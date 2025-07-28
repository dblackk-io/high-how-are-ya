-- User System for High How Are Ya
-- Anonymous profiles with persistent stats

-- Users table (anonymous but persistent)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL, -- Anonymous session identifier
  auth_user_id UUID, -- Supabase auth user ID (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferred_vibes TEXT[] DEFAULT '{}',
  total_thoughts INTEGER DEFAULT 0,
  total_boosts INTEGER DEFAULT 0,
  total_strikes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_thought_date DATE
);

-- User stats for their own thoughts
CREATE TABLE IF NOT EXISTS user_thought_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  boost_count INTEGER DEFAULT 0,
  strike_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thought_id)
);

-- Notifications for user interactions
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('boost', 'strike', 'comment')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_user_thought_stats_user_id ON user_thought_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_thought_stats_thought_id ON user_thought_stats(thought_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_thought_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (session_id = current_setting('app.session_id', true));

-- RLS Policies for user_thought_stats table
CREATE POLICY "Users can view own thought stats" ON user_thought_stats
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

CREATE POLICY "Users can update own thought stats" ON user_thought_stats
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

CREATE POLICY "Users can insert own thought stats" ON user_thought_stats
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
    )
  );

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (
    user_id IN (
      user_id IN (
        SELECT id FROM users WHERE session_id = current_setting('app.session_id', true)
      )
    )
  );

-- Function to get or create user by session
CREATE OR REPLACE FUNCTION get_or_create_user(session_id_param TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to find existing user
  SELECT id INTO user_id FROM users WHERE session_id = session_id_param;
  
  -- If not found, create new user
  IF user_id IS NULL THEN
    INSERT INTO users (session_id) VALUES (session_id_param)
    RETURNING id INTO user_id;
  ELSE
    -- Update last active
    UPDATE users SET last_active = NOW() WHERE id = user_id;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update thought stats
CREATE OR REPLACE FUNCTION update_thought_stats(
  thought_id_param UUID,
  action_type TEXT
)
RETURNS VOID AS $$
DECLARE
  thought_user_id UUID;
  user_id UUID;
BEGIN
  -- Get the user who owns the thought
  SELECT user_id INTO thought_user_id FROM thoughts WHERE id = thought_id_param;
  
  -- Get current user
  SELECT get_or_create_user(current_setting('app.session_id', true)) INTO user_id;
  
  -- Only update if thought belongs to current user
  IF thought_user_id = user_id THEN
    INSERT INTO user_thought_stats (user_id, thought_id)
    VALUES (user_id, thought_id_param)
    ON CONFLICT (user_id, thought_id) DO NOTHING;
    
    -- Update the appropriate count
    CASE action_type
      WHEN 'boost' THEN
        UPDATE user_thought_stats 
        SET boost_count = boost_count + 1, updated_at = NOW()
        WHERE user_id = user_id AND thought_id = thought_id_param;
      WHEN 'strike' THEN
        UPDATE user_thought_stats 
        SET strike_count = strike_count + 1, updated_at = NOW()
        WHERE user_id = user_id AND thought_id = thought_id_param;
      WHEN 'comment' THEN
        UPDATE user_thought_stats 
        SET comment_count = comment_count + 1, updated_at = NOW()
        WHERE user_id = user_id AND thought_id = thought_id_param;
      WHEN 'view' THEN
        UPDATE user_thought_stats 
        SET view_count = view_count + 1, updated_at = NOW()
        WHERE user_id = user_id AND thought_id = thought_id_param;
    END CASE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  thought_id_param UUID,
  notification_type TEXT,
  message_param TEXT
)
RETURNS VOID AS $$
DECLARE
  thought_user_id UUID;
  user_id UUID;
BEGIN
  -- Get the user who owns the thought
  SELECT user_id INTO thought_user_id FROM thoughts WHERE id = thought_id_param;
  
  -- Get current user
  SELECT get_or_create_user(current_setting('app.session_id', true)) INTO user_id;
  
  -- Only create notification if thought belongs to current user
  IF thought_user_id = user_id THEN
    INSERT INTO notifications (user_id, thought_id, type, message)
    VALUES (user_id, thought_id_param, notification_type, message_param);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
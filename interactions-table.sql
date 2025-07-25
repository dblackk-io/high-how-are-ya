-- Interactions table for tracking user interactions with thoughts
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('boost', 'strike', 'comment', 'view')),
  time_spent INTEGER,
  completion_rate DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interactions_thought_id ON interactions(thought_id);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_action ON interactions(action);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert interactions (anonymous platform)
CREATE POLICY "Anyone can insert interactions" ON interactions
  FOR INSERT WITH CHECK (true);

-- Allow reading interactions for analytics (optional)
CREATE POLICY "Anyone can read interactions" ON interactions
  FOR SELECT USING (true); 
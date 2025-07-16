-- Database schema updates for High How Are Ya core loop
-- Run these in your Supabase SQL editor

-- Add new columns to thoughts table
ALTER TABLE thoughts 
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing thoughts to be active
UPDATE thoughts SET is_active = true WHERE is_active IS NULL;

-- Add index for better performance on random selection
CREATE INDEX IF NOT EXISTS idx_thoughts_active_nsfw ON thoughts(is_active, nsfw_) WHERE is_active = true;

-- Add index for streak tracking
CREATE INDEX IF NOT EXISTS idx_thoughts_streak ON thoughts(streak_count DESC) WHERE is_active = true;

-- Update interactions table to support reaction types
ALTER TABLE interactions 
ADD COLUMN IF NOT EXISTS reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike'));

-- Add some sample thoughts for testing (optional)
INSERT INTO thoughts (content, user_id, vibe_tag, nsfw_, gender_target, streak_count, dislike_count, is_active) 
VALUES 
  ('Sometimes I wonder if everyone else is just pretending to have their life together', 'test-user-1', 'deep', false, null, 0, 0, true),
  ('Why do we park in driveways and drive on parkways?', 'test-user-2', 'funny', false, null, 0, 0, true),
  ('The fact that we can see the moon but not hear it is wild', 'test-user-3', 'weird', false, null, 0, 0, true),
  ('I think about the Roman Empire at least once a day', 'test-user-4', 'funny', false, null, 0, 0, true),
  ('What if our dreams are just memories from parallel universes?', 'test-user-5', 'deep', false, null, 0, 0, true)
ON CONFLICT DO NOTHING; 
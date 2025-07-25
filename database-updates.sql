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
CREATE INDEX IF NOT EXISTS idx_thoughts_active_nsfw ON thoughts(is_active, nsfw_flag) WHERE is_active = true;

-- Add index for streak tracking
CREATE INDEX IF NOT EXISTS idx_thoughts_streak ON thoughts(streak_count DESC) WHERE is_active = true;

-- Update interactions table to support reaction types
ALTER TABLE interactions 
ADD COLUMN IF NOT EXISTS reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike'));

-- UPDATE VIBE TAG CONSTRAINT TO ACCEPT NEW TAGS
-- First, update any existing thoughts with old vibe tags to valid ones
UPDATE thoughts SET vibe_tag = 'deep' WHERE vibe_tag NOT IN ('deep', 'funny', 'weird', 'relationships', 'nsfw');

-- Drop the existing constraint
ALTER TABLE thoughts DROP CONSTRAINT IF EXISTS thoughts_vibe_tag_check;

-- Add the new constraint with all vibe tags
ALTER TABLE thoughts ADD CONSTRAINT thoughts_vibe_tag_check 
CHECK (vibe_tag IN ('deep', 'funny', 'weird', 'relationships', 'nsfw'));

 

-- Create comments table for real commenting functionality
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_thought_id ON comments(thought_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Add RLS policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to insert comments
CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid()); 
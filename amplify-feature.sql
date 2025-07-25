-- Add amplify functionality to thoughts table
-- Run this in your Supabase SQL Editor

-- Add amplified_by column to track who amplified each thought
ALTER TABLE thoughts 
ADD COLUMN IF NOT EXISTS amplified_by TEXT[] DEFAULT '{}';

-- Add index for better performance on amplify filtering
CREATE INDEX IF NOT EXISTS idx_thoughts_amplified_by ON thoughts USING GIN(amplified_by);

-- Add amplify_count column for quick stats
ALTER TABLE thoughts 
ADD COLUMN IF NOT EXISTS amplify_count INTEGER DEFAULT 0; 
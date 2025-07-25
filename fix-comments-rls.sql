-- Fix RLS policies to allow anonymous comments
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Create new policies that allow anonymous users
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update comments" ON comments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete comments" ON comments
  FOR DELETE USING (true); 
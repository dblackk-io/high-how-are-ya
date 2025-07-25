-- Reports table for content moderation
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  action_taken TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_thought_id ON reports(thought_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_at ON reports(reported_at);
CREATE INDEX IF NOT EXISTS idx_reports_session_id ON reports(session_id);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reports (anonymous reporting)
CREATE POLICY "Anyone can insert reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Only allow reading reports with proper admin authentication
-- This would be handled by your admin interface
CREATE POLICY "Admin can read reports" ON reports
  FOR SELECT USING (false); -- This will be overridden by admin auth

-- Allow admins to update reports
CREATE POLICY "Admin can update reports" ON reports
  FOR UPDATE USING (false); -- This will be overridden by admin auth 
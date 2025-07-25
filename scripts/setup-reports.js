const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Make sure you have:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (from your Supabase dashboard)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupReports() {
  console.log('Setting up reports table...');

  try {
    // Create reports table
    console.log('Creating reports table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (createTableError) {
      console.log('Reports table already exists or error:', createTableError.message);
    } else {
      console.log('✅ Created reports table');
    }

    // Create indexes
    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_reports_thought_id ON reports(thought_id);
        CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
        CREATE INDEX IF NOT EXISTS idx_reports_reported_at ON reports(reported_at);
        CREATE INDEX IF NOT EXISTS idx_reports_session_id ON reports(session_id);
      `
    });

    if (indexError) {
      console.log('Indexes already exist or error:', indexError.message);
    } else {
      console.log('✅ Created indexes');
    }

    // Enable RLS and create policies
    console.log('Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can insert reports" ON reports;
        CREATE POLICY "Anyone can insert reports" ON reports
          FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Admin can read reports" ON reports;
        CREATE POLICY "Admin can read reports" ON reports
          FOR SELECT USING (false);
        
        DROP POLICY IF EXISTS "Admin can update reports" ON reports;
        CREATE POLICY "Admin can update reports" ON reports
          FOR UPDATE USING (false);
      `
    });

    if (rlsError) {
      console.log('RLS policies already exist or error:', rlsError.message);
    } else {
      console.log('✅ Created RLS policies');
    }

    console.log('✅ Reports table setup complete!');
    console.log('📝 Note: Admin access to reports will need to be configured separately');

  } catch (error) {
    console.error('Error setting up reports table:', error);
  }
}

setupReports(); 
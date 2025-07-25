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

async function setupInteractions() {
  console.log('Setting up interactions table...');

  try {
    // Check if interactions table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('interactions')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating interactions table...');
      
      // We'll need to create this manually in Supabase dashboard
      console.log('⚠️  Please create the interactions table manually in your Supabase dashboard:');
      console.log('');
      console.log('SQL to run in Supabase SQL Editor:');
      console.log(`
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('boost', 'strike', 'comment', 'view')),
  time_spent INTEGER,
  completion_rate DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interactions_thought_id ON interactions(thought_id);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_action ON interactions(action);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert interactions" ON interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read interactions" ON interactions
  FOR SELECT USING (true);
      `);
      console.log('');
      console.log('After creating the table, restart your dev server and try again.');
    } else {
      console.log('✅ Interactions table already exists!');
      console.log('📊 Stats tracking should work now.');
    }

  } catch (error) {
    console.error('Error checking interactions table:', error);
  }
}

setupInteractions(); 
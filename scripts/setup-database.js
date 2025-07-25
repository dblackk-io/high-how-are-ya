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

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // 1. Add new columns to thoughts table
    console.log('Adding columns to thoughts table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE thoughts 
        ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      `
    });

    if (alterError) {
      console.log('Thoughts table columns already exist or error:', alterError.message);
    } else {
      console.log('✅ Added columns to thoughts table');
    }

    // 2. Create comments table
    console.log('Creating comments table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE
        );
      `
    });

    if (createTableError) {
      console.log('Comments table already exists or error:', createTableError.message);
    } else {
      console.log('✅ Created comments table');
    }

    // 3. Create indexes
    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_comments_thought_id ON comments(thought_id);
        CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
        CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
        CREATE INDEX IF NOT EXISTS idx_thoughts_active_nsfw ON thoughts(is_active, nsfw_flag) WHERE is_active = true;
        CREATE INDEX IF NOT EXISTS idx_thoughts_streak ON thoughts(streak_count DESC) WHERE is_active = true;
      `
    });

    if (indexError) {
      console.log('Indexes already exist or error:', indexError.message);
    } else {
      console.log('✅ Created indexes');
    }

    // 4. Enable RLS and create policies
    console.log('Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
        CREATE POLICY "Anyone can read comments" ON comments
          FOR SELECT USING (is_active = true);
        
        DROP POLICY IF EXISTS "Users can insert comments" ON comments;
        CREATE POLICY "Users can insert comments" ON comments
          FOR INSERT WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Users can update own comments" ON comments;
        CREATE POLICY "Users can update own comments" ON comments
          FOR UPDATE USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
        CREATE POLICY "Users can delete own comments" ON comments
          FOR DELETE USING (user_id = auth.uid());
      `
    });

    if (rlsError) {
      console.log('RLS policies already exist or error:', rlsError.message);
    } else {
      console.log('✅ Set up RLS policies');
    }

    console.log('\n🎉 Database setup complete!');
    console.log('Comments should now work in your app.');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 
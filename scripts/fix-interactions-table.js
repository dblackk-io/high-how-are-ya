const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixInteractionsTable() {
  console.log('Fixing interactions table schema...');

  try {
    // Add missing columns to the existing table
    console.log('Adding missing columns...');
    
    const columnsToAdd = [
      'thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE',
      'session_id TEXT NOT NULL',
      'action TEXT NOT NULL CHECK (action IN (\'boost\', \'strike\', \'comment\', \'view\'))',
      'time_spent INTEGER',
      'completion_rate DECIMAL(3,2)',
      'created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()'
    ];

    for (const columnDef of columnsToAdd) {
      const columnName = columnDef.split(' ')[0];
      console.log(`Adding column: ${columnName}`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE interactions ADD COLUMN IF NOT EXISTS ${columnDef};`
        });

        if (error) {
          console.log(`Column ${columnName} already exists or error:`, error.message);
        } else {
          console.log(`✅ Added column: ${columnName}`);
        }
      } catch (e) {
        console.log(`Could not add column ${columnName} via RPC, you may need to add it manually`);
      }
    }

    // Create indexes
    console.log('Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_interactions_thought_id ON interactions(thought_id);',
      'CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_interactions_action ON interactions(action);',
      'CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);'
    ];

    for (const index of indexes) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: index });
        if (error) {
          console.log('Index already exists or error:', error.message);
        } else {
          console.log('✅ Created index');
        }
      } catch (e) {
        console.log('Could not create index via RPC, you may need to create it manually');
      }
    }

    console.log('');
    console.log('⚠️  If the RPC calls failed, please run this SQL manually in your Supabase dashboard:');
    console.log('');
    console.log(`
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS session_id TEXT NOT NULL;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS action TEXT NOT NULL CHECK (action IN ('boost', 'strike', 'comment', 'view'));
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS time_spent INTEGER;
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(3,2);
ALTER TABLE interactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_interactions_thought_id ON interactions(thought_id);
CREATE INDEX IF NOT EXISTS idx_interactions_session_id ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_action ON interactions(action);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);
    `);

  } catch (error) {
    console.error('Error fixing interactions table:', error);
  }
}

fixInteractionsTable(); 
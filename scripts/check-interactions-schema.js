const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkInteractionsSchema() {
  console.log('Checking interactions table schema...');

  try {
    // Try different column combinations to see what exists
    const columnTests = [
      ['id'],
      ['id', 'thought_id'],
      ['id', 'user_id'],
      ['id', 'type'],
      ['id', 'reaction_type'],
      ['id', 'created_at'],
      ['id', 'thought_id', 'user_id'],
      ['id', 'thought_id', 'type'],
      ['id', 'thought_id', 'reaction_type'],
      ['id', 'thought_id', 'user_id', 'type'],
      ['id', 'thought_id', 'user_id', 'reaction_type']
    ];

    for (const columns of columnTests) {
      try {
        const { data, error } = await supabase
          .from('interactions')
          .select(columns.join(', '))
          .limit(1);

        if (!error) {
          console.log(`✅ Columns that exist: ${columns.join(', ')}`);
          if (data.length > 0) {
            console.log('Sample data:', data[0]);
          }
          break;
        } else {
          console.log(`❌ Columns that don't exist: ${columns.join(', ')}`);
        }
      } catch (e) {
        console.log(`❌ Error with columns: ${columns.join(', ')}`);
      }
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkInteractionsSchema(); 
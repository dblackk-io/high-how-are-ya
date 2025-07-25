const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key] = valueParts.join('=');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function showThoughts() {
  try {
    console.log('🔍 Fetching all active thoughts...\n');
    
    const { data: thoughts, error } = await supabase
      .from('thoughts')
      .select('id, content, vibe_tag, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (!thoughts || thoughts.length === 0) {
      console.log('📭 No active thoughts found');
      return;
    }

    console.log(`📝 Found ${thoughts.length} active thoughts:\n`);
    console.log('─'.repeat(80));

    thoughts.forEach((thought, index) => {
      console.log(`\n${index + 1}. ID: ${thought.id}`);
      console.log(`   Vibe: ${thought.vibe_tag}`);
      console.log(`   Date: ${new Date(thought.created_at).toLocaleDateString()}`);
      console.log(`   Content: ${thought.content.substring(0, 100)}${thought.content.length > 100 ? '...' : ''}`);
      console.log('─'.repeat(80));
    });

    console.log('\n💡 To deactivate a thought, copy its ID and run:');
    console.log('   UPDATE thoughts SET is_active = false WHERE id = \'paste-id-here\';');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

showThoughts(); 
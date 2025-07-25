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

async function deleteSpecificThought() {
  try {
    console.log('💀 Deleting the specific thought...\n');

    // First delete any interactions for this thought
    console.log('🗑️  Deleting interactions first...');
    const { error: interactionsError } = await supabase
      .from('interactions')
      .delete()
      .eq('thought_id', '6c948edc-29a0-4f48-8221-51d26471aa66');

    if (interactionsError) {
      console.error('❌ Error deleting interactions:', interactionsError);
      return;
    }

    console.log('✅ Interactions deleted successfully');

    // Then delete the thought
    console.log('💀 Deleting the thought...');
    const { data, error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', '6c948edc-29a0-4f48-8221-51d26471aa66');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('💀 THOUGHT DELETED!');
    console.log('🎯 "If people don\'t post for a while is there a good chance they are fat/ look different?" is GONE!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteSpecificThought(); 
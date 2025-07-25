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

async function nukeEverything() {
  try {
    console.log('💥 NUKING EVERYTHING FROM THE DATABASE...\n');

    // First delete all interactions
    console.log('🗑️  Deleting ALL interactions...');
    const { error: interactionsError } = await supabase
      .from('interactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (interactionsError) {
      console.error('❌ Error deleting interactions:', interactionsError);
      return;
    }

    console.log('✅ ALL interactions deleted successfully');

    // Then delete all thoughts
    console.log('💀 Deleting ALL thoughts...');
    const { data, error } = await supabase
      .from('thoughts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('💥 DATABASE COMPLETELY NUKED!');
    console.log('🎯 Everything is GONE. Fresh start.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

nukeEverything(); 
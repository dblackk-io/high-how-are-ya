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

async function removeVibeTags() {
  try {
    console.log('🏷️  Removing all vibe tags to make thoughts neutral...\n');

    // Update all thoughts to have NULL vibe_tag
    const { data, error } = await supabase
      .from('thoughts')
      .update({ vibe_tag: null })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all thoughts

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ ALL VIBE TAGS REMOVED!');
    console.log('🎯 Thoughts are now neutral and open to interpretation!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeVibeTags(); 
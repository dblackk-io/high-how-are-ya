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

async function deleteMoreCornyThoughts() {
  try {
    console.log('💀 PERMANENTLY DELETING more corny AI thoughts...\n');
    
    // The corny AI thought IDs to DELETE
    const cornyIds = [
      'da6356d2-b205-4ea1-b686-8f5a3e77a824', // 19 - "Why do we say 'bless you' when someone sneezes? Like what are we blessing them for?"
      'fc994bc3-e92d-4297-ae0d-dd317e7284d5', // 62 - "Why do we park in driveways and drive on parkways?"
      'e2f0934d-66b5-45ad-98b5-edfa4ab27cc4', // 63 - "Do you think pigeons have favorite humans? Like 'oh shit, there's that guy who always has bread'" (duplicate)
      'b4090674-4876-43f1-b46d-1f089c5a5436'  // 64 - "Why do we say 'bless you' when someone sneezes? Like what are we blessing them for?" (duplicate)
    ];

    const { data, error } = await supabase
      .from('thoughts')
      .delete()
      .in('id', cornyIds);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`💀 PERMANENTLY DELETED ${cornyIds.length} more corny AI thoughts!`);
    console.log('🎯 They are GONE FOREVER. No more cringe.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteMoreCornyThoughts(); 
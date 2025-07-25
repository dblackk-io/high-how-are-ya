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

async function deleteAllCornyThoughts() {
  try {
    console.log('💀 PERMANENTLY DELETING ALL corny AI thoughts...\n');
    
    // ALL the corny AI thought IDs to DELETE
    const cornyIds = [
      'beeaa8fa-9593-47e8-b6cb-fd0fd7bfd870', // 10 - "Why do we have belly buttons? Like what's the point after we're born?"
      'f4987ee8-4f2d-415d-a016-aa4b2aa8844a', // 11 - "What if the moon is just Earth's way of keeping an eye on us?"
      '7c64cf6d-9202-4d79-b98a-b5faeac326e1', // 12 - "Do you think plants talk to each other? Like 'yo, that human just watered me again, I'm good'"
      'bd8f99d3-0fd0-4901-9812-d85ffc211c97', // 14 - "Why do we have eyebrows? Like what's their actual purpose besides looking surprised?"
      '68024f65-e51a-4c80-9b85-8db5e65980f0', // 15 - "Do you think aliens would find our music weird? Like imagine explaining dubstep to an alien."
      '94d60975-7c54-4916-aab5-a4d5b1fdf938', // 28 - "Do you think dogs feel awkward if they are scratching themselves, and u come over and start givin em..."
      '9eac96e9-961a-4896-a262-0fc00ec597e9', // 69 - "Do you think dogs feel awkward if they are scratching themselves, and u come over and start givin em..." (duplicate)
      '140d9849-c0bd-4db0-b423-30f19f8e62c4'  // 71 - "Why do firefighters always have mustaches"
    ];

    const { data, error } = await supabase
      .from('thoughts')
      .delete()
      .in('id', cornyIds);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`💀 PERMANENTLY DELETED ${cornyIds.length} corny AI thoughts!`);
    console.log('🎯 They are ALL GONE FOREVER. No more cringe.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteAllCornyThoughts(); 
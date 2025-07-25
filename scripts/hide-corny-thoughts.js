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

async function hideCornyThoughts() {
  try {
    console.log('🗑️  Hiding corny AI thoughts...\n');
    
    // The corny AI thought IDs to hide
    const cornyIds = [
      '6a121528-cb12-4d88-b96a-721c41aaa68a', // 69 - "Why do we say 'good morning' when it's clearly not good for anyone? (Ai)"
      '1d27a74f-77b1-4ccf-93cd-e045cb39612c', // 71 - "Why do we clap when a plane lands? Like we're congratulating the pilot for doing their job?"
      'c4e94154-ff70-4168-8be4-459b27f7b1e4', // 68 - "What if clouds are just sky cotton candy that got too high and forgot how to come down? AI Generated..."
      '932f6526-ceea-4947-8c93-e688565dfc9d', // 72 - "What if trees are just really slow people who decided to stay in one place?"
      'db5a53c8-c0ba-4bfc-9b54-34dce1f20f28'  // 73 - "Why do we whisper in libraries? The books can't hear us."
    ];

    const { data, error } = await supabase
      .from('thoughts')
      .update({ is_active: false })
      .in('id', cornyIds);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Successfully hid ${cornyIds.length} corny AI thoughts!`);
    console.log('🎯 Your feed should be less cringe now.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

hideCornyThoughts(); 
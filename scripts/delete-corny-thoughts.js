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

async function deleteCornyThoughts() {
  try {
    console.log('💀 PERMANENTLY DELETING corny AI thoughts...\n');
    
    // The corny AI thought IDs to DELETE (not just hide)
    const cornyIds = [
      'b9f8c012-b86c-44c6-b880-2bef9ff5e425', // "Why do we say 'good morning' when it's clearly not good for anyone?"
      '21914aa1-7c49-4d3b-8019-72f736603b45', // "Why do we clap when a plane lands? Like we're congratulating the pilot for doing their job?"
      '72064c05-ed21-4e19-8597-747eda7817d3', // "What if trees are just really slow people who decided to stay in one place?"
      'd14cc73d-a634-4e41-a481-15eb7863ecea', // "Why do we whisper in libraries? The books can't hear us."
      'd32b77bf-0f52-435c-b01a-c51595460603', // "Do you think ants have traffic jams? Like 'damn, another ant blocking the tunnel'"
      '8308a72c-850f-4467-95e4-e9236716a35e', // "Do you think fish get thirsty? Or do they just not know what thirst feels like?"
      '6a121528-cb12-4d88-b96a-721c41aaa68a', // "Why do we say 'good morning' when it's clearly not good for anyone? (Ai)"
      '1d27a74f-77b1-4ccf-93cd-e045cb39612c', // "Why do we clap when a plane lands? Like we're congratulating the pilot for doing their job?"
      'c4e94154-ff70-4168-8be4-459b27f7b1e4', // "What if clouds are just sky cotton candy that got too high and forgot how to come down? AI Generated..."
      '932f6526-ceea-4947-8c93-e688565dfc9d', // "What if trees are just really slow people who decided to stay in one place?"
      'db5a53c8-c0ba-4bfc-9b54-34dce1f20f28'  // "Why do we whisper in libraries? The books can't hear us."
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
    console.log('🎯 They are GONE FOREVER. No more cringe.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteCornyThoughts(); 
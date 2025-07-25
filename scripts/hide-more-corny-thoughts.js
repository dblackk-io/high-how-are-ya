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

async function hideMoreCornyThoughts() {
  try {
    console.log('🗑️  Hiding more corny AI thoughts...\n');
    
    // The corny AI thought IDs to hide
    const cornyIds = [
      'b9f8c012-b86c-44c6-b880-2bef9ff5e425', // 18 - "Why do we say 'good morning' when it's clearly not good for anyone?"
      '21914aa1-7c49-4d3b-8019-72f736603b45', // 19 - "Why do we clap when a plane lands? Like we're congratulating the pilot for doing their job?"
      '72064c05-ed21-4e19-8597-747eda7817d3', // 20 - "What if trees are just really slow people who decided to stay in one place?"
      'd14cc73d-a634-4e41-a481-15eb7863ecea', // 21 - "Why do we whisper in libraries? The books can't hear us."
      'd32b77bf-0f52-435c-b01a-c51595460603', // 67 - "Do you think ants have traffic jams? Like 'damn, another ant blocking the tunnel'" (duplicate)
      '8308a72c-850f-4467-95e4-e9236716a35e'  // 68 - "Do you think fish get thirsty? Or do they just not know what thirst feels like?"
    ];

    const { data, error } = await supabase
      .from('thoughts')
      .update({ is_active: false })
      .in('id', cornyIds);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Successfully hid ${cornyIds.length} more corny AI thoughts!`);
    console.log('🎯 Your feed is getting less cringe by the minute.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

hideMoreCornyThoughts(); 
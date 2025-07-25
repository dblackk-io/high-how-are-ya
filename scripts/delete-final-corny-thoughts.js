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

async function deleteFinalCornyThoughts() {
  try {
    console.log('💀 PERMANENTLY DELETING final batch of corny AI thoughts...\n');
    
    // The final batch of corny AI thought IDs to DELETE
    const cornyIds = [
      'e79ac418-d895-4e0e-9b78-2ec3b8c4e341', // 11 - "Do you think ants have traffic jams? Like 'damn, another ant blocking the tunnel'"
      'ac802fa9-7dfe-4f49-be79-7040061b4fbf', // 12 - "What if clouds are just sky cotton candy that got too high and forgot how to come down?"
      '8e4aa4c0-0866-4430-8f6f-d75d93e8310f', // 13 - "Do you think pigeons have favorite humans? Like 'oh shit, there's that guy who always has bread'"
      'b8562c59-416f-40df-968f-495de1b1e8a8', // 26 - "Why do firefighters always have mustaches"
      'c48826b7-e234-4a59-98ce-00b8024003e7', // 65 - "If you could live in any past time period what period would it be? AI generated: will be gone as mo..."
      '5afcca9a-d19e-48d3-bc44-8f9d3b7fecd5'  // 80 - "Why do parents fear turning into their parents? ((ai when more users come these will be gone :) en..."
    ];

    const { data, error } = await supabase
      .from('thoughts')
      .delete()
      .in('id', cornyIds);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`💀 PERMANENTLY DELETED ${cornyIds.length} final corny AI thoughts!`);
    console.log('🎯 They are ALL GONE FOREVER. Your feed should be way less cringe now.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteFinalCornyThoughts(); 
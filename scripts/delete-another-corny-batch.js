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

async function deleteAnotherCornyBatch() {
  try {
    console.log('💀 PERMANENTLY DELETING the checked thoughts...\n');

    // The corny AI thought IDs to DELETE - using correct full UUIDs
    const cornyIds = [
      'b3aa78d7-a0fe-43a7-8f95-7da501fc655b', // Isn't it wild that we're all just floating on a rock in space
      'b4144d39-042f-416e-8465-e4d7d02cb99d', // who the fuck likes donald trump
      'b716baa6-bf1a-4d11-8a9c-e0eef89f14c8', // What if deja vu is just your brain processing information faster
      'bb522228-d6af-4681-9691-a378133f27a1', // What's this generation's mixed tape?
      'c4f00cb0-fc03-40fd-80f0-4f047137ae0d', // How in the world are people still supporting Trump?
      'c885be8b-7846-47c0-bd26-52afbcaeac17', // What if soulmates are just people who have the same weird quirks as you?
      'ca650d51-03b2-4637-baf9-5e81186933c2', // If you could live in any past time period what period would it be?
      'cb24a3f8-6816-4070-b8c5-d76a750191aa', // Isn't it wild that we're all just floating on a rock in space
      'd89c0ad4-414f-4ad7-b8cb-c4578baab8db', // What songs bring up specific memories you have?
      'e5066c18-24a0-4a15-a8f0-b5817a626ab4', // silly boys
      'e715f43c-4457-4d9c-aa22-1901f1ea0e93', // Things don't taste spicy, they feel spicy
      'e9723a2a-6d72-4235-bac6-80ecc33e5416', // I know the universe is expanding but what is it expanding into
      'ed84ac7a-92dc-4749-8a4b-5fdfed1a9c99', // Why do we care so much about what strangers think of us on the internet?
      'f645ee93-e76d-4a47-aca6-6a628696e564'  // What if consciousness is just the universe experiencing itself through different perspectives?
    ];

    // First delete interactions for these thoughts
    console.log('🗑️  Deleting interactions first...');
    const { error: interactionsError } = await supabase
      .from('interactions')
      .delete()
      .in('thought_id', cornyIds);

    if (interactionsError) {
      console.error('❌ Error deleting interactions:', interactionsError);
      return;
    }

    console.log('✅ Interactions deleted successfully');

    // Then delete the thoughts
    console.log('💀 Deleting thoughts...');
    const { data, error } = await supabase
      .from('thoughts')
      .delete()
      .in('id', cornyIds);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`💀 PERMANENTLY DELETED ${cornyIds.length} checked thoughts!`);
    console.log('🎯 They are GONE FOREVER. No more cringe.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deleteAnotherCornyBatch(); 
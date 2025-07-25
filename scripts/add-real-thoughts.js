require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Add your real thoughts here
const realThoughts = [
  // Add your thoughts in this format:
  // { content: "Your thought here", vibe_tag: "funny|deep|horny", nsfw_flag: false },
  
  // Example:
  // { content: "I'm not lazy, I'm just conserving energy for when I actually need it.", vibe_tag: "funny", nsfw_flag: false },
  // { content: "What if our dreams are just memories from parallel universes?", vibe_tag: "deep", nsfw_flag: false },
  
  // Add your real thoughts below:
];

async function addRealThoughts() {
  console.log('Adding real thoughts to database...');
  
  if (realThoughts.length === 0) {
    console.log('No thoughts added to the array. Please add your thoughts to the realThoughts array in this file.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('thoughts')
      .insert(realThoughts);

    if (error) {
      console.error('Error adding thoughts:', error);
    } else {
      console.log(`✅ Successfully added ${realThoughts.length} thoughts to the database!`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

addRealThoughts(); 
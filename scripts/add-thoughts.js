const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// User's original thoughts
const originalThoughts = [
  {
    content: "Why do people find different music genres better than others?",
    vibe_tag: "deep"
  },
  {
    content: "Isn't it crazy that no one sees the world the same? No colors, no texture, nothing is the same.",
    vibe_tag: "deep"
  },
  {
    content: "Why is there thought to be a correlation between dogs and their owners looks?",
    vibe_tag: "weird"
  },
  {
    content: "What determines one's sense of humor?",
    vibe_tag: "deep"
  },
  {
    content: "Why do parents fear turning into their parents?",
    vibe_tag: "deep"
  },
  {
    content: "Do you ever feel forced to love your family even if you really don't?",
    vibe_tag: "relationships"
  },
  {
    content: "Why is sex taboo?",
    vibe_tag: "relationships"
  },
  {
    content: "I wonder if time travel is genuinely possible. What needs to happen?",
    vibe_tag: "deep"
  },
  {
    content: "Why do kids lie so much? And why do they think other people won't notice?",
    vibe_tag: "funny"
  },
  {
    content: "Have you thought about what it's like to learn something for the first time all over again?",
    vibe_tag: "deep"
  },
  {
    content: "What is the earliest memory you can think of?",
    vibe_tag: "deep"
  },
  {
    content: "If you teach yourself something, did you learn how to do that?",
    vibe_tag: "deep"
  },
  {
    content: "Have we found the same old fears",
    vibe_tag: "deep"
  },
  {
    content: "What songs bring up specific memories you have?",
    vibe_tag: "deep"
  },
  {
    content: "Best 1-2 line part of a song",
    vibe_tag: "funny"
  },
  {
    content: "I hate growing up",
    vibe_tag: "deep"
  },
  {
    content: "I know the universe is expanding but what is it expanding into? What did the Big Bang start from (where did the intense heat come from, if there was nothing beforehand)? And if there was \"something\" creating the intense heat what was it?",
    vibe_tag: "deep"
  },
  {
    content: "Are people still doing LSD or is it no longer a popular hallucinogen? What hallucinogens are popular?",
    vibe_tag: "weird"
  },
  {
    content: "Do people believe god(s) exist? Is it for guidence, or is it a general determination to serve a higher power?",
    vibe_tag: "deep"
  },
  {
    content: "If you could do any illegal drug and know you would die or become addicted, what drug would you pick?",
    vibe_tag: "weird"
  },
  {
    content: "I can't get into big fake tits. It just doesn't do it for me.",
    vibe_tag: "relationships"
  },
  {
    content: "What is your biggest regret? I wish I would have lived aboard before settling down.",
    vibe_tag: "deep"
  },
  {
    content: "What music line speaks most to you? Pink Floyd's Wish You Were Here: \"We're just two lost souls swimming in a fishbowl, year after year. Runnin' over the same old ground, what have we found? The same old fears, wish you were here\" or REM's I Believe: \"Trust in your calling, make sure your calling's true. Think of others, the others think of you. Silly rule, golden words make practice, practice makes perfect. Perfect is a fault, and fault lines change\"",
    vibe_tag: "deep"
  },
  {
    content: "Why is 7 so common when people pick a number 1-10, until you mention that its the most common number? Then what happens?",
    vibe_tag: "weird"
  },
  {
    content: "80s-90s rap is so much better than rap from 2000s",
    vibe_tag: "funny"
  },
  {
    content: "How in the world are people still supporting Trump?",
    vibe_tag: "weird"
  },
  {
    content: "If you could live in any past time period what period would it be?",
    vibe_tag: "deep"
  },
  {
    content: "What's this generation's mixed tape?",
    vibe_tag: "funny"
  },
  {
    content: "Why do firefighters always have mustaches",
    vibe_tag: "funny"
  },
  {
    content: "Are most dispensaries opened by people who were selling weed before it was made legal?",
    vibe_tag: "weird"
  },
  {
    content: "If people don't post for a while is there a good chance they are fat/ look different?",
    vibe_tag: "funny"
  },
  {
    content: "You're parents and people around you have their own life, jokes, friends. That's fucking nuts",
    vibe_tag: "deep"
  },
  {
    content: "Do you think dogs feel awkward if they are scratching themselves, and u come over and start givin em rubs",
    vibe_tag: "funny"
  },
  {
    content: "Things don't taste spicy, they feel spicy. Spiciness affects the sense of feeling, not the sense of taste.",
    vibe_tag: "weird"
  }
];

// Generated thoughts in the same style
const generatedThoughts = [
  // Deep thoughts
  {
    content: "Why do we dream in the language we speak? What would dreams sound like if we didn't know any language?",
    vibe_tag: "deep"
  },
  {
    content: "Isn't it wild that we're all just floating on a rock in space, and most of us are worried about what to wear tomorrow?",
    vibe_tag: "deep"
  },
  {
    content: "Do you think animals have existential crises? Like do dogs ever wonder what the point of fetch is?",
    vibe_tag: "deep"
  },
  {
    content: "Why do we feel the need to explain our emotions to other people when we barely understand them ourselves?",
    vibe_tag: "deep"
  },
  {
    content: "What if deja vu is just your brain processing information faster than you can consciously register it?",
    vibe_tag: "deep"
  },
  {
    content: "Why do we romanticize the past so much? Like the 90s weren't that great, we just remember the good parts.",
    vibe_tag: "deep"
  },
  {
    content: "Do you think plants feel pain? Or are they just vibing and we're overthinking it?",
    vibe_tag: "deep"
  },
  {
    content: "Why do we care so much about what strangers think of us on the internet?",
    vibe_tag: "deep"
  },
  {
    content: "What if consciousness is just the universe experiencing itself through different perspectives?",
    vibe_tag: "deep"
  },
  {
    content: "Why do we get embarrassed about things that happened years ago? Like who even remembers that shit?",
    vibe_tag: "deep"
  },

  // Funny thoughts
  {
    content: "Why do we say 'bless you' when someone sneezes? Like what are we blessing them for?",
    vibe_tag: "funny"
  },
  {
    content: "Do you think pigeons have favorite humans? Like 'oh shit, there's that guy who always has bread'",
    vibe_tag: "funny"
  },
  {
    content: "Why do we whisper in libraries? The books can't hear us.",
    vibe_tag: "funny"
  },
  {
    content: "What if trees are just really slow people who decided to stay in one place?",
    vibe_tag: "funny"
  },
  {
    content: "Why do we clap when a plane lands? Like we're congratulating the pilot for doing their job?",
    vibe_tag: "funny"
  },
  {
    content: "Do you think fish get thirsty? Or do they just not know what thirst feels like?",
    vibe_tag: "funny"
  },
  {
    content: "Why do we say 'good morning' when it's clearly not good for anyone?",
    vibe_tag: "funny"
  },
  {
    content: "What if clouds are just sky cotton candy that got too high and forgot how to come down?",
    vibe_tag: "funny"
  },
  {
    content: "Do you think ants have traffic jams? Like 'damn, another ant blocking the tunnel'",
    vibe_tag: "funny"
  },
  {
    content: "Why do we park in driveways and drive on parkways?",
    vibe_tag: "funny"
  },

  // Weird thoughts
  {
    content: "What if mirrors are just windows to parallel universes where everything is backwards?",
    vibe_tag: "weird"
  },
  {
    content: "Do you think aliens would find our music weird? Like imagine explaining dubstep to an alien.",
    vibe_tag: "weird"
  },
  {
    content: "What if deja vu is just your brain glitching like a video game?",
    vibe_tag: "weird"
  },
  {
    content: "Why do we have eyebrows? Like what's their actual purpose besides looking surprised?",
    vibe_tag: "weird"
  },
  {
    content: "What if dreams are just your brain's way of processing all the weird shit you saw on the internet?",
    vibe_tag: "weird"
  },
  {
    content: "Do you think plants talk to each other? Like 'yo, that human just watered me again, I'm good'",
    vibe_tag: "weird"
  },
  {
    content: "What if the moon is just Earth's way of keeping an eye on us?",
    vibe_tag: "weird"
  },
  {
    content: "Why do we have belly buttons? Like what's the point after we're born?",
    vibe_tag: "weird"
  },
  {
    content: "What if time is just a social construct and we're all living in the same moment?",
    vibe_tag: "weird"
  },
  {
    content: "Do you think animals have their own version of social media? Like 'just caught a mouse, feeling cute'",
    vibe_tag: "weird"
  },

  // Relationship thoughts
  {
    content: "Why do we get nervous around people we like? Like our brain just decides to malfunction.",
    vibe_tag: "relationships"
  },
  {
    content: "Do you think love is just chemicals in our brain or is there something more to it?",
    vibe_tag: "relationships"
  },
  {
    content: "Why do we care so much about what our exes are doing? Like move on already.",
    vibe_tag: "relationships"
  },
  {
    content: "What if soulmates are just people who have the same weird quirks as you?",
    vibe_tag: "relationships"
  },
  {
    content: "Why do we get butterflies in our stomach when we like someone? Like what's that about?",
    vibe_tag: "relationships"
  },
  {
    content: "Do you think love at first sight is real or just really good timing?",
    vibe_tag: "relationships"
  },
  {
    content: "Why do we always want what we can't have? Like the forbidden fruit thing is real.",
    vibe_tag: "relationships"
  },
  {
    content: "What if relationships are just two people agreeing to be weird together?",
    vibe_tag: "relationships"
  },
  {
    content: "Why do we get jealous over things that don't even matter? Like who cares who they follow on Instagram?",
    vibe_tag: "relationships"
  },
  {
    content: "Do you think love is worth all the drama and heartbreak?",
    vibe_tag: "relationships"
  }
];

// Combine all thoughts
const allThoughts = [...originalThoughts, ...generatedThoughts];

async function addThoughts() {
  console.log('Starting to add thoughts to database...');
  
  for (const thought of allThoughts) {
    try {
      const { error } = await supabase
        .from('thoughts')
        .insert([
          {
            content: thought.content,
            vibe_tag: thought.vibe_tag,
            nsfw_flag: thought.vibe_tag === 'nsfw', // Only mark as NSFW if explicitly tagged
            is_active: true,
            streak_count: 0,
            dislike_count: 0
          }
        ]);

      if (error) {
        console.error('Error adding thought:', error);
      } else {
        console.log(`Added thought: "${thought.content.substring(0, 50)}..." (${thought.vibe_tag})`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  console.log('Finished adding thoughts!');
}

// Run the script
addThoughts(); 
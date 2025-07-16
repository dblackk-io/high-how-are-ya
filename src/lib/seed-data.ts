import { supabase } from './supabase'

// Thought templates for each genre
const thoughtTemplates = {
  deep: [
    "What if our dreams are just memories from parallel universes where we made different choices?",
    "The most profound conversations happen in silence between two people who truly understand each other.",
    "We're all just stardust trying to figure out how to shine in the darkness of existence.",
    "The greatest paradox of life is that we spend our youth trying to be older and our age trying to be younger.",
    "Sometimes the loudest voice in the room is the one that says nothing at all.",
    "What if time isn't linear but circular, and we're just experiencing the same moment over and over?",
    "The most dangerous thing in the world is a person who has nothing left to lose.",
    "We're all just walking each other home, one conversation at a time.",
    "The universe doesn't owe us anything, but it gives us everything we need to survive.",
    "What if our consciousness is just the universe's way of understanding itself?",
    "The hardest truth to accept is that we're all just temporary visitors in each other's lives.",
    "Sometimes the most revolutionary act is simply being kind in a world that rewards cruelty.",
    "We spend our lives searching for meaning when meaning is just what we choose to make of our lives.",
    "The most beautiful things in life are the ones we can't explain with words.",
    "What if death isn't the end but just a different way of existing?"
  ],
  funny: [
    "I'm not lazy, I'm just conserving energy for when I actually need it.",
    "My diet is going great! I've lost 3 days this week already.",
    "I don't always procrastinate, but when I do, I make sure to do it thoroughly.",
    "I'm not arguing, I'm just explaining why I'm right.",
    "I'm not saying I'm Batman, I'm just saying no one has ever seen me and Batman in the same room.",
    "I'm not addicted to coffee, I'm addicted to being awesome.",
    "I don't need Google, my wife knows everything.",
    "I'm not short, I'm just concentrated awesome.",
    "I'm not a morning person, I'm a coffee person.",
    "I don't always make mistakes, but when I do, I make sure they're spectacular.",
    "I'm not antisocial, I'm selectively social.",
    "I don't need a therapist, I need a mute button for my thoughts.",
    "I'm not clumsy, I'm just dancing with gravity.",
    "I don't always tell dad jokes, but when I do, I make sure they're groan-worthy.",
    "I'm not a control freak, I'm just someone who likes things done my way."
  ],
  weird: [
    "What if clouds are just cotton candy that got too high and forgot how to come down?",
    "I'm convinced that socks have a secret society and they're plotting against us.",
    "What if trees are just really slow dancers swaying to music we can't hear?",
    "I think my cat is actually a tiny alien wearing a cat costume.",
    "What if dreams are just our brain's way of processing all the weird thoughts we have during the day?",
    "I'm pretty sure my phone has a secret life when I'm not looking at it.",
    "What if mirrors are just windows to parallel universes where everything is backwards?",
    "I think vegetables are just plants that got tired of being green and decided to be colorful instead.",
    "What if rain is just the sky crying because it's having a bad day?",
    "I'm convinced that my keys have a secret teleportation device.",
    "What if the moon is just Earth's way of keeping an eye on us?",
    "I think my shadow is actually a separate entity that follows me around.",
    "What if dreams are just our brain's way of processing all the weird thoughts we have during the day?",
    "I'm pretty sure that my car has a personality and it's judging my driving.",
    "What if the internet is just a giant digital spider web connecting all our thoughts?"
  ],
  nsfw: [
    "Sometimes the best conversations happen in the dark when inhibitions are lowered.",
    "What if our deepest desires are just our subconscious trying to tell us something?",
    "The most intimate moments aren't always physical - sometimes they're just two souls connecting.",
    "I wonder if aliens have the same kind of relationship drama we do.",
    "What if our dreams are just our brain's way of processing all the things we can't say out loud?",
    "Sometimes the most erotic thing is just being completely understood by another person.",
    "I think we're all just looking for someone who makes us feel less alone in this universe.",
    "What if our bodies are just vessels for our souls to experience physical pleasure?",
    "Sometimes the most intimate thing you can do with someone is just hold their hand.",
    "I wonder if there's a parallel universe where everyone is just really good at relationships.",
    "What if our deepest fears are just our subconscious trying to protect us from getting hurt?",
    "Sometimes the most beautiful thing is just watching someone you care about sleep.",
    "I think we're all just trying to find someone who makes us feel like we're enough.",
    "What if our dreams are just our brain's way of processing all the things we want but can't have?",
    "Sometimes the most intimate moment is just two people sharing a comfortable silence."
  ]
}

// Generate random thoughts with proper distribution
const generateThoughts = () => {
  const thoughts: Array<{
    content: string
    vibe_tag: string
    nsfw_flag: boolean
    streak_count: number
    dislike_count: number
    is_active: boolean
    created_at: string
  }> = []
  
  // Generate thoughts for each genre
  Object.entries(thoughtTemplates).forEach(([genre, templates]) => {
    templates.forEach((content, index) => {
      thoughts.push({
        content,
        vibe_tag: genre,
        nsfw_flag: genre === 'nsfw',
        streak_count: Math.floor(Math.random() * 50) + 1, // Random engagement
        dislike_count: Math.floor(Math.random() * 10), // Random dislikes
        is_active: true,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
      })
    })
  })
  
  return thoughts
}

// Seed the database with thoughts
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...')
    
    const thoughts = generateThoughts()
    console.log(`Generated ${thoughts.length} thoughts`)
    
    // Insert thoughts in batches
    const batchSize = 10
    for (let i = 0; i < thoughts.length; i += batchSize) {
      const batch = thoughts.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('thoughts')
        .insert(batch)
      
      if (error) {
        console.error('Error inserting batch:', error)
        throw error
      }
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(thoughts.length / batchSize)}`)
    }
    
    console.log('✅ Database seeding completed successfully!')
    return { success: true, count: thoughts.length }
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    return { success: false, error }
  }
}

// Check if database needs seeding
export const checkDatabaseStatus = async () => {
  try {
    const { count, error } = await supabase
      .from('thoughts')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    
    return { needsSeeding: count === 0, count }
  } catch (error) {
    console.error('Error checking database status:', error)
    return { needsSeeding: true, error }
  }
} 
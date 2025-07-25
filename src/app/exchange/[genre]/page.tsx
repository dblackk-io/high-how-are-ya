'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'

export default function GenrePage() {
  const router = useRouter()
  const params = useParams()
  const genre = params.genre as string
  
  const [currentThought, setCurrentThought] = useState<{ id?: string; content: string; streak_count?: number; dislike_count?: number; is_fallback?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const genreConfig = {
    deep: { color: '#00ffff', emoji: '🤔', title: 'Deep Thoughts' },
    funny: { color: '#ffff00', emoji: '😂', title: 'Funny Thoughts' },
    horny: { color: '#ff00ff', emoji: '🔥', title: 'Horny Thoughts' },
    random: { color: '#00ff00', emoji: '🎲', title: 'Random Thoughts' },
    refresh: { color: '#ff8800', emoji: '🔄', title: 'Fresh Thoughts' }
  }

  const config = genreConfig[genre as keyof typeof genreConfig] || genreConfig.random

  useEffect(() => {
    fetchThought()
  }, [genre])

  const fetchThought = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('is_active', true)

      // Apply genre filter
      if (genre === 'random') {
        // No filter for random
      } else if (genre === 'refresh') {
        // Get newest thoughts
        query = query.order('created_at', { ascending: false })
      } else {
        // Filter by vibe_tag
        query = query.eq('vibe_tag', genre)
      }

      // Add NSFW filter for horny thoughts
      if (genre === 'horny') {
        query = query.eq('nsfw_flag', true)
      } else {
        query = query.eq('nsfw_flag', false)
      }

      const { data, error } = await query.limit(1).single()

      if (error) {
        console.error('Error fetching thought:', error)
        // Show a fallback message
        setCurrentThought({
          content: "No thoughts found in this category yet. Be the first to share!",
          streak_count: 0,
          is_fallback: true
        })
      } else {
        setCurrentThought(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (!currentThought || currentThought.is_fallback) return

    try {
      // Record the interaction
      await supabase
        .from('interactions')
        .insert({
          user_id: null,
          thought_id: currentThought.id,
          type: 'star',
          tag_value: reactionType
        })

      // Update the thought's streak/dislike count
      const updateField = reactionType === 'like' ? 'streak_count' : 'dislike_count'
      const currentCount = currentThought[updateField] || 0
      const newCount = currentCount + 1
      
      const { error } = await supabase
        .from('thoughts')
        .update({ 
          [updateField]: newCount,
          is_active: reactionType === 'dislike' && (currentThought.dislike_count || 0) >= 2 ? false : true
        })
        .eq('id', currentThought.id)

      if (error) throw error

      // Update local state
      setCurrentThought((prev) => prev ? ({
        ...prev,
        [updateField]: newCount
      }) : null)

      // Fetch next thought after a brief delay
      setTimeout(() => {
        fetchThought()
      }, 500)

    } catch (error) {
      console.error('Error recording reaction:', error)
    }
  }

  const handleNext = () => {
    fetchThought()
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-center font-black text-5xl md:text-6xl neon-title" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          {config.emoji} {config.title}
        </h1>
      </div>

      {/* Thought Display */}
      <div className="neon-chatbox flex flex-col items-center justify-center p-16 rounded-3xl shadow-2xl" style={{ minWidth: 600, maxWidth: 800 }}>
        
        {isLoading ? (
          <div className="text-center">
            <div className="text-3xl text-pink-400 mb-4">Finding thoughts...</div>
            <div className="animate-pulse text-pink-200 text-4xl">⚡</div>
          </div>
        ) : currentThought ? (
          <div className="w-full">
            <div className="bg-black/40 border-2 border-pink-500 rounded-2xl p-8 mb-6 neon-glow">
              <div className="text-2xl md:text-3xl font-medium text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                &quot;{currentThought.content}&quot;
              </div>
              <div className="text-sm text-pink-300">
                {currentThought.streak_count || 0} people have seen this thought
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleReaction('like')}
                className="neon-btn neon-solid text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider"
              >
                👍 Like
              </button>
              <button
                onClick={() => handleReaction('dislike')}
                className="neon-btn neon-solid text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider"
                style={{ 
                  background: '#ff4444', 
                  borderColor: '#ff4444',
                  boxShadow: '0 0 40px #ff4444, 0 0 120px #ff4444'
                }}
              >
                👎 Dislike
              </button>
              <button
                onClick={handleNext}
                className="neon-btn text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider"
                style={{
                  background: 'transparent',
                  borderColor: config.color,
                  color: config.color,
                  boxShadow: `0 0 20px ${config.color}`
                }}
              >
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push('/exchange/browse')}
          className="neon-btn text-xl px-6 py-3 font-bold rounded-lg uppercase tracking-wider"
          style={{
            background: 'transparent',
            borderColor: '#666',
            color: '#666',
            boxShadow: '0 0 20px #666'
          }}
        >
          ← Browse
        </button>
        <button
          onClick={() => router.push('/exchange')}
          className="neon-btn text-xl px-6 py-3 font-bold rounded-lg uppercase tracking-wider"
          style={{
            background: 'transparent',
            borderColor: '#666',
            color: '#666',
            boxShadow: '0 0 20px #666'
          }}
        >
          Submit Thought
        </button>
      </div>

      <style jsx global>{`
        body {
          background: #000 !important;
          font-family: 'Inter', sans-serif !important;
        }
        .neon-title {
          color: #ff00cc;
          text-shadow:
            0 0 20px #ff00cc,
            0 0 40px #ff00cc,
            0 0 80px #ff00cc,
            0 0 160px #ff00cc;
        }
        .neon-btn {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .neon-btn:active {
          transform: scale(0.97);
        }
        .neon-solid {
          color: #000;
          background: #ff00cc;
          border: 4px solid #ff00cc;
          box-shadow:
            0 0 40px #ff00cc,
            0 0 120px #ff00cc;
        }
        .neon-solid:hover {
          background: #ff33cc;
          box-shadow:
            0 0 80px #ff00cc,
            0 0 160px #ff00cc;
        }
        .neon-chatbox {
          background: linear-gradient(135deg, #1a0022cc 60%, #ff00cc22 100%);
          border: 2px solid #ff00cc;
          box-shadow:
            0 0 40px #ff00cc,
            0 0 120px #ff00cc;
        }
        .neon-glow {
          box-shadow: 0 0 20px #ff00cc;
        }
      `}</style>
    </div>
  )
} 
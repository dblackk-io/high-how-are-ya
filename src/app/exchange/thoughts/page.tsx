"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function ThoughtsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const genres = searchParams.get('genres')?.split(',') || []
  
  const [currentThought, setCurrentThought] = useState<{ id?: string; content: string; streak_count?: number; dislike_count?: number; nsfw_flag?: boolean; is_fallback?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBlurred, setIsBlurred] = useState(false)

  useEffect(() => {
    fetchThought()
  }, [genres])

  const fetchThought = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('is_active', true)

      // Apply genre filtering
      if (genres.includes('nsfw') && !genres.includes('deep') && !genres.includes('funny') && !genres.includes('weird')) {
        // Only NSFW selected
        query = query.eq('nsfw_flag', true)
      } else if (!genres.includes('nsfw') && (genres.includes('deep') || genres.includes('funny') || genres.includes('weird'))) {
        // Only SFW selected
        query = query.eq('nsfw_flag', false)
      }
      // If both SFW and NSFW selected, no filter (show all)

      // Apply specific genre filters
      if (genres.includes('fresh')) {
        query = query.order('created_at', { ascending: false })
      } else if (genres.includes('random')) {
        // No additional filter for random
      } else {
        // Filter by vibe_tag for specific genres
        const validVibeTags = genres.filter(g => ['deep', 'funny', 'weird'].includes(g))
        if (validVibeTags.length > 0) {
          query = query.in('vibe_tag', validVibeTags)
        }
      }

      const { data, error } = await query.limit(1).single()

      if (error || !data) {
        console.error('Error fetching thought:', error)
        setCurrentThought({
          content: "No thoughts found matching your selected genres. The database might be empty - try seeding it first!",
          is_fallback: true
        })
      } else {
        setCurrentThought(data)
        setIsBlurred(data.nsfw_flag) // Blur if NSFW
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

      // Fetch next thought
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

  const handleChat = () => {
    // Chat functionality coming soon
  }

  const getGenreDisplay = () => {
    const genreNames = {
      deep: 'Deep Thoughts',
      funny: 'Humor & Comedy',
      weird: 'Strange & Surreal',
      nsfw: 'Adult Content',
      random: 'Random Mix',
      fresh: 'Fresh & New'
    }
    return genres.map(g => genreNames[g as keyof typeof genreNames] || g).join(', ')
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">

      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-center font-black text-4xl md:text-5xl neon-title mb-4" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          Your Selected Content
        </h1>
        <p className="text-center text-lg text-gray-400">
          {getGenreDisplay()}
        </p>
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
              <div 
                className={`text-2xl md:text-3xl font-medium text-white mb-4 transition-all ${
                  isBlurred ? 'blur-md' : ''
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                &quot;{currentThought.content}&quot;
              </div>
              {isBlurred && (
                <div className="text-center mb-4">
                  <button
                    onClick={() => setIsBlurred(false)}
                    className="neon-btn text-lg px-6 py-3 font-bold rounded-lg uppercase tracking-wider"
                    style={{
                      background: 'transparent',
                      borderColor: '#ff00ff',
                      color: '#ff00ff',
                      boxShadow: '0 0 20px #ff00ff'
                    }}
                  >
                    Unblur NSFW Content
                  </button>
                </div>
              )}
              {currentThought.is_fallback ? (
                <div className="text-center mt-4">
                  <a
                    href="/seed"
                    className="neon-btn text-lg px-6 py-3 font-bold rounded-lg uppercase tracking-wider"
                    style={{
                      background: 'transparent',
                      borderColor: '#00ffff',
                      color: '#00ffff',
                      boxShadow: '0 0 20px #00ffff'
                    }}
                  >
                    Populate Database
                  </a>
                </div>
              ) : (
                <div className="text-sm text-pink-300">
                  {currentThought.streak_count || 0} people have seen this thought
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-4">
              <button
                onClick={() => handleReaction('like')}
                className="neon-btn neon-solid text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider"
              >
                Like
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
                Dislike
              </button>
              <button
                onClick={handleNext}
                className="neon-btn text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider"
                style={{
                  background: 'transparent',
                  borderColor: '#00ffff',
                  color: '#00ffff',
                  boxShadow: '0 0 20px #00ffff'
                }}
              >
                Next
              </button>
            </div>

            {/* Chat Button */}
            <div className="text-center">
              <button
                onClick={handleChat}
                className="neon-btn text-lg px-6 py-3 font-bold rounded-lg uppercase tracking-wider"
                style={{
                  background: 'transparent',
                  borderColor: '#ffff00',
                  color: '#ffff00',
                  boxShadow: '0 0 20px #ffff00'
                }}
              >
                Start Chat
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
          Change Genres
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
          Back to Exchange
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

export default function ThoughtsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThoughtsPageContent />
    </Suspense>
  )
} 
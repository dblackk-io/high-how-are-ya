'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { supabase, getSessionId, Thought } from '@/lib/supabase'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [thought, setThought] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedThought, setSubmittedThought] = useState<Thought | null>(null)
  const [isNSFW, setIsNSFW] = useState(false)
  const [showContentPreferences, setShowContentPreferences] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [currentThought, setCurrentThought] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)

  const contentOptions = [
    { id: 'deep', name: 'Deep', emoji: '🤔', color: '#00ffff' },
    { id: 'funny', name: 'Funny', emoji: '😂', color: '#ffff00' },
    { id: 'weird', name: 'Weird', emoji: '👽', color: '#00ff00' },
    { id: 'nsfw', name: 'NSFW', emoji: '🔥', color: '#ff00ff' }
  ]

  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!thought.trim() || isSubmitting) return

    setIsSubmitting(true)
    const sessionId = getSessionId()
    if (!sessionId) return

    console.log('Submitting thought:', { content: thought, user_id: sessionId, vibe_tag: isNSFW ? 'horny' : 'deep', nsfw_flag: isNSFW })

    try {
      // Insert the thought into Supabase
      const { data: newThought, error } = await supabase
        .from('thoughts')
        .insert({
          content: thought.trim(),
          user_id: null, // Remove foreign key constraint for anonymous thoughts
          vibe_tag: isNSFW ? 'horny' : 'deep', // Default to deep for now, horny for NSFW
          nsfw_flag: isNSFW,
          gender_target: null
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      console.log('Thought submitted successfully:', newThought)
      setSubmittedThought(newThought)
      setThought('')
      
      // Show content preferences after submission
      setShowContentPreferences(true)
      
    } catch (error) {
      console.error('Error submitting thought:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', (error as any)?.message)
      console.error('Error details:', (error as any)?.details)
      // TODO: Add error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchThoughtByPreferences = async () => {
    if (selectedPreferences.length === 0) return
    
    setIsLoading(true)
    try {
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('is_active', true)

      // Filter by selected preferences
      const nsfwSelected = selectedPreferences.includes('nsfw')
      const sfwSelected = selectedPreferences.some(p => p !== 'nsfw')
      
      if (nsfwSelected && !sfwSelected) {
        // Only NSFW selected
        query = query.eq('nsfw_flag', true)
      } else if (sfwSelected && !nsfwSelected) {
        // Only SFW selected
        query = query.eq('nsfw_flag', false)
      }
      // If both selected, no filter (show all)

      const { data, error } = await query.limit(1).single()

      if (error) {
        console.error('Error fetching thought:', error)
        setCurrentThought({
          content: "No thoughts found matching your preferences. Try adjusting your selections!",
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
      setCurrentThought((prev: any) => ({
        ...prev,
        [updateField]: newCount
      }))

      // Fetch next thought
      setTimeout(() => {
        fetchThoughtByPreferences()
      }, 500)

    } catch (error) {
      console.error('Error recording reaction:', error)
    }
  }

  const handleNext = () => {
    fetchThoughtByPreferences()
  }

  const handleChat = () => {
    // TODO: Implement chat functionality
    console.log('Starting chat with thought:', currentThought)
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Main Chat Interface */}
      {!showContentPreferences && (
        <div className="neon-chatbox flex flex-col items-center justify-center p-16 rounded-3xl shadow-2xl" style={{ minWidth: 600, maxWidth: 800 }}>
          <div className="flex items-center justify-center mb-2">
            <h2 className="text-center font-black text-5xl md:text-6xl neon-title" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
              Anonymous Chat
            </h2>
          </div>

          {/* NSFW Toggle */}
          <div className="mb-6 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isNSFW}
                onChange={(e) => setIsNSFW(e.target.checked)}
                className="mr-3 w-5 h-5 text-pink-600 bg-black border-2 border-pink-500 rounded focus:ring-pink-500"
              />
              <span className="text-xl text-pink-400 font-bold">NSFW Content</span>
            </label>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-row gap-6">
            <input
              className="flex-1 px-10 py-8 rounded-2xl text-3xl font-medium bg-black/60 border-2 border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 neon-input text-white placeholder-white/60 backdrop-blur-md"
              placeholder={isNSFW ? 'Type your NSFW thought...' : 'Type your thought...'}
              type="text"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              disabled={isSubmitting}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <button 
              type="submit"
              disabled={isSubmitting || !thought.trim()}
              className="neon-btn neon-solid text-3xl px-16 py-8 font-extrabold rounded-2xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* Content Preferences Selection */}
      {showContentPreferences && !currentThought && (
        <div className="neon-chatbox flex flex-col items-center justify-center p-16 rounded-3xl shadow-2xl" style={{ minWidth: 600, maxWidth: 800 }}>
          <h2 className="text-center font-black text-4xl md:text-5xl neon-title mb-8" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
            What do you want to see?
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {contentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => togglePreference(option.id)}
                className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                  selectedPreferences.includes(option.id)
                    ? 'border-white bg-white/20'
                    : 'border-gray-600 bg-black/40'
                }`}
                style={{
                  borderColor: selectedPreferences.includes(option.id) ? option.color : '#666',
                  boxShadow: selectedPreferences.includes(option.id) ? `0 0 20px ${option.color}` : 'none'
                }}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div>{option.name}</div>
              </button>
            ))}
          </div>

          <button
            onClick={fetchThoughtByPreferences}
            disabled={selectedPreferences.length === 0}
            className="neon-btn neon-solid text-2xl px-12 py-6 font-bold rounded-xl uppercase tracking-wider disabled:opacity-50"
          >
            Find Thoughts
          </button>
        </div>
      )}

      {/* Thought Display */}
      {currentThought && (
        <div className="neon-chatbox flex flex-col items-center justify-center p-16 rounded-3xl shadow-2xl" style={{ minWidth: 600, maxWidth: 800 }}>
          {isLoading ? (
            <div className="text-center">
              <div className="text-3xl text-pink-400 mb-4">Finding thoughts...</div>
              <div className="animate-pulse text-pink-200 text-4xl">⚡</div>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-black/40 border-2 border-pink-500 rounded-2xl p-8 mb-6 neon-glow">
                <div 
                  className={`text-2xl md:text-3xl font-medium text-white mb-4 transition-all ${
                    isBlurred ? 'blur-md' : ''
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  "{currentThought.content}"
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
                      🔥 Unblur NSFW Content
                    </button>
                  </div>
                )}
                <div className="text-sm text-pink-300">
                  {currentThought.streak_count || 0} people have seen this thought
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 justify-center mb-4">
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
                    borderColor: '#00ffff',
                    color: '#00ffff',
                    boxShadow: '0 0 20px #00ffff'
                  }}
                >
                  Next →
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
                  💬 Start Chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
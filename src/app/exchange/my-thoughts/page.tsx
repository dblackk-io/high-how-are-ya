'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'

export default function MyThoughtsPage() {
  const router = useRouter()
  const [myThoughts, setMyThoughts] = useState<{ id: string; content: string; streak_count?: number; dislike_count?: number; created_at: string; vibe_tag?: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyThoughts()
  }, [])

  const fetchMyThoughts = async () => {
    setIsLoading(true)
    try {
      // For now, we'll show all thoughts since they're anonymous
      // In the future, we could track user sessions more robustly
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20) // Show recent thoughts

      if (error) {
        console.error('Error fetching thoughts:', error)
      } else {
        setMyThoughts(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getThoughtStatus = (thought: { streak_count?: number; dislike_count?: number }) => {
    const streakCount = thought.streak_count || 0
    const dislikeCount = thought.dislike_count || 0
    
    if (dislikeCount >= 3) return { status: 'Dead', color: '#ff4444', emoji: '💀' }
    if (streakCount >= 5) return { status: 'Trending', color: '#ffff00', emoji: '⚡' }
    if (streakCount >= 2) return { status: 'Growing', color: '#00ffff', emoji: '📈' }
    return { status: 'New', color: '#888', emoji: '🆕' }
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-center font-black text-5xl md:text-6xl neon-title" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          🧠 My Thoughts Performance
        </h1>
      </div>

      {/* Thoughts List */}
      <div className="neon-chatbox flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl" style={{ minWidth: 600, maxWidth: 800, maxHeight: '70vh', overflowY: 'auto' }}>
        
        {isLoading ? (
          <div className="text-center">
            <div className="text-3xl text-pink-400 mb-4">Loading your thoughts...</div>
            <div className="animate-pulse text-pink-200 text-4xl">⚡</div>
          </div>
        ) : myThoughts.length > 0 ? (
          <div className="w-full space-y-6">
            {myThoughts.map((thought) => {
              const status = getThoughtStatus(thought)
              return (
                <div key={thought.id} className="bg-black/40 border-2 border-pink-500 rounded-2xl p-6 neon-glow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-lg md:text-xl font-medium text-white flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      &quot;{thought.content}&quot;
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-bold" style={{ color: status.color }}>
                        {status.emoji} {status.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-6">
                      <div className="text-green-400">
                        👍 {thought.streak_count || 0} likes
                      </div>
                      <div className="text-red-400">
                        👎 {thought.dislike_count || 0} dislikes
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {new Date(thought.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {thought.vibe_tag && (
                    <div className="mt-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-300">
                        {thought.vibe_tag}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl text-pink-400 mb-4">No thoughts found</div>
            <div className="text-lg text-gray-400">Submit your first thought to see it here!</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
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
          ← Back to Exchange
        </button>
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
          Browse Thoughts
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
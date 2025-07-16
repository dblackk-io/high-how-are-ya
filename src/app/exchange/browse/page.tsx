"use client"

import { useRouter } from 'next/navigation'
import React from 'react'

const GENRES = [
  {
    id: "deep",
    name: "Deep Thoughts",
    description: "Philosophical, introspective, and profound reflections on life, existence, and meaning.",
    color: "#00ffff",
    gradient: "linear-gradient(135deg, #00ffff 0%, #0080ff 100%)"
  },
  {
    id: "funny",
    name: "Humor & Comedy",
    description: "Jokes, memes, wild stories, and anything that makes you laugh out loud.",
    color: "#ffff00",
    gradient: "linear-gradient(135deg, #ffff00 0%, #ff8000 100%)"
  },
  {
    id: "weird",
    name: "Strange & Surreal",
    description: "Bizarre thoughts, surreal concepts, and the wonderfully weird side of imagination.",
    color: "#00ff00",
    gradient: "linear-gradient(135deg, #00ff00 0%, #00ff80 100%)"
  },
  {
    id: "nsfw",
    name: "Adult Content",
    description: "Explicit sexual content, adult themes, and graphic material for mature audiences.",
    color: "#ff00ff",
    gradient: "linear-gradient(135deg, #ff00ff 0%, #8000ff 100%)"
  },
  {
    id: "random",
    name: "Random Mix",
    description: "A diverse collection of thoughts from all categories, completely unpredictable.",
    color: "#ff8800",
    gradient: "linear-gradient(135deg, #ff8800 0%, #ff0080 100%)"
  },
  {
    id: "fresh",
    name: "Fresh & New",
    description: "The latest thoughts from the community, hot off the press.",
    color: "#00ff80",
    gradient: "linear-gradient(135deg, #00ff80 0%, #0080ff 100%)"
  }
]

export default function BrowsePage() {
  const router = useRouter()
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([])

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleContinue = () => {
    if (selectedGenres.length === 0) return
    const genreParams = selectedGenres.join(',')
    router.push(`/exchange/thoughts?genres=${genreParams}`)
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">

      
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-center font-black text-5xl md:text-6xl neon-title uppercase tracking-tight" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          Choose Your Content
        </h1>
        <p className="text-center text-xl text-gray-400 mt-4 max-w-2xl">
          Select the types of thoughts you want to explore. You can choose multiple categories.
        </p>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full px-8 mb-12">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre.id)}
            className={`relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 ${
              selectedGenres.includes(genre.id)
                ? 'ring-4 ring-white shadow-2xl scale-105'
                : 'hover:scale-102'
            }`}
            style={{
              background: selectedGenres.includes(genre.id) 
                ? genre.gradient 
                : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: `2px solid ${selectedGenres.includes(genre.id) ? genre.color : 'rgba(255,255,255,0.1)'}`,
              boxShadow: selectedGenres.includes(genre.id) 
                ? `0 0 40px ${genre.color}, 0 0 80px ${genre.color}` 
                : '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            {/* Selection Indicator */}
            {selectedGenres.includes(genre.id) && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            )}

            <div className="space-y-4">
              <h3 
                className="text-2xl font-black uppercase tracking-wider"
                style={{ 
                  color: selectedGenres.includes(genre.id) ? '#000' : genre.color,
                  textShadow: selectedGenres.includes(genre.id) ? 'none' : `0 0 20px ${genre.color}`
                }}
              >
                {genre.name}
              </h3>
              <p 
                className="text-base leading-relaxed"
                style={{ 
                  color: selectedGenres.includes(genre.id) ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.7)'
                }}
              >
                {genre.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex gap-6">
        <button
          onClick={() => router.push('/exchange')}
          className="neon-btn text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider"
          style={{
            background: 'transparent',
            borderColor: '#666',
            color: '#666',
            boxShadow: '0 0 20px #666'
          }}
        >
          Back
        </button>
        
        <button
          onClick={handleContinue}
          disabled={selectedGenres.length === 0}
          className="neon-btn neon-solid text-xl px-12 py-4 font-bold rounded-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue ({selectedGenres.length} selected)
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
      `}</style>
    </div>
  )
} 
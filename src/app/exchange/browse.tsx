'use client'

import Head from 'next/head'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromNSFW = searchParams.get('fromNSFW') === 'true'

  console.log('Browse page - fromNSFW:', fromNSFW)
  console.log('Search params:', searchParams.toString())

  const genres = [
    { name: 'Deep', color: '#00ffff', emoji: '🤔', path: '/exchange/deep' },
    { name: 'Funny', color: '#ffff00', emoji: '😂', path: '/exchange/funny' },
    { name: 'Random', color: '#00ff00', emoji: '🎲', path: '/exchange/random' },
    { name: 'Refresh', color: '#ff8800', emoji: '🔄', path: '/exchange/refresh' }
  ]

  // Add NSFW option only if user came from NSFW submission
  if (fromNSFW) {
    genres.push({ name: 'Horny', color: '#ff00ff', emoji: '🔥', path: '/exchange/horny' })
    console.log('Added Horny genre for NSFW user')
  }

  console.log('Final genres:', genres.map(g => g.name))

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-center font-black text-6xl md:text-7xl neon-title" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          What Are People Thinking?
        </h1>
      </div>

      {/* Genre Buttons */}
      <div className="flex flex-col gap-8 items-center">
        {genres.map((genre, index) => (
          <button
            key={genre.name}
            onClick={() => router.push(genre.path)}
            className="neon-btn neon-solid text-4xl px-20 py-8 font-extrabold rounded-2xl uppercase tracking-widest w-96"
            style={{
              background: genre.color,
              borderColor: genre.color,
              boxShadow: `0 0 40px ${genre.color}, 0 0 120px ${genre.color}`,
              color: '#000'
            }}
          >
            <span className="mr-4">{genre.emoji}</span>
            {genre.name}
          </button>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/exchange')}
        className="mt-12 neon-btn text-2xl px-12 py-6 font-bold rounded-xl uppercase tracking-wider"
        style={{
          background: 'transparent',
          borderColor: '#666',
          color: '#666',
          boxShadow: '0 0 20px #666'
        }}
      >
        ← Back
      </button>

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
        .neon-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 0 80px currentColor, 0 0 160px currentColor;
        }
      `}</style>
    </div>
  )
} 
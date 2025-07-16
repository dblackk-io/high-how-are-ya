"use client"

import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const SUMMARY = "Share a thought. Instantly get one back. Connect with the unknown."
const REACTIONS_LINE = "More reactions = more reach."

const GENRES = [
  {
    name: "Deep",
    desc: "Profound & introspective.",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#ff00cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20v-6m0 0c-4.418 0-8-2.239-8-5s3.582-5 8-5 8 2.239 8 5-3.582 5-8 5z"/></svg>
    )
  },
  {
    name: "Funny",
    desc: "Jokes, memes, wild stories.",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#ff00cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>
    )
  },
  {
    name: "Weird",
    desc: "Strange & surreal.",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#ff00cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6"/><circle cx="12" cy="12" r="3"/></svg>
    )
  },
  {
    name: "NSFW",
    desc: "Spicy, unfiltered, 18+.",
    icon: (
      <svg width="32" height="32" fill="none" stroke="#ff00cc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="5"/><path d="M8 11h.01M16 11h.01"/></svg>
    )
  }
]

export default function ExchangePage() {
  const router = useRouter()
  const [displayed, setDisplayed] = useState("")
  const [typing, setTyping] = useState(true)
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(true)
  const [displayedReactions, setDisplayedReactions] = useState("")
  const [typingReactions, setTypingReactions] = useState(false)
  const [indexReactions, setIndexReactions] = useState(0)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (typing) {
      if (index < SUMMARY.length) {
        timeout = setTimeout(() => {
          setDisplayed(SUMMARY.slice(0, index + 1))
          setIndex(index + 1)
        }, 70)
      } else {
        timeout = setTimeout(() => {
          setShow(true)
          setTyping(false)
          setTypingReactions(true)
        }, 500)
      }
    } else if (typingReactions) {
      if (indexReactions < REACTIONS_LINE.length) {
        timeout = setTimeout(() => {
          setDisplayedReactions(REACTIONS_LINE.slice(0, indexReactions + 1))
          setIndexReactions(indexReactions + 1)
        }, 70)
      } else {
        timeout = setTimeout(() => {
          setTypingReactions(false)
        }, 500)
      }
    } else {
      // Glow for 5 seconds, then fade out, then restart
      timeout = setTimeout(() => {
        setShow(false)
        setTimeout(() => {
          setDisplayed("")
          setIndex(0)
          setTyping(true)
          setDisplayedReactions("")
          setIndexReactions(0)
          setTypingReactions(false)
          setShow(true)
        }, 600) // fade out duration
      }, 5000)
    }
    return () => clearTimeout(timeout)
  }, [typing, index, typingReactions, indexReactions])

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div className="flex flex-col items-center justify-center px-8 py-14 rounded-[2.5rem] neon-exchange-box" style={{ minWidth: 380, maxWidth: 700 }}>
        <h1 className="text-center font-black text-4xl md:text-6xl mb-16 neon-title uppercase tracking-tight" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
          Share a Thought<br />Get a Thought<br />Stay Anonymous
        </h1>
        
        {/* Two main buttons */}
        <div className="flex flex-col gap-12 items-center">
          <button
            className="neon-btn neon-solid text-5xl px-24 py-12 rounded-[1.5rem] font-black tracking-[0.2em] shadow-2xl uppercase transition-transform duration-150"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', borderWidth: '6px', borderColor: '#ff00cc', textShadow: '0 0 40px #ff00cc, 0 0 120px #ff00cc, 0 0 240px #ff00cc' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => router.push('/chat')}
          >
            Add a Thought
          </button>
          
          <button
            className="neon-btn neon-solid text-5xl px-24 py-12 rounded-[1.5rem] font-black tracking-[0.2em] shadow-2xl uppercase transition-transform duration-150"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', borderWidth: '6px', borderColor: '#ff00cc', textShadow: '0 0 40px #ff00cc, 0 0 120px #ff00cc, 0 0 240px #ff00cc' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => router.push('/exchange/browse')}
          >
            Browse Genres
          </button>
        </div>
        
        {/* Seeding link */}
        <div className="mt-8">
          <a
            href="/seed"
            className="text-sm text-gray-500 hover:text-pink-400 transition-colors duration-200"
            style={{ textShadow: '0 0 10px rgba(255, 0, 204, 0.3)' }}
          >
            Populate with AI thoughts
          </a>
        </div>
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
          box-shadow:
            0 0 20px #ff00cc,
            0 0 40px #ff00cc,
            0 0 80px #ff00cc;
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
        .typewriter-summary {
          text-shadow:
            0 0 24px #ff00cc,
            0 0 48px #ff00cc,
            0 0 96px #ff00cc;
        }
        .typewriter-cursor {
          display: inline-block;
          width: 1ch;
          animation: blink 1s steps(1) infinite;
        }
      `}</style>
    </div>
  )
} 
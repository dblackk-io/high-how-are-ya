"use client"

import Head from 'next/head'
import { useRouter } from 'next/navigation'




export default function ExchangePage() {
  const router = useRouter()




  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Title */}
        <h1 className="text-center font-black neon-title uppercase tracking-tight mb-20"
          style={{
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.05em',
            lineHeight: 1.1,
            fontSize: '4rem',
          }}
        >
          Speak Freely.<br />Stay Unknown.
        </h1>
        <style>{`
          @media (min-width: 768px) {
            h1.neon-title {
              font-size: 6rem !important;
            }
          }
        `}</style>
        
        {/* Two main buttons with proper spacing */}
        <div className="flex flex-col md:flex-row gap-6 items-center" style={{ marginTop: '60px', marginBottom: '60px' }}>
          <button
            onClick={() => router.push('/exchange/add-thought')}
            style={{
              backgroundColor: 'transparent',
              color: '#ff00cc',
              border: '2px solid #ff00cc',
              textShadow: '0 0 30px #ff00cc, 0 0 60px #ff00cc, 0 0 120px #ff00cc',
              boxShadow: '0 0 40px rgba(255, 0, 204, 0.3)',
              fontSize: '1.2rem',
              padding: '0.75rem 1.5rem',
              minWidth: '220px',
              minHeight: '48px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              borderRadius: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Share a Thought
          </button>
          <button
            onClick={() => router.push('/exchange/feed')}
            style={{
              backgroundColor: 'transparent',
              color: '#fff',
              border: '2px solid #fff',
              textShadow: '0 0 20px #fff, 0 0 40px #ff00cc',
              boxShadow: '0 0 30px rgba(255, 0, 204, 0.15)',
              fontSize: '1.2rem',
              padding: '0.75rem 1.5rem',
              minWidth: '220px',
              minHeight: '48px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              borderRadius: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            What&apos;s Everyone Thinking
          </button>
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
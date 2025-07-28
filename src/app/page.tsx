'use client'

import Head from 'next/head'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

export default function Home() {
  console.log("Rendering root page");
  const router = useRouter()

  const handleEnter = () => {
    router.push('/exchange')
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Massive NEON title */}
          <h1 className="text-center font-black text-[6rem] md:text-[8rem] neon-title uppercase tracking-tight mb-16" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
            HIGH HOW ARE YA
          </h1>
          {/* Main action buttons */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <button
              onClick={handleEnter}
              style={{
                backgroundColor: 'transparent',
                color: '#ff00cc',
                border: '2px solid #ff00cc',
                textShadow: '0 0 30px #ff00cc, 0 0 60px #ff00cc, 0 0 120px #ff00cc',
                boxShadow: '0 0 40px rgba(255, 0, 204, 0.3)',
                fontSize: '1.2rem',
                padding: '0.75rem 1.5rem',
                minWidth: '180px',
                minHeight: '44px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                borderRadius: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Enter
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                border: '2px solid #fff',
                textShadow: '0 0 20px #fff, 0 0 40px #fff',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                fontSize: '1.2rem',
                padding: '0.75rem 1.5rem',
                minWidth: '180px',
                minHeight: '44px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                borderRadius: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Sign Up
            </button>
          </div>
          
          {/* Login link */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/login')}
              style={{
                color: '#666',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ff00cc'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#666'}
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </main>
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
        .neon-pulse {
          color: #000;
          background: #ff00cc;
          border: 3px solid #ff00cc;
          animation: neonPulse 2s ease-in-out infinite alternate;
        }
        @keyframes neonPulse {
          0% {
            box-shadow:
              0 0 20px #ff00cc,
              0 0 40px #ff00cc,
              0 0 60px #ff00cc;
          }
          100% {
            box-shadow:
              0 0 40px #ff00cc,
              0 0 80px #ff00cc,
              0 0 120px #ff00cc;
          }
        }
      `}      </style>
      {/* Footer always at the bottom */}
      <Footer />
    </div>
  )
}

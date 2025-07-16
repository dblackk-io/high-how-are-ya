'use client'

import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [showAgeGate, setShowAgeGate] = useState(false)

  const handleEnter = () => {
    setShowAgeGate(true)
  }

  const handleAgeConfirm = () => {
    router.push('/exchange')
  }

  const handleAgeReject = () => {
    setShowAgeGate(false)
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Massive NEON title */}
        <h1 className="text-center font-black text-8xl md:text-9xl neon-title uppercase tracking-tight mb-12" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
          HIGH HOW ARE YA
        </h1>
        {/* Even bigger NEON Enter button */}
        <button
          className="neon-btn neon-solid text-6xl px-32 py-14 font-extrabold rounded-lg uppercase tracking-widest"
          onClick={handleEnter}
        >
          Enter
        </button>
      </div>

      {/* Age Gate Modal */}
      {showAgeGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred Background */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md">
            {/* Blurred Exchange Page Preview */}
            <div className="absolute inset-0 opacity-20">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl font-black text-pink-500 mb-8">SHARE A THOUGHT</div>
                <div className="text-6xl font-black text-pink-500 mb-8">GET A THOUGHT</div>
                <div className="text-6xl font-black text-pink-500 mb-8">STAY ANONYMOUS</div>
                <div className="w-96 h-16 bg-pink-500 rounded-lg mb-8"></div>
                <div className="w-96 h-16 bg-pink-500 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Age Gate Modal */}
          <div className="relative bg-black/95 border-2 border-pink-500 rounded-3xl p-12 max-w-2xl mx-8 text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-pink-500 mb-4 uppercase tracking-wide">
                Age Verification Required
              </h2>
              <div className="text-2xl text-pink-400 mb-6">18+</div>
            </div>

            <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 mb-8">
              <p className="text-lg text-red-300 mb-4 font-bold">
                ⚠️ EXPLICIT CONTENT WARNING ⚠️
              </p>
              <p className="text-base text-gray-300 mb-4">
                This application contains <strong>explicit sexual content</strong>, adult themes, and graphic material intended for individuals 18 years of age or older.
              </p>
              <p className="text-base text-gray-300">
                By continuing, you confirm that you are <strong>18 or older</strong> and consent to viewing explicit adult content.
              </p>
            </div>

            <div className="flex gap-6 justify-center">
              <button
                onClick={handleAgeConfirm}
                className="neon-btn neon-solid text-2xl px-12 py-6 font-bold rounded-xl uppercase tracking-wider"
              >
                I Am 18+
              </button>
              <button
                onClick={handleAgeReject}
                className="neon-btn text-2xl px-12 py-6 font-bold rounded-xl uppercase tracking-wider"
                style={{
                  background: 'transparent',
                  borderColor: '#666',
                  color: '#666',
                  boxShadow: '0 0 20px #666'
                }}
              >
                Exit
              </button>
            </div>
          </div>
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
      `}</style>
    </div>
  )
}

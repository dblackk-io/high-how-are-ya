"use client"

import Head from 'next/head'

import { useRouter } from 'next/navigation'

export default function NSFWExchangePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div className="flex flex-col items-center justify-center w-full max-w-2xl px-8 py-14">
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-center font-black text-3xl md:text-4xl neon-title uppercase tracking-tight mr-3" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', color: '#ff00cc', textShadow: '0 0 24px #ff00cc, 0 0 48px #ff00cc' }}>
            ADULT CONTENT
          </h2>
          <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-full align-middle shadow-md border-2 border-red-400" style={{letterSpacing:'0.1em'}}>18+ ONLY</span>
        </div>
        
        <div className="bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 mb-8 text-center">
          <p className="text-lg text-red-300 mb-4 font-bold">
            ⚠️ EXPLICIT SEXUAL CONTENT WARNING ⚠️
          </p>
          <p className="text-base text-gray-300 mb-4" style={{lineHeight:1.6}}>
            This section contains <strong>explicit sexual content</strong>, adult themes, and graphic material intended for individuals 18 years of age or older. Content may include:
          </p>
          <ul className="text-sm text-gray-400 mb-4 text-left list-disc list-inside">
            <li>Explicit sexual thoughts and fantasies</li>
            <li>Adult relationship content</li>
            <li>Sexual humor and innuendo</li>
            <li>Graphic descriptions and adult themes</li>
          </ul>
          <p className="text-base text-gray-300" style={{lineHeight:1.6}}>
            By continuing, you confirm that you are <strong>18 or older</strong> and consent to viewing explicit adult content. If you are under 18, exit immediately.
          </p>
        </div>
        
        <h1 className="text-center font-black text-4xl md:text-5xl mb-8 neon-title uppercase tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '-0.05em', lineHeight: 1.1, color: '#ff00cc', textShadow: '0 0 24px #ff00cc, 0 0 48px #ff00cc' }}>
          ENTER ADULT ZONE?
        </h1>
        
        <div className="flex flex-row gap-10 mt-2">
          <button
            className="neon-btn neon-solid text-xl px-8 py-3 rounded-xl font-black tracking-[0.18em] shadow-xl uppercase transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', borderWidth: '3px', borderColor: '#ff00cc', textShadow: '0 0 24px #ff00cc' }}
            onClick={() => router.push('/exchange/add-thought?nsfw=1')}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            ENTER 🔥
          </button>
          <button
            className="neon-btn text-xl px-8 py-3 rounded-xl font-black tracking-[0.18em] shadow-xl uppercase transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            style={{ 
              fontFamily: 'Space Grotesk, Inter, sans-serif', 
              borderWidth: '3px', 
              borderColor: '#666', 
              color: '#666',
              background: 'transparent',
              textShadow: '0 0 24px #666'
            }}
            onClick={() => router.push('/exchange')}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            EXIT
          </button>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect } from 'react'
import { seedDatabase, checkDatabaseStatus } from '@/lib/seed-data'

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [status, setStatus] = useState<{ count?: number | null; needsSeeding?: boolean } | null>(null)
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: unknown } | null>(null)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const dbStatus = await checkDatabaseStatus()
    setStatus(dbStatus)
  }

  const handleSeed = async () => {
    setIsSeeding(true)
    setResult(null)
    
    try {
      const seedResult = await seedDatabase()
      setResult(seedResult)
      
      if (seedResult.success) {
        // Refresh status after successful seeding
        await checkStatus()
      }
    } catch (error) {
      setResult({ success: false, error })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-black text-4xl md:text-5xl neon-title mb-4" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
          Database Seeding
        </h1>
        <p className="text-lg text-gray-400">
          Populate the database with AI-generated thoughts
        </p>
      </div>

      {/* Status Card */}
      <div className="neon-chatbox flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl mb-8" style={{ minWidth: 500, maxWidth: 600 }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
          
          {status ? (
            <div className="space-y-4">
              <div className="text-lg">
                <span className="text-gray-400">Thoughts in database: </span>
                <span className="text-pink-400 font-bold">{status.count || 0}</span>
              </div>
              
              {status.needsSeeding ? (
                <div className="text-yellow-400 font-semibold">
                  ⚠️ Database needs seeding
                </div>
              ) : (
                <div className="text-green-400 font-semibold">
                  ✅ Database is populated
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">Loading status...</div>
          )}
        </div>

        {/* Seed Button */}
        <button
          onClick={handleSeed}
          disabled={isSeeding || !status?.needsSeeding}
          className={`neon-btn neon-solid text-xl px-8 py-4 font-bold rounded-xl uppercase tracking-wider ${
            isSeeding || !status?.needsSeeding ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSeeding ? 'Seeding Database...' : 'Seed Database'}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="neon-chatbox flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl" style={{ minWidth: 500, maxWidth: 600 }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Seeding Result</h2>
            
            {result.success ? (
              <div className="space-y-4">
                <div className="text-green-400 text-4xl mb-4">✅</div>
                <div className="text-lg text-white">
                  Successfully seeded database with <span className="text-pink-400 font-bold">{result.count}</span> thoughts!
                </div>
                <div className="text-sm text-gray-400">
                  The app is now ready to use with AI-generated content.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-red-400 text-4xl mb-4">❌</div>
                <div className="text-lg text-white">
                  Error seeding database
                </div>
                <div className="text-sm text-red-300">
                  {(result.error as Error)?.message || 'Unknown error occurred'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8">
        <button
          onClick={() => window.location.href = '/exchange'}
          className="neon-btn text-lg px-6 py-3 font-bold rounded-lg uppercase tracking-wider"
          style={{
            background: 'transparent',
            borderColor: '#00ffff',
            color: '#00ffff',
            boxShadow: '0 0 20px #00ffff'
          }}
        >
          Back to Exchange
        </button>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  
  // Get redirect URL from query params
  const [redirectTo, setRedirectTo] = useState('/exchange/feed')
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setRedirectTo(searchParams.get('redirect') || '/exchange/feed')
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Store anonymous identifier
            anonymous_id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user && !data.session) {
        // Email confirmation required
        setUserEmail(email)
        setShowEmailConfirmation(true)
        return
      }

      if (data.user && data.session) {
        // User is immediately signed in (email confirmation not required)
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              session_id: data.user.user_metadata.anonymous_id,
              created_at: new Date().toISOString(),
              last_active: new Date().toISOString()
            }
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        // Redirect to the intended page or feed
        router.push(redirectTo)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      })
      
      if (error) {
        setError(error.message)
      } else {
        setError('')
        alert('Confirmation email sent! Check your inbox.')
      }
    } catch {
      setError('Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestMode = () => {
    // Generate anonymous session and redirect
    const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('anon_session_id', sessionId)
    router.push('/exchange/feed')
  }

  // Show email confirmation screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#ff00cc] mb-2">Check Your Email</h1>
            <p className="text-gray-400">We sent a confirmation link to</p>
            <p className="text-[#ff00cc] font-semibold">{userEmail}</p>
          </div>

          {/* Email Confirmation Content */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#ff00cc] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Confirm Your Email</h2>
                <p className="text-gray-400 text-sm">
                  Click the link in your email to complete your account setup. 
                  This helps us keep your account secure.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-[#ff00cc] text-black py-3 rounded-xl font-bold hover:bg-[#ff33cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </button>
            
            <button
              onClick={() => setShowEmailConfirmation(false)}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Back to Sign Up
            </button>
            
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-transparent text-gray-400 py-3 rounded-xl font-bold hover:text-white transition-colors"
            >
              Already confirmed? Sign In
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Can&apos;t find the email?</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes for delivery</li>
              <li>• Try clicking &quot;Resend Email&quot; above</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#ff00cc] mb-2">Join High How Are Ya</h1>
          <p className="text-gray-400">Stay anonymous, track your stats</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#ff00cc] transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#ff00cc] transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff00cc] text-black py-3 rounded-xl font-bold hover:bg-[#ff33cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* Guest Mode */}
        <button
          onClick={handleGuestMode}
          className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Continue as Guest
        </button>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-[#ff00cc] hover:text-[#ff33cc] transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Privacy & Anonymity</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Your email is only used for account recovery</li>
            <li>• All thoughts and interactions remain anonymous</li>
            <li>• No personal information is shared publicly</li>
            <li>• You can delete your account anytime</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
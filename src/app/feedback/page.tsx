'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSessionId } from '@/lib/supabase'
import Link from 'next/link'

export default function FeedbackPage() {
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmitFeedback = async () => {
    if (!feedbackRating) return
    
    setIsSubmitting(true)
    try {
      // Save feedback to database
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            session_id: getSessionId(),
            rating: feedbackRating,
            text: feedbackText || null,
            user_agent: navigator.userAgent
          }
        ])

      if (error) {
        console.error('Error submitting feedback:', error)
        // Fallback to localStorage if database fails
        const feedback = {
          rating: feedbackRating,
          text: feedbackText,
          timestamp: new Date().toISOString(),
          sessionId: getSessionId()
        }
        
        const existingFeedback = JSON.parse(localStorage.getItem('user-feedback') || '[]')
        existingFeedback.push(feedback)
        localStorage.setItem('user-feedback', JSON.stringify(existingFeedback))
      }
      
      setIsSubmitted(true)
      
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-4">Thanks for your feedback!</h1>
          <p className="text-gray-400 mb-6">Your input helps us make the platform better.</p>
          <Link 
            href="/exchange/feed"
            className="inline-block bg-[#ff00cc] text-black px-6 py-3 rounded-full font-bold hover:bg-[#ff33cc] transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Feedback</h1>
          <p className="text-gray-400">Help us improve the platform</p>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">How would you rate your experience?</label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setFeedbackRating(rating)}
                className={`w-12 h-12 rounded-full text-lg font-bold transition-all ${
                  feedbackRating === rating
                    ? 'bg-[#ff00cc] text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Text Feedback */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">Additional comments (optional)</label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff00cc] transition-colors resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitFeedback}
          disabled={!feedbackRating || isSubmitting}
          className="w-full bg-[#ff00cc] text-black py-3 rounded-lg font-bold hover:bg-[#ff33cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>

        {/* Back Link */}
        <Link 
          href="/exchange/feed"
          className="block text-center text-gray-400 hover:text-[#ff00cc] transition-colors"
        >
          ← Back to Feed
        </Link>
      </div>
    </div>
  )
} 
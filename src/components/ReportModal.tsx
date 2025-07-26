'use client'

import { useState } from 'react'
import { supabase, getSessionId } from '@/lib/supabase'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  thoughtId: string
  thoughtContent: string
}

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Violence',
  'Inappropriate content',
  'False information',
  'Other'
]

export default function ReportModal({ isOpen, onClose, thoughtId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReason) return

    setIsSubmitting(true)
    
    try {
      const sessionId = getSessionId()
      
      const { error } = await supabase
        .from('reports')
        .insert([
          {
            thought_id: thoughtId,
            session_id: sessionId,
            reason: selectedReason,
            details: additionalDetails,
            reported_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setSelectedReason('')
        setAdditionalDetails('')
      }, 2000)

    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-[#ff00cc] mb-4">Report Thought</h3>
        
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-green-400 text-lg mb-2">✓ Report Submitted</div>
            <div className="text-gray-400 text-sm">Thank you for helping keep the community safe.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Reason for reporting:</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                required
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Additional details (optional):</label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Provide more context..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white h-24 resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedReason}
                className="flex-1 px-4 py-2 bg-[#ff00cc] text-black font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff33cc] transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 
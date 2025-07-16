'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'

interface ThoughtSubmitProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (thought: string, vibe: string, nsfw: boolean) => void
}

export default function ThoughtSubmit({ isOpen, onClose, onSubmit }: ThoughtSubmitProps) {
  const [thought, setThought] = useState('')
  const [vibe, setVibe] = useState('')
  const [nsfw, setNsfw] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!thought.trim()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(thought.trim(), vibe, nsfw)
      setThought('')
      setVibe('')
      setNsfw(false)
      onClose()
    } catch (error) {
      console.error('Failed to submit thought:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const vibeOptions = [
    { value: 'funny', label: 'Funny', emoji: '😂' },
    { value: 'deep', label: 'Deep', emoji: '🤔' },
    { value: 'horny', label: 'Horny', emoji: '🔥' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold gradient-text">What's Your Damage?</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Thought Input */}
            <div className="mb-6">
                             <textarea
                 value={thought}
                 onChange={(e) => setThought(e.target.value)}
                 placeholder="Spill it. (200 chars max)"
                 maxLength={200}
                 className="w-full h-32 bg-gray-800 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
               />
              <div className="text-right text-sm text-gray-400 mt-2">
                {thought.length}/200
              </div>
            </div>

            {/* Vibe Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Vibe (optional)</label>
              <div className="flex gap-2">
                {vibeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setVibe(vibe === option.value ? '' : option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      vibe === option.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* NSFW Toggle */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={nsfw}
                  onChange={(e) => setNsfw(e.target.checked)}
                  className="mr-3 w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm">NSFW content</span>
              </label>
            </div>

            {/* Submit Button */}
                           <button
                 onClick={handleSubmit}
                 disabled={!thought.trim() || isSubmitting}
                 className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isSubmitting ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     Sending...
                   </>
                 ) : (
                   <>
                     <Sparkles size={16} />
                     Unleash
                   </>
                 )}
               </button>

            {/* Privacy Note */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Your thought will be shared anonymously. No personal information is stored.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
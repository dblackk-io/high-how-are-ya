'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChatPage() {
  const [thought, setThought] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNSFW, setIsNSFW] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!thought.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('thoughts')
        .insert({
          content: thought.trim(),
          user_id: null,
          vibe_tag: isNSFW ? 'horny' : 'deep',
          nsfw_flag: isNSFW,
          gender_target: null
        })
        .select()
        .single()

      if (error) throw error

      setThought('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsNSFW(false)
      
    } catch (error) {
      console.error('Error submitting thought:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black neon-title uppercase tracking-tight mb-4" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
            Share Your Thoughts
          </h1>
          <p className="text-xl text-gray-400">
            Express yourself through words and images
          </p>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-black border border-[#ff00cc] rounded-2xl p-8" style={{
          boxShadow: "0 0 30px rgba(255, 0, 204, 0.3)"
        }}>
          
          {/* Text Input Area */}
          <div className="mb-6">
            <textarea
              className="w-full h-48 px-6 py-4 rounded-xl text-white bg-black border border-[#ff00cc] focus:outline-none focus:ring-2 focus:ring-[#ff00cc] placeholder-gray-500 resize-none text-lg"
              placeholder="What's on your mind? Share your thoughts, ideas, or observations..."
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              disabled={isSubmitting}
              style={{
                boxShadow: "0 0 15px rgba(255, 0, 204, 0.2)"
              }}
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            {!selectedImage ? (
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#ff00cc] rounded-xl text-[#ff00cc] bg-black hover:bg-[#ff00cc]/5 cursor-pointer transition-all"
                style={{
                  boxShadow: "0 0 15px rgba(255, 0, 204, 0.2)"
                }}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm font-medium">Add a photo (optional)</p>
                  <p className="text-xs text-gray-500 mt-1">Click to upload an image</p>
                </div>
              </label>
            ) : (
              <div className="relative w-full h-48">
                <img
                  src={imagePreview || ""}
                  alt="Upload Preview"
                  className="w-full h-full object-cover rounded-xl border border-[#ff00cc]"
                  style={{ 
                    boxShadow: "0 0 20px rgba(255, 0, 204, 0.3)"
                  }}
                />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-black/80 text-[#ff00cc] p-2 rounded-full hover:bg-red-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Controls and Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNSFW}
                  onChange={(e) => setIsNSFW(e.target.checked)}
                  className="mr-3 w-5 h-5 text-[#ff00cc] bg-black border-2 border-[#ff00cc] rounded focus:ring-[#ff00cc]"
                />
                <span className="text-[#ff00cc] text-base font-medium">NSFW Content</span>
              </label>
              
              <div className="text-sm text-gray-500">
                {thought.length}/500 characters
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !thought.trim()}
              className="px-8 py-4 bg-[#ff00cc] text-black font-bold rounded-xl hover:bg-[#ff33cc] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
              style={{
                boxShadow: "0 0 20px rgba(255, 0, 204, 0.5)"
              }}
            >
              {isSubmitting ? "Posting..." : "Post Thought"}
            </button>
          </div>
        </div>

        {/* Back to Feed Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-[#ff00cc] transition-colors text-lg font-medium"
          >
            ← Back to Feed
          </button>
        </div>
      </div>
    </div>
  )
} 
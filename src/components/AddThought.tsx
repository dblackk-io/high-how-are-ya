'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AddThoughtProps {
  onThoughtAdded?: () => void;
}

export default function AddThought({ onThoughtAdded }: AddThoughtProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const playPostSound = () => {
    // Create audio context for the ding and buzz sound
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Ding sound (high frequency)
    const dingOsc = audioContext.createOscillator();
    const dingGain = audioContext.createGain();
    dingOsc.connect(dingGain);
    dingGain.connect(audioContext.destination);
    
    dingOsc.frequency.setValueAtTime(800, audioContext.currentTime);
    dingOsc.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    dingGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    dingGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    // Buzz sound (lower frequency)
    const buzzOsc = audioContext.createOscillator();
    const buzzGain = audioContext.createGain();
    buzzOsc.connect(buzzGain);
    buzzGain.connect(audioContext.destination);
    
    buzzOsc.frequency.setValueAtTime(200, audioContext.currentTime);
    buzzOsc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
    buzzGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    buzzGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    dingOsc.start(audioContext.currentTime);
    dingOsc.stop(audioContext.currentTime + 0.1);
    buzzOsc.start(audioContext.currentTime + 0.05);
    buzzOsc.stop(audioContext.currentTime + 0.25);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('thoughts')
        .insert([
          {
            content: content.trim(),
            vibe_tag: 'deep', // Default to deep, let the content speak for itself
            nsfw_flag: false,
            is_active: true,
            streak_count: 0,
            dislike_count: 0
          }
        ]);

      if (error) {
        throw error;
      }

      setContent('');
      setMessage('Posted');
      playPostSound(); // Play the ding and buzz sound
      onThoughtAdded?.();

      // Clear success message after 2 seconds
      setTimeout(() => setMessage(''), 2000);

    } catch (err) {
      console.error('Error submitting thought:', err);
      setMessage('Failed to post. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl w-full">
      <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Input */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none resize-none text-lg"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500">
              {content.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-8 py-3 bg-[#ff00cc] text-white font-bold rounded-lg uppercase tracking-wider neon-btn cyber-font transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`text-center p-3 rounded ${
              message.includes('Failed') 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Thoughts for You Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/exchange/feed')}
          className="px-6 py-2 bg-transparent border border-[#ff00cc] text-[#ff00cc] cyber-font neon-text text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-[#ff00cc] hover:text-white transition-all"
        >
          Thoughts for You
        </button>
      </div>

      {/* Cyberpunk Description */}
      <div className="mt-8 text-center space-y-4">
        <div className="space-y-2">
          <p className="text-[#ff00cc] cyber-font neon-text text-lg font-bold uppercase tracking-wider">
            - see thoughts
          </p>
          <p className="text-[#ff00cc] cyber-font neon-text text-lg font-bold uppercase tracking-wider">
            - strike or bump
          </p>
          <p className="text-[#ff00cc] cyber-font neon-text text-lg font-bold uppercase tracking-wider">
            - comment
          </p>
        </div>
        <p className="text-[#ff00cc] cyber-font neon-text text-sm font-bold uppercase tracking-wider">
          3 Strikes and your thought is out
        </p>
        <p className="text-[#ff00cc] cyber-font neon-text text-sm font-bold uppercase tracking-wider">
          Enjoy. We remain The same:)
        </p>
      </div>

      <style jsx>{`
        .neon-btn {
          box-shadow: 
            0 0 20px #ff00cc,
            0 0 40px #ff00cc;
        }
        .neon-btn:hover {
          box-shadow: 
            0 0 30px #ff00cc,
            0 0 60px #ff00cc;
        }
        .neon-text {
          text-shadow: 
            0 0 10px #ff00cc,
            0 0 20px #ff00cc,
            0 0 30px #ff00cc;
        }
      `}</style>
    </div>
  );
} 
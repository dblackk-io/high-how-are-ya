'use client';

import { useRouter } from 'next/navigation';
import AddThought from '@/components/AddThought';

export default function AddThoughtPage() {
  const router = useRouter();

  const handleThoughtAdded = () => {
    // Optionally redirect to feed after adding
    // router.push('/exchange/feed');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#ff00cc] neon-glow uppercase tracking-wider cyber-font">
            Share
          </h1>
          <button
            onClick={() => router.push('/exchange/feed')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← back
          </button>
        </div>
      </div>

      {/* Add Thought Form */}
      <AddThought onThoughtAdded={handleThoughtAdded} />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .cyber-font {
          font-family: 'Orbitron', monospace;
        }
        
        .neon-glow {
          text-shadow: 
            0 0 20px #ff00cc,
            0 0 40px #ff00cc,
            0 0 80px #ff00cc;
        }
      `}</style>
    </div>
  );
} 
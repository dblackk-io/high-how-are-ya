"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'

export default function BrowsePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const router = useRouter()

  const topics = [
    "Philosophy", "Humor", "Relationships",
    "Technology", "Creativity", "Politics",
    "Science", "Lifestyle", "Entertainment"
  ];

  const toggle = (topic: string) => {
    setSelected(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleContinue = () => {
    if (selected.length < 3 || !ageGroup) return
    const topicParams = selected.join(',')
    router.push(`/exchange/feed?topics=${topicParams}&age=${ageGroup}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold mb-3">What do you want to see?</h1>
        <p className="text-sm text-gray-400 mb-8">
          Select at least 3 topics to personalize your feed. They will help us show you relevant thoughts.
        </p>
        
        {/* Age Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Are you...</h2>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setAgeGroup('under18')}
              className={`px-8 py-3 rounded-xl transition-all duration-200 ease-in-out border-2 font-semibold
                ${ageGroup === 'under18'
                  ? "bg-white text-black border-white shadow-md"
                  : "border-gray-600 text-white hover:border-white hover:shadow"
                }
              `}
            >
              Under 18
            </button>
            <button
              onClick={() => setAgeGroup('18plus')}
              className={`px-8 py-3 rounded-xl transition-all duration-200 ease-in-out border-2 font-semibold
                ${ageGroup === '18plus'
                  ? "bg-white text-black border-white shadow-md"
                  : "border-gray-600 text-white hover:border-white hover:shadow"
                }
              `}
            >
              18+
            </button>
          </div>
          
          {ageGroup === '18plus' && (
            <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="text-[#ff00cc] font-medium">18+ Content Notice:</span> You&apos;ll have access to unfiltered thoughts, including mature themes, explicit language, and adult discussions. Content moderation is relaxed while maintaining basic safety standards.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl w-full mb-8">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => toggle(topic)}
            className={`border rounded-xl py-3 px-4 text-center transition-all duration-200 ease-in-out w-full
              ${selected.includes(topic)
                ? "bg-white text-black font-semibold shadow-md"
                : "border-gray-600 hover:border-white hover:shadow"}
            `}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* ✅ FOOTER */}
      <div className="flex justify-between items-center w-full max-w-2xl px-1">
        <span className="text-sm text-gray-500">
          {selected.length} of 3 selected • {ageGroup ? (ageGroup === 'under18' ? 'Under 18' : '18+') : 'Age not selected'}
        </span>
        <button
          onClick={handleContinue}
          disabled={selected.length < 3 || !ageGroup}
          className={`px-4 py-1.5 rounded-full transition-all duration-200 text-sm
            ${selected.length >= 3 && ageGroup ? "bg-white text-black" : "bg-gray-800 text-gray-500 cursor-not-allowed"}
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
} 
'use client'

import { useState } from "react";

export default function FixPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const topics = [
    "Philosophy", "Technology", "Science",
    "Humor", "Creativity", "Lifestyle",
    "Relationships", "Politics", "Entertainment"
  ];

  const toggle = (topic: string) => {
    setSelected((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold mb-3">What do you want to see?</h1>
        <p className="text-sm text-gray-400">
          Select at least 3 topics to personalize your feed. They will help us show you relevant thoughts.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl w-full mb-10">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => toggle(topic)}
            className={`w-[160px] h-[60px] border rounded-xl py-3 px-4 text-center transition-all duration-200 ease-in-out
              ${selected.includes(topic)
                ? "bg-white text-black font-semibold shadow-md"
                : "border-gray-600 hover:border-white hover:shadow"}
            `}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center w-full max-w-2xl px-1">
        <span className="text-sm text-gray-500">{selected.length} of 3 selected</span>
        <button
          disabled={selected.length < 3}
          className={`px-4 py-1.5 rounded-full transition-all duration-200 text-sm
            ${selected.length >= 3 ? "bg-white text-black" : "bg-gray-800 text-gray-500 cursor-not-allowed"}
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
} 
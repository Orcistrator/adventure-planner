'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ConversationPrompt } from '@/lib/types';

interface ReadAloudProps {
  text: string;
  prompts?: ConversationPrompt[];
}

export default function ReadAloud({ text, prompts }: ReadAloudProps) {
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);

  return (
    <div className="my-6">
      <div className="read-aloud shadow-sm">
        <p>{text}</p>
      </div>

      {prompts && prompts.length > 0 && (
        <div className="mt-2 ml-4 flex flex-col gap-2">
          {prompts.map((prompt, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-md overflow-hidden bg-white"
            >
              <button
                onClick={() =>
                  setExpandedPrompt(expandedPrompt === idx ? null : idx)
                }
                className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-gray-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">If</span>{' '}
                  {prompt.trigger}
                </span>
                {expandedPrompt === idx ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              {expandedPrompt === idx && (
                <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-200 bg-white italic">
                  &ldquo;{prompt.response}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

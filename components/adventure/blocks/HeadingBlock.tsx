'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface HeadingBlockProps {
  id: Id<'blocks'>;
  text: string;
  level: number;
  isEditing: boolean;
}

const headingClasses: Record<number, string> = {
  1: 'font-heading text-4xl font-bold text-gray-900 mt-10 mb-4',
  2: 'font-heading text-3xl font-bold text-gray-900 mt-8 mb-3',
  3: 'font-heading text-2xl font-bold text-gray-900 mt-6 mb-2',
};

const inputClasses: Record<number, string> = {
  1: 'font-heading text-4xl font-bold text-gray-900',
  2: 'font-heading text-3xl font-bold text-gray-900',
  3: 'font-heading text-2xl font-bold text-gray-900',
};

export default function HeadingBlock({ id, text, level, isEditing }: HeadingBlockProps) {
  const [draft, setDraft] = useState(text);
  const updateBlock = useMutation(api.blocks.update);
  const safeLevel = Math.max(1, Math.min(3, level)) as 1 | 2 | 3;

  useEffect(() => {
    setDraft(text);
  }, [text]);

  const handleBlur = () => {
    if (draft !== text) {
      updateBlock({ id, patch: { text: draft } });
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        className={`w-full bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-300 pb-1 ${inputClasses[safeLevel]}`}
      />
    );
  }

  const Tag = `h${safeLevel}` as 'h1' | 'h2' | 'h3';
  return <Tag className={headingClasses[safeLevel]}>{text}</Tag>;
}

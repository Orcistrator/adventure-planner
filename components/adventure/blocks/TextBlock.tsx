'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface TextBlockProps {
  id: Id<'blocks'>;
  markdown: string;
  isEditing: boolean;
}

export default function TextBlock({ id, markdown, isEditing }: TextBlockProps) {
  const [draft, setDraft] = useState(markdown);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => {
    setDraft(markdown);
  }, [markdown]);

  useEffect(() => {
    if (focused && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft, focused]);

  const handleBlur = () => {
    setFocused(false);
    if (draft !== markdown) {
      updateBlock({ id, patch: { markdown: draft } });
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder="Start typing…"
        className="w-full resize-none bg-transparent text-gray-700 leading-relaxed text-base outline-none placeholder:text-gray-300 min-h-[3rem]"
        rows={1}
      />
    );
  }

  return (
    <p className="text-gray-700 leading-relaxed">
      {markdown || <span className="text-gray-300 italic">Empty text block</span>}
    </p>
  );
}

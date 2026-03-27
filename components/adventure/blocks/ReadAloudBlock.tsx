'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Check } from 'lucide-react';
import ReadAloud from '@/components/adventure/ReadAloud';

interface ReadAloudBlockProps {
  id: Id<'blocks'>;
  text: string;
  isEditing: boolean;
  editTrigger?: number;
}

export default function ReadAloudBlock({ id, text, isEditing, editTrigger }: ReadAloudBlockProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftText, setDraftText] = useState(text);
  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => {
    if (editTrigger) setEditOpen(true);
  }, [editTrigger]);

  useEffect(() => {
    setDraftText(text);
  }, [text]);

  const save = () => {
    updateBlock({ id, patch: { text: draftText } });
    setEditOpen(false);
  };

  if (isEditing && editOpen) {
    return (
      <div className="my-6 border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">Read Aloud</span>
          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
          >
            <Check size={14} /> Save
          </button>
        </div>

        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          rows={4}
          placeholder="Read-aloud text…"
          className="w-full border border-indigo-200 rounded p-3 text-sm text-gray-700 bg-white resize-none outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
    );
  }

  return <ReadAloud text={text} />;
}

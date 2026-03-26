'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Check } from 'lucide-react';

interface ImageBlockProps {
  id: Id<'blocks'>;
  url: string;
  caption?: string;
  isEditing: boolean;
  editTrigger?: number;
}

export default function ImageBlock({ id, url, caption, isEditing, editTrigger }: ImageBlockProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftUrl, setDraftUrl] = useState(url);
  const [draftCaption, setDraftCaption] = useState(caption ?? '');
  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => {
    if (editTrigger) setEditOpen(true);
  }, [editTrigger]);

  useEffect(() => {
    setDraftUrl(url);
    setDraftCaption(caption ?? '');
  }, [url, caption]);

  // Auto-open edit on first insert (empty url)
  useEffect(() => {
    if (isEditing && url === '') setEditOpen(true);
  }, []);

  const save = () => {
    updateBlock({ id, patch: { url: draftUrl, caption: draftCaption || undefined } });
    setEditOpen(false);
  };

  if (isEditing && editOpen) {
    return (
      <div className="my-6 border-2 border-teal-200 rounded-lg p-4 bg-teal-50/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-teal-700 uppercase tracking-wider">Image</span>
          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700"
          >
            <Check size={14} /> Save
          </button>
        </div>

        <input
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          placeholder="Image URL…"
          className="w-full border border-teal-200 rounded p-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-teal-300 mb-3"
          autoFocus
        />

        <input
          value={draftCaption}
          onChange={(e) => setDraftCaption(e.target.value)}
          placeholder="Caption (optional)…"
          className="w-full border border-teal-200 rounded p-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="my-6 rounded-lg border-2 border-dashed border-gray-200 h-32 flex items-center justify-center text-gray-300 text-sm">
        No image URL set
      </div>
    );
  }

  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={caption ?? ''} className="w-full rounded-lg" />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-500 text-center italic">{caption}</figcaption>
      )}
    </figure>
  );
}

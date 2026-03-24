'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Pencil, Check, Plus, Trash2 } from 'lucide-react';
import ReadAloud from '@/components/adventure/ReadAloud';

interface Prompt {
  trigger: string;
  response: string;
}

interface ReadAloudBlockProps {
  id: Id<'blocks'>;
  text: string;
  prompts?: Prompt[];
  isEditing: boolean;
}

export default function ReadAloudBlock({ id, text, prompts, isEditing }: ReadAloudBlockProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftText, setDraftText] = useState(text);
  const [draftPrompts, setDraftPrompts] = useState<Prompt[]>(prompts ?? []);
  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => {
    setDraftText(text);
    setDraftPrompts(prompts ?? []);
  }, [text, prompts]);

  const save = () => {
    updateBlock({ id, patch: { text: draftText, prompts: draftPrompts } });
    setEditOpen(false);
  };

  const updatePrompt = (idx: number, field: keyof Prompt, value: string) => {
    setDraftPrompts((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const addPrompt = () => {
    setDraftPrompts((prev) => [...prev, { trigger: '', response: '' }]);
  };

  const removePrompt = (idx: number) => {
    setDraftPrompts((prev) => prev.filter((_, i) => i !== idx));
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
          className="w-full border border-indigo-200 rounded p-3 text-sm text-gray-700 bg-white resize-none outline-none focus:ring-2 focus:ring-indigo-300 mb-4"
        />

        <div className="flex flex-col gap-3">
          {draftPrompts.map((p, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase">If</span>
                <input
                  value={p.trigger}
                  onChange={(e) => updatePrompt(idx, 'trigger', e.target.value)}
                  placeholder="player does…"
                  className="flex-1 text-sm border-b border-gray-200 outline-none focus:border-indigo-300 pb-0.5"
                />
                <button onClick={() => removePrompt(idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={p.response}
                onChange={(e) => updatePrompt(idx, 'response', e.target.value)}
                placeholder="Then say…"
                rows={2}
                className="w-full text-sm border border-gray-200 rounded p-2 outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
              />
            </div>
          ))}
          <button
            onClick={addPrompt}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 self-start"
          >
            <Plus size={14} /> Add prompt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/readAloud">
      <ReadAloud text={text} prompts={prompts} />
      {isEditing && (
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-2 right-2 opacity-0 group-hover/readAloud:opacity-100 transition-opacity p-1.5 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-indigo-600"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}

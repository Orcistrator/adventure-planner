'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Check, Plus, Trash2 } from 'lucide-react';
import TreasureTable from '@/components/adventure/TreasureTable';

interface TableItem {
  roll: string;
  result: string;
}

interface TreasureTableBlockProps {
  id: Id<'blocks'>;
  title: string;
  items: TableItem[];
  isEditing: boolean;
  editTrigger?: number;
}

export default function TreasureTableBlock({ id, title, items, isEditing, editTrigger }: TreasureTableBlockProps) {
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (editTrigger) setEditOpen(true);
  }, [editTrigger]);

  const [draftTitle, setDraftTitle] = useState(title);
  const [draftResults, setDraftResults] = useState<string[]>(items.map((i) => i.result));
  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => {
    setDraftTitle(title);
    setDraftResults(items.map((i) => i.result));
  }, [title, items]);

  const save = () => {
    const computedItems = draftResults.map((result, idx) => ({
      roll: String(idx + 1),
      result,
    }));
    updateBlock({ id, patch: { title: draftTitle, items: computedItems } });
    setEditOpen(false);
  };

  const updateResult = (idx: number, value: string) => {
    setDraftResults((prev) => prev.map((r, i) => (i === idx ? value : r)));
  };

  const addItem = () => {
    setDraftResults((prev) => [...prev, '']);
  };

  const removeItem = (idx: number) => {
    setDraftResults((prev) => prev.filter((_, i) => i !== idx));
  };

  if (isEditing && editOpen) {
    return (
      <div className="my-6 border-2 border-amber-200 rounded-lg p-4 bg-amber-50/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Table</span>
          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700"
          >
            <Check size={14} /> Save
          </button>
        </div>

        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Table title…"
          className="w-full border border-amber-200 rounded p-2 text-sm font-semibold text-gray-800 bg-white outline-none focus:ring-2 focus:ring-amber-300 mb-4"
        />

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[2rem_1fr_2rem] gap-2 text-xs font-semibold text-gray-400 uppercase px-1">
            <span className="text-center">#</span>
            <span>Result</span>
          </div>
          {draftResults.map((result, idx) => (
            <div key={idx} className="grid grid-cols-[2rem_1fr_2rem] gap-2 items-center">
              <span className="text-xs font-mono text-gray-400 text-center tabular-nums">{idx + 1}</span>
              <input
                value={result}
                onChange={(e) => updateResult(idx, e.target.value)}
                placeholder="Result…"
                className="text-sm border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-amber-300"
              />
              <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 justify-self-center">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 self-start mt-1"
          >
            <Plus size={14} /> Add row
          </button>
        </div>
      </div>
    );
  }

  return <TreasureTable title={title} items={items} />;
}

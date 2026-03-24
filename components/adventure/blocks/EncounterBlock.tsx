'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Pencil, Check, Plus, Trash2 } from 'lucide-react';
import EncounterTracker from '@/components/adventure/EncounterTracker';

interface Monster {
  entityId: string;
  count: number;
}

interface EncounterBlockProps {
  id: Id<'blocks'>;
  title: string;
  monsters: Monster[];
  isEditing: boolean;
}

export default function EncounterBlock({ id, title, monsters, isEditing }: EncounterBlockProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftMonsters, setDraftMonsters] = useState<Monster[]>(monsters);
  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => {
    setDraftTitle(title);
    setDraftMonsters(monsters);
  }, [title, monsters]);

  const save = () => {
    updateBlock({ id, patch: { title: draftTitle, monsters: draftMonsters } });
    setEditOpen(false);
  };

  const updateMonster = (idx: number, field: keyof Monster, value: string | number) => {
    setDraftMonsters((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const addMonster = () => {
    setDraftMonsters((prev) => [...prev, { entityId: '', count: 1 }]);
  };

  const removeMonster = (idx: number) => {
    setDraftMonsters((prev) => prev.filter((_, i) => i !== idx));
  };

  if (isEditing && editOpen) {
    return (
      <div className="my-6 border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-red-700 uppercase tracking-wider">Encounter</span>
          <button
            onClick={save}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
          >
            <Check size={14} /> Save
          </button>
        </div>

        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Encounter title…"
          className="w-full border border-red-200 rounded p-2 text-sm font-semibold text-gray-800 bg-white outline-none focus:ring-2 focus:ring-red-300 mb-4"
        />

        <div className="flex flex-col gap-2">
          {draftMonsters.map((m, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded p-2">
              <input
                value={m.entityId}
                onChange={(e) => updateMonster(idx, 'entityId', e.target.value)}
                placeholder="Entity slug (e.g. goblin)"
                className="flex-1 text-sm border-b border-gray-200 outline-none focus:border-red-300 pb-0.5"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">×</span>
                <input
                  type="number"
                  min={1}
                  value={m.count}
                  onChange={(e) => updateMonster(idx, 'count', parseInt(e.target.value) || 1)}
                  className="w-12 text-sm text-center border border-gray-200 rounded p-1 outline-none focus:ring-1 focus:ring-red-300"
                />
              </div>
              <button onClick={() => removeMonster(idx)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addMonster}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 self-start"
          >
            <Plus size={14} /> Add monster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/encounter">
      <EncounterTracker
        title={title}
        monsters={monsters.map((m) => ({ id: m.entityId, count: m.count }))}
      />
      {isEditing && (
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-2 right-2 opacity-0 group-hover/encounter:opacity-100 transition-opacity p-1.5 bg-white border border-gray-200 rounded shadow-sm text-gray-500 hover:text-red-600"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}

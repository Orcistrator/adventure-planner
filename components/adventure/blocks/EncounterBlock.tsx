'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Check, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
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
  editTrigger?: number;
}

export default function EncounterBlock({ id, title, monsters, isEditing, editTrigger }: EncounterBlockProps) {
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (editTrigger) setEditOpen(true);
  }, [editTrigger]);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftMonsters, setDraftMonsters] = useState<Monster[]>(monsters);
  const [openPickerIdx, setOpenPickerIdx] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const updateBlock = useMutation(api.blocks.update);
  const entities = useQuery(api.entities.list, editOpen ? {} : 'skip');

  const pickableEntities = entities?.filter(
    (e) => e.type === 'monster' || e.type === 'character'
  ) ?? [];

  const filteredEntities = pickerSearch
    ? pickableEntities.filter((e) =>
        e.name.toLowerCase().includes(pickerSearch.toLowerCase())
      )
    : pickableEntities;

  useEffect(() => {
    setDraftTitle(title);
    setDraftMonsters(monsters);
  }, [title, monsters]);

  const save = () => {
    updateBlock({ id, patch: { title: draftTitle, monsters: draftMonsters } });
    setEditOpen(false);
    setOpenPickerIdx(null);
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
    if (openPickerIdx === idx) setOpenPickerIdx(null);
  };

  const selectEntity = (idx: number, slug: string) => {
    updateMonster(idx, 'entityId', slug);
    setOpenPickerIdx(null);
    setPickerSearch('');
  };

  const togglePicker = (idx: number) => {
    if (openPickerIdx === idx) {
      setOpenPickerIdx(null);
    } else {
      setOpenPickerIdx(idx);
      setPickerSearch('');
    }
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
          {draftMonsters.map((m, idx) => {
            const selectedEntity = entities?.find((e) => e.slug === m.entityId);
            return (
              <div key={idx} className="relative">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded p-2">
                  <button
                    type="button"
                    onClick={() => togglePicker(idx)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    {selectedEntity ? (
                      <>
                        {selectedEntity.image ? (
                          <Image
                            src={selectedEntity.image}
                            alt=""
                            width={24}
                            height={24}
                            unoptimized
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                            {selectedEntity.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{selectedEntity.name}</div>
                          <div className="text-xs text-gray-400">
                            AC {selectedEntity.stats?.ac ?? '—'} · {selectedEntity.stats?.hp ?? '—'} HP
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        {m.entityId || 'Select entity…'}
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-500">×</span>
                    <input
                      type="number"
                      min={1}
                      value={m.count}
                      onChange={(e) => updateMonster(idx, 'count', parseInt(e.target.value) || 1)}
                      className="w-12 text-sm text-center border border-gray-200 rounded p-1 outline-none focus:ring-1 focus:ring-red-300"
                    />
                  </div>
                  <button onClick={() => removeMonster(idx)} className="text-gray-400 hover:text-red-500 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>

                {openPickerIdx === idx && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg">
                    <input
                      autoFocus
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search monsters & NPCs…"
                      className="w-full p-2 text-sm border-b border-gray-100 outline-none"
                    />
                    <div className="max-h-52 overflow-y-auto">
                      {entities === undefined ? (
                        <div className="p-3 text-sm text-gray-400">Loading…</div>
                      ) : filteredEntities.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400">No entities found.</div>
                      ) : (
                        filteredEntities.slice(0, 20).map((entity) => (
                          <button
                            key={entity._id}
                            type="button"
                            onClick={() => selectEntity(idx, entity.slug)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-left"
                          >
                            {entity.image ? (
                              <Image
                                src={entity.image}
                                alt=""
                                width={28}
                                height={28}
                                unoptimized
                                className="rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                {entity.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900">{entity.name}</div>
                              <div className="text-xs text-gray-400 capitalize">
                                {entity.type} · AC {entity.stats?.ac ?? '—'} · {entity.stats?.hp ?? '—'} HP
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={addMonster}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 self-start mt-1"
          >
            <Plus size={14} /> Add combatant
          </button>
        </div>
      </div>
    );
  }

  return (
    <EncounterTracker
      title={title}
      monsters={monsters.map((m) => ({ id: m.entityId, count: m.count }))}
    />
  );
}

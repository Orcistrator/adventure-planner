'use client';

import { useState } from 'react';
import { ChevronDown, Skull, User, Package, MapPin } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { AnimatePresence, motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EntitySummaryCard } from '@/components/entities/EntitySummaryCard';
import { MonsterFormModal } from '@/components/entities/MonsterFormModal';
import { NpcFormModal } from '@/components/entities/NpcFormModal';
import { ItemFormModal } from '@/components/entities/ItemFormModal';
import { LocationFormModal } from '@/components/entities/LocationFormModal';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'monster', label: 'Monsters' },
  { key: 'character', label: 'NPCs' },
  { key: 'item', label: 'Items' },
  { key: 'location', label: 'Locations' },
] as const;

type TabKey = (typeof TABS)[number]['key'];
type EntityType = 'monster' | 'character' | 'item' | 'location';

const ADD_OPTIONS: { type: EntityType; label: string; icon: React.ElementType }[] = [
  { type: 'monster', label: 'Monster', icon: Skull },
  { type: 'character', label: 'NPC', icon: User },
  { type: 'item', label: 'Item', icon: Package },
  { type: 'location', label: 'Location', icon: MapPin },
];

export default function EntitiesPage() {
  const entities = useQuery(api.entities.list, {});
  const removeEntity = useMutation(api.entities.remove);

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activeModal, setActiveModal] = useState<EntityType | null>(null);
  const [editing, setEditing] = useState<Doc<'entities'> | undefined>(undefined);

  const filtered =
    entities === undefined
      ? undefined
      : activeTab === 'all'
        ? entities
        : entities.filter((e) => e.type === activeTab);

  function openCreate(type: EntityType) {
    setEditing(undefined);
    setActiveModal(type);
  }

  function openEdit(entity: Doc<'entities'>) {
    setEditing(entity);
    setActiveModal(entity.type as EntityType);
  }

  function closeModal() {
    setActiveModal(null);
    setEditing(undefined);
  }

  async function handleDelete() {
    if (!editing) return;
    if (confirm(`Delete "${editing.name}"? This cannot be undone.`)) {
      await removeEntity({ id: editing._id });
      closeModal();
    }
  }

  const counts =
    entities === undefined
      ? {}
      : entities.reduce<Record<string, number>>((acc, e) => {
          acc[e.type] = (acc[e.type] ?? 0) + 1;
          return acc;
        }, {});

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[30px] leading-[1.2] font-heading text-[oklch(21%_0.034_264.7)]">
            Entities
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg py-2 px-4 bg-stone-950 text-white text-[14px] font-medium hover:bg-stone-800 transition-colors">
              + Add Entity
              <ChevronDown size={14} className="opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {ADD_OPTIONS.map(({ type, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => openCreate(type)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Icon size={14} className="text-[oklch(70.7%_0.022_261.3)]" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[oklch(92.8%_0.006_264.5)]">
          {TABS.map((tab) => {
            const count = tab.key === 'all' ? (entities?.length ?? 0) : (counts[tab.key] ?? 0);
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                  active
                    ? 'border-stone-950 text-[oklch(21%_0.034_264.7)]'
                    : 'border-transparent text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[11px] rounded-full px-1.5 py-0.5 leading-none ${active ? 'bg-stone-100 text-stone-600' : 'bg-stone-50 text-stone-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered === undefined ? (
          <div className="text-sm text-stone-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-stone-500 italic">
            {activeTab === 'all'
              ? 'No entities yet.'
              : `No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} yet.`}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
            <AnimatePresence initial={false}>
              {filtered.map((entity) => (
                <motion.div
                  key={entity._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <EntitySummaryCard entity={entity} onEdit={() => openEdit(entity)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeModal === 'monster' && (
          <MonsterFormModal key="monster" entity={editing} onClose={closeModal} onDelete={editing ? handleDelete : undefined} />
        )}
        {activeModal === 'character' && (
          <NpcFormModal key="npc" entity={editing} onClose={closeModal} onDelete={editing ? handleDelete : undefined} />
        )}
        {activeModal === 'item' && (
          <ItemFormModal key="item" entity={editing} onClose={closeModal} onDelete={editing ? handleDelete : undefined} />
        )}
        {activeModal === 'location' && (
          <LocationFormModal key="location" entity={editing} onClose={closeModal} onDelete={editing ? handleDelete : undefined} />
        )}
      </AnimatePresence>
    </>
  );
}

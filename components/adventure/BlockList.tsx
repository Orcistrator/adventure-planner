'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import {
  Plus,
  AlignLeft,
  Heading2,
  BookOpen,
  Swords,
  Gem,
  Minus,
} from 'lucide-react';
import BlockRenderer from './BlockRenderer';

type BlockType = 'text' | 'heading' | 'read-aloud' | 'encounter' | 'treasure-table' | 'divider';

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <AlignLeft size={15} /> },
  { type: 'heading', label: 'Heading', icon: <Heading2 size={15} /> },
  { type: 'read-aloud', label: 'Read Aloud', icon: <BookOpen size={15} /> },
  { type: 'encounter', label: 'Encounter', icon: <Swords size={15} /> },
  { type: 'treasure-table', label: 'Treasure Table', icon: <Gem size={15} /> },
  { type: 'divider', label: 'Divider', icon: <Minus size={15} /> },
];

interface BlockListProps {
  adventureId: Id<'adventures'>;
  blocks: Doc<'blocks'>[];
  isEditing: boolean;
}

export default function BlockList({ adventureId, blocks, isEditing }: BlockListProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const addBlock = useMutation(api.blocks.add);

  // Flatten across pages, preserving (page, order) sort order
  const sorted = [...blocks].sort((a, b) => {
    const pageA = a.page ?? 1;
    const pageB = b.page ?? 1;
    return pageA !== pageB ? pageA - pageB : a.order - b.order;
  });

  const handleAdd = (type: BlockType) => {
    const last = sorted[sorted.length - 1];
    addBlock({ adventureId, type, page: 1, afterOrder: last?.order });
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      {sorted.length === 0 && !isEditing && (
        <p className="text-gray-300 italic text-sm">No content yet.</p>
      )}

      {sorted.map((block, idx) => (
        <BlockRenderer
          key={block._id}
          block={block}
          adventureId={adventureId}
          isEditing={isEditing}
          isFirst={idx === 0}
          isLast={idx === sorted.length - 1}
        />
      ))}

      {isEditing && (
        <div className="relative self-start">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-300 rounded-lg px-4 py-2 transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.97]"
          >
            <Plus size={14} /> Add block
          </button>

          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[180px]">
                {BLOCK_TYPES.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleAdd(type)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-[background-color,transform] duration-100 active:scale-[0.98]"
                  >
                    <span className="text-gray-400">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

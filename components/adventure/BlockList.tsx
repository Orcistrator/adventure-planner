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
  FilePlus,
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
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const addBlock = useMutation(api.blocks.add);

  const pageNumbers = blocks.length > 0
    ? [...new Set(blocks.map((b) => b.page))].sort((a, b) => a - b)
    : [1];
  const maxPage = Math.max(...pageNumbers);

  const blocksOnPage = (page: number) =>
    blocks.filter((b) => b.page === page);

  const handleAdd = (type: BlockType, page: number) => {
    const pageBlocks = blocksOnPage(page);
    const lastOrder = pageBlocks.length > 0 ? pageBlocks[pageBlocks.length - 1].order : undefined;
    addBlock({ adventureId, type, page, afterOrder: lastOrder });
    setOpenPicker(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
      {pageNumbers.map((pageNum) => {
        const pageBlocks = blocksOnPage(pageNum);

        return (
          <section key={pageNum}>
            {/* Page divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Page {pageNum}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
              {isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setOpenPicker(openPicker === pageNum ? null : pageNum)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-[color,transform] duration-150 ease-out active:scale-95 ml-2"
                  >
                    <Plus size={13} /> Add block
                  </button>
                  {openPicker === pageNum && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenPicker(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[180px]">
                        {BLOCK_TYPES.map(({ type, label, icon }) => (
                          <button
                            key={type}
                            onClick={() => handleAdd(type, pageNum)}
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

            {/* 2-col block grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              {pageBlocks.length === 0 ? (
                <p className="col-span-2 text-gray-300 italic text-sm">
                  {isEditing ? 'Use "Add block" above to start this page.' : 'No content on this page.'}
                </p>
              ) : (
                pageBlocks.map((block, idx) => (
                  <BlockRenderer
                    key={block._id}
                    block={block}
                    adventureId={adventureId}
                    isEditing={isEditing}
                    isFirst={idx === 0}
                    isLast={idx === pageBlocks.length - 1}
                    maxPage={maxPage}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}

      {isEditing && (
        <button
          onClick={() => addBlock({ adventureId, type: 'text', page: maxPage + 1 })}
          className="self-center flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-6 py-3 transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.97]"
        >
          <FilePlus size={15} />
          Add page
        </button>
      )}
    </div>
  );
}

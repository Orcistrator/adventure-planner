'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import BlockRenderer from './BlockRenderer';
import InsertGap from './InsertGap';

interface BlockListProps {
  adventureId: Id<'adventures'>;
  blocks: Doc<'blocks'>[];
  isEditing: boolean;
}

export default function BlockList({ adventureId, blocks, isEditing }: BlockListProps) {
  const [pendingFocusId, setPendingFocusId] = useState<Id<'blocks'> | null>(null);

  const addBlock = useMutation(api.blocks.add);
  const removeBlock = useMutation(api.blocks.remove);

  const sorted = [...blocks].sort((a, b) => {
    const pageA = a.page ?? 1;
    const pageB = b.page ?? 1;
    return pageA !== pageB ? pageA - pageB : a.order - b.order;
  });

  // Create a text block after the given block and auto-focus it
  const handleCreateAfter = async (block: Doc<'blocks'>) => {
    const newId = await addBlock({
      adventureId,
      type: 'text',
      page: block.page ?? 1,
      afterOrder: block.order,
    });
    setPendingFocusId(newId);
  };

  // Delete a text block and focus the nearest previous text block
  const handleDeleteText = async (blockId: Id<'blocks'>) => {
    const idx = sorted.findIndex((b) => b._id === blockId);
    const prev = sorted.slice(0, idx).reverse().find((b) => b.type === 'text');
    await removeBlock({ id: blockId });
    if (prev) setPendingFocusId(prev._id);
  };

  // Called by InsertGap when a new block is added between existing blocks
  const handleInsertGapAdded = (newId: Id<'blocks'>, type: string) => {
    if (type === 'text') setPendingFocusId(newId);
  };

  return (
    <div className={`flex flex-col ${isEditing ? '' : 'gap-6'}`}>
      {/* Empty state */}
      {sorted.length === 0 && !isEditing && (
        <p className="text-gray-300 italic text-sm">No content yet.</p>
      )}

      {sorted.length === 0 && isEditing && (
        <InsertGap
          afterOrder={0}
          page={1}
          adventureId={adventureId}
          onAdded={handleInsertGapAdded}
        />
      )}

      {sorted.map((block, idx) => (
        <div key={block._id}>
          {/* Gap before each block (in edit mode) */}
          {isEditing && (
            <InsertGap
              afterOrder={idx === 0 ? block.order - 1 : sorted[idx - 1].order}
              page={block.page ?? 1}
              adventureId={adventureId}
              onAdded={handleInsertGapAdded}
            />
          )}

          <BlockRenderer
            block={block}
            isEditing={isEditing}
            autoFocus={block._id === pendingFocusId}
            onFocused={() => setPendingFocusId(null)}
            onCreateAfter={block.type === 'text' ? () => handleCreateAfter(block) : undefined}
            onDeleteSelf={block.type === 'text' ? () => handleDeleteText(block._id) : undefined}
          />
        </div>
      ))}

      {/* Gap after the last block (in edit mode) */}
      {isEditing && sorted.length > 0 && (
        <InsertGap
          afterOrder={sorted[sorted.length - 1].order}
          page={sorted[sorted.length - 1].page ?? 1}
          adventureId={adventureId}
          onAdded={handleInsertGapAdded}
        />
      )}
    </div>
  );
}

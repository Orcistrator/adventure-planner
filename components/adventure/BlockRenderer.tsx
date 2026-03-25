'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { Trash2 } from 'lucide-react';
import TextBlock from './blocks/TextBlock';
import ReadAloudBlock from './blocks/ReadAloudBlock';
import EncounterBlock from './blocks/EncounterBlock';
import TreasureTableBlock from './blocks/TreasureTableBlock';
import DividerBlock from './blocks/DividerBlock';

interface BlockRendererProps {
  block: Doc<'blocks'>;
  isEditing: boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
  onCreateAfter?: () => void;
  onDeleteSelf?: () => void;
}

// ─── Legacy heading block ─────────────────────────────────────────────────────
// Heading blocks were removed from the UI. This renders them as styled headings
// in view mode and auto-converts them to text blocks when editing begins.
function LegacyHeadingBlock({
  block,
  isEditing,
}: {
  block: Extract<Doc<'blocks'>, { type: 'heading' }>;
  isEditing: boolean;
}) {
  const convertToText = useMutation(api.blocks.convertHeadingToText);
  const convertedRef = useRef(false);

  useEffect(() => {
    if (isEditing && !convertedRef.current) {
      convertedRef.current = true;
      convertToText({ id: block._id });
    }
  }, [isEditing, block._id, convertToText]);

  const safeLevel = Math.max(1, Math.min(4, block.level)) as 1 | 2 | 3 | 4;
  const Tag = `h${safeLevel}` as 'h1' | 'h2' | 'h3' | 'h4';
  const classes: Record<number, string> = {
    1: 'font-heading text-4xl font-bold text-gray-900 mt-10 mb-4',
    2: 'font-heading text-3xl font-bold text-gray-900 mt-8 mb-3',
    3: 'font-heading text-2xl font-bold text-gray-900 mt-6 mb-2',
    4: 'font-heading text-xl font-semibold text-gray-900 mt-5 mb-2',
  };
  const anchorId = block.text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return (
    <Tag id={anchorId} className={classes[safeLevel]}>
      {block.text}
    </Tag>
  );
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export default function BlockRenderer({
  block,
  isEditing,
  autoFocus,
  onFocused,
  onCreateAfter,
  onDeleteSelf,
}: BlockRendererProps) {
  const removeBlock = useMutation(api.blocks.remove);

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            id={block._id}
            markdown={block.markdown}
            isEditing={isEditing}
            autoFocus={autoFocus}
            onFocused={onFocused}
            onCreateAfter={onCreateAfter}
            onDeleteSelf={onDeleteSelf}
          />
        );
      case 'heading':
        return <LegacyHeadingBlock block={block} isEditing={isEditing} />;
      case 'read-aloud':
        return <ReadAloudBlock id={block._id} text={block.text} prompts={block.prompts} isEditing={isEditing} />;
      case 'encounter':
        return <EncounterBlock id={block._id} title={block.title} monsters={block.monsters} isEditing={isEditing} />;
      case 'treasure-table':
        return <TreasureTableBlock id={block._id} title={block.title} items={block.items} isEditing={isEditing} />;
      case 'divider':
        return <DividerBlock />;
      default:
        return null;
    }
  };

  // Text blocks: frameless in edit mode
  if (block.type === 'text') {
    return <div>{renderContent()}</div>;
  }

  // Special blocks: delete button on hover in edit mode
  return (
    <div className="relative group/block">
      {renderContent()}
      {isEditing && (
        <div className="absolute top-1 right-1 opacity-0 group-hover/block:opacity-100 transition-opacity duration-150 flex gap-0.5 bg-white/90 rounded border border-gray-200 shadow-sm p-0.5">
          <button
            onClick={() => removeBlock({ id: block._id })}
            title="Delete block"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-100 active:scale-90"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

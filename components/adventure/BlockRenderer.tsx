'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import TextBlock from './blocks/TextBlock';
import ReadAloudBlock from './blocks/ReadAloudBlock';
import EncounterBlock from './blocks/EncounterBlock';
import TreasureTableBlock from './blocks/TreasureTableBlock';
import DividerBlock from './blocks/DividerBlock';
import ImageBlock from './blocks/ImageBlock';
import LocationBlock from './blocks/LocationBlock';

interface BlockRendererProps {
  block: Doc<'blocks'>;
  isEditing: boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
  onCreateAfter?: () => void;
  onDeleteSelf?: () => void;
  editTrigger?: number;
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
  editTrigger,
}: BlockRendererProps) {
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
        return <ReadAloudBlock id={block._id} text={block.text} prompts={block.prompts} isEditing={isEditing} editTrigger={editTrigger} />;
      case 'encounter':
        return <EncounterBlock id={block._id} title={block.title} monsters={block.monsters} isEditing={isEditing} editTrigger={editTrigger} />;
      case 'treasure-table':
        return <TreasureTableBlock id={block._id} title={block.title} items={block.items} isEditing={isEditing} editTrigger={editTrigger} />;
      case 'divider':
        return <DividerBlock />;
      case 'image':
        return <ImageBlock id={block._id} url={block.url} caption={block.caption} isEditing={isEditing} editTrigger={editTrigger} />;
      case 'location':
        return <LocationBlock id={block._id} entityId={block.entityId} isEditing={isEditing} editTrigger={editTrigger} />;
      default:
        return null;
    }
  };

  return <div>{renderContent()}</div>;
}

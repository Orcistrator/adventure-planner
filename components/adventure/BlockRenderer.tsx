'use client';

import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ReadAloudBlock from './blocks/ReadAloudBlock';
import EncounterBlock from './blocks/EncounterBlock';
import TreasureTableBlock from './blocks/TreasureTableBlock';
import DividerBlock from './blocks/DividerBlock';

interface BlockRendererProps {
  block: Doc<'blocks'>;
  adventureId: Id<'adventures'>;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  maxPage: number;
}

export default function BlockRenderer({
  block,
  adventureId,
  isEditing,
  isFirst,
  isLast,
  maxPage,
}: BlockRendererProps) {
  const removeBlock = useMutation(api.blocks.remove);
  const moveBlock = useMutation(api.blocks.move);
  const movePageBlock = useMutation(api.blocks.movePage);

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return <TextBlock id={block._id} markdown={block.markdown} isEditing={isEditing} />;
      case 'heading':
        return <HeadingBlock id={block._id} text={block.text} level={block.level} isEditing={isEditing} />;
      case 'read-aloud':
        return (
          <ReadAloudBlock
            id={block._id}
            text={block.text}
            prompts={block.prompts}
            isEditing={isEditing}
          />
        );
      case 'encounter':
        return (
          <EncounterBlock
            id={block._id}
            title={block.title}
            monsters={block.monsters}
            isEditing={isEditing}
          />
        );
      case 'treasure-table':
        return (
          <TreasureTableBlock
            id={block._id}
            title={block.title}
            items={block.items}
            isEditing={isEditing}
          />
        );
      case 'divider':
        return <DividerBlock />;
      default:
        return null;
    }
  };

  return (
    <div className="relative group/block">
      {renderContent()}

      {isEditing && (
        <div className="absolute top-1 right-1 opacity-0 group-hover/block:opacity-100 transition-opacity flex gap-0.5 bg-white/90 rounded border border-gray-200 shadow-sm p-0.5">
          {/* Within-page ordering */}
          <button
            onClick={() => moveBlock({ id: block._id, adventureId, direction: 'up' })}
            disabled={isFirst}
            title="Move up"
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={() => moveBlock({ id: block._id, adventureId, direction: 'down' })}
            disabled={isLast}
            title="Move down"
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronDown size={13} />
          </button>

          {/* Cross-page movement */}
          <div className="w-px bg-gray-200 mx-0.5" />
          <button
            onClick={() => movePageBlock({ id: block._id, adventureId, targetPage: block.page - 1 })}
            disabled={block.page <= 1}
            title="Move to previous page"
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => movePageBlock({ id: block._id, adventureId, targetPage: block.page + 1 })}
            disabled={block.page >= maxPage}
            title="Move to next page"
            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight size={13} />
          </button>

          {/* Delete */}
          <div className="w-px bg-gray-200 mx-0.5" />
          <button
            onClick={() => removeBlock({ id: block._id })}
            title="Delete block"
            className="p-1 rounded text-gray-400 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

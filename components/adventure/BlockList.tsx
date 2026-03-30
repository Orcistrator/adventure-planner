'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Trash2, Pencil, Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockRenderer from './BlockRenderer';
import { BLOCK_TYPES } from './block-types';

// ─── Ghost text input ─────────────────────────────────────────────────────────

interface GhostTextInputProps {
  adventureId: Id<'adventures'>;
  afterOrder: number;
  page: number;
  onCreated: (id: Id<'blocks'>) => void;
  hidden: boolean;
  autoFocus?: boolean;
}

function GhostTextInput({ adventureId, afterOrder, page, onCreated, hidden, autoFocus }: GhostTextInputProps) {
  const addBlock = useMutation(api.blocks.add);
  const updateBlock = useMutation(api.blocks.update);
  const creatingRef = useRef(false);
  const valueRef = useRef('');
  const [value, setValue] = useState('');

  if (hidden) return null;

  const create = async () => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    const id = await addBlock({ adventureId, type: 'text', page, afterOrder });
    if (valueRef.current.trim()) {
      await updateBlock({ id, patch: { markdown: valueRef.current } });
    }
    setValue('');
    valueRef.current = '';
    onCreated(id);
  };

  return (
    <textarea
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        setValue(v);
        valueRef.current = v;
        if (v && !creatingRef.current) create();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          create();
        }
      }}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      placeholder="Start writing…"
      rows={1}
      className="w-full resize-none bg-transparent text-base leading-relaxed text-gray-700 outline-none placeholder:text-transparent focus:placeholder:text-gray-300 py-1"
    />
  );
}

// ─── Sortable block row ───────────────────────────────────────────────────────

interface SortableBlockRowProps {
  block: Doc<'blocks'>;
  isEditing: boolean;
  isDragOverlay?: boolean;
  pendingFocusId: Id<'blocks'> | null;
  editTriggers: Record<string, number>;
  insertPickerBlockId: Id<'blocks'> | null;
  firstParagraphId: Id<'blocks'> | null;
  onFocused: () => void;
  onCreateAfter: (block: Doc<'blocks'>) => void;
  onDeleteText: (blockId: Id<'blocks'>) => void;
  onDelete: (block: Doc<'blocks'>) => void;
  onEditBlock: (id: Id<'blocks'>) => void;
  onInsertBlockAfter: (block: Doc<'blocks'>, type: string) => void;
  onOpenInsertPicker: (blockId: Id<'blocks'>, e: React.MouseEvent<HTMLButtonElement>) => void;
}

function SortableBlockRow({
  block,
  isEditing,
  isDragOverlay = false,
  pendingFocusId,
  editTriggers,
  insertPickerBlockId,
  firstParagraphId,
  onFocused,
  onCreateAfter,
  onDeleteText,
  onDelete,
  onEditBlock,
  onInsertBlockAfter,
  onOpenInsertPicker,
}: SortableBlockRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block._id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/row relative ${isDragging && !isDragOverlay ? 'opacity-40' : ''}`}
    >
      {isEditing && (
        <div className="absolute right-full top-2 pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 flex items-center gap-0.5">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            title="Drag to reorder"
            className="p-1.5 rounded text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-colors duration-100 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical size={14} />
          </button>
          {/* Insert block */}
          <button
            onClick={(e) => onOpenInsertPicker(block._id, e)}
            title="Insert block"
            className={`p-1.5 rounded transition-colors duration-100 ${
              insertPickerBlockId === block._id
                ? 'text-stone-700 bg-stone-100'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Plus size={14} />
          </button>
          {(block.type === 'encounter' || block.type === 'read-aloud' || block.type === 'treasure-table' || block.type === 'image' || block.type === 'location') && (
            <button
              onClick={() => onEditBlock(block._id)}
              title="Edit block"
              className="p-1.5 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors duration-100"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(block)}
            title="Delete block"
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <BlockRenderer
        block={block}
        isEditing={isEditing}
        autoFocus={block._id === pendingFocusId}
        onFocused={onFocused}
        onCreateAfter={block.type === 'text' ? () => onCreateAfter(block) : undefined}
        onDeleteSelf={block.type === 'text' ? () => onDeleteText(block._id) : undefined}
        onInsertBlock={(type) => onInsertBlockAfter(block, type)}
        editTrigger={editTriggers[block._id]}
        isFirstParagraph={block._id === firstParagraphId}
      />
    </div>
  );
}

// ─── Block list ───────────────────────────────────────────────────────────────

interface BlockListProps {
  adventureId: Id<'adventures'>;
  blocks: Doc<'blocks'>[];
  isEditing: boolean;
}

export default function BlockList({ adventureId, blocks, isEditing }: BlockListProps) {
  const [pendingFocusId, setPendingFocusId] = useState<Id<'blocks'> | null>(null);
  const [editTriggers, setEditTriggers] = useState<Record<string, number>>({});
  const [insertPickerBlockId, setInsertPickerBlockId] = useState<Id<'blocks'> | null>(null);
  const [insertPickerPos, setInsertPickerPos] = useState<{ top: number; left: number } | null>(null);
  const [activeId, setActiveId] = useState<Id<'blocks'> | null>(null);

  const addBlock = useMutation(api.blocks.add);
  const removeBlock = useMutation(api.blocks.remove);
  const updateBlock = useMutation(api.blocks.update);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const sorted = [...blocks].sort((a, b) => {
    const pageA = a.page ?? 1;
    const pageB = b.page ?? 1;
    return pageA !== pageB ? pageA - pageB : a.order - b.order;
  });

  const activeBlock = activeId ? (sorted.find((b) => b._id === activeId) ?? null) : null;

  const handleEditBlock = (id: Id<'blocks'>) => {
    setEditTriggers((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const handleCreateAfter = async (block: Doc<'blocks'>) => {
    const newId = await addBlock({
      adventureId,
      type: 'text',
      page: block.page ?? 1,
      afterOrder: block.order,
    });
    setPendingFocusId(newId);
  };

  const handleInsertBlockAfter = async (block: Doc<'blocks'>, type: string) => {
    const newId = await addBlock({
      adventureId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      page: block.page ?? 1,
      afterOrder: block.order,
    });
    if (type === 'text') {
      setPendingFocusId(newId);
    } else {
      setEditTriggers((prev) => ({ ...prev, [newId]: (prev[newId] ?? 0) + 1 }));
    }
    setInsertPickerBlockId(null);
    setInsertPickerPos(null);
  };

  const handleDeleteText = async (blockId: Id<'blocks'>) => {
    const idx = sorted.findIndex((b) => b._id === blockId);
    const prev = sorted.slice(0, idx).reverse().find((b) => b.type === 'text');
    await removeBlock({ id: blockId });
    if (prev) setPendingFocusId(prev._id);
  };

  const handleDelete = (block: Doc<'blocks'>) => {
    if (block.type === 'text') {
      handleDeleteText(block._id);
    } else {
      removeBlock({ id: block._id });
    }
  };

  const openInsertPicker = (blockId: Id<'blocks'>, e: React.MouseEvent<HTMLButtonElement>) => {
    if (insertPickerBlockId === blockId) {
      setInsertPickerBlockId(null);
      setInsertPickerPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setInsertPickerBlockId(blockId);
    setInsertPickerPos({ top: rect.bottom + 4, left: rect.left });
  };

  const closeInsertPicker = () => {
    setInsertPickerBlockId(null);
    setInsertPickerPos(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as Id<'blocks'>);
    closeInsertPicker();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((b) => b._id === active.id);
    const newIndex = sorted.findIndex((b) => b._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newSorted = arrayMove(sorted, oldIndex, newIndex);
    const prev = newSorted[newIndex - 1];
    const next = newSorted[newIndex + 1];

    let newOrder: number;
    if (prev && next) {
      newOrder = (prev.order + next.order) / 2;
    } else if (prev) {
      newOrder = prev.order + 1;
    } else if (next) {
      newOrder = next.order - 1;
    } else {
      return;
    }

    updateBlock({ id: active.id as Id<'blocks'>, patch: { order: newOrder } });
  };

  const lastBlock = sorted[sorted.length - 1];
  const ghostAfterOrder = lastBlock ? lastBlock.order : 0;
  const ghostPage = lastBlock ? (lastBlock.page ?? 1) : 1;

  const firstParagraphId = sorted.find((b) => {
    if (b.type !== 'text') return false;
    const md = b.markdown.trim();
    if (!md || /^#{1,4}\s/.test(md)) return false;
    const lines = md.split('\n').filter((l) => l.trim());
    return !lines.every((l) => /^[-*]\s/.test(l)) && !lines.every((l) => /^\d+\.\s/.test(l));
  })?._id ?? null;

  const rowProps = {
    isEditing,
    pendingFocusId,
    editTriggers,
    insertPickerBlockId,
    firstParagraphId,
    onFocused: () => setPendingFocusId(null),
    onCreateAfter: handleCreateAfter,
    onDeleteText: handleDeleteText,
    onDelete: handleDelete,
    onEditBlock: handleEditBlock,
    onInsertBlockAfter: handleInsertBlockAfter,
    onOpenInsertPicker: openInsertPicker,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sorted.map((b) => b._id)} strategy={verticalListSortingStrategy}>
        <div className={`flex flex-col ${isEditing ? '' : 'gap-6'}`}>
          {sorted.length === 0 && !isEditing && (
            <p className="text-gray-300 italic text-sm">No content yet.</p>
          )}

          {sorted.map((block) => (
            <SortableBlockRow key={block._id} block={block} {...rowProps} />
          ))}

          {isEditing && (
            <GhostTextInput
              adventureId={adventureId}
              afterOrder={ghostAfterOrder}
              page={ghostPage}
              onCreated={(id) => setPendingFocusId(id)}
              hidden={pendingFocusId !== null}
              autoFocus={sorted.length === 0}
            />
          )}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeBlock && (
          <div className="rounded-lg bg-white shadow-2xl ring-1 ring-gray-200 px-4 py-2 opacity-95 cursor-grabbing">
            <BlockRenderer block={activeBlock} isEditing={false} />
          </div>
        )}
      </DragOverlay>

      {/* Insert block picker portal */}
      {insertPickerBlockId && insertPickerPos && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={closeInsertPicker} />
          <div
            className="fixed z-50 min-w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg p-1"
            style={{ top: insertPickerPos.top, left: insertPickerPos.left }}
          >
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => {
                  const block = sorted.find((b) => b._id === insertPickerBlockId);
                  if (block) handleInsertBlockAfter(block, type);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-100"
              >
                <Icon size={14} className="text-gray-400" />
                {label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </DndContext>
  );
}

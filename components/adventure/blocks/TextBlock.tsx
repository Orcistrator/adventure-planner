'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import SelectionToolbar from './SelectionToolbar';
import EntityLink from '@/components/entities/EntityLink';

interface TextBlockProps {
  id: Id<'blocks'>;
  markdown: string;
  isEditing: boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
  onCreateAfter?: () => void;
  onDeleteSelf?: () => void;
}

// ─── Markdown view renderer ──────────────────────────────────────────────────

const headingClasses: Record<number, string> = {
  1: 'font-heading text-4xl font-bold text-gray-900 mt-10 mb-4',
  2: 'font-heading text-3xl font-bold text-gray-900 mt-8 mb-3',
  3: 'font-heading text-2xl font-bold text-gray-900 mt-6 mb-2',
  4: 'font-heading text-xl font-semibold text-gray-900 mt-5 mb-2',
};

// Matches: @[Name](slug), **bold**, *italic*
const INLINE_SPLIT = /(@\[[^\]]+\]\([^)]+\)|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(INLINE_SPLIT);
  return parts.map((part, i) => {
    const mentionMatch = part.match(/^@\[([^\]]+)\]\(([^)]+)\)$/);
    if (mentionMatch) return <EntityLink key={i} id={mentionMatch[2]}>{mentionMatch[1]}</EntityLink>;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function MarkdownView({ text }: { text: string }) {
  if (!text.trim()) return null;

  // Heading: entire text is a `# …` line
  const headingMatch = text.match(/^(#{1,4})\s+([\s\S]+)$/);
  if (headingMatch) {
    const level = Math.min(4, headingMatch[1].length) as 1 | 2 | 3 | 4;
    const content = headingMatch[2].trimEnd();
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
    const anchorId = content.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return (
      <Tag id={anchorId} className={headingClasses[level]}>
        {renderInline(content)}
      </Tag>
    );
  }

  // Lists
  const lines = text.split('\n').filter((l) => l.trim());
  const isBullet = lines.length > 0 && lines.every((l) => /^[-*]\s/.test(l));
  const isOrdered = lines.length > 0 && lines.every((l) => /^\d+\.\s/.test(l));

  if (isBullet) {
    return (
      <ul className="list-disc pl-5 text-gray-700 leading-relaxed space-y-0.5">
        {lines.map((l, i) => <li key={i}>{renderInline(l.replace(/^[-*]\s/, ''))}</li>)}
      </ul>
    );
  }
  if (isOrdered) {
    return (
      <ol className="list-decimal pl-5 text-gray-700 leading-relaxed space-y-0.5">
        {lines.map((l, i) => <li key={i}>{renderInline(l.replace(/^\d+\.\s/, ''))}</li>)}
      </ol>
    );
  }

  return <p className="text-gray-700 leading-relaxed">{renderInline(text)}</p>;
}

// ─── Entity type pill colors ───────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  monster: 'Monster',
  character: 'NPC',
  item: 'Item',
  location: 'Location',
};
const TYPE_COLOR: Record<string, string> = {
  monster: 'bg-red-50 text-red-600',
  character: 'bg-blue-50 text-blue-600',
  item: 'bg-amber-50 text-amber-600',
  location: 'bg-green-50 text-green-600',
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function TextBlock({
  id,
  markdown,
  isEditing,
  autoFocus,
  onFocused,
  onCreateAfter,
  onDeleteSelf,
}: TextBlockProps) {
  const [draft, setDraft] = useState(markdown);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);

  // @ mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo history
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  const updateBlock = useMutation(api.blocks.update);
  const allEntities = useQuery(api.entities.list, isEditing ? {} : 'skip');

  const mentionResults: Doc<'entities'>[] =
    mentionQuery !== null && allEntities
      ? allEntities
          .filter((e) => e.name.toLowerCase().includes(mentionQuery.toLowerCase()))
          .slice(0, 8)
      : [];

  useEffect(() => { setDraft(markdown); }, [markdown]);
  useEffect(() => { setMentionIndex(0); }, [mentionQuery]);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || !isEditing) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft, isEditing]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  // Hide toolbar on scroll
  useEffect(() => {
    const hide = () => setToolbarRect(null);
    window.addEventListener('scroll', hide, { passive: true });
    return () => window.removeEventListener('scroll', hide);
  }, []);

  // ─── History helpers ────────────────────────────────────────────────────────

  const pushHistory = useCallback((value: string) => {
    const h = historyRef.current;
    const idx = historyIdxRef.current;
    if (h[idx] === value) return;
    historyRef.current = h.slice(0, idx + 1);
    historyRef.current.push(value);
    historyIdxRef.current = historyRef.current.length - 1;
    // Cap at 100 entries
    if (historyRef.current.length > 100) {
      historyRef.current = historyRef.current.slice(-100);
      historyIdxRef.current = historyRef.current.length - 1;
    }
  }, []);

  // ─── Save ──────────────────────────────────────────────────────────────────

  const save = useCallback((value: string) => {
    if (value !== markdown) updateBlock({ id, patch: { markdown: value } });
  }, [markdown, id, updateBlock]);

  // ─── Selection toolbar ─────────────────────────────────────────────────────

  const checkSelection = () => {
    const ta = textareaRef.current;
    if (!ta || ta.selectionStart === ta.selectionEnd) {
      setToolbarRect(null);
    } else {
      setToolbarRect(ta.getBoundingClientRect());
    }
  };

  const handleBlur = () => {
    save(draft);
    blurTimerRef.current = setTimeout(() => {
      setToolbarRect(null);
      setMentionQuery(null);
    }, 200);
  };

  const handleFocus = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    // Seed history on first focus
    if (historyRef.current.length === 0) pushHistory(draft);
  };

  // ─── @ mention detection ───────────────────────────────────────────────────

  const detectMention = (val: string, cursor: number) => {
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    if (lastAt !== -1) {
      const afterAt = textBeforeCursor.slice(lastAt + 1);
      // Don't trigger on already-formatted mentions (@[...]) or across newlines
      if (!afterAt.includes('\n') && !afterAt.startsWith('[')) {
        setMentionQuery(afterAt);
        setMentionStart(lastAt);
        return;
      }
    }
    setMentionQuery(null);
  };

  // ─── Insert entity mention ─────────────────────────────────────────────────

  const selectMention = useCallback((entity: Doc<'entities'>) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? draft.length;
    const before = draft.slice(0, mentionStart);
    const after = draft.slice(cursor);
    const mention = `@[${entity.name}](${entity.slug})`;
    const newDraft = before + mention + after;

    setDraft(newDraft);
    setMentionQuery(null);
    pushHistory(newDraft);
    save(newDraft);

    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      const newPos = mentionStart + mention.length;
      ta.setSelectionRange(newPos, newPos);
    });
  }, [draft, mentionStart, save, pushHistory]);

  // ─── Text change ───────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart ?? val.length;
    setDraft(val);
    detectMention(val, cursor);
    // Debounced history snapshot for undo
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => pushHistory(val), 500);
  };

  // ─── Formatting helpers ────────────────────────────────────────────────────

  const applyInlineFormat = (marker: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const selected = draft.slice(start, end);
    if (!selected) return;

    pushHistory(draft);

    const before = draft.slice(0, start);
    const after = draft.slice(end);
    const isWrapped =
      selected.startsWith(marker) &&
      selected.endsWith(marker) &&
      selected.length > marker.length * 2;

    let newDraft: string;
    let newStart: number, newEnd: number;
    if (isWrapped) {
      const inner = selected.slice(marker.length, -marker.length);
      newDraft = before + inner + after;
      newStart = start; newEnd = end - marker.length * 2;
    } else {
      newDraft = before + marker + selected + marker + after;
      newStart = start + marker.length; newEnd = end + marker.length;
    }

    setDraft(newDraft);
    pushHistory(newDraft);
    save(newDraft);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
      checkSelection();
    });
  };

  const applyListFormat = (style: 'bullet' | 'ordered') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const lineStart = draft.lastIndexOf('\n', start - 1) + 1;
    const lineEndIdx = draft.indexOf('\n', end);
    const blockEnd = lineEndIdx === -1 ? draft.length : lineEndIdx;
    const block = draft.slice(lineStart, blockEnd);

    pushHistory(draft);

    const lines = block.split('\n');
    const formatted = lines.map((l, i) => {
      if (style === 'bullet') {
        if (/^[-*]\s/.test(l)) return l.replace(/^[-*]\s/, '');
        return `- ${l.replace(/^\d+\.\s/, '')}`;
      } else {
        if (/^\d+\.\s/.test(l)) return l.replace(/^\d+\.\s/, '');
        return `${i + 1}. ${l.replace(/^[-*]\s/, '')}`;
      }
    });

    const newDraft = draft.slice(0, lineStart) + formatted.join('\n') + draft.slice(blockEnd);
    setDraft(newDraft);
    pushHistory(newDraft);
    save(newDraft);
    requestAnimationFrame(() => { ta.focus(); checkSelection(); });
  };

  const applyHeadingPrefix = (level: 0 | 1 | 2 | 3) => {
    pushHistory(draft);
    const prefix = level === 0 ? '' : '#'.repeat(level) + ' ';
    const clean = draft.replace(/^#{1,4}\s+/, '');
    const newDraft = prefix + clean;
    setDraft(newDraft);
    pushHistory(newDraft);
    save(newDraft);
    setToolbarRect(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  // ─── Keyboard ─────────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Mention dropdown navigation
    if (mentionQuery !== null) {
      if (e.key === 'ArrowDown' && mentionResults.length > 0) {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionResults.length - 1));
        return;
      }
      if (e.key === 'ArrowUp' && mentionResults.length > 0) {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && mentionResults.length > 0) {
        e.preventDefault();
        selectMention(mentionResults[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    // Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      const idx = historyIdxRef.current;
      if (idx > 0) {
        const prev = historyRef.current[idx - 1];
        historyIdxRef.current = idx - 1;
        setDraft(prev);
        save(prev);
      }
      return;
    }
    // Enter: create new block below (Shift+Enter = newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      save(draft);
      onCreateAfter?.();
      return;
    }
    // Backspace on empty: remove block
    if (e.key === 'Backspace' && draft === '') {
      e.preventDefault();
      onDeleteSelf?.();
    }
  };

  // Close mention if cursor moves before @
  const handleSelect = () => {
    checkSelection();
    if (mentionQuery !== null) {
      const ta = textareaRef.current;
      if (ta && ta.selectionStart <= mentionStart) {
        setMentionQuery(null);
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isEditing) {
    return <MarkdownView text={markdown} />;
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        placeholder="Start writing…"
        className="w-full resize-none bg-transparent text-gray-700 leading-relaxed text-base outline-none placeholder:text-gray-300 min-h-[1.75rem] block"
        rows={1}
      />

      {/* @ mention dropdown */}
      {mentionQuery !== null && mentionResults.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          {mentionResults.map((entity, i) => (
            <button
              key={entity._id}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                i === mentionIndex ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => { e.preventDefault(); selectMention(entity); }}
              onMouseEnter={() => setMentionIndex(i)}
            >
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${TYPE_COLOR[entity.type]}`}>
                {TYPE_LABEL[entity.type]}
              </span>
              <span className="truncate text-gray-900">{entity.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Show hint when @ typed but no results yet */}
      {mentionQuery !== null && mentionQuery.length === 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs text-gray-400 shadow-xl">
          Type to search entities…
        </div>
      )}

      {toolbarRect && (
        <SelectionToolbar
          rect={toolbarRect}
          onBold={() => applyInlineFormat('**')}
          onItalic={() => applyInlineFormat('*')}
          onBulletList={() => applyListFormat('bullet')}
          onNumberedList={() => applyListFormat('ordered')}
          onSetHeading={applyHeadingPrefix}
        />
      )}
    </div>
  );
}

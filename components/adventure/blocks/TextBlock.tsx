'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import SelectionToolbar from './SelectionToolbar';
import EntityLink from '@/components/entities/EntityLink';
import { BLOCK_TYPES } from '../block-types';

// ─── Caret position helper ────────────────────────────────────────────────────

function getCaretPosition(textarea: HTMLTextAreaElement, index: number) {
  const mirror = document.createElement('div');
  const s = getComputedStyle(textarea);
  Object.assign(mirror.style, {
    position: 'absolute', top: '0', left: '-9999px',
    width: s.width,
    paddingTop: s.paddingTop, paddingRight: s.paddingRight,
    paddingBottom: s.paddingBottom, paddingLeft: s.paddingLeft,
    fontSize: s.fontSize, fontFamily: s.fontFamily,
    fontWeight: s.fontWeight, lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing, whiteSpace: 'pre-wrap',
    wordBreak: 'break-word', overflow: 'hidden',
  });
  mirror.textContent = textarea.value.slice(0, index);
  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const top = marker.offsetTop;
  const left = marker.offsetLeft;
  const lineHeight = parseFloat(s.lineHeight) || 20;
  document.body.removeChild(mirror);
  return { top, left, lineHeight };
}

interface TextBlockProps {
  id: Id<'blocks'>;
  markdown: string;
  isEditing: boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
  onCreateAfter?: () => void;
  onDeleteSelf?: () => void;
  onInsertBlock?: (type: string) => void;
  isFirstParagraph?: boolean;
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

function MarkdownView({ text, isFirstParagraph }: { text: string; isFirstParagraph?: boolean }) {
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

  return <p className={`text-gray-700 leading-relaxed${isFirstParagraph ? ' drop-cap' : ''}`}>{renderInline(text)}</p>;
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
  onInsertBlock,
  isFirstParagraph,
}: TextBlockProps) {
  const [draft, setDraft] = useState(markdown);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);

  // @ mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // / command state
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [slashStart, setSlashStart] = useState(0);
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);

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

  const slashResults =
    slashQuery !== null
      ? BLOCK_TYPES.filter((bt) => bt.label.toLowerCase().includes(slashQuery.toLowerCase()))
      : [];

  useEffect(() => { setDraft(markdown); }, [markdown]);
  useEffect(() => { setMentionIndex(0); }, [mentionQuery]);
  useEffect(() => { setSlashIndex(0); }, [slashQuery]);

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

  // Hide toolbar + dropdowns on scroll
  useEffect(() => {
    const hide = () => { setToolbarRect(null); setMentionQuery(null); setSlashQuery(null); };
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
      setDropdownPos(null);
      setSlashQuery(null);
      setSlashPos(null);
    }, 200);
  };

  const handleFocus = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    // Seed history on first focus
    if (historyRef.current.length === 0) pushHistory(draft);
  };

  // ─── Special syntax detection (@mention, /command) ────────────────────────

  const detectSpecialSyntax = (val: string, cursor: number) => {
    const textBeforeCursor = val.slice(0, cursor);
    const ta = textareaRef.current;

    // Check for / command (only at start of line or after whitespace)
    const lastSlash = textBeforeCursor.lastIndexOf('/');
    if (lastSlash !== -1) {
      const charBefore = lastSlash > 0 ? val[lastSlash - 1] : '\n';
      const afterSlash = textBeforeCursor.slice(lastSlash + 1);
      if (
        (charBefore === '\n' || charBefore === ' ' || lastSlash === 0) &&
        !afterSlash.includes(' ') &&
        !afterSlash.includes('\n')
      ) {
        setSlashQuery(afterSlash);
        setSlashStart(lastSlash);
        if (ta) {
          const { top, left, lineHeight } = getCaretPosition(ta, lastSlash);
          const rect = ta.getBoundingClientRect();
          setSlashPos({ top: rect.top + top + lineHeight, left: rect.left + left });
        }
        setMentionQuery(null);
        setDropdownPos(null);
        return;
      }
    }
    setSlashQuery(null);
    setSlashPos(null);

    // Check for @ mention
    const lastAt = textBeforeCursor.lastIndexOf('@');
    if (lastAt !== -1) {
      const afterAt = textBeforeCursor.slice(lastAt + 1);
      if (!afterAt.includes('\n') && !afterAt.startsWith('[')) {
        setMentionQuery(afterAt);
        setMentionStart(lastAt);
        if (ta) {
          const { top, left, lineHeight } = getCaretPosition(ta, lastAt);
          const rect = ta.getBoundingClientRect();
          setDropdownPos({ top: rect.top + top + lineHeight, left: rect.left + left });
        }
        return;
      }
    }
    setMentionQuery(null);
    setDropdownPos(null);
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
    setDropdownPos(null);
    pushHistory(newDraft);
    save(newDraft);

    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      const newPos = mentionStart + mention.length;
      ta.setSelectionRange(newPos, newPos);
    });
  }, [draft, mentionStart, save, pushHistory]);

  // ─── / command selection ──────────────────────────────────────────────────

  const selectSlashCommand = useCallback((type: string) => {
    const ta = textareaRef.current;
    const cursor = ta?.selectionStart ?? draft.length;
    const before = draft.slice(0, slashStart);
    const after = draft.slice(cursor);
    const newDraft = before + after;

    setSlashQuery(null);
    setSlashPos(null);

    if (newDraft.trim() === '') {
      onInsertBlock?.(type);
      onDeleteSelf?.();
    } else {
      setDraft(newDraft);
      save(newDraft);
      onInsertBlock?.(type);
    }
  }, [draft, slashStart, save, onInsertBlock, onDeleteSelf]);

  // ─── Text change ───────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart ?? val.length;
    setDraft(val);
    detectSpecialSyntax(val, cursor);
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
    // / command dropdown navigation
    if (slashQuery !== null && slashResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex((i) => Math.min(i + 1, slashResults.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectSlashCommand(slashResults[slashIndex].type);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashQuery(null);
        setSlashPos(null);
        return;
      }
    } else if (slashQuery !== null && e.key === 'Escape') {
      e.preventDefault();
      setSlashQuery(null);
      setSlashPos(null);
      return;
    }

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
      if ((e.key === 'Enter' || e.key === 'Tab') && mentionResults.length > 0) {
        e.preventDefault();
        selectMention(mentionResults[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        setDropdownPos(null);
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

  // Close dropdowns if cursor moves before trigger character
  const handleSelect = () => {
    checkSelection();
    const ta = textareaRef.current;
    if (!ta) return;
    if (mentionQuery !== null && ta.selectionStart <= mentionStart) {
      setMentionQuery(null);
    }
    if (slashQuery !== null && ta.selectionStart <= slashStart) {
      setSlashQuery(null);
      setSlashPos(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isEditing) {
    return <MarkdownView text={markdown} isFirstParagraph={isFirstParagraph} />;
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
        className="w-full resize-none bg-transparent text-gray-700 leading-relaxed text-base outline-none placeholder:text-transparent focus:placeholder:text-gray-300 min-h-[1.75rem] block"
        rows={1}
      />

      {/* / command dropdown */}
      {slashQuery !== null && slashResults.length > 0 && slashPos && createPortal(
        <div
          style={{ position: 'fixed', top: slashPos.top + 4, left: slashPos.left, zIndex: 9999 }}
          className="min-w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg p-1"
        >
          {slashResults.map(({ type, label, icon: Icon }, i) => (
            <button
              key={type}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 rounded-md transition-colors duration-100 ${
                i === slashIndex ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onMouseDown={(e) => { e.preventDefault(); selectSlashCommand(type); }}
              onMouseEnter={() => setSlashIndex(i)}
            >
              <Icon size={14} className="text-gray-400 shrink-0" />
              {label}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* @ mention dropdown — portal so it renders outside any ancestor */}
      {mentionQuery !== null && mentionResults.length > 0 && dropdownPos && createPortal(
        <div
          style={{ position: 'fixed', top: dropdownPos.top + 4, left: dropdownPos.left, zIndex: 9999 }}
          className="w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
        >
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
        </div>,
        document.body
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

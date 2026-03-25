'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import SelectionToolbar from './SelectionToolbar';

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

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo history
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  const updateBlock = useMutation(api.blocks.update);

  useEffect(() => { setDraft(markdown); }, [markdown]);

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
    blurTimerRef.current = setTimeout(() => setToolbarRect(null), 200);
  };

  const handleFocus = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    // Seed history on first focus
    if (historyRef.current.length === 0) pushHistory(draft);
  };

  // ─── Text change ───────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraft(val);
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

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isEditing) {
    return <MarkdownView text={markdown} />;
  }

  return (
    <>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onSelect={checkSelection}
        onMouseUp={checkSelection}
        onKeyUp={checkSelection}
        placeholder="Start writing…"
        className="w-full resize-none bg-transparent text-gray-700 leading-relaxed text-base outline-none placeholder:text-gray-300 min-h-[1.75rem] block"
        rows={1}
      />

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
    </>
  );
}

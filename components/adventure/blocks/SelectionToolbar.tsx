'use client';

import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface SelectionToolbarProps {
  rect: DOMRect;
  onBold: () => void;
  onItalic: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  /** 0 = plain text, 1–3 = H1–H3 */
  onSetHeading: (level: 0 | 1 | 2 | 3) => void;
}

const btn =
  'flex items-center justify-center w-7 h-7 rounded text-stone-300 hover:text-white hover:bg-white/10 transition-colors duration-100 text-[13px] font-medium select-none cursor-pointer';
const divider = 'w-px h-4 bg-stone-700 mx-0.5 shrink-0';

export default function SelectionToolbar({
  rect,
  onBold,
  onItalic,
  onBulletList,
  onNumberedList,
  onSetHeading,
}: SelectionToolbarProps) {
  const TOOLBAR_W = 260;
  const GAP = 8;

  const top = Math.max(GAP, rect.top - 48);
  const rawLeft = rect.left + rect.width / 2 - TOOLBAR_W / 2;
  const left = Math.max(
    GAP,
    Math.min(rawLeft, (typeof window !== 'undefined' ? window.innerWidth : 1200) - TOOLBAR_W - GAP)
  );

  return (
    <div
      style={{ position: 'fixed', top, left, zIndex: 9999 }}
      className="flex items-center gap-0.5 bg-stone-950 border border-stone-800 rounded-lg px-1.5 py-1 shadow-2xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Type */}
      <button className={btn} title="Paragraph" onClick={() => onSetHeading(0)}>
        <span className="font-serif">T</span>
      </button>
      <button className={btn} title="Heading 1" onClick={() => onSetHeading(1)}>
        H1
      </button>
      <button className={btn} title="Heading 2" onClick={() => onSetHeading(2)}>
        H2
      </button>
      <button className={btn} title="Heading 3" onClick={() => onSetHeading(3)}>
        H3
      </button>

      <div className={divider} />

      {/* Inline */}
      <button className={btn} title="Bold" onClick={onBold}>
        <Bold size={13} strokeWidth={2.5} />
      </button>
      <button className={btn} title="Italic" onClick={onItalic}>
        <Italic size={13} />
      </button>

      <div className={divider} />

      {/* Lists */}
      <button className={btn} title="Bullet list" onClick={onBulletList}>
        <List size={13} />
      </button>
      <button className={btn} title="Numbered list" onClick={onNumberedList}>
        <ListOrdered size={13} />
      </button>
    </div>
  );
}

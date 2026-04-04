'use client';

import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, useState } from 'react';
import { Feather } from 'lucide-react';
import { motion, Transition } from 'motion/react';

const FEATHER_VARIANTS = {
  normal: { rotate: 0, y: 0, x: 0 },
  animate: {
    rotate: [0, -8, 4, -3, 0],
    y: [0, -4, -2, -1, 0],
    x: [0, 2, -2, 1, 0],
  },
};

const FEATHER_TRANSITION: Transition = {
  duration: 1.6,
  ease: 'easeInOut',
};

const FEATHER_TRANSITION_LOOP: Transition = {
  ...FEATHER_TRANSITION,
  repeat: Infinity,
};

// ── GenerativeInput ───────────────────────────────────────────────────────────
// Drop-in replacement for <input>. Add onGenerate to get the AI button; omit it
// and it renders as a plain <input> with zero overhead.

interface GenerativeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onGenerate?: () => Promise<void>;
  generateDisabled?: boolean;
}

export function GenerativeInput({ onGenerate, generateDisabled, ...props }: GenerativeInputProps) {
  if (!onGenerate) return <input {...props} />;
  return (
    <GenerateField placement="input" onGenerate={onGenerate} disabled={generateDisabled}>
      <input {...props} />
    </GenerateField>
  );
}

// ── GenerativeTextarea ────────────────────────────────────────────────────────
// Drop-in replacement for <textarea>. Same opt-in pattern as GenerativeInput.

interface GenerativeTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  onGenerate?: () => Promise<void>;
  generateDisabled?: boolean;
}

export function GenerativeTextarea({ onGenerate, generateDisabled, ...props }: GenerativeTextareaProps) {
  if (!onGenerate) return <textarea {...props} />;
  return (
    <GenerateField placement="textarea" onGenerate={onGenerate} disabled={generateDisabled}>
      <textarea {...props} />
    </GenerateField>
  );
}

// ── GenerateField (primitive) ─────────────────────────────────────────────────
// Wraps any child element and injects the AI generate button on focus.
// Use GenerativeInput / GenerativeTextarea for standard fields.

// placement: 'input'    → button floats right-center inside a single-line input
//            'textarea' → button anchors bottom-right inside a textarea
interface GenerateFieldProps {
  children: ReactNode;
  onGenerate: () => Promise<void>;
  disabled?: boolean;
  placement?: 'input' | 'textarea';
}

export function GenerateField({
  children,
  onGenerate,
  disabled = false,
  placement = 'textarea',
}: GenerateFieldProps) {
  const [focused, setFocused] = useState(false);
  const [generating, setGenerating] = useState(false);

  const visible = (focused || generating) && !disabled;

  async function handleClick() {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  }

  const buttonPos =
    placement === 'input'
      ? 'absolute right-2 top-1/2 -translate-y-1/2'
      : 'absolute right-2 bottom-2';

  return (
    <div
      className="relative"
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      {children}
      {visible && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClick}
          disabled={generating}
          className={`${buttonPos} flex items-center gap-1 rounded-md border border-indigo-100 bg-white/90 px-1.5 py-1 text-[11px] font-medium text-indigo-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <motion.div
            variants={FEATHER_VARIANTS}
            animate={generating ? 'animate' : 'normal'}
            transition={generating ? FEATHER_TRANSITION_LOOP : FEATHER_TRANSITION}
          >
            <Feather size={11} />
          </motion.div>
          <span>{generating ? 'Generating…' : 'Generate'}</span>
        </button>
      )}
    </div>
  );
}

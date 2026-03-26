'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, ImageIcon } from 'lucide-react';
import Image from 'next/image';

// ── Shared CSS strings ────────────────────────────────────────────────────────

export const inputCls =
  'w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none focus:border-stone-400 transition-colors';

export const selectCls =
  'w-full rounded-lg border border-[oklch(92.8%_0.006_264.5)] px-3 py-2 text-[14px] text-[oklch(21%_0.034_264.7)] outline-none focus:border-stone-400 transition-colors bg-white';

// ── Section header ────────────────────────────────────────────────────────────

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[11px] tracking-[0.8px] uppercase font-bold text-[oklch(70.7%_0.022_261.3)]">
        {children}
      </span>
      <div className="flex-1 h-px bg-[oklch(92.8%_0.006_264.5)]" />
    </div>
  );
}

// ── Field label ───────────────────────────────────────────────────────────────

export function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-[12px] tracking-[0.6px] uppercase text-[oklch(70.7%_0.022_261.3)] font-bold">
      {children}
      {optional && <span className="normal-case font-normal ml-1">(optional)</span>}
    </label>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

export function Field({
  label,
  optional,
  children,
  className,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label optional={optional}>{label}</Label>
      {children}
    </div>
  );
}

// ── Square image field ────────────────────────────────────────────────────────

export function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label optional>Image URL</Label>
      <div className="flex items-center gap-3">
        {/* Square preview */}
        <div className="relative w-16 h-16 shrink-0 rounded-lg border border-[oklch(92.8%_0.006_264.5)] bg-[oklch(98%_0.003_264.5)] overflow-hidden">
          {value ? (
            <Image src={value} alt="Preview" fill unoptimized className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[oklch(80%_0.010_261.3)]">
              <ImageIcon size={20} />
            </div>
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className={inputCls}
        />
      </div>
    </div>
  );
}

// ── Ability list (traits / actions / etc.) ────────────────────────────────────

export type AbilityEntry = { name: string; description: string };

export function AbilityList({
  label,
  entries,
  onChange,
}: {
  label: string;
  entries: AbilityEntry[];
  onChange: (entries: AbilityEntry[]) => void;
}) {
  function add() {
    onChange([...entries, { name: '', description: '' }]);
  }
  function remove(i: number) {
    onChange(entries.filter((_, idx) => idx !== i));
  }
  function update(i: number, field: 'name' | 'description', value: string) {
    onChange(entries.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionHeader>{label}</SectionHeader>
      <AnimatePresence initial={false}>
        {entries.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.12 }}
            className="flex flex-col gap-1.5 rounded-lg border border-[oklch(92.8%_0.006_264.5)] p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={entry.name}
                onChange={(e) => update(i, 'name', e.target.value)}
                placeholder="Name"
                className={inputCls + ' flex-1'}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 rounded-lg text-[oklch(70.7%_0.022_261.3)] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={entry.description}
              onChange={(e) => update(i, 'description', e.target.value)}
              placeholder="Description"
              rows={2}
              className={inputCls + ' resize-none'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-[13px] text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 transition-colors self-start py-1"
      >
        <Plus size={14} />
        Add {label.toLowerCase()}
      </button>
    </div>
  );
}

// ── Roll table editor ─────────────────────────────────────────────────────────

export type TableRow = { roll: string; result: string };
export type RollTable = { title: string; rows: TableRow[] };

export function RollTableEditor({
  tables,
  onChange,
}: {
  tables: RollTable[];
  onChange: (tables: RollTable[]) => void;
}) {
  function addTable() {
    onChange([...tables, { title: '', rows: [{ roll: '', result: '' }] }]);
  }
  function removeTable(ti: number) {
    onChange(tables.filter((_, i) => i !== ti));
  }
  function updateTitle(ti: number, title: string) {
    onChange(tables.map((t, i) => (i === ti ? { ...t, title } : t)));
  }
  function addRow(ti: number) {
    onChange(
      tables.map((t, i) =>
        i === ti ? { ...t, rows: [...t.rows, { roll: '', result: '' }] } : t
      )
    );
  }
  function removeRow(ti: number, ri: number) {
    onChange(
      tables.map((t, i) =>
        i === ti ? { ...t, rows: t.rows.filter((_, j) => j !== ri) } : t
      )
    );
  }
  function updateRow(ti: number, ri: number, field: 'roll' | 'result', value: string) {
    onChange(
      tables.map((t, i) =>
        i === ti
          ? { ...t, rows: t.rows.map((r, j) => (j === ri ? { ...r, [field]: value } : r)) }
          : t
      )
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader>Roll Tables</SectionHeader>
      {tables.map((table, ti) => (
        <div key={ti} className="rounded-lg border border-[oklch(92.8%_0.006_264.5)] overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(98%_0.003_264.5)] border-b border-[oklch(92.8%_0.006_264.5)]">
            <input
              value={table.title}
              onChange={(e) => updateTitle(ti, e.target.value)}
              placeholder="Table title"
              className="flex-1 bg-transparent text-[13px] font-medium text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none"
            />
            <button
              type="button"
              onClick={() => removeTable(ti)}
              className="p-1 rounded text-[oklch(70.7%_0.022_261.3)] hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
          {/* Column headers */}
          <div className="grid grid-cols-[80px_1fr] gap-0 px-3 py-1.5 bg-[oklch(98%_0.003_264.5)] border-b border-[oklch(92.8%_0.006_264.5)]">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[oklch(70.7%_0.022_261.3)]">Roll</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[oklch(70.7%_0.022_261.3)]">Result</span>
          </div>
          {/* Rows */}
          {table.rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-[80px_1fr_28px] gap-0 border-b border-[oklch(96%_0.004_264.5)] last:border-b-0">
              <input
                value={row.roll}
                onChange={(e) => updateRow(ti, ri, 'roll', e.target.value)}
                placeholder="1–4"
                className="px-3 py-2 text-[13px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none border-r border-[oklch(96%_0.004_264.5)] focus:bg-stone-50 transition-colors"
              />
              <input
                value={row.result}
                onChange={(e) => updateRow(ti, ri, 'result', e.target.value)}
                placeholder="Result description"
                className="px-3 py-2 text-[13px] text-[oklch(21%_0.034_264.7)] placeholder:text-[oklch(70.7%_0.022_261.3)] outline-none focus:bg-stone-50 transition-colors"
              />
              <button
                type="button"
                onClick={() => removeRow(ti, ri)}
                className="flex items-center justify-center text-[oklch(70.7%_0.022_261.3)] hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {/* Add row */}
          <button
            type="button"
            onClick={() => addRow(ti)}
            className="flex items-center gap-1.5 w-full px-3 py-2 text-[12px] text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 hover:bg-stone-50 transition-colors border-t border-[oklch(92.8%_0.006_264.5)]"
          >
            <Plus size={12} />
            Add row
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addTable}
        className="flex items-center gap-1.5 text-[13px] text-[oklch(70.7%_0.022_261.3)] hover:text-stone-700 transition-colors self-start py-1"
      >
        <Plus size={14} />
        Add table
      </button>
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

export function ModalShell({
  title,
  subtitle,
  image,
  headerBg = 'bg-[oklch(21%_0.034_264.7)]',
  onClose,
  onSubmit,
  onDelete,
  saving,
  submitLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  headerBg?: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  saving: boolean;
  submitLabel: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
          className="rounded-[14px] overflow-clip flex flex-col bg-white [border-width:0.666667px] border-solid border-[oklch(92.8%_0.006_264.5)] [box-shadow:0px_8px_32px_#00000033,0px_1px_3px_#0000001A] w-full max-w-2xl pointer-events-auto max-h-[90vh]"
        >
          {/* Cover header */}
          <div className={`relative h-36 shrink-0 ${headerBg}`}>
            <div className="flex flex-col justify-end h-full overflow-clip relative p-6">
              {image && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(in oklab 0deg, oklab(0% 0 0 / 90%) 0%, oklab(0% 0 0 / 40%) 50%, oklab(0% 0 0 / 0%) 100%)',
                }}
              />
              <div className="relative">
                <h2 className="text-2xl leading-tight text-white font-heading">{title}</h2>
                {subtitle && <p className="text-sm text-white/60 mt-0.5 italic">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="content-center rounded-lg top-1.5 right-[14px] absolute bg-[oklab(0%_0_0/30%)] p-1.5 hover:bg-[oklab(0%_0_0/50%)] transition-colors"
              aria-label="Close"
            >
              <X size={14} color="white" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5 overflow-y-auto">
            {children}
            <div className="flex items-center justify-between pt-2">
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-lg py-2 px-3 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              ) : <span />}
              <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg py-2 px-4 text-[14px] font-medium text-[oklch(44.6%_0.030_256.8)] hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg py-2 px-4 bg-stone-950 text-white text-[14px] font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : submitLabel}
              </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

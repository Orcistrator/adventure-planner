'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Plus, X, RotateCcw } from 'lucide-react';
import { useEntityDrawer } from '@/components/entities/EntityDrawerContext';
import { EntityPopoverCard } from '@/components/entities/EntitySummaryCard';
import { Input } from '@/components/ui/input';

interface EncounterTrackerProps {
  title: string;
  monsters: { id: string; count: number }[];
}

interface Combatant {
  uid: string;
  type: 'monster' | 'player';
  entity?: Doc<'entities'>;
  playerName?: string;
  initiative: number | null;
  currentHp: number;
  maxHp: number;
}

function MonsterName({ entity }: { entity: Doc<'entities'> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const { open: openDrawer } = useEntityDrawer();

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopoverPos({ top: rect.top, left: rect.left + rect.width / 2 });
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        ref={ref}
        onClick={() => openDrawer(entity)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsOpen(false)}
        className="text-[15px] font-medium text-slate-900 leading-tight shrink-0 hover:text-indigo-700 transition-colors"
      >
        {entity.name}
      </button>

      {isOpen && popoverPos && createPortal(
        <div
          style={{
            position: 'fixed',
            top: popoverPos.top - 10,
            left: popoverPos.left,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="w-72 bg-white rounded-xl shadow-xl border border-[oklch(92.8%_0.006_264.5)] overflow-hidden"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <EntityPopoverCard entity={entity} />
          <div className="absolute -bottom-1.25 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-[oklch(92.8%_0.006_264.5)] rotate-45" />
        </div>,
        document.body
      )}
    </>
  );
}

export default function EncounterTracker({ title, monsters }: EncounterTrackerProps) {
  const entities = useQuery(api.entities.list, {});
  const { open: openDrawer } = useEntityDrawer();

  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [initialized, setInitialized] = useState(false);
  // Raw text in each HP modifier input (key = uid)
  const [hpInputs, setHpInputs] = useState<Record<string, string>>({});
  // Raw text in each initiative input (key = uid)
  const [initiativeInputs, setInitiativeInputs] = useState<Record<string, string>>({});
  // Transient HP change feedback (key = uid)
  const [hpFeedback, setHpFeedback] = useState<Record<string, { delta: number; id: number } | null>>({});
  const feedbackTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Add player form
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerInitiative, setNewPlayerInitiative] = useState('');

  // One-time init once entities load
  useEffect(() => {
    if (!entities || initialized) return;
    const bySlug = Object.fromEntries(entities.map((e) => [e.slug, e]));
    const initial: Combatant[] = monsters
      .flatMap((m) =>
        Array.from({ length: m.count }).map((_, i) => {
          const entity = bySlug[m.id];
          if (!entity) return null;
          return {
            uid: `${m.id}-${i}`,
            type: 'monster' as const,
            entity,
            initiative: null,
            currentHp: entity.stats?.hp ?? 0,
            maxHp: entity.stats?.hp ?? 0,
          };
        })
      )
      .filter(Boolean) as Combatant[];
    setCombatants(initial);
    setInitialized(true);
  }, [entities, initialized, monsters]);

  // Sort descending by initiative; nulls sink to bottom
  const sorted = [...combatants].sort((a, b) => {
    if (a.initiative === null && b.initiative === null) return 0;
    if (a.initiative === null) return 1;
    if (b.initiative === null) return -1;
    return b.initiative - a.initiative;
  });

  // Apply the HP modifier input (negative = damage, positive = heal)
  const applyHp = (uid: string) => {
    const raw = (hpInputs[uid] ?? '').trim();
    const delta = parseInt(raw);
    if (isNaN(delta) || raw === '') return;
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.uid !== uid) return c;
        return { ...c, currentHp: Math.max(0, Math.min(c.maxHp, c.currentHp + delta)) };
      })
    );
    setHpInputs((prev) => ({ ...prev, [uid]: '' }));
    // Show transient feedback label
    if (feedbackTimers.current[uid]) clearTimeout(feedbackTimers.current[uid]);
    setHpFeedback((prev) => ({ ...prev, [uid]: { delta, id: Date.now() } }));
    feedbackTimers.current[uid] = setTimeout(() => {
      setHpFeedback((prev) => ({ ...prev, [uid]: null }));
    }, 1600);
  };

  // Commit initiative input to combatant state
  const applyInitiative = (uid: string) => {
    const raw = (initiativeInputs[uid] ?? '').trim();
    const val = raw === '' ? null : parseInt(raw);
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.uid !== uid) return c;
        return { ...c, initiative: !val || isNaN(val) ? null : val };
      })
    );
  };

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const initiative = newPlayerInitiative === '' ? null : parseInt(newPlayerInitiative);
    const uid = `player-${Date.now()}`;
    setCombatants((prev) => [
      ...prev,
      {
        uid,
        type: 'player',
        playerName: newPlayerName.trim(),
        initiative: !initiative || isNaN(initiative) ? null : initiative,
        currentHp: 0,
        maxHp: 0,
      },
    ]);
    if (newPlayerInitiative !== '') {
      setInitiativeInputs((prev) => ({ ...prev, [uid]: newPlayerInitiative }));
    }
    setNewPlayerName('');
    setNewPlayerInitiative('');
    setAddingPlayer(false);
  };

  const removePlayer = (uid: string) => {
    setCombatants((prev) => prev.filter((c) => c.uid !== uid));
  };

  const reset = () => {
    setCombatants((prev) =>
      prev
        .filter((c) => c.type === 'monster')
        .map((c) => ({ ...c, initiative: null, currentHp: c.maxHp }))
    );
    setHpInputs({});
    setInitiativeInputs({});
    setAddingPlayer(false);
  };

  return (
    <div className="my-6 rounded-[10px] overflow-hidden border border-red-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50 border-b border-red-200">
        <Swords size={18} className="text-red-600 shrink-0" />
        <h4 className="font-heading font-bold text-red-900 text-sm flex-1">Encounter: {title}</h4>
        <button
          onClick={reset}
          title="Reset encounter"
          className="p-1.5 rounded text-red-300 hover:text-red-600 hover:bg-red-100 transition-colors"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1 p-2">
        {entities === undefined ? (
          <p className="text-xs text-gray-400 py-2 px-2">Loading…</p>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {sorted.map((c) => (
                <motion.div
                  key={c.uid}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className={`group/combatant flex items-center gap-2 rounded-[10px] p-2 transition-colors hover:bg-stone-50 ${
                    c.type === 'monster' && c.currentHp === 0 ? 'opacity-40' : ''
                  }`}
                >
                  {/* Initiative input */}
                  <Input
                    type="number"
                    value={initiativeInputs[c.uid] ?? (c.initiative !== null ? String(c.initiative) : '')}
                    onChange={(e) =>
                      setInitiativeInputs((prev) => ({ ...prev, [c.uid]: e.target.value }))
                    }
                    onBlur={() => applyInitiative(c.uid)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        applyInitiative(c.uid);
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="—"
                    className="w-10 shrink-0 px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {/* Avatar */}
                  {c.type === 'monster' && c.entity?.image ? (
                    <button
                      onClick={() => c.entity && openDrawer(c.entity)}
                      className="size-8 shrink-0 rounded bg-cover bg-center outline outline-1 outline-stone-200 hover:outline-indigo-400 transition-all"
                      style={{ backgroundImage: `url(${c.entity.image})` }}
                      title={`View ${c.entity.name}`}
                    />
                  ) : (
                    <div className="size-8 shrink-0 rounded bg-stone-100 outline outline-1 outline-stone-200 flex items-center justify-center text-xs font-bold text-stone-400">
                      {(c.entity?.name ?? c.playerName ?? '?').charAt(0)}
                    </div>
                  )}

                  {/* Name + stats */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {c.type === 'monster' && c.entity ? (
                      <MonsterName entity={c.entity} />
                    ) : (
                      <span className="text-[15px] font-medium text-slate-900 leading-tight shrink-0">
                        {c.playerName}
                      </span>
                    )}

                    {c.type === 'monster' && c.entity && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span>AC {c.entity.stats?.ac ?? '—'}</span>
                        <span>/</span>
                        <span>{c.entity.stats?.speed ?? '—'}</span>
                      </div>
                    )}

                    {c.type === 'player' && (
                      <span className="text-xs text-slate-400">Player</span>
                    )}
                  </div>

                  {/* HP section — monsters only */}
                  {c.type === 'monster' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <AnimatePresence mode="wait">
                        {hpFeedback[c.uid] && (
                          <motion.span
                            key={hpFeedback[c.uid]!.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
                            exit={{ opacity: 0, y: -10, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }}
                            className={`text-xs font-medium tabular-nums shrink-0 ${
                              hpFeedback[c.uid]!.delta < 0
                                ? 'text-[oklch(63.7%_0.237_25.3)]'
                                : 'text-green-600'
                            }`}
                          >
                            {hpFeedback[c.uid]!.delta < 0
                              ? `${Math.abs(hpFeedback[c.uid]!.delta)} damage`
                              : `+${hpFeedback[c.uid]!.delta} healed`}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">HP</span>
                        <span
                          className={`text-[15px] font-medium leading-tight tabular-nums ${
                            c.currentHp === 0 ? 'text-red-500' : 'text-slate-900'
                          }`}
                        >
                          {c.currentHp}
                        </span>
                      </div>
                      <Input
                        inputMode="numeric"
                        value={hpInputs[c.uid] ?? ''}
                        onChange={(e) =>
                          setHpInputs((prev) => ({ ...prev, [c.uid]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') applyHp(c.uid);
                          if (e.key === 'Escape')
                            setHpInputs((prev) => ({ ...prev, [c.uid]: '' }));
                        }}
                        placeholder="—"
                        title="Type -4 to deal damage or 4 to heal, then Enter"
                        className="w-14 shrink-0 px-1.5"
                      />
                    </div>
                  )}

                  {/* Remove — players only, on hover */}
                  {c.type === 'player' && (
                    <button
                      onClick={() => removePlayer(c.uid)}
                      className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover/combatant:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add player form / button */}
            {addingPlayer ? (
              <div className="flex items-center gap-2 rounded-[10px] p-2 bg-stone-50">
                <Input
                  autoFocus
                  type="number"
                  value={newPlayerInitiative}
                  onChange={(e) => setNewPlayerInitiative(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPlayer();
                    if (e.key === 'Escape') setAddingPlayer(false);
                  }}
                  placeholder="—"
                  className="w-10 shrink-0 px-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="size-8 shrink-0 rounded bg-stone-100 outline outline-1 outline-stone-200" />
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPlayer();
                    if (e.key === 'Escape') setAddingPlayer(false);
                  }}
                  placeholder="Player name…"
                  className="flex-1 text-sm text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                />
                <button
                  onClick={addPlayer}
                  className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 shrink-0 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingPlayer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingPlayer(true)}
                className="flex items-center gap-1.5 self-start py-1 px-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus size={14} />
                <span className="text-[13px]">Add player</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

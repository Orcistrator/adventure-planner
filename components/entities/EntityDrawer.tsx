'use client';

import Image from 'next/image';
import { Shield, Heart, Footprints, Zap, Pencil, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Doc } from '@/convex/_generated/dataModel';
import { Drawer as VaulDrawer } from 'vaul';
import {
  DrawerPortal,
  DrawerClose,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useEntityDrawer } from './EntityDrawerContext';
import { TYPE_CONFIG } from './EntitySummaryCard';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

// ── Layout primitives ─────────────────────────────────────────────────────────

function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-3">
      {label && (
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.8px] text-[oklch(55%_0.08_50)]">
          {label}
        </span>
      )}
      <div className="grow h-px bg-[oklch(82%_0.05_50)]" />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[13px] leading-snug text-[oklch(21%_0.034_264.7)]">
      <span className="font-bold">{label} </span>
      {value}
    </p>
  );
}

function AbilitySection({
  entries,
  label,
}: {
  entries: { name: string; description: string }[];
  label: string;
}) {
  if (!entries?.length) return null;
  return (
    <div>
      <Divider label={label} />
      <div className="flex flex-col gap-2">
        {entries.map((e, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">
            <span className="font-bold italic">{e.name}. </span>
            {e.description}
          </p>
        ))}
      </div>
    </div>
  );
}

function RollTableSection({ tables }: { tables: NonNullable<Doc<'entities'>['tables']> }) {
  return (
    <>
      {tables.map((table, ti) => (
        <div key={ti}>
          <Divider label={table.title || 'Table'} />
          <div className="rounded-lg border border-[oklch(92.8%_0.006_264.5)] overflow-hidden text-[13px]">
            <div className="grid grid-cols-[72px_1fr] bg-[oklch(98%_0.003_264.5)] border-b border-[oklch(92.8%_0.006_264.5)]">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[oklch(70.7%_0.022_261.3)] border-r border-[oklch(92.8%_0.006_264.5)]">Roll</div>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[oklch(70.7%_0.022_261.3)]">Result</div>
            </div>
            {table.rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-[72px_1fr] border-b border-[oklch(96%_0.004_264.5)] last:border-b-0">
                <div className="px-3 py-2 text-[oklch(55%_0.015_261)] border-r border-[oklch(96%_0.004_264.5)]">{row.roll}</div>
                <div className="px-3 py-2 text-[oklch(21%_0.034_264.7)]">{row.result}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Per-type content ──────────────────────────────────────────────────────────

function MonsterContent({ entity }: { entity: Doc<'entities'> }) {
  const s = entity.stats;
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  const abilityLabels = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
  const saveKeys = { str: 'strSave', dex: 'dexSave', con: 'conSave', int: 'intSave', wis: 'wisSave', cha: 'chaSave' } as const;

  return (
    <>
      {/* Identity */}
      <p className="text-[13px] italic text-[oklch(55%_0.015_261)] -mt-1 mb-2">
        {[entity.size, entity.creatureType, entity.alignment].filter(Boolean).join(', ')}
      </p>

      <Divider />

      {/* Combat stats */}
      <div className="flex flex-wrap mb-1 gap-[4px_24px]">
        {s?.ac != null && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Shield size={13} className="text-slate-400 shrink-0" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">AC</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.ac}{s.acNote ? ` (${s.acNote})` : ''}</span>
          </div>
        )}
        {s?.hp != null && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Heart size={13} className="text-[#FF6467] shrink-0" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">HP</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.hp}{s.hpFormula ? ` (${s.hpFormula})` : ''}</span>
          </div>
        )}
        {s?.speed && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Footprints size={13} className="text-stone-400 shrink-0" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">Speed</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.speed}</span>
          </div>
        )}
        {s?.initiative != null && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Zap size={13} className="text-amber-400 shrink-0" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">Initiative</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.initiative >= 0 ? `+${s.initiative}` : s.initiative}</span>
          </div>
        )}
      </div>

      <Divider />

      {/* Ability scores */}
      {s && abilities.some(a => s[a] != null) && (
        <>
          <div className="grid grid-cols-6 gap-2">
            {abilities.map((key) => {
              const score = s[key];
              const saveKey = saveKeys[key];
              const saveVal = s[saveKey];
              return (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-center text-[oklch(55%_0.08_50)]">
                    {abilityLabels[key]}
                  </span>
                  <span className="text-[15px] font-bold text-center text-[oklch(21%_0.034_264.7)]">
                    {score ?? '—'}
                  </span>
                  {score != null && (
                    <span className="text-[11px] text-center text-[oklch(55%_0.015_261)]">{mod(score)}</span>
                  )}
                  {saveVal != null && (
                    <span className="text-[10px] text-[oklch(55%_0.08_50)] font-medium text-center">
                      {saveVal >= 0 ? `+${saveVal}` : saveVal} ✦
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Divider />
        </>
      )}

      {/* Skills / senses / languages */}
      <div className="flex flex-col gap-1">
        {entity.skills?.length ? (
          <StatRow
            label="Skills"
            value={entity.skills.map(sk => `${sk.name} ${sk.bonus >= 0 ? `+${sk.bonus}` : sk.bonus}`).join(', ')}
          />
        ) : null}
        {entity.senses && <StatRow label="Senses" value={entity.senses} />}
        {entity.languages && <StatRow label="Languages" value={entity.languages} />}
        {entity.immunities && <StatRow label="Damage Immunities" value={entity.immunities} />}
        {entity.resistances && <StatRow label="Resistances" value={entity.resistances} />}
        {entity.vulnerabilities && <StatRow label="Vulnerabilities" value={entity.vulnerabilities} />}
        {entity.conditionImmunities && <StatRow label="Condition Immunities" value={entity.conditionImmunities} />}
        {(s?.cr != null || s?.xp != null || s?.proficiencyBonus != null) && (
          <StatRow
            label="CR"
            value={[
              s?.cr,
              s?.xp != null && `${s.xp.toLocaleString()} XP`,
              s?.proficiencyBonus != null && `PB +${s.proficiencyBonus}`,
            ].filter(Boolean).join(' · ')}
          />
        )}
      </div>

      <AbilitySection label="Traits" entries={entity.traits ?? []} />
      <AbilitySection label="Actions" entries={entity.actions ?? []} />
      <AbilitySection label="Bonus Actions" entries={entity.bonusActions ?? []} />
      <AbilitySection label="Reactions" entries={entity.reactions ?? []} />

      {(entity.legendaryActions?.length || entity.legendaryActionsDescription) && (
        <div>
          <Divider label="Legendary Actions" />
          {entity.legendaryActionsDescription && (
            <p className="text-[13px] italic text-[oklch(55%_0.015_261)] mb-2 leading-relaxed">
              {entity.legendaryActionsDescription}
            </p>
          )}
          {entity.legendaryActions?.map((e, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)] mb-1">
              <span className="font-bold italic">{e.name}. </span>
              {e.description}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

function NpcContent({ entity }: { entity: Doc<'entities'> }) {
  return (
    <>
      <p className="text-[13px] italic text-[oklch(55%_0.015_261)] -mt-1 mb-2">
        {[entity.role, entity.race, entity.alignment].filter(Boolean).join(' · ')}
      </p>
      <MonsterContent entity={entity} />
      {(entity.personality || entity.ideals || entity.bonds || entity.flaws || entity.backstory) && (
        <div>
          <Divider label="Personality" />
          <div className="flex flex-col gap-2">
            {entity.personality && <StatRow label="Traits" value={entity.personality} />}
            {entity.ideals && <StatRow label="Ideals" value={entity.ideals} />}
            {entity.bonds && <StatRow label="Bonds" value={entity.bonds} />}
            {entity.flaws && <StatRow label="Flaws" value={entity.flaws} />}
          </div>
          {entity.backstory && (
            <>
              <Divider label="Backstory" />
              <p className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">{entity.backstory}</p>
            </>
          )}
        </div>
      )}
    </>
  );
}

function ItemContent({ entity }: { entity: Doc<'entities'> }) {
  return (
    <>
      <div className="flex flex-wrap gap-2 -mt-1 mb-3">
        {entity.rarity && (
          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {entity.rarity}
          </span>
        )}
        {entity.itemType && (
          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {entity.itemType}
          </span>
        )}
        {entity.requiresAttunement && (
          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
            Requires Attunement
          </span>
        )}
      </div>

      {(entity.cost || entity.weight || entity.itemProperties) && (
        <>
          <div className="flex flex-col gap-1 mb-3">
            {entity.cost && <StatRow label="Cost" value={entity.cost} />}
            {entity.weight && <StatRow label="Weight" value={entity.weight} />}
            {entity.itemProperties && <StatRow label="Properties" value={entity.itemProperties} />}
          </div>
          <Divider />
        </>
      )}

      {entity.description && (
        <p className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">{entity.description}</p>
      )}

      {entity.tables?.length ? <RollTableSection tables={entity.tables} /> : null}
    </>
  );
}

function LocationContent({ entity }: { entity: Doc<'entities'> }) {
  return (
    <>
      <p className="text-[13px] italic text-[oklch(55%_0.015_261)] -mt-1 mb-3">
        {[entity.locationType, entity.region].filter(Boolean).join(' · ')}
      </p>

      {entity.description && (
        <p className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">{entity.description}</p>
      )}

      {entity.notableFeatures?.length ? (
        <div>
          <Divider label="Notable Features" />
          <ul className="flex flex-col gap-1">
            {entity.notableFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[oklch(21%_0.034_264.7)]">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[oklch(55%_0.08_50)] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {entity.tables?.length ? <RollTableSection tables={entity.tables} /> : null}
    </>
  );
}

// ── Drawer root ───────────────────────────────────────────────────────────────

export function EntityDrawer({ onEdit }: { onEdit?: (entity: Doc<'entities'>) => void }) {
  const { entity, close } = useEntityDrawer();

  // Decouple open state from entity so content stays visible during close animation.
  // displayEntity persists until onClose fires (after animation completes).
  const [open, setOpen] = useState(false);
  const [displayEntity, setDisplayEntity] = useState<Doc<'entities'> | null>(null);

  useEffect(() => {
    if (entity) {
      setDisplayEntity(entity);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [entity]);

  const cfg = displayEntity ? TYPE_CONFIG[displayEntity.type] : null;

  return (
    <VaulDrawer.Root
      open={open}
      onOpenChange={(o) => { if (!o) setOpen(false); }}
      onClose={close}
      direction="bottom"
    >
      <DrawerPortal>
        {/* Transparent overlay — catches outside clicks to close, no blur */}
        <VaulDrawer.Overlay className="fixed inset-0 z-50" />
        <VaulDrawer.Content className="group/drawer-content fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85vh] rounded-t-xl border-t border-[oklch(92.2%_0_0)] bg-white [box-shadow:0_-8px_32px_oklch(0%_0_0/10%)] focus:outline-none">
          {/* Grab handle */}
          <div className="mx-auto mt-4 h-1 w-[100px] shrink-0 rounded-full bg-stone-200" />
          <DrawerTitle className="sr-only">{displayEntity?.name ?? 'Entity details'}</DrawerTitle>
          {/* Scrollable content — only scrolls when needed */}
          <div className="overflow-y-auto select-text">
        {displayEntity && cfg && (
          <div className="flex flex-col items-center pt-2 pb-10 relative">
            {/* Close button */}
            <DrawerClose asChild>
              <button
                className="absolute right-2 top-2 rounded-[10px] bg-[oklch(0%_0_0/30%)] p-1.5 hover:bg-[oklch(0%_0_0/50%)] transition-colors"
                aria-label="Close"
              >
                <X size={16} color="white" strokeWidth={1.5} />
              </button>
            </DrawerClose>

            {/* Title row */}
            <div className="flex items-center w-full max-w-[980px] px-6 py-6 gap-3">
              <h2 className="font-heading text-[22px] leading-tight text-[oklch(21%_0.034_264.7)] shrink-0 line-clamp-1">
                {displayEntity.name}
              </h2>
              <span className={`text-[10px] uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-full [border-width:0.666667px] shrink-0 ${cfg.color}`}>
                {cfg.label}
              </span>
              {onEdit && (
                <button
                  onClick={() => { close(); onEdit(displayEntity); }}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[oklch(44.6%_0.030_256.8)] hover:bg-stone-100 transition-colors shrink-0"
                >
                  <Pencil size={13} />
                  Edit
                </button>
              )}
            </div>

            {/* Body: image + statblock */}
            <div className="flex items-start gap-10 w-full max-w-[980px] px-6 pb-8">
              {/* Square image */}
              <div className="relative w-[240px] h-[240px] rounded-[10px] overflow-clip [outline:1px_solid_oklch(86.9%_0.005_56.4)] shrink-0">
                {displayEntity.image ? (
                  <Image src={displayEntity.image} alt={displayEntity.name} fill unoptimized className="object-cover object-center" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${cfg.iconBg}`}>
                    <cfg.Icon size={48} strokeWidth={1.5} />
                  </div>
                )}
              </div>

              {/* Statblock */}
              <div className="flex-1 min-w-0">
                {displayEntity.type === 'monster' && <MonsterContent entity={displayEntity} />}
                {displayEntity.type === 'character' && <NpcContent entity={displayEntity} />}
                {displayEntity.type === 'item' && <ItemContent entity={displayEntity} />}
                {displayEntity.type === 'location' && <LocationContent entity={displayEntity} />}
              </div>
            </div>
          </div>
        )}
          </div>
        </VaulDrawer.Content>
      </DrawerPortal>
    </VaulDrawer.Root>
  );
}

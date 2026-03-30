"use client";

import Image from "next/image";
import { Shield, Heart, Footprints, Zap, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "motion/react";
import { useEntityDrawer } from "./EntityDrawerContext";
import { EntityBadge } from "./EntitySummaryCard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

// ── Layout primitives ─────────────────────────────────────────────────────────

function Divider({ label }: { label?: string }) {
  return (
    <div className="my-3 flex items-center gap-3">
      {label && (
        <span className="shrink-0 text-[11px] font-bold tracking-[0.8px] text-[oklch(55%_0.08_50)] uppercase">
          {label}
        </span>
      )}
      <div className="h-px grow bg-[oklch(82%_0.05_50)]" />
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

function AbilitySection({ entries, label }: { entries: { name: string; description: string }[]; label: string }) {
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

function RollTableSection({ tables }: { tables: NonNullable<Doc<"entities">["tables"]> }) {
  return (
    <>
      {tables.map((table, ti) => (
        <div key={ti}>
          <Divider label={table.title || "Table"} />
          <div className="overflow-hidden rounded-lg border border-[oklch(92.8%_0.006_264.5)] text-[13px]">
            <div className="grid grid-cols-[72px_1fr] border-b border-[oklch(92.8%_0.006_264.5)] bg-[oklch(98%_0.003_264.5)]">
              <div className="border-r border-[oklch(92.8%_0.006_264.5)] px-3 py-1.5 text-[10px] font-bold tracking-wider text-[oklch(70.7%_0.022_261.3)] uppercase">Roll</div>
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[oklch(70.7%_0.022_261.3)] uppercase">Result</div>
            </div>
            {table.rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-[72px_1fr] border-b border-[oklch(96%_0.004_264.5)] last:border-b-0">
                <div className="border-r border-[oklch(96%_0.004_264.5)] px-3 py-2 text-[oklch(55%_0.015_261)]">{row.roll}</div>
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

function MonsterContent({ entity }: { entity: Doc<"entities"> }) {
  const s = entity.stats;
  const abilities = ["str", "dex", "con", "int", "wis", "cha"] as const;
  const abilityLabels = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
  const saveKeys = { str: "strSave", dex: "dexSave", con: "conSave", int: "intSave", wis: "wisSave", cha: "chaSave" } as const;

  return (
    <>
      <p className="-mt-1 mb-2 text-[13px] text-[oklch(55%_0.015_261)] italic">
        {[entity.size, entity.creatureType, entity.alignment].filter(Boolean).join(", ")}
      </p>
      <Divider />
      <div className="mb-1 flex flex-wrap gap-[4px_24px]">
        {s?.ac != null && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Shield size={13} className="shrink-0 text-slate-400" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">AC</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.ac}{s.acNote ? ` (${s.acNote})` : ""}</span>
          </div>
        )}
        {s?.hp != null && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Heart size={13} className="shrink-0 text-[#FF6467]" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">HP</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.hp}{s.hpFormula ? ` (${s.hpFormula})` : ""}</span>
          </div>
        )}
        {s?.speed && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Footprints size={13} className="shrink-0 text-stone-400" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">Speed</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.speed}</span>
          </div>
        )}
        {s?.initiative != null && (
          <div className="flex items-center gap-1.5 text-[13px]">
            <Zap size={13} className="shrink-0 text-amber-400" />
            <span className="font-bold text-[oklch(21%_0.034_264.7)]">Initiative</span>
            <span className="text-[oklch(21%_0.034_264.7)]">{s.initiative >= 0 ? `+${s.initiative}` : s.initiative}</span>
          </div>
        )}
      </div>
      <Divider />
      {s && abilities.some((a) => s[a] != null) && (
        <>
          <div className="grid grid-cols-6 gap-2">
            {abilities.map((key) => {
              const score = s[key];
              const saveVal = s[saveKeys[key]];
              return (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <span className="text-center text-[10px] font-bold tracking-[0.5px] text-[oklch(55%_0.08_50)] uppercase">{abilityLabels[key]}</span>
                  <span className="text-center text-[15px] font-bold text-[oklch(21%_0.034_264.7)]">{score ?? "—"}</span>
                  {score != null && <span className="text-center text-[11px] text-[oklch(55%_0.015_261)]">{mod(score)}</span>}
                  {saveVal != null && <span className="text-center text-[10px] font-medium text-[oklch(55%_0.08_50)]">{saveVal >= 0 ? `+${saveVal}` : saveVal} ✦</span>}
                </div>
              );
            })}
          </div>
          <Divider />
        </>
      )}
      <div className="flex flex-col gap-1">
        {entity.skills?.length ? <StatRow label="Skills" value={entity.skills.map((sk) => `${sk.name} ${sk.bonus >= 0 ? `+${sk.bonus}` : sk.bonus}`).join(", ")} /> : null}
        {entity.senses && <StatRow label="Senses" value={entity.senses} />}
        {entity.languages && <StatRow label="Languages" value={entity.languages} />}
        {entity.immunities && <StatRow label="Damage Immunities" value={entity.immunities} />}
        {entity.resistances && <StatRow label="Resistances" value={entity.resistances} />}
        {entity.vulnerabilities && <StatRow label="Vulnerabilities" value={entity.vulnerabilities} />}
        {entity.conditionImmunities && <StatRow label="Condition Immunities" value={entity.conditionImmunities} />}
        {(s?.cr != null || s?.xp != null || s?.proficiencyBonus != null) && (
          <StatRow label="CR" value={[s?.cr, s?.xp != null && `${s.xp.toLocaleString()} XP`, s?.proficiencyBonus != null && `PB +${s.proficiencyBonus}`].filter(Boolean).join(" · ")} />
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
            <p className="mb-2 text-[13px] leading-relaxed text-[oklch(55%_0.015_261)] italic">{entity.legendaryActionsDescription}</p>
          )}
          {entity.legendaryActions?.map((e, i) => (
            <p key={i} className="mb-1 text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">
              <span className="font-bold italic">{e.name}. </span>{e.description}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

function NpcContent({ entity }: { entity: Doc<"entities"> }) {
  return (
    <>
      <p className="-mt-1 mb-2 text-[13px] text-[oklch(55%_0.015_261)] italic">
        {[entity.role, entity.race, entity.alignment].filter(Boolean).join(" · ")}
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

function ItemContent({ entity }: { entity: Doc<"entities"> }) {
  return (
    <>
      {(entity.itemType || entity.requiresAttunement) && (
        <div className="-mt-1 mb-3 flex flex-wrap gap-2">
          {entity.itemType && <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] tracking-wider text-stone-600 uppercase">{entity.itemType}</span>}
          {entity.requiresAttunement && <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] tracking-wider text-violet-600 uppercase">Requires Attunement</span>}
        </div>
      )}
      {(entity.cost || entity.weight || entity.itemProperties) && (
        <>
          <div className="mb-3 flex flex-col gap-1">
            {entity.cost && <StatRow label="Cost" value={entity.cost} />}
            {entity.weight && <StatRow label="Weight" value={entity.weight} />}
            {entity.itemProperties && <StatRow label="Properties" value={entity.itemProperties} />}
          </div>
          <Divider />
        </>
      )}
      {entity.description && <p className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">{entity.description}</p>}
      {entity.tables?.length ? <RollTableSection tables={entity.tables} /> : null}
    </>
  );
}

function LocationContent({ entity }: { entity: Doc<"entities"> }) {
  return (
    <>
      <p className="-mt-1 mb-3 text-sm text-gray-500 uppercase">
        {[entity.locationType, entity.region].filter(Boolean).join(" · ")}
      </p>
      {entity.description && <p className="text-[13px] leading-relaxed text-[oklch(21%_0.034_264.7)]">{entity.description}</p>}
      {entity.notableFeatures?.length ? (
        <div>
          <Divider label="Notable Features" />
          <ul className="flex flex-col gap-1">
            {entity.notableFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[oklch(21%_0.034_264.7)]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[oklch(55%_0.08_50)]" />
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

// ── Drawer panel ──────────────────────────────────────────────────────────────

export function EntityDrawer({
  onEditAction,
}: {
  onEditAction?: (entity: Doc<"entities">) => void;
}) {
  const { entity, close } = useEntityDrawer();

  // Keep content visible during the exit animation
  const [displayEntity, setDisplayEntity] = useState<Doc<"entities"> | null>(null);
  const [prevEntity, setPrevEntity] = useState(entity);
  if (entity !== prevEntity) {
    setPrevEntity(entity);
    if (entity) setDisplayEntity(entity);
  }

  return (
    <AnimatePresence onExitComplete={() => setDisplayEntity(null)}>
      {entity && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 440 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="shrink-0 overflow-hidden rounded-lg bg-white"
        >
          {displayEntity && (
            <div className="flex h-full items-start gap-10 overflow-y-auto px-10 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Square image */}
              <div className="relative h-52 w-52 shrink-0 overflow-clip rounded-[10px] [outline:1px_solid_oklch(86.9%_0.005_56.4)]">
                {displayEntity.image ? (
                  <Image src={displayEntity.image} alt={displayEntity.name} fill unoptimized className="object-cover object-center" />
                ) : (
                  <div className="h-full w-full bg-stone-100" />
                )}
              </div>

              {/* Statblock */}
              <div className="min-w-0 flex-1">
                {/* Title row */}
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="font-heading line-clamp-1 shrink-0 text-[22px] leading-tight text-[oklch(21%_0.034_264.7)]">
                    {displayEntity.name}
                  </h2>
                  <div className="w-32 shrink-0">
                    <EntityBadge entity={displayEntity} />
                  </div>
                  {onEditAction && (
                    <button
                      onClick={() => { close(); onEditAction(displayEntity); }}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[oklch(44.6%_0.030_256.8)] transition-[background-color,transform] duration-150 hover:bg-stone-100 active:scale-[0.97]"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                </div>

                {displayEntity.type === "monster" && <MonsterContent entity={displayEntity} />}
                {displayEntity.type === "character" && <NpcContent entity={displayEntity} />}
                {displayEntity.type === "item" && <ItemContent entity={displayEntity} />}
                {displayEntity.type === "location" && <LocationContent entity={displayEntity} />}
              </div>

              {/* Close button */}
              <button
                onClick={close}
                className="shrink-0 rounded-lg p-1.5 text-stone-400 transition-[background-color,color] duration-150 hover:bg-stone-100 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

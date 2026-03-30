"use client";

import Image from "next/image";
import { Shield, Heart, Footprints, Zap, Pencil, X } from "lucide-react";
import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "motion/react";
import { useEntityDrawer } from "./EntityDrawerContext";
import { EntityBadge } from "./EntitySummaryCard";

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="my-3 flex items-center gap-3">
      {label && <span className="shrink-0 text-xs font-bold text-stone-950 uppercase">{label}</span>}
      <div className="h-px grow bg-stone-200" />
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs leading-snug text-stone-800">
      <span className="font-bold">{label} </span>{value}
    </p>
  );
}

function AbilityBlock({ entries, label }: { entries: { name: string; description: string }[]; label: string }) {
  if (!entries?.length) return null;
  return (
    <div>
      <Divider label={label} />
      <div className="flex flex-col gap-2">
        {entries.map((e, i) => (
          <p key={i} className="text-xs leading-relaxed text-stone-800">
            <span className="font-bold italic">{e.name}. </span>{e.description}
          </p>
        ))}
      </div>
    </div>
  );
}

function RollTable({ tables }: { tables: NonNullable<Doc<"entities">["tables"]> }) {
  return (
    <>
      {tables.map((table, ti) => (
        <div key={ti}>
          <Divider label={table.title || "Table"} />
          <div className="overflow-hidden rounded-lg border border-stone-200 text-xs">
            <div className="grid grid-cols-[56px_1fr] border-b border-stone-200 bg-stone-50">
              <div className="border-r border-stone-200 px-3 py-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">Roll</div>
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">Result</div>
            </div>
            {table.rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-[56px_1fr] border-b border-stone-100 last:border-b-0">
                <div className="border-r border-stone-100 px-3 py-2 text-stone-400">{row.roll}</div>
                <div className="px-3 py-2 text-stone-700">{row.result}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Col 2: main statblock / description content ───────────────────────────────

function Col2Content({ entity }: { entity: Doc<"entities"> }) {
  const s = entity.stats;
  const abilities = ["str", "dex", "con", "int", "wis", "cha"] as const;
  const abilityLabels = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
  const saveKeys = { str: "strSave", dex: "dexSave", con: "conSave", int: "intSave", wis: "wisSave", cha: "chaSave" } as const;

  if (entity.type === "monster" || entity.type === "character") {
    return (
      <>
        <p className="mb-3 text-xs text-stone-400 italic">
          {entity.type === "character"
            ? [entity.race, entity.alignment].filter(Boolean).join(" · ")
            : [entity.size, entity.creatureType, entity.alignment].filter(Boolean).join(", ")}
        </p>

        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
          {s?.ac != null && <div className="flex items-center gap-1 text-xs"><Shield size={11} className="text-stone-400" /><span className="font-bold text-stone-800">AC</span><span className="text-stone-600">{s.ac}{s.acNote ? ` (${s.acNote})` : ""}</span></div>}
          {s?.hp != null && <div className="flex items-center gap-1 text-xs"><Heart size={11} className="text-rose-400" /><span className="font-bold text-stone-800">HP</span><span className="text-stone-600">{s.hp}{s.hpFormula ? ` (${s.hpFormula})` : ""}</span></div>}
          {s?.speed && <div className="flex items-center gap-1 text-xs"><Footprints size={11} className="text-stone-400" /><span className="font-bold text-stone-800">Speed</span><span className="text-stone-600">{s.speed}</span></div>}
          {s?.initiative != null && <div className="flex items-center gap-1 text-xs"><Zap size={11} className="text-amber-400" /><span className="font-bold text-stone-800">Initiative</span><span className="text-stone-600">{s.initiative >= 0 ? `+${s.initiative}` : s.initiative}</span></div>}
        </div>

        <Divider />

        {s && abilities.some((a) => s[a] != null) && (
          <>
            <div className="mb-3 grid grid-cols-6 gap-1">
              {abilities.map((key) => {
                const score = s[key];
                const saveVal = s[saveKeys[key]];
                return (
                  <div key={key} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase">{abilityLabels[key]}</span>
                    <span className="text-sm font-bold text-stone-900">{score ?? "—"}</span>
                    {score != null && <span className="text-[10px] text-stone-500">{mod(score)}</span>}
                    {saveVal != null && <span className="text-[9px] font-medium text-stone-400">{saveVal >= 0 ? `+${saveVal}` : saveVal} ✦</span>}
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
          {entity.conditionImmunities && <StatRow label="Condition Immunities" value={entity.conditionImmunities} />}
        </div>

        <AbilityBlock label="Traits" entries={entity.traits ?? []} />

        {entity.type === "character" && (entity.personality || entity.ideals || entity.bonds || entity.flaws) && (
          <div>
            <Divider label="Personality" />
            <div className="flex flex-col gap-1">
              {entity.personality && <StatRow label="Traits" value={entity.personality} />}
              {entity.ideals && <StatRow label="Ideals" value={entity.ideals} />}
              {entity.bonds && <StatRow label="Bonds" value={entity.bonds} />}
              {entity.flaws && <StatRow label="Flaws" value={entity.flaws} />}
            </div>
          </div>
        )}
      </>
    );
  }

  if (entity.type === "item") {
    return (
      <>
        {(entity.cost || entity.weight || entity.itemProperties) && (
          <div className="mb-3 flex flex-col gap-1">
            {entity.cost && <StatRow label="Cost" value={entity.cost} />}
            {entity.weight && <StatRow label="Weight" value={entity.weight} />}
            {entity.itemProperties && <StatRow label="Properties" value={entity.itemProperties} />}
          </div>
        )}
        {entity.description && <p className="text-xs leading-relaxed text-stone-700">{entity.description}</p>}
      </>
    );
  }

  if (entity.type === "location") {
    return (
      <>
        {entity.description && <p className="text-xs leading-relaxed text-stone-700">{entity.description}</p>}
        {entity.notableFeatures?.length ? (
          <div>
            <Divider label="Notable Features" />
            <ul className="flex flex-col gap-1">
              {entity.notableFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  }

  return null;
}

// ── Col 3: actions / tables ───────────────────────────────────────────────────

function Col3Content({ entity }: { entity: Doc<"entities"> }) {
  let content: React.ReactNode = null;

  if (entity.type === "monster" || entity.type === "character") {
    const hasActions = [entity.actions, entity.bonusActions, entity.reactions, entity.legendaryActions].some((a) => a?.length);
    if (hasActions) {
      content = (
        <>
          <AbilityBlock label="Actions" entries={entity.actions ?? []} />
          <AbilityBlock label="Bonus Actions" entries={entity.bonusActions ?? []} />
          <AbilityBlock label="Reactions" entries={entity.reactions ?? []} />
          {(entity.legendaryActions?.length || entity.legendaryActionsDescription) && (
            <div>
              <Divider label="Legendary Actions" />
              {entity.legendaryActionsDescription && <p className="mb-2 text-xs text-stone-500 italic">{entity.legendaryActionsDescription}</p>}
              {entity.legendaryActions?.map((e, i) => (
                <p key={i} className="mb-1 text-xs leading-relaxed text-stone-800">
                  <span className="font-bold italic">{e.name}. </span>{e.description}
                </p>
              ))}
            </div>
          )}
        </>
      );
    }
  } else if (entity.tables?.length) {
    content = <RollTable tables={entity.tables} />;
  }

  if (!content) return null;
  return <div className="w-56 shrink-0">{content}</div>;
}

// ── Drawer panel ──────────────────────────────────────────────────────────────

export function EntityDrawer({ onEditAction }: { onEditAction?: (entity: Doc<"entities">) => void }) {
  const { entity, close } = useEntityDrawer();

  const [displayEntity, setDisplayEntity] = useState<Doc<"entities"> | null>(null);
  const [prevEntity, setPrevEntity] = useState(entity);
  if (entity !== prevEntity) {
    setPrevEntity(entity);
    if (entity) setDisplayEntity(entity);
  }

  return (
    <AnimatePresence onExitComplete={() => setDisplayEntity(null)}>
      {entity && (
        <>
          <div className="fixed inset-0" onClick={close} />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="shrink-0 overflow-hidden rounded-lg bg-white"
          >
            {displayEntity && (
              <div className="relative">
                <button
                  onClick={close}
                  className="absolute top-4 right-4 z-10 rounded-lg p-1.5 text-stone-400 transition-[background-color,color] duration-150 hover:bg-stone-100 hover:text-stone-600"
                >
                  <X size={16} />
                </button>

                {/* Single scrollable container — all cols scroll together */}
                <div className="flex max-h-[50vh] gap-8 overflow-y-auto px-40 py-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {/* Col 1: image + badge */}
                  <div className="flex w-44 shrink-0 flex-col gap-3">
                    <div className="relative aspect-square w-full overflow-clip rounded-xl bg-stone-100">
                      {displayEntity.image ? (
                        <Image src={displayEntity.image} alt={displayEntity.name} fill unoptimized className="object-cover object-center" />
                      ) : (
                        <div className="h-full w-full bg-stone-100" />
                      )}
                    </div>
                    <EntityBadge entity={displayEntity} />
                  </div>

                  {/* Col 2: title + statblock / description */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <h2 className="font-heading line-clamp-1 text-xl leading-tight text-stone-950">{displayEntity.name}</h2>
                      {onEditAction && (
                        <button
                          onClick={() => { close(); onEditAction(displayEntity); }}
                          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition-[background-color] duration-150 hover:bg-stone-100"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                    </div>
                    <Col2Content entity={displayEntity} />
                  </div>

                  {/* Col 3: actions / tables */}
                  <Col3Content entity={displayEntity} />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

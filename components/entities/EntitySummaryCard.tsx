"use client";

import Image from "next/image";
import { Shield, Heart, Pencil, Triangle } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { useEntityDrawer } from "./EntityDrawerContext";

// ── Shared config ─────────────────────────────────────────────────────────────

export const TYPE_CONFIG = {
  monster: { label: "Monster", color: "text-stone-950 border-stone-300" },
  character: { label: "NPC", color: "text-stone-950 border-stone-300" },
  item: { label: "Item", color: "text-stone-950 border-stone-300" },
  location: { label: "Location", color: "text-stone-950 border-stone-300" },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function entitySubtitle(entity: Doc<"entities">): string | null {
  switch (entity.type) {
    case "monster":
      return (
        [entity.size, entity.creatureType, entity.alignment]
          .filter(Boolean)
          .join(", ") || null
      );
    case "character":
      return (
        [entity.role, entity.race, entity.alignment]
          .filter(Boolean)
          .join(", ") || null
      );
    case "item":
      return (
        [entity.rarity, entity.itemType].filter(Boolean).join(" ") ||
        entity.description ||
        null
      );
    case "location":
      return (
        [entity.locationType, entity.region].filter(Boolean).join(", ") ||
        entity.description ||
        null
      );
  }
}

function parseCr(cr: string): number {
  if (cr.includes("/")) {
    const [n, d] = cr.split("/").map(Number);
    return n / d;
  }
  return parseFloat(cr) || 0;
}

const RARITY_MUTED = {
  bg: "bg-stone-200",
  label: "text-stone-400/75",
  value: "text-stone-400",
};

const RARITY_STYLE: Record<
  string,
  { bg: string; label: string; value: string }
> = {
  common: RARITY_MUTED,
  uncommon: {
    bg: "bg-emerald-600",
    label: "text-white/75",
    value: "text-white",
  },
  rare: { bg: "bg-blue-700", label: "text-white/75", value: "text-white" },
  "very rare": {
    bg: "bg-purple-700",
    label: "text-white/75",
    value: "text-white",
  },
  legendary: {
    bg: "bg-amber-500",
    label: "text-white/75",
    value: "text-white",
  },
  artifact: { bg: "bg-rose-700", label: "text-white/75", value: "text-white" },
  varies: RARITY_MUTED,
  unknown: RARITY_MUTED,
};

export function EntityBadge({ entity }: { entity: Doc<"entities"> }) {
  if (entity.type === "monster" && entity.stats?.cr) {
    const isLegendary = parseCr(entity.stats.cr) >= 15;
    return (
      <div
        className={`flex h-7 shrink-0 items-center justify-between rounded-full px-3 ${isLegendary ? "bg-[oklch(50.5%_0.213_27.5)]" : "bg-stone-950"}`}
      >
        <span className="text-[8px] font-semibold text-white/50 uppercase">
          CR
        </span>
        <div className="flex items-center gap-1.5">
          {isLegendary && (
            <Triangle size={10} className="text-white" strokeWidth={3} />
          )}
          <span className="text-xs tracking-wide text-white uppercase">
            {entity.stats.cr}
          </span>
        </div>
      </div>
    );
  }
  if (entity.type === "item" && entity.rarity) {
    const style =
      RARITY_STYLE[entity.rarity.toLowerCase()] ?? RARITY_STYLE.unknown;
    return (
      <div
        className={`flex h-7 shrink-0 items-center justify-between rounded-full px-3 ${style.bg}`}
      >
        <span
          className={`text-[8px] font-semibold tracking-widest uppercase ${style.label}`}
        >
          Rarity
        </span>
        <span
          className={`text-xs font-semibold tracking-wider uppercase ${style.value}`}
        >
          {entity.rarity}
        </span>
      </div>
    );
  }
  if (entity.type === "location" || entity.type === "character") {
    const label =
      entity.type === "location"
        ? (entity.locationType ?? "Location")
        : (entity.role ?? "NPC");
    return (
      <div className="flex h-7 shrink-0 items-center justify-end rounded-full bg-stone-200 px-3">
        <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
          {label}
        </span>
      </div>
    );
  }
  return null;
}

// ── Card (grid view) ──────────────────────────────────────────────────────────

interface EntitySummaryCardProps {
  entity: Doc<"entities">;
  onEdit?: () => void;
}

export function EntitySummaryCard({ entity, onEdit }: EntitySummaryCardProps) {
  const subtitle = entitySubtitle(entity);
  const { open } = useEntityDrawer();

  return (
    <div
      className="group flex cursor-pointer flex-col gap-2 rounded-3xl border border-stone-300 p-2 transition-shadow duration-150 hover:shadow-md"
      onClick={() => open(entity)}
    >
      {/* Square image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        {entity.image ? (
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            unoptimized
            className="object-cover opacity-50 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          />
        ) : (
          <div className="h-full w-full bg-stone-100" />
        )}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-1.5 left-1.5 rounded-md bg-[oklch(0%_0_0/30%)] p-1.5 opacity-0 transition-[opacity,background-color] duration-150 group-hover:opacity-100 hover:bg-[oklch(0%_0_0/50%)]"
            aria-label="Edit"
          >
            <Pencil size={18} color="white" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col gap-2">
        {/* Name + badge row */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-heading text-dm truncate leading-snug text-stone-950">
            {entity.name}
          </span>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="line-clamp-1 text-xs leading-snug text-stone-400 italic">
            {subtitle}
          </p>
        )}
        <EntityBadge entity={entity} />
      </div>
    </div>
  );
}

// ── Popover variant (used in EntityLink hover) ────────────────────────────────

export function EntityPopoverCard({ entity }: { entity: Doc<"entities"> }) {
  const cfg = TYPE_CONFIG[entity.type];
  const subtitle = entitySubtitle(entity);
  const isMonster = entity.type === "monster";

  return (
    <div className="flex flex-col">
      {/* Image */}
      <div className="relative aspect-square w-full">
        {entity.image ? (
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-stone-100" />
        )}
      </div>
      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-md text-[oklch(21%_0.034_264.7)]">
            {entity.name}
          </span>
          <span
            className={`rounded-full [border-width:0.666667px] px-1.5 py-0.5 text-[10px] tracking-[0.5px] uppercase ${cfg.color}`}
          >
            {isMonster && entity.stats?.cr
              ? `CR ${entity.stats.cr}`
              : cfg.label}
          </span>
        </div>
        {subtitle && (
          <p className="line-clamp-1 text-[12px] text-[oklch(60%_0.015_261)] italic">
            {subtitle}
          </p>
        )}
        {isMonster && entity.stats && (entity.stats.ac || entity.stats.hp) && (
          <div className="mt-1 flex items-center gap-3">
            {entity.stats.ac && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[oklch(44.6%_0.030_256.8)]">
                <Shield size={12} className="text-slate-400" /> AC{" "}
                {entity.stats.ac}
              </span>
            )}
            {entity.stats.hp && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[oklch(44.6%_0.030_256.8)]">
                <Heart size={12} className="text-[#FF6467]" /> {entity.stats.hp}{" "}
                HP
              </span>
            )}
          </div>
        )}
        {!isMonster && entity.description && (
          <p className="line-clamp-2 text-[12px] text-[oklch(60%_0.015_261)]">
            {entity.description}
          </p>
        )}
      </div>
    </div>
  );
}

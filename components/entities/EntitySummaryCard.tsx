'use client';

import Image from 'next/image';
import { Skull, User, Package, MapPin, Shield, Heart, Pencil } from 'lucide-react';
import { Doc } from '@/convex/_generated/dataModel';
import { useEntityDrawer } from './EntityDrawerContext';

// ── Shared config ─────────────────────────────────────────────────────────────

export const TYPE_CONFIG = {
  monster: {
    label: 'Monster',
    color: 'bg-[oklch(97%_0.001_106.4)] text-[oklch(44.4%_0.011_73.6)] border-[oklch(92.3%_0.003_48.7)]',
    iconBg: 'bg-red-50 text-red-400',
    Icon: Skull,
  },
  character: {
    label: 'NPC',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    iconBg: 'bg-blue-50 text-blue-400',
    Icon: User,
  },
  item: {
    label: 'Item',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-400',
    Icon: Package,
  },
  location: {
    label: 'Location',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-400',
    Icon: MapPin,
  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function entitySubtitle(entity: Doc<'entities'>): string | null {
  switch (entity.type) {
    case 'monster':
      return [entity.size, entity.creatureType, entity.alignment]
        .filter(Boolean).join(', ') || null;
    case 'character':
      return [entity.role, entity.race, entity.alignment]
        .filter(Boolean).join(', ') || null;
    case 'item':
      return [entity.rarity, entity.itemType].filter(Boolean).join(' ') || entity.description || null;
    case 'location':
      return [entity.locationType, entity.region].filter(Boolean).join(', ') || entity.description || null;
  }
}

// ── Card (grid view) ──────────────────────────────────────────────────────────

interface EntitySummaryCardProps {
  entity: Doc<'entities'>;
  onEdit?: () => void;
}

export function EntitySummaryCard({ entity, onEdit }: EntitySummaryCardProps) {
  const cfg = TYPE_CONFIG[entity.type];
  const { Icon } = cfg;
  const subtitle = entitySubtitle(entity);
  const isMonster = entity.type === 'monster';
  const showStats = isMonster && entity.stats && (entity.stats.ac || entity.stats.hp);
  const { open } = useEntityDrawer();

  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-[10px] bg-white [border-width:0.666667px] border-[oklch(92.8%_0.006_264.5)] hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => open(entity)}
    >
      {/* Square image */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden [outline:1px_solid_oklch(92.8%_0.006_264.5)]">
        {entity.image ? (
          <Image src={entity.image} alt={entity.name} fill unoptimized className="object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${cfg.iconBg}`}>
            <Icon size={36} strokeWidth={1.5} />
          </div>
        )}
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="absolute right-2 top-2 rounded-lg bg-[oklch(0%_0_0/30%)] p-1.5 hover:bg-[oklch(0%_0_0/50%)] transition-colors"
            aria-label="Edit"
          >
            <Pencil size={14} color="white" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Name + badge row */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-heading text-[16px] leading-snug text-[oklch(21%_0.034_264.7)] shrink-0">
            {entity.name}
          </span>
          {isMonster && entity.stats?.cr ? (
            <span className={`text-[10px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-full [border-width:0.666667px] shrink-0 ${cfg.color}`}>
              CR {entity.stats.cr}
            </span>
          ) : (
            <span className={`text-[10px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-full [border-width:0.666667px] shrink-0 ${cfg.color}`}>
              {entity.type === 'item' && entity.rarity ? entity.rarity : cfg.label}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[12px] italic leading-snug text-[oklch(60%_0.015_261)] line-clamp-1">
            {subtitle}
          </p>
        )}

        {/* Monster stats */}
        {showStats && (
          <div className="flex items-center gap-3 mt-0.5">
            {entity.stats?.ac && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[oklch(44.6%_0.030_256.8)]">
                <Shield size={12} className="text-slate-400" strokeWidth={2} />
                AC {entity.stats.ac}
              </span>
            )}
            {entity.stats?.hp && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[oklch(44.6%_0.030_256.8)]">
                <Heart size={12} className="text-[#FF6467]" strokeWidth={2} />
                {entity.stats.hp} HP
              </span>
            )}
            {entity.stats?.hpFormula && (
              <span className="text-[11px] text-[oklch(70.7%_0.022_261.3)]">
                ({entity.stats.hpFormula})
              </span>
            )}
          </div>
        )}

        {/* Description for non-monsters without subtitle */}
        {!isMonster && !subtitle && entity.description && (
          <p className="text-[12px] text-[oklch(60%_0.015_261)] line-clamp-2 mt-0.5">
            {entity.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Popover variant (used in EntityLink hover) ────────────────────────────────

export function EntityPopoverCard({ entity }: { entity: Doc<'entities'> }) {
  const cfg = TYPE_CONFIG[entity.type];
  const { Icon } = cfg;
  const subtitle = entitySubtitle(entity);
  const isMonster = entity.type === 'monster';

  return (
    <div className="flex flex-col">
      {/* Image */}
      <div className="relative w-full aspect-square">
        {entity.image ? (
          <Image src={entity.image} alt={entity.name} fill unoptimized className="object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${cfg.iconBg}`}>
            <Icon size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-heading text-[15px] text-[oklch(21%_0.034_264.7)]">{entity.name}</span>
          <span className={`text-[10px] tracking-[0.5px] uppercase px-1.5 py-0.5 rounded-full [border-width:0.666667px] ${cfg.color}`}>
            {isMonster && entity.stats?.cr ? `CR ${entity.stats.cr}` : cfg.label}
          </span>
        </div>
        {subtitle && (
          <p className="text-[12px] italic text-[oklch(60%_0.015_261)] line-clamp-1">{subtitle}</p>
        )}
        {isMonster && entity.stats && (entity.stats.ac || entity.stats.hp) && (
          <div className="flex items-center gap-3 mt-1">
            {entity.stats.ac && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[oklch(44.6%_0.030_256.8)]">
                <Shield size={12} className="text-slate-400" /> AC {entity.stats.ac}
              </span>
            )}
            {entity.stats.hp && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[oklch(44.6%_0.030_256.8)]">
                <Heart size={12} className="text-[#FF6467]" /> {entity.stats.hp} HP
              </span>
            )}
          </div>
        )}
        {!isMonster && entity.description && (
          <p className="text-[12px] text-[oklch(60%_0.015_261)] line-clamp-2">{entity.description}</p>
        )}
      </div>
    </div>
  );
}

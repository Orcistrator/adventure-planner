import {
  type LucideIcon,
  Cone,
  Skull,
  Gem,
  ShieldUser,
  MapPinned,
  Swords,
  LifeBuoy,
  Crown,
  PawPrint,
  FlameKindling,
} from 'lucide-react';

export const ENVIRONMENTS = [
  { name: 'Forest',      tw: 'text-green-400   border-green-500'   },
  { name: 'Desert',      tw: 'text-amber-400   border-amber-500'   },
  { name: 'Mountain',    tw: 'text-stone-300   border-stone-400'   },
  { name: 'Urban',       tw: 'text-blue-400    border-blue-500'    },
  { name: 'Underground', tw: 'text-purple-400  border-purple-500'  },
  { name: 'Coastal',     tw: 'text-cyan-400    border-cyan-500'    },
  { name: 'Arctic',      tw: 'text-sky-300     border-sky-400'     },
  { name: 'Swamp',       tw: 'text-emerald-400 border-emerald-500' },
  { name: 'Ruins',       tw: 'text-orange-400  border-orange-500'  },
  { name: 'Dungeon',     tw: 'text-red-400     border-red-500'     },
] as const;

export type EnvironmentName = (typeof ENVIRONMENTS)[number]['name'];

export function getEnvStyle(name: string): string {
  return (
    ENVIRONMENTS.find((e) => e.name === name)?.tw ?? 'text-amber-400 border-amber-500'
  );
}

export const ADVENTURE_TYPES: { name: string; icon: LucideIcon }[] = [
  { name: 'Mystery',       icon: Cone          },
  { name: 'Horror',        icon: Skull         },
  { name: 'Heist',         icon: Gem           },
  { name: 'Escort',        icon: ShieldUser    },
  { name: 'Exploration',   icon: MapPinned     },
  { name: 'Combat',        icon: Swords        },
  { name: 'Rescue',        icon: LifeBuoy      },
  { name: 'Political',     icon: Crown         },
  { name: 'Investigation', icon: PawPrint      },
  { name: 'Survival',      icon: FlameKindling },
];

export const LEVEL_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: `Level ${i + 1}`,
}));

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
  { name: 'Forest',      bg: 'bg-green-600',   text: 'text-white'     },
  { name: 'Desert',      bg: 'bg-amber-500',   text: 'text-white'     },
  { name: 'Mountain',    bg: 'bg-stone-200',   text: 'text-stone-500' },
  { name: 'Urban',       bg: 'bg-blue-600',    text: 'text-white'     },
  { name: 'Underground', bg: 'bg-purple-700',  text: 'text-white'     },
  { name: 'Coastal',     bg: 'bg-cyan-500',    text: 'text-white'     },
  { name: 'Arctic',      bg: 'bg-sky-200',     text: 'text-sky-900'   },
  { name: 'Swamp',       bg: 'bg-emerald-700', text: 'text-white'     },
  { name: 'Ruins',       bg: 'bg-orange-500',  text: 'text-white'     },
  { name: 'Dungeon',     bg: 'bg-red-700',     text: 'text-white'     },
] as const;

export type EnvironmentName = (typeof ENVIRONMENTS)[number]['name'];

export function getEnvStyle(name: string): string {
  const env = ENVIRONMENTS.find((e) => e.name === name);
  return env ? `${env.bg} ${env.text}` : 'bg-amber-500 text-white';
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

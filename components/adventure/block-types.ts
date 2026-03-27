import {
  BookOpen,
  Swords,
  Gem,
  Minus,
  Image as ImageIcon,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

export const BLOCK_TYPES: { type: string; label: string; icon: LucideIcon }[] = [
  { type: 'read-aloud',     label: 'Read Aloud', icon: BookOpen  },
  { type: 'encounter',      label: 'Encounter',  icon: Swords    },
  { type: 'treasure-table', label: 'Table',      icon: Gem       },
  { type: 'image',          label: 'Image',      icon: ImageIcon },
  { type: 'location',       label: 'Location',   icon: MapPin    },
  { type: 'divider',        label: 'Divider',    icon: Minus     },
];

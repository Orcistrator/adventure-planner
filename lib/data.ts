import type { Entity } from './types';

export const ENTITIES: Record<string, Entity> = {
  'water-weird': {
    id: 'water-weird',
    name: 'Water Weird',
    type: 'monster',
    description: 'An elemental guardian bound to a specific water-filled pool. It is invisible while fully immersed in water.',
    stats: { ac: 13, hp: 58, speed: '0 ft., swim 60 ft.', str: 17, dex: 16, con: 13, int: 11, wis: 10, cha: 10 },
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200&auto=format&fit=crop',
  },
  'silver-vial': {
    id: 'silver-vial',
    name: 'Silver Vial of Dawn',
    type: 'item',
    description: 'A beautifully crafted silver vial with celestial motifs. It magically refills with 1 pint of fresh, pure water at dawn each day.',
  },
  'echoing-shade': {
    id: 'echoing-shade',
    name: 'Echoing Shade',
    type: 'monster',
    description: 'A shadow entity formed from stolen voices and forgotten names.',
    stats: { ac: 14, hp: 35, speed: '40 ft.' },
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=200&auto=format&fit=crop',
  },
  'healing-potion': {
    id: 'healing-potion',
    name: 'Potion of Healing',
    type: 'item',
    description: 'A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.',
    image: 'https://images.unsplash.com/photo-1605557202138-097824c3e074?q=80&w=200&auto=format&fit=crop',
  },
  'goblin': {
    id: 'goblin',
    name: 'Goblin',
    type: 'monster',
    description: 'Goblins are small, black-hearted humanoids that lair in despoiled dungeons and other dismal settings.',
    stats: { ac: 15, hp: 7, speed: '30 ft.', str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    image: 'https://images.unsplash.com/photo-1620121478247-ec786f9be40f?q=80&w=200&auto=format&fit=crop',
  },
};

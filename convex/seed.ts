import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

const MONSTERS = [
  {
    slug: 'goblin',
    name: 'Goblin',
    type: 'monster' as const,
    description: 'Small and cunning humanoids that dwell in dark places, goblins favor ambushes and dirty tricks over fair fights.',
    size: 'Small',
    creatureType: 'Humanoid (goblinoid)',
    alignment: 'Neutral Evil',
    stats: {
      ac: 15, acNote: 'leather armor, shield',
      hp: 7, hpFormula: '2d6',
      speed: '30 ft.',
      str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8,
      proficiencyBonus: 2, cr: '1/4', xp: 50,
    },
    skills: [{ name: 'Stealth', bonus: 6 }],
    senses: 'Darkvision 60 ft., passive Perception 9',
    languages: 'Common, Goblin',
    traits: [
      { name: 'Nimble Escape', description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.' },
    ],
    actions: [
      { name: 'Scimitar', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.' },
      { name: 'Shortbow', description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.' },
    ],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    type: 'monster' as const,
    description: 'Animated by dark magic, skeletons are the bones of the dead given unholy purpose. They follow the orders of their masters without question.',
    size: 'Medium',
    creatureType: 'Undead',
    alignment: 'Lawful Evil',
    stats: {
      ac: 13, acNote: 'armor scraps',
      hp: 13, hpFormula: '2d8 + 4',
      speed: '30 ft.',
      str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5,
      proficiencyBonus: 2, cr: '1/4', xp: 50,
    },
    vulnerabilities: 'Bludgeoning',
    conditionImmunities: 'Exhaustion, Poisoned',
    senses: 'Darkvision 60 ft., passive Perception 9',
    languages: 'Understands the languages it knew in life but can\'t speak',
    actions: [
      { name: 'Shortsword', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.' },
      { name: 'Shortbow', description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.' },
    ],
  },
  {
    slug: 'zombie',
    name: 'Zombie',
    type: 'monster' as const,
    description: 'Slow and relentless, zombies are the rotting corpses of humanoids animated by necromantic magic to serve as mindless soldiers.',
    size: 'Medium',
    creatureType: 'Undead',
    alignment: 'Neutral Evil',
    stats: {
      ac: 8,
      hp: 22, hpFormula: '3d8 + 9',
      speed: '20 ft.',
      str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5,
      wisSave: 0,
      proficiencyBonus: 2, cr: '1/4', xp: 50,
    },
    conditionImmunities: 'Poisoned',
    senses: 'Darkvision 60 ft., passive Perception 8',
    languages: 'Understands the languages it knew in life but can\'t speak',
    traits: [
      { name: 'Undead Fortitude', description: 'If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.' },
    ],
    actions: [
      { name: 'Slam', description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.' },
    ],
  },
  {
    slug: 'wolf',
    name: 'Wolf',
    type: 'monster' as const,
    description: 'Wolves are pack hunters that use coordinated tactics to bring down prey. They are fiercely loyal to their pack.',
    size: 'Medium',
    creatureType: 'Beast',
    alignment: 'Unaligned',
    stats: {
      ac: 13, acNote: 'natural armor',
      hp: 11, hpFormula: '2d8 + 2',
      speed: '40 ft.',
      str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6,
      proficiencyBonus: 2, cr: '1/4', xp: 50,
    },
    skills: [
      { name: 'Perception', bonus: 3 },
      { name: 'Stealth', bonus: 4 },
    ],
    senses: 'Passive Perception 13',
    traits: [
      { name: 'Keen Hearing and Smell', description: 'The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.' },
      { name: 'Pack Tactics', description: 'The wolf has advantage on an attack roll against a creature if at least one of the wolf\'s allies is within 5 ft. of the creature and the ally isn\'t incapacitated.' },
    ],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone.' },
    ],
  },
  {
    slug: 'orc',
    name: 'Orc',
    type: 'monster' as const,
    description: 'Savage and brutal warriors driven by a lust for conflict, orcs raid and pillage wherever they roam, leaving destruction in their wake.',
    size: 'Medium',
    creatureType: 'Humanoid (orc)',
    alignment: 'Chaotic Evil',
    stats: {
      ac: 13, acNote: 'hide armor',
      hp: 15, hpFormula: '2d8 + 6',
      speed: '30 ft.',
      str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10,
      proficiencyBonus: 2, cr: '1/2', xp: 100,
    },
    skills: [{ name: 'Intimidation', bonus: 2 }],
    senses: 'Darkvision 60 ft., passive Perception 10',
    languages: 'Common, Orc',
    traits: [
      { name: 'Aggressive', description: 'As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.' },
    ],
    actions: [
      { name: 'Greataxe', description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.' },
      { name: 'Javelin', description: 'Melee or Ranged Weapon Attack: +5 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 6 (1d6 + 3) piercing damage.' },
    ],
  },
];

export const monsters = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const monster of MONSTERS) {
      const existing = await ctx.db
        .query('entities')
        .withIndex('by_slug', (q) => q.eq('slug', monster.slug))
        .unique();
      if (!existing) {
        await ctx.db.insert('entities', { ...monster, description: monster.description });
      }
    }
  },
});

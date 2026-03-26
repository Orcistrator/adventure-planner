import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const abilityEntry = v.object({ name: v.string(), description: v.string() });
const skillEntry = v.object({ name: v.string(), bonus: v.number() });

const statsValidator = v.object({
  ac: v.optional(v.number()),
  acNote: v.optional(v.string()),
  hp: v.optional(v.number()),
  hpFormula: v.optional(v.string()),
  speed: v.optional(v.string()),
  initiative: v.optional(v.number()),
  str: v.optional(v.number()),
  dex: v.optional(v.number()),
  con: v.optional(v.number()),
  int: v.optional(v.number()),
  wis: v.optional(v.number()),
  cha: v.optional(v.number()),
  strSave: v.optional(v.number()),
  dexSave: v.optional(v.number()),
  conSave: v.optional(v.number()),
  intSave: v.optional(v.number()),
  wisSave: v.optional(v.number()),
  chaSave: v.optional(v.number()),
  proficiencyBonus: v.optional(v.number()),
  cr: v.optional(v.string()),
  xp: v.optional(v.number()),
});

const tableRow = v.object({ roll: v.string(), result: v.string() });
const table = v.object({ title: v.string(), rows: v.array(tableRow) });

const entityFields = {
  name: v.string(),
  type: v.union(
    v.literal('monster'),
    v.literal('character'),
    v.literal('item'),
    v.literal('location')
  ),
  description: v.string(),
  image: v.optional(v.string()),
  // Monster + NPC
  size: v.optional(v.string()),
  creatureType: v.optional(v.string()),
  alignment: v.optional(v.string()),
  stats: v.optional(statsValidator),
  skills: v.optional(v.array(skillEntry)),
  senses: v.optional(v.string()),
  languages: v.optional(v.string()),
  immunities: v.optional(v.string()),
  resistances: v.optional(v.string()),
  vulnerabilities: v.optional(v.string()),
  conditionImmunities: v.optional(v.string()),
  traits: v.optional(v.array(abilityEntry)),
  actions: v.optional(v.array(abilityEntry)),
  bonusActions: v.optional(v.array(abilityEntry)),
  reactions: v.optional(v.array(abilityEntry)),
  legendaryActionsDescription: v.optional(v.string()),
  legendaryActions: v.optional(v.array(abilityEntry)),
  // NPC-specific
  role: v.optional(v.string()),
  race: v.optional(v.string()),
  personality: v.optional(v.string()),
  ideals: v.optional(v.string()),
  bonds: v.optional(v.string()),
  flaws: v.optional(v.string()),
  backstory: v.optional(v.string()),
  // Item-specific
  itemType: v.optional(v.string()),
  rarity: v.optional(v.string()),
  requiresAttunement: v.optional(v.boolean()),
  cost: v.optional(v.string()),
  weight: v.optional(v.string()),
  itemProperties: v.optional(v.string()),
  // Location-specific
  locationType: v.optional(v.string()),
  region: v.optional(v.string()),
  notableFeatures: v.optional(v.array(v.string())),
  // Shared: roll tables
  tables: v.optional(v.array(table)),
};

export const list = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('monster'),
        v.literal('character'),
        v.literal('item'),
        v.literal('location')
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return ctx.db
        .query('entities')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .collect();
    }
    return ctx.db.query('entities').collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('entities')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    ...entityFields,
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('entities', args);
  },
});

export const update = mutation({
  args: {
    id: v.id('entities'),
    slug: v.string(),
    ...entityFields,
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.replace(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id('entities') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

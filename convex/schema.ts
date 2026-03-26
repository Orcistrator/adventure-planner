import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  campaigns: defineTable({
    name: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    createdAt: v.number(),
  }),

  adventures: defineTable({
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    level: v.optional(v.string()),
    type: v.optional(v.string()),
    environment: v.optional(v.string()),
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    createdAt: v.number(),
  })
    .index('by_slug', ['slug']),

  campaignAdventures: defineTable({
    campaignId: v.id('campaigns'),
    adventureId: v.id('adventures'),
  })
    .index('by_adventure', ['adventureId'])
    .index('by_campaign_and_adventure', ['campaignId', 'adventureId']),

  blocks: defineTable(
    v.union(
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('text'),
        markdown: v.string(),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('heading'),
        text: v.string(),
        level: v.number(),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('read-aloud'),
        text: v.string(),
        prompts: v.optional(
          v.array(v.object({ trigger: v.string(), response: v.string() }))
        ),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('encounter'),
        title: v.string(),
        monsters: v.array(v.object({ entityId: v.string(), count: v.number() })),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('treasure-table'),
        title: v.string(),
        items: v.array(v.object({ roll: v.string(), result: v.string() })),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('divider'),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('image'),
        url: v.string(),
        caption: v.optional(v.string()),
      }),
      v.object({
        adventureId: v.id('adventures'),
        page: v.optional(v.number()),
        order: v.number(),
        type: v.literal('location'),
        entityId: v.string(),
      }),
    )
  ).index('by_adventure_page_and_order', ['adventureId', 'page', 'order']),

  entities: defineTable({
    slug: v.string(),
    name: v.string(),
    type: v.union(
      v.literal('monster'),
      v.literal('character'),
      v.literal('item'),
      v.literal('location')
    ),
    description: v.string(),
    image: v.optional(v.string()),
    // Monster identity
    size: v.optional(v.string()),
    creatureType: v.optional(v.string()),
    alignment: v.optional(v.string()),
    // Combat + ability scores
    stats: v.optional(
      v.object({
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
        // Saving throw bonus overrides (if proficient)
        strSave: v.optional(v.number()),
        dexSave: v.optional(v.number()),
        conSave: v.optional(v.number()),
        intSave: v.optional(v.number()),
        wisSave: v.optional(v.number()),
        chaSave: v.optional(v.number()),
        proficiencyBonus: v.optional(v.number()),
        cr: v.optional(v.string()),
        xp: v.optional(v.number()),
      })
    ),
    // Proficiencies & traits
    skills: v.optional(v.array(v.object({ name: v.string(), bonus: v.number() }))),
    senses: v.optional(v.string()),
    languages: v.optional(v.string()),
    immunities: v.optional(v.string()),
    resistances: v.optional(v.string()),
    vulnerabilities: v.optional(v.string()),
    conditionImmunities: v.optional(v.string()),
    // Abilities (monster + NPC)
    traits: v.optional(v.array(v.object({ name: v.string(), description: v.string() }))),
    actions: v.optional(v.array(v.object({ name: v.string(), description: v.string() }))),
    bonusActions: v.optional(v.array(v.object({ name: v.string(), description: v.string() }))),
    reactions: v.optional(v.array(v.object({ name: v.string(), description: v.string() }))),
    legendaryActionsDescription: v.optional(v.string()),
    legendaryActions: v.optional(v.array(v.object({ name: v.string(), description: v.string() }))),
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
    // Shared: roll tables (items + locations)
    tables: v.optional(v.array(v.object({
      title: v.string(),
      rows: v.array(v.object({ roll: v.string(), result: v.string() })),
    }))),
  })
    .index('by_slug', ['slug'])
    .index('by_type', ['type']),
});

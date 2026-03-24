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
    campaignId: v.id('campaigns'),
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
    .index('by_campaign', ['campaignId'])
    .index('by_slug', ['slug']),

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
    stats: v.optional(
      v.object({
        ac: v.optional(v.number()),
        hp: v.optional(v.number()),
        speed: v.optional(v.string()),
        str: v.optional(v.number()),
        dex: v.optional(v.number()),
        con: v.optional(v.number()),
        int: v.optional(v.number()),
        wis: v.optional(v.number()),
        cha: v.optional(v.number()),
      })
    ),
  })
    .index('by_slug', ['slug'])
    .index('by_type', ['type']),
});

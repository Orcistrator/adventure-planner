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
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    createdAt: v.number(),
  }).index('by_campaign', ['campaignId']).index('by_slug', ['slug']),

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
  }).index('by_slug', ['slug']).index('by_type', ['type']),
});

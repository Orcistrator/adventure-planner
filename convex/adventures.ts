import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('adventures').order('desc').take(200);
  },
});

export const listByCampaign = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('adventures')
      .withIndex('by_campaign', (q) => q.eq('campaignId', args.campaignId))
      .take(100);
  },
});

export const get = query({
  args: { id: v.id('adventures') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('adventures')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    campaignId: v.id('campaigns'),
    title: v.string(),
    slug: v.string(),
    subtitle: v.optional(v.string()),
    level: v.optional(v.string()),
    type: v.optional(v.string()),
    environment: v.optional(v.string()),
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('adventures', {
      ...args,
      status: 'draft',
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('adventures'),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    level: v.optional(v.string()),
    type: v.optional(v.string()),
    environment: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

import { query } from './_generated/server';
import { v } from 'convex/values';

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

import { query } from './_generated/server';
import { v } from 'convex/values';

export const listByCampaign = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('adventures')
      .withIndex('by_campaign', (q) => q.eq('campaignId', args.campaignId))
      .collect();
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

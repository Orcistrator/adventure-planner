import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listForCampaign = query({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query('campaignAdventures')
      .withIndex('by_campaign_and_adventure', (q) => q.eq('campaignId', args.campaignId))
      .take(100);
    const adventures = await Promise.all(links.map((l) => ctx.db.get(l.adventureId)));
    return adventures.filter((a) => a !== null);
  },
});

export const add = mutation({
  args: {
    campaignId: v.id('campaigns'),
    adventureId: v.id('adventures'),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('campaignAdventures')
      .withIndex('by_campaign_and_adventure', (q) =>
        q.eq('campaignId', args.campaignId).eq('adventureId', args.adventureId)
      )
      .unique();
    if (existing) return;
    await ctx.db.insert('campaignAdventures', args);
  },
});

export const remove = mutation({
  args: {
    campaignId: v.id('campaigns'),
    adventureId: v.id('adventures'),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query('campaignAdventures')
      .withIndex('by_campaign_and_adventure', (q) =>
        q.eq('campaignId', args.campaignId).eq('adventureId', args.adventureId)
      )
      .unique();
    if (link) await ctx.db.delete(link._id);
  },
});

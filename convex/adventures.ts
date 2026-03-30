import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const adventures = await ctx.db.query('adventures').take(200);
    return adventures.sort((a, b) => a.title.localeCompare(b.title));
  },
});

export const listWithDescriptions = query({
  args: {},
  handler: async (ctx) => {
    const adventures = await ctx.db.query('adventures').take(200);
    adventures.sort((a, b) => a.title.localeCompare(b.title));
    return Promise.all(
      adventures.map(async (a) => {
        const firstBlock = await ctx.db
          .query('blocks')
          .withIndex('by_adventure_page_and_order', (q) => q.eq('adventureId', a._id))
          .first();
        let description: string | undefined;
        if (firstBlock?.type === 'text') {
          description = firstBlock.markdown
            .replace(/^#{1,4}\s+/, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/@\[([^\]]+)\]\([^)]+\)/g, '$1')
            .trim()
            .slice(0, 280);
        }
        return { ...a, description };
      })
    );
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
    title: v.string(),
    slug: v.string(),
    level: v.optional(v.string()),
    type: v.optional(v.string()),
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('adventures', {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('adventures') },
  handler: async (ctx, args) => {
    const blocks = await ctx.db
      .query('blocks')
      .withIndex('by_adventure_page_and_order', (q) => q.eq('adventureId', args.id))
      .take(500);
    await Promise.all(blocks.map((b) => ctx.db.delete(b._id)));

    const links = await ctx.db
      .query('campaignAdventures')
      .withIndex('by_adventure', (q) => q.eq('adventureId', args.id))
      .take(100);
    await Promise.all(links.map((l) => ctx.db.delete(l._id)));

    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id('adventures'),
    title: v.optional(v.string()),
    level: v.optional(v.string()),
    type: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

import { mutation, query } from './_generated/server';
import { WithoutSystemFields } from 'convex/server';
import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';

type BlockInsert = WithoutSystemFields<Doc<'blocks'>>;

export const listByAdventure = query({
  args: { adventureId: v.id('adventures') },
  handler: async (ctx, args) => {
    const blocks = await ctx.db
      .query('blocks')
      .withIndex('by_adventure_page_and_order', (q) =>
        q.eq('adventureId', args.adventureId)
      )
      .order('asc')
      .take(500);
    // Normalize: docs without page (pre-migration) fall back to page 1
    return blocks.map((b) => ({ ...b, page: b.page ?? 1 }));
  },
});

export const add = mutation({
  args: {
    adventureId: v.id('adventures'),
    type: v.union(
      v.literal('text'),
      v.literal('heading'),
      v.literal('read-aloud'),
      v.literal('encounter'),
      v.literal('treasure-table'),
      v.literal('divider')
    ),
    page: v.number(),
    afterOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let order: number;

    if (args.afterOrder !== undefined) {
      const nextBlock = await ctx.db
        .query('blocks')
        .withIndex('by_adventure_page_and_order', (q) =>
          q.eq('adventureId', args.adventureId).eq('page', args.page)
        )
        .order('asc')
        .filter((q) => q.gt(q.field('order'), args.afterOrder!))
        .first();

      order = nextBlock
        ? (args.afterOrder + nextBlock.order) / 2
        : args.afterOrder + 1;
    } else {
      const lastBlock = await ctx.db
        .query('blocks')
        .withIndex('by_adventure_page_and_order', (q) =>
          q.eq('adventureId', args.adventureId).eq('page', args.page)
        )
        .order('desc')
        .first();

      order = lastBlock ? lastBlock.order + 1 : 1;
    }

    return ctx.db.insert('blocks', getDefaults(args.type, args.adventureId, args.page, order));
  },
});

export const update = mutation({
  args: {
    id: v.id('blocks'),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.patch);
  },
});

export const remove = mutation({
  args: { id: v.id('blocks') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Swap order with adjacent block on the same page
export const move = mutation({
  args: {
    id: v.id('blocks'),
    adventureId: v.id('adventures'),
    direction: v.union(v.literal('up'), v.literal('down')),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db.get(args.id);
    if (!block) return;

    const pageBlocks = await ctx.db
      .query('blocks')
      .withIndex('by_adventure_page_and_order', (q) =>
        q.eq('adventureId', args.adventureId).eq('page', block.page)
      )
      .order('asc')
      .take(500);

    const idx = pageBlocks.findIndex((b) => b._id === args.id);
    if (idx === -1) return;

    const swapIdx = args.direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= pageBlocks.length) return;

    const swapBlock = pageBlocks[swapIdx];
    await ctx.db.patch(args.id, { order: swapBlock.order });
    await ctx.db.patch(swapBlock._id, { order: block.order });
  },
});

// Move a block to a different page (appended at the end of that page)
export const movePage = mutation({
  args: {
    id: v.id('blocks'),
    adventureId: v.id('adventures'),
    targetPage: v.number(),
  },
  handler: async (ctx, args) => {
    const lastOnPage = await ctx.db
      .query('blocks')
      .withIndex('by_adventure_page_and_order', (q) =>
        q.eq('adventureId', args.adventureId).eq('page', args.targetPage)
      )
      .order('desc')
      .first();

    const order = lastOnPage ? lastOnPage.order + 1 : 1;
    await ctx.db.patch(args.id, { page: args.targetPage, order });
  },
});

// Convert a legacy heading block to a text block with `# ` prefix
export const convertHeadingToText = mutation({
  args: { id: v.id('blocks') },
  handler: async (ctx, { id }) => {
    const block = await ctx.db.get(id);
    if (!block || block.type !== 'heading') return;
    const prefix = '#'.repeat(Math.max(1, Math.min(4, block.level))) + ' ';
    await ctx.db.delete(id);
    return ctx.db.insert('blocks', {
      adventureId: block.adventureId,
      page: block.page ?? 1,
      order: block.order,
      type: 'text',
      markdown: prefix + block.text,
    });
  },
});

// One-time migration: backfill page: 1 on blocks that predate the page field.
// Run once from the Convex dashboard, then delete and re-narrow page to required.
export const backfillPage = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('blocks').take(2000);
    let patched = 0;
    for (const block of all) {
      if (block.page === undefined) {
        await ctx.db.patch(block._id, { page: 1 });
        patched++;
      }
    }
    return { patched };
  },
});

function getDefaults(
  type: string,
  adventureId: Doc<'adventures'>['_id'],
  page: number,
  order: number
): BlockInsert {
  const base = { adventureId, page, order };
  switch (type) {
    case 'text':
      return { ...base, type: 'text', markdown: '' };
    case 'heading':
      return { ...base, type: 'heading', text: 'New Heading', level: 2 };
    case 'read-aloud':
      return { ...base, type: 'read-aloud', text: '' };
    case 'encounter':
      return { ...base, type: 'encounter', title: 'New Encounter', monsters: [] };
    case 'treasure-table':
      return { ...base, type: 'treasure-table', title: 'New Treasure Table', items: [] };
    case 'divider':
      return { ...base, type: 'divider' };
    default:
      return { ...base, type: 'text', markdown: '' };
  }
}

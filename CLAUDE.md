# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server via Turbopack (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx convex dev       # Convex backend + codegen (run alongside npm run dev)
```

Both `npm run dev` and `npx convex dev` must be running simultaneously during development. There is no test suite.

## Architecture

**Next.js 15 App Router** + **Convex** backend. All pages live under `app/(main)/` — a route group that applies `FloatingToolbar` to every page. Root `app/layout.tsx` handles the HTML shell, fonts, and `ConvexClientProvider`.

### Routing

| Route | Page |
|---|---|
| `/` | Campaigns list |
| `/adventure/[id]` | Adventure viewer/editor (slug-based) |
| `/adventures` | Adventures list |
| `/entities` | Entity browser |

### Data Layer

**Convex schema** has five tables: `campaigns`, `adventures`, `campaignAdventures` (join), `blocks`, `entities`.

- Adventures are standalone — zero-to-many campaigns via `campaignAdventures` join table
- `blocks` uses a **union type** with eight variants: `text`, `heading` (legacy), `read-aloud`, `encounter`, `treasure-table`, `divider`, `image`, `location`
- Block ordering uses **floating-point fractional ordering** — new blocks inserted between two existing blocks get order `(a + b) / 2`, avoiding full reorders
- `blocks.page` supports future multi-page documents; currently always `1`
- `lib/data.ts` contains hardcoded seed entities (no longer used by `EncounterTracker`, which now fetches live from `useQuery(api.entities.list)`)

**Always read `convex/_generated/ai/guidelines.md` before writing any Convex code.** Key rules:
- Always include argument validators on every function
- Use `withIndex` instead of `filter` on queries — Convex `.filter()` does NOT push to storage
- Never use `.collect()` without a bound — prefer `.take(n)` or paginate
- Index names must match their fields (e.g. `by_campaign_and_adventure`)
- `"use node"` files cannot export queries or mutations
- `campaignAdventures` only has `by_adventure` and `by_campaign_and_adventure` indexes — `by_campaign_and_adventure` handles prefix-only campaign queries too

### Adventure Page

`AdventureView` orchestrates the full adventure page. The layout:

```
AdventureView
├── AdventureHeader        — animated collapsing cover (scroll-driven, Framer Motion)
└── [content area: max-w-6xl]
    ├── aside (xl only)    — sticky; title + TableOfContents
    └── main
        └── BlockList
            ├── SortableBlockRow × N  (dnd-kit sortable, drag handle in action strip)
            │   └── BlockRenderer     — routes to correct block component
            └── GhostTextInput        — edit mode only, after last block
```

**Header scroll animation** (Framer Motion `useScroll` + `useTransform`):
- `headerHeight`: `[0,440]→[500,0]` — collapses to zero
- `metaOpacity`: `[0,200]→[1,0]` — level/tags fade out
- `titleOpacity`: `[80,280]→[1,0]` — title fades out
- The ToC sidebar title fades in with `[220,400]→[0,1]` to replace the collapsing header title

### Block System

**Text blocks** are the primary editing surface. They store markdown-like syntax:
- `# ` / `## ` / `### ` / `#### ` prefix → rendered as headings (also used for ToC extraction)
- `**text**` / `*text*` → bold / italic inline
- `- ` / `1. ` prefix → bullet / ordered lists
- `@[Name](slug)` → entity mention, rendered as `EntityLink` in view mode

TextBlock has a **client-side undo system** (`historyRef` array capped at 100, `historyIdxRef` pointer) with debounced snapshots (500ms) and Ctrl/Cmd+Z support. Snapshots are also taken before formatting actions.

The **SelectionToolbar** floats above the textarea when text is selected. It uses `onMouseDown: e.preventDefault()` to preserve textarea focus/selection when clicking toolbar buttons.

**Entity mention flow** (edit mode): typing `@` opens a portal-rendered dropdown positioned directly below the caret using a mirror-div technique (`getCaretPosition` in `TextBlock.tsx`). Arrow keys / Enter / Tab navigate and select. Selecting inserts `@[Name](slug)` into the draft. The dropdown fetches all entities via `useQuery(api.entities.list, isEditing ? {} : 'skip')`.

**Legacy heading blocks**: `heading`-type blocks still exist in the DB. `BlockRenderer` wraps them in `LegacyHeadingBlock`, which renders them correctly in view mode and auto-fires the `convertHeadingToText` mutation (delete + re-insert as `text` block with `#` prefix) when edit mode is entered.

**Insert picker**: In edit mode, each block row's action strip has a `+` button. Clicking it opens a portal-rendered popover listing all insertable block types (sourced from `components/adventure/block-types.ts`). Text blocks are created via Enter key in the `GhostTextInput` at the bottom instead. The `add` mutation returns the new block's ID; `BlockList` uses this to set `pendingFocusId` for auto-focus.

**Drag-and-drop**: `BlockList` uses `@dnd-kit` (`DndContext`, `SortableContext`, `useSortable`) for block reordering. On drag end, the block's `order` is updated to `(prev.order + next.order) / 2`. A `DragOverlay` renders a floating ghost card while dragging.

**Adding a new block type** requires changes in six places:
1. `convex/schema.ts` — add a new `v.object({ type: v.literal('...'), ... })` variant to the blocks union
2. `convex/blocks.ts` — add `v.literal('...')` to the `add` mutation args union, and a `case` in `getDefaults()`
3. `components/adventure/block-types.ts` — add entry to `BLOCK_TYPES` array (shown in insert picker)
4. `components/adventure/BlockRenderer.tsx` — import the component and add a `case` to the switch
5. `components/adventure/BlockList.tsx` — add the type to the pencil-button visibility check if it has edit mode
6. Create `components/adventure/blocks/YourBlock.tsx` — follow the dual-mode pattern: `useState(false)` for `editOpen`, watch `editTrigger` with `useEffect`, local draft state synced from props, save via `api.blocks.update`

**Block action strip**: In edit mode, hovering a block reveals a left-side action strip (`absolute right-full top-2`) anchored outside the block's left edge. It contains:
- **Drag handle** (`GripVertical`) — dnd-kit drag activation
- **Insert** (`Plus`) — opens the insert block picker portal
- **Pencil** (stone/gray) — only shown for `encounter`, `read-aloud`, `treasure-table`, `image`, and `location` blocks; triggers edit mode via an `editTrigger` counter prop
- **Trash** (red on hover) — deletes the block; for text blocks also re-focuses the nearest previous text block

`BlockRenderer` no longer owns any action chrome. All block-level actions live in `BlockList`'s hover strip.

**`editTrigger` pattern**: `BlockList` holds `editTriggers: Record<string, number>`. Clicking the pencil increments the counter for that block's ID. `BlockRenderer` passes it down; each editable block watches it with `useEffect(() => { if (editTrigger) setEditOpen(true); }, [editTrigger])`. This avoids `useImperativeHandle`/refs while keeping edit state local to each block.

**Drop cap**: The first plain-text paragraph (not heading/list) in view mode gets a `drop-cap` CSS class. `BlockList` computes `firstParagraphId` by scanning sorted blocks; `isFirstParagraph` is threaded through `BlockRenderer` → `TextBlock` → `MarkdownView`.

**ToC extraction** (in `AdventureView`) handles both legacy heading blocks and `#`-prefixed text blocks:
```ts
const m = block.markdown.match(/^(#{1,4})\s+(.+)/);
```

### Entity System

Entities have four types: `monster`, `character`, `item`, `location`. Each is a large document with type-specific fields (stats, abilities, roll tables, etc.).

**`EntityDrawerContext`** (provided in `app/(main)/layout.tsx`) is the global controller for the entity detail drawer. Call `open(entity)` from anywhere to show the drawer. The Vaul bottom drawer uses `noBodyStyles` and the app-wide `overflow: auto !important` CSS rule so the drawer never locks body scroll — users can keep scrolling the adventure while an entity drawer is open.

**`EntityLink`** renders inline entity mentions in view mode. It fetches the entity by slug via `useQuery(api.entities.getBySlug)`, shows an indigo dashed-underline style, opens a hover popover (portal-rendered via `createPortal` to avoid nesting `<div>` inside `<p>`), and opens the drawer on click. The popover also uses `createPortal` with `position: fixed` coordinates derived from `getBoundingClientRect()`.

The same hover-popover pattern is reused in `EncounterTracker` via a local `MonsterName` sub-component — same `onMouseEnter` → `getBoundingClientRect` → portal approach, no shared abstraction needed.

**`EntitySummaryCard` / `EntityPopoverCard`**: shared card components used on the entity browser grid and in the `EntityLink` hover popover. `TYPE_CONFIG` (defined in `EntitySummaryCard.tsx`) is the shared source of truth for entity type labels, badge colors, and icon backgrounds.

### Campaigns

`CampaignFormModal` uses a **deferred write pattern**: local `toAdd`, `toRemove`, `toCreate` arrays accumulate changes while the modal is open; everything is batch-written on submit. The modal also allows creating new adventures inline.

`CampaignCard` and `CampaignFormModal` share a Framer Motion `layoutId` for a card-to-modal morph animation. The card is hidden (not unmounted) while its modal is open.

### AdventureHeader Edit Mode

Metadata inputs in edit mode:
- **Level**: Two `number` inputs (1–20) serialized as `"5"` or `"1-5"` string in the DB
- **Environments**: Multi-select toggle pills from `ENVIRONMENTS` preset (stored in `tags[]`)
- **Type**: shadcn `<Select>` from `ADVENTURE_TYPES` preset, each with a Lucide icon
- **Cover image**: URL input, top-right corner overlay

### Encounter Block

`EncounterBlock` is the edit-mode shell; `EncounterTracker` is the full view-mode combat interface.

**Edit mode** (opened via the left action strip pencil): entity picker for `monster` and `character` types with searchable dropdown showing avatar + AC/HP preview. Entities are fetched via `useQuery(api.entities.list, editOpen ? {} : 'skip')`.

**`EncounterTracker`** (view mode only, all state is client-side / not persisted):
- Fetches entities once via `useQuery(api.entities.list, {})` and initialises combatants on first load (guarded by `initialized` ref to avoid resetting live state)
- **Initiative**: editable number input per combatant; list auto-sorts descending (nulls last) using Framer Motion `layout` animation
- **HP tracking**: modifier input per monster — type `-4` (damage) or `4` (heal), press Enter; clamped to `[0, maxHp]`; zero-HP combatants dim to 40% opacity
- **HP feedback**: transient `AnimatePresence` label ("4 damage" / "+4 healed") slides in at 150ms ease-out, floats up and fades at 400ms ease-out, auto-clears after 1.6s; uses `id: Date.now()` as key so rapid hits each re-animate
- **Players**: "Add player" button creates temporary combatants (name + initiative only, no HP); removed via hover ✕
- **Reset**: `RotateCcw` button in the header restores all monster HP to max, clears initiative, removes players
- Clicking a monster name or avatar opens `EntityDrawerContext` drawer; hovering the name shows `EntityPopoverCard` via the same portal pattern as `EntityLink`

### Table Block (`treasure-table`)

Despite the schema type name `treasure-table`, these are general-purpose **roll tables** — any list of outcomes a DM might roll on. The "Table" label is used everywhere in the UI.

**Edit mode**: title input + a list of result rows. Roll numbers are **auto-computed** (not manually entered) — each row gets a sequential integer starting at `1` on save. Only the result text is editable per row.

**View mode** (`TreasureTable.tsx`): renders a styled table with a Roll button. Die size is inferred from item count via `getStandardDie(n)` — picks the smallest standard die (d4 → d6 → d8 → d10 → d12 → d20 → d100) that fits all rows. The Roll button label and column header update dynamically (e.g. "Roll d20"). The animation picks a random number 1–dieSize and highlights the matching row; rolls beyond the item count are handled gracefully.

### Image Block

Schema fields: `url: string`, `caption?: string`. Full-width image with an optional caption.

**Edit mode**: auto-opens on first insert (detected via `useState(isEditing && url === '')` initial value). URL input + optional caption input; teal color theme. Pencil in the action strip re-opens edit mode.

**View mode**: `<figure>` with full-width `<img>` and optional `<figcaption>`. Shows a dashed placeholder when no URL is set.

### Location Block

Schema field: `entityId: string` (stores the entity's slug). Renders a clickable card that opens the `EntityDrawerContext` drawer.

**Edit mode**: searchable picker filtered to `type: "location"` entities only, fetched via `useQuery(api.entities.list, { type: 'location' })`. Shows avatar, name, locationType, and region. Auto-opens on first insert when `entityId` is empty.

**View mode**: full-width card with image, name, locationType/region meta, and description preview. Clicking opens the entity drawer.

### Styling

Tailwind v4 via `@tailwindcss/postcss`. Theme tokens are defined in `app/globals.css` using `@theme` — there is no `tailwind.config`. Fonts: `Figtree` → `--font-sans` / `font-sans`, `Faculty_Glyphic` → `--font-heading` / `font-heading`. Two custom utility classes: `.drop-cap` and `.read-aloud`.

`components/ui/input.tsx` is a **shadcn-style** `<input>` wrapper (plain HTML input, not Base UI). It applies `border-input`, `ring-ring/50` focus ring, and `shadow-xs`. Use it for all form inputs; override width/padding via `className`.

`app/globals.css` sets `body { overflow: auto !important; padding-right: 0 !important; }` — this intentionally overrides Vaul's scroll-lock behaviour so entity drawers don't shift the page layout or block scrolling.

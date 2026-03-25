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
| `/entities`, `/items`, `/bestiary` | Entity browsers (partially wired) |

### Data Layer

**Convex schema** has five tables: `campaigns`, `adventures`, `campaignAdventures` (join), `blocks`, `entities`.

- Adventures are standalone — zero-to-many campaigns via `campaignAdventures` join table
- `blocks` uses a **union type** with six variants: `text`, `heading` (legacy), `read-aloud`, `encounter`, `treasure-table`, `divider`
- Block ordering uses **floating-point fractional ordering** — new blocks inserted between two existing blocks get order `(a + b) / 2`, avoiding full reorders
- `blocks.page` supports future multi-page documents; currently always `1`
- `lib/data.ts` contains hardcoded seed entities used by `EncounterTracker` — migration path is `useQuery(api.entities.list)`

**Always read `convex/_generated/ai/guidelines.md` before writing any Convex code.** Key rules:
- Always include argument validators on every function
- Use `withIndex` instead of `filter` on queries
- Never use `.collect()` without a bound — prefer `.take(n)` or paginate
- Index names must match their fields (e.g. `by_campaign_and_adventure`)
- `"use node"` files cannot export queries or mutations

### Adventure Page

`AdventureView` orchestrates the full adventure page. The layout:

```
AdventureView
├── AdventureHeader        — animated collapsing cover (fixed, scroll-driven)
├── [h-125 spacer]         — reserves space for the fixed header in normal flow
├── aside (xl only)
│   ├── [title fades in]   — appears as header collapses (useTransform [220,400])
│   └── TableOfContents    — sticky, scrolls with page
└── main
    └── BlockList
        ├── InsertGap      — appears before every block in edit mode
        ├── BlockRenderer  — routes to correct block component
        └── InsertGap      — after last block in edit mode
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

TextBlock has a **client-side undo system** (`historyRef` array capped at 100, `historyIdxRef` pointer) with debounced snapshots (500ms) and Ctrl/Cmd+Z support. Snapshots are also taken before formatting actions.

The **SelectionToolbar** floats above the textarea when text is selected. It uses `onMouseDown: e.preventDefault()` to preserve textarea focus/selection when clicking toolbar buttons.

**Legacy heading blocks**: `heading`-type blocks still exist in the DB. `BlockRenderer` wraps them in `LegacyHeadingBlock`, which renders them correctly in view mode and auto-fires the `convertHeadingToText` mutation (delete + re-insert as `text` block with `#` prefix) when edit mode is entered.

**InsertGap** renders a hover zone between every pair of blocks in edit mode. On click it opens a menu of insertable block types (all except text, which is created via Enter key). The `add` mutation returns the new block's ID; `BlockList` uses this to set `pendingFocusId` for auto-focus.

**ToC extraction** (in `AdventureView`) handles both legacy heading blocks and `#`-prefixed text blocks:
```ts
const m = block.markdown.match(/^(#{1,4})\s+(.+)/);
```

### Campaigns

`CampaignFormModal` uses a **deferred write pattern**: local `toAdd`, `toRemove`, `toCreate` arrays accumulate changes while the modal is open; everything is batch-written on submit. The modal also allows creating new adventures inline.

`CampaignCard` and `CampaignFormModal` share a Framer Motion `layoutId` for a card-to-modal morph animation. The card is hidden (not unmounted) while its modal is open.

### AdventureHeader Edit Mode

Metadata inputs in edit mode:
- **Level**: Two `number` inputs (1–20) serialized as `"5"` or `"1-5"` string in the DB
- **Environments**: Multi-select toggle pills from `ENVIRONMENTS` preset (stored in `tags[]`)
- **Type**: shadcn `<Select>` from `ADVENTURE_TYPES` preset, each with a Lucide icon
- **Cover image**: URL input, top-right corner overlay

### Styling

Tailwind v4 via `@tailwindcss/postcss`. Theme tokens are defined in `app/globals.css` using `@theme` — there is no `tailwind.config`. Fonts: `Figtree` → `--font-sans` / `font-sans`, `Faculty_Glyphic` → `--font-heading` / `font-heading`. Two custom utility classes: `.drop-cap` and `.read-aloud`.

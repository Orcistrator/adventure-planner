# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server via Turbopack (localhost:3000)
npm run build        # Production build (Webpack)
npm run lint         # ESLint
npx convex dev       # Run Convex backend + codegen (required alongside npm run dev)
```

There is no test suite yet.

## Architecture

This is a **Next.js 15 App Router** project with **Convex** as the backend.

### Routing

Pages live under `app/(main)/` inside a route group that wraps every page with the sidebar shell (`app/(main)/layout.tsx`). The root `app/layout.tsx` handles only the HTML shell and global CSS. Adventure pages are dynamically routed at `/adventure/[id]` but currently render static content — the `id` param is not yet wired to a Convex query.

### Data layer

There are two parallel data sources in flight:

- **`lib/data.ts`** — hardcoded seed entities (monsters, items). Used directly by components right now.
- **`convex/`** — the real backend (schema, queries). Not yet wired to the UI. The migration path is to replace `lib/data.ts` imports with `useQuery(api.entities.list)` etc. once `ConvexProvider` is added to the root layout.

The Convex schema has three tables: `campaigns`, `adventures`, `entities`. See `convex/schema.ts` for field definitions and indexes.

### Components

Client components (anything with interactivity) are marked `'use client'` and live in `components/`. Server components are the default for pages. The split:

- `components/adventure/` — `ReadAloud`, `TreasureTable`, `EncounterTracker` are all client components with local state
- `components/entities/` — `EntityLink` is a client component (hover state); `EntityCard` is a server component
- `components/layout/Sidebar.tsx` — client component (open/close toggle, `usePathname`)

### Styling

Tailwind v4 via `@tailwindcss/postcss`. Theme tokens (`--font-sans`, `--font-heading`) are defined in `app/globals.css` using the `@theme` block — not a `tailwind.config`. Two custom utility classes are defined there: `.drop-cap` and `.read-aloud`.

Fonts are loaded via `next/font/google` in `app/layout.tsx` (`Figtree` → `--font-sans`, `Faculty_Glyphic` → `--font-heading`). The `@theme inline` block in `globals.css` maps these CSS variables to Tailwind utilities.

### Convex

**Always read `convex/_generated/ai/guidelines.md` before writing any Convex code.** It overrides training-data assumptions about Convex APIs.

Key rules that differ from common assumptions:
- Always include argument validators on every function
- Use `withIndex` instead of `filter` on queries
- Never use `.collect()` without a bound — prefer `.take(n)` or paginate
- Index names must include all indexed field names (e.g. `by_campaign_and_slug`)
- `"use node"` files cannot export queries or mutations — Node actions must be in dedicated files

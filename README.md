# Adventure Planner

An enhanced D&D 5E adventure viewer for dungeon masters. Inspired by the format of official 5E modules with richer interactive features: forking read-aloud prompts, randomized treasure tables, entity popover cards, inline encounter trackers, and more.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Convex · Vercel

## Features

- **Adventure Viewer** — Two-column layout matching official 5E adventure formatting
- **Read-Aloud Blocks** — Expandable if/then conversation prompts for DMs
- **Entity Popovers** — Hover cards for monsters, items, characters, and locations
- **Encounter Tracker** — Live HP management per combatant
- **Treasure Tables** — Animated d100 rolls with highlighted results
- **Bestiary & Items Library** — Card-based browsing of all entities

## Getting Started

**Prerequisites:** Node.js 18+, a [Convex](https://convex.dev) account

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize Convex (first time only):
   ```bash
   npx convex dev
   ```
   This generates the backend bindings and gives you a deployment URL. Add it to `.env.local`:
   ```
   CONVEX_DEPLOYMENT=your-deployment-slug
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                    # Next.js App Router pages
  (main)/               # Shell layout with sidebar
    page.tsx            # Campaigns dashboard
    adventure/[id]/     # Adventure viewer
    bestiary/           # Monster library
    items/              # Items library
components/
  adventure/            # ReadAloud, TreasureTable, EncounterTracker
  entities/             # EntityLink, EntityCard
  layout/               # Sidebar
convex/                 # Backend schema and queries
lib/                    # Shared types and seed data
```

## Deployment

Deploy to Vercel — connect your GitHub repo, add the `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` environment variables, and Vercel handles the rest.

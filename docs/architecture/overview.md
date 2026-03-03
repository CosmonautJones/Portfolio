# Architecture Overview

## System Architecture

```
Browser
  |
  v
Netlify CDN (travisjohnjones.com)
  |
  v
Next.js 15 App Router (Node 20)
  |
  +---> Public pages  (no auth required)
  +---> Auth flow     (GitHub OAuth via Supabase)
  +---> Protected     (admin-only: tools, admin panel)
  +---> Adventure     (auth required: game)
  |
  v
Supabase
  +---> PostgreSQL (7 tables)
  +---> Auth (GitHub OAuth, PKCE)
  +---> RLS (row-level security per user)
```

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 15.x |
| Language | TypeScript | 5.x |
| UI runtime | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| UI components | shadcn/ui (new-york) | — |
| Animations | motion/react | 12.x |
| Database | Supabase PostgreSQL | — |
| Auth | Supabase Auth (GitHub OAuth) | — |
| Deployment | Netlify | Node 20 |
| Testing | Vitest + React Testing Library | 4.x |

## Application Domains

The portfolio is organized into five distinct domains:

### 1. Public Portfolio
Pages accessible without authentication. Shows the developer's work, skills, and contact info. Includes the secret vault route discoverable by direct URL.

See [architecture.md](../architecture.md) for route table.

### 2. Authentication
GitHub OAuth via Supabase with PKCE. Middleware enforces auth rules on every request using local JWT validation (no network call). Admin actions re-verify with `getUser()`.

See [auth.md](../auth.md) for the full auth flow.

### 3. Tool Hub (Admin-only)
A curated collection of tools accessible at `/tools`. Tools can be internal React components, external iframes, or self-contained HTML documents imported from GitHub repos.

See [tool-system.md](../tool-system.md) for how tools work.

### 4. ClaudeBot's Adventure
A Frogger-style arcade game built with HTML5 Canvas. Pure TypeScript game engine (no React in the hot path) driven by a fixed-timestep loop at 60fps. Features coins, in-game achievements, and a leaderboard.

See [game-engine.md](../game-engine.md) for engine internals.

### 5. Progression System
XP awards, level titles, and achievements wired into the root layout. Visitors earn XP by exploring the site, playing the game, and finding easter eggs.

See [progression-system.md](../progression-system.md) for XP/achievement details.

## Request Lifecycle

```
1. Browser sends request
2. next.js middleware runs (src/middleware.ts)
   a. updateSession() refreshes cookie if needed
   b. JWT validated locally via getClaims()
   c. Routing rules applied (redirects for unauthed / non-admin)
3. Route handler / Server Component executes
   a. Server actions called for any mutations
   b. requireAdmin() re-verifies identity for admin ops
4. HTML streamed to browser
5. Client components hydrate
6. VisitorProvider mounts, loads profile, listens for auth changes
```

## Data Flow

```
User action (click, keypress, form submit)
  |
  v
Client component calls server action (no API route needed)
  |
  v
Server action validates input (Zod schema)
  +---> Admin ops: requireAdmin() -> throws if not admin
  |
  v
Server action queries/mutates Supabase via server client
  |
  v
revalidatePath() invalidates affected cached pages
  |
  v
Return value rendered by client component
```

## Related Documents

- [../architecture.md](../architecture.md) — Directory structure and route groups
- [../auth.md](../auth.md) — Auth flow and middleware routing
- [../database.md](../database.md) — Database schema
- [../server-actions.md](../server-actions.md) — Server action signatures
- [../deployment.md](../deployment.md) — Netlify deployment and environment

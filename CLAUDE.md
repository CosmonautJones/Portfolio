# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always commit to main.

## Commands

- `npm run dev` — Start dev server (Next.js + Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Run all tests (Vitest)
- `npm run test:watch` — Interactive test watcher
- Run a single test: `npx vitest run src/path/to/file.test.tsx`

## Architecture

Next.js 15 App Router application — a portfolio site with an authenticated tools hub. Deployed to Netlify (`travisjohnjones.com`, Node 20). Uses Supabase for PostgreSQL database and authentication (GitHub OAuth with PKCE). Path alias: `@/*` → `./src/*`.

### Route Groups

- `src/app/(public)/` — Public portfolio pages (home, about, work, contact, vault)
- `src/app/(auth)/` — Auth flow (login, confirmation callback)
- `src/app/(protected)/` — Requires authentication (tools browser, admin panel)
- `src/app/(adventure)/` — Game pages (ClaudeBot's Adventure)
- `src/app/api/embed/[slug]/` — Serves embedded tool HTML content

### Auth & Middleware

Middleware (`src/lib/supabase/middleware.ts`) uses `supabase.auth.getClaims()` for fast local JWT validation (no network round-trip). Server actions should still use `getUser()` for full verification.

Routing rules enforced by middleware:
- `/tools` and `/admin` require authentication → redirect to `/login?redirectTo=<path>`
- Non-admin authenticated users on `/tools` or `/admin` → redirect to `/adventure`
- Authenticated users on `/login` → redirect to `/tools` (admin) or `/adventure` (non-admin)

### Tool System (core domain)

Tools have three types, defined in `src/lib/types.ts`:
- **external** — Links to an external URL
- **internal** — React components registered in `src/lib/tools-registry.ts` via `React.lazy()`. To add a new internal tool, create the component and add a lazy import entry to the registry.
- **embedded** — Self-contained HTML/CSS/JS stored in the `html_content` database column, served via the `/api/embed/[slug]` route in an iframe

Admin can import tools directly from GitHub repos. `importFromGitHub()` fetches repo metadata; `fetchRepoHtml()` assembles a single-file HTML document by inlining CSS/JS from the repo tree.

### Progression System (XP, Levels, Achievements)

Central to the visitor experience. Wired into the root layout via `VisitorProvider`.

- **`src/lib/xp.ts`** — XP award definitions with dedup rules: `once_ever`, `per_session`, `per_day`. 10 levels from "Visitor" (0 XP) to "High Five" (6000 XP).
- **`src/lib/achievements.ts`** — Achievement definitions with conditions, icons, XP rewards, and `secret` flags.
- **`src/lib/visitor-context.tsx`** — `VisitorProvider` React Context that loads profiles on mount, listens to auth state changes, manages streaks, and exposes `awardXP()`, `unlockAchievement()`, `trackEvent()`, `refreshProfile()`. Uses optimistic UI — XP added locally first, server sync is fire-and-forget. Session dedup via module-level `Set`.
- **`src/hooks/use-visitor.ts`** — convenience hook wrapping the context.
- **`src/actions/profiles.ts`** — Server actions: `getProfile`, `awardXP`, `unlockAchievement`, `trackEvent`, `addDiscovery`, `updateStreak`. Profile auto-created on first access.
- **`src/components/progression/`** — UI: `xp-bar`, `achievement-panel`, `achievement-toast`, `level-up-overlay`.

### Game Engine (`src/lib/game/`)

A pure TypeScript Frogger-style game engine decoupled from React. React integration is in `src/components/adventure/GameCanvas.tsx`.

- **`engine.ts`** — Pure functions: `createInitialState`, `tick`, `resetForNewGame`. Fixed-timestep accumulator at 60fps. Each tick: processActions → updatePlayer → updateLogRiding → updateObstacles → checkCollisions → checkIdleTimeout → updateCamera → generateLanes → pruneOldLanes → updateParticles.
- **`renderer.ts`** — Canvas 2D renderer with `SpriteCache` backed by `OffscreenCanvas`. Palette-indexed pixel sprites pre-rendered for performance.
- **`input.ts`** — Keyboard (arrows/WASD/Esc/P) + touch (swipe with 30px threshold, tap = move up).
- **`audio.ts`** — Web Audio API with procedurally generated sounds (no audio files). Mute state in `localStorage` key `adventure_muted`.
- **`types.ts`** — Lane types (grass/road/water/railroad), obstacle types, game phases, death causes.
- **`constants.ts`** — Cell size, grid dimensions, hop duration, speed ranges, difficulty scaling, collision margins.
- **`sprites/`** — Pixel art data: `palette.ts`, `lobster.ts` (player), `obstacles.ts`, `tiles.ts`.

The game has its own in-game level system (6 levels at score thresholds) separate from the visitor XP system. `game_scores.game_type` column supports multiple arcade games.

### Easter Eggs & Terminal

- **`src/lib/easter-eggs/registry.ts`** — 6 registered easter eggs (konami code, hidden terminal, vault, cosmonaut cocktail, hitchhiker 42, vaporwave). Each awards XP/achievements when discovered.
- **`src/lib/terminal/`** — Command parser, tab completer, command history, type definitions.
- **`src/components/terminal/`** — Slide-out terminal sheet with two modes: `main` (toggle button in navbar) and `retro` (hidden terminal easter egg with CRT aesthetic). Commands: `help`, `about`, `skills`, `projects`, `neofetch`, `matrix`, `cowsay`, `fortune`, `clear`, `sudo`, `vaporwave` (hidden).
- **`src/app/(public)/vault/`** — Secret route (no nav link) with puzzle challenges.

### Animation Patterns

Uses `motion/react` (Motion library, not legacy framer-motion). Two reusable wrappers:
- **`src/components/ui/animate-on-scroll.tsx`** — `useInView`-triggered animations with 5 variants (fade-up, fade-in, scale-in, slide-in-left/right). Respects `prefers-reduced-motion` via `useReducedMotion()`.
- **`src/components/ui/stagger-children.tsx`** — Container/child pair for staggered entrance animations.

Easing constant used throughout: `[0.16, 1, 0.3, 1]`.

### Server Actions (`src/actions/`)

All mutations go through server actions, not API routes. Admin actions call `requireAdmin()` which checks the authenticated user's email against `ADMIN_EMAIL`. The admin Supabase client (`src/lib/supabase/admin.ts`) bypasses RLS.

- `tools.ts` — Tool CRUD, GitHub import, repo HTML fetching
- `notes.ts` — Note CRUD (per-user via RLS)
- `projects.ts` — Project CRUD
- `profiles.ts` — XP, achievements, discoveries, streaks
- `auth.ts` — Sign out
- `deploy.ts` — Trigger Netlify build webhooks
- `game-scores.ts` — Score submission and leaderboard

### Key Libraries

- **UI**: shadcn/ui (new-york style) + Tailwind CSS 4 + Lucide icons + next-themes
- **Animation**: motion/react with `animate-on-scroll` and `stagger-children` wrappers
- **Forms**: React Hook Form + Zod validation (`src/lib/validations.ts`)
- **Auth**: Supabase Auth with GitHub OAuth; JWT validated locally in middleware
- **Testing**: Vitest + React Testing Library + jsdom

### Database

Supabase PostgreSQL with migrations in `supabase/migrations/`. Seven tables:
- `tools`, `notes` (user_id FK, RLS), `projects`, `tasks` — core app data
- `game_scores` — leaderboard with `game_type` column
- `profiles` — XP, level, title, achievements (JSONB), discoveries (JSONB), streak tracking. Auto-created via `on_auth_user_created` trigger.
- `events` — audit trail for XP awards, achievement unlocks, and analytics. Indexed on `(user_id, event_type)`.

RLS policies defined in migration 003. The `notes` table has an auto-updating `updated_at` trigger.

### Static Data

`src/lib/constants.ts` contains `SITE_CONFIG` (name, tagline, socials), `NAV_LINKS`, `PROJECTS`, `SKILLS`, `SKILL_CATEGORIES`, and `EXPERIENCE`. This data also powers terminal commands (`about`, `skills`, `projects`, `neofetch`).

### Environment Variables

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`. Optional: `GITHUB_TOKEN` (for higher API rate limits during GitHub import).

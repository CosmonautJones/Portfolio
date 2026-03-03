# Configuration Reference

## Environment Variables

See `.env.example` for the template.

### Required Variables

| Variable | Description | Where to Find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS) | Supabase dashboard → Settings → API |
| `ADMIN_EMAIL` | Email address of the admin user | Your GitHub account email |

### Optional Variables

| Variable | Default | Description |
|---|---|---|
| `GITHUB_TOKEN` | — | Personal access token. Raises GitHub API rate limit from 60 to 5000 req/hr. Used for tool GitHub import. |

## Next.js Configuration (`next.config.ts`)

Standard Next.js App Router configuration. No custom webpack overrides.

## TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2017
- **Strict**: true
- **Path alias**: `@/*` → `./src/*`
- **JSX**: preserve (Next.js handles it)

## Tailwind CSS 4 (`postcss.config.mjs`)

Uses `@tailwindcss/postcss` for Tailwind CSS 4 processing. Configured in `src/app/globals.css` using `@import "tailwindcss"`.

Color scheme CSS custom properties (`--color-*`) are defined in `globals.css` with variants for `theme-ocean`, `theme-ember`, `theme-emerald` classes.

## Game Engine Constants (`src/lib/game/constants.ts`)

Key tuning values for ClaudeBot's Adventure:

| Constant | Value | Description |
|---|---|---|
| `cellSize` | 16px | Grid cell size in pixels |
| `gridColumns` | 13 | Number of horizontal grid cells |
| `hopDuration` | 0.12s | Time for one player hop animation |
| `idleTimeout` | 7s | Idle time before player dies |
| `backDeathDistance` | 5 cells | Cells behind camera before back-death |
| `generateAhead` | 30 lanes | How many lanes to pre-generate ahead |
| `cameraSmoothing` | 0.1 | Lerp factor for camera follow (per tick) |
| `fixedTimestep` | 1/60s | Fixed physics update rate |

### Lane Weights

Weighted random probabilities for lane type generation:

| Lane | Weight |
|---|---|
| `road` | 50 |
| `grass` | 30 |
| `water` | 15 |
| `railroad` | 5 |

### Speed Ranges (px/s)

| Obstacle | Min | Max |
|---|---|---|
| car | 30 | 70 |
| truck | 20 | 50 |
| train | 120 | 180 |
| log | 15 | 40 |

### Coin System Constants

| Constant | Value | Description |
|---|---|---|
| `COIN_VALUES.gold` | 5 pts | Gold coin score bonus |
| `COIN_VALUES.silver` | 15 pts | Silver coin score bonus |
| `COIN_VALUES.diamond` | 50 pts | Diamond coin score bonus |
| `COIN_SPAWN_CHANCE.grass` | 40% | Coin spawn rate on grass |
| `COIN_SPAWN_CHANCE.road` | 25% | Coin spawn rate on road |
| `COIN_SPAWN_CHANCE.water` | 30% | Coin spawn rate on water |
| `COIN_TRAIL_CHANCE` | 30% | Chance of gold trail vs single coin (grass) |
| `COIN_COLLECT_RADIUS` | 0.75 cells | Collection radius |

### Difficulty Scaling

| Constant | Value |
|---|---|
| `DIFFICULTY.maxScoreThreshold` | 200 |
| `DIFFICULTY.minMultiplier` | 1.0x |
| `DIFFICULTY.maxMultiplier` | 2.5x |

Speed multiplier interpolates linearly from min to max as score goes from 0 to maxScoreThreshold, plus a per-level bonus.

## XP System Constants (`src/lib/xp.ts`)

See [../progression-system.md](../progression-system.md) for the full XP awards table and level thresholds.

## Shadcn/ui Configuration (`components.json`)

Style: `new-york`. Icons: `lucide`. Path aliases follow the `@/` convention.

## ESLint Configuration (`eslint.config.mjs`)

Uses `eslint-config-next`. Configured to warn (not error) on build so linting issues don't block deploys.

## Vitest Configuration (`vitest.config.ts`)

- **Environment**: jsdom
- **Setup file**: `src/test/setup.ts`
- **Globals**: enabled
- **Resolve alias**: `@` → `./src`

## Netlify Configuration (`netlify.toml`)

- **Node version**: 20
- **Build command**: `npm run build`
- **Publish directory**: `.next`

## LocalStorage Keys

The app persists several values in `localStorage`:

| Key | Value | Used By |
|---|---|---|
| `color-scheme` | `"ocean" \| "ember" \| "emerald"` | Color scheme picker |
| `adventure_muted` | `"true" \| "false"` | Game audio mute state |
| `adventure_death_history` | JSON array of death cause strings | In-game achievement tracker |

## Related Documents

- [../deployment.md](../deployment.md) — Netlify deployment and env vars
- [../game-engine.md](../game-engine.md) — Game engine internals
- [../progression-system.md](../progression-system.md) — XP and achievement definitions
- [../testing.md](../testing.md) — Vitest test configuration

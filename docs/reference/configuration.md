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
| `COIN_VALUES.ruby` | 25 pts | Ruby coin score bonus |
| `COIN_VALUES.diamond` | 50 pts | Diamond coin score bonus |
| `COIN_RARITY` | gold 75%, silver 13%, ruby 9%, diamond 3% | Weighted rarity table |
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

### Isometric 2.5D Rendering

| Constant | Value | Description |
|---|---|---|
| `SHADOW_OFFSET` | `{ x: 3, y: 2 }` | Pixel offset for drop shadows |
| `SHADOW_ALPHA` | `0.3` | Shadow opacity |
| `OBJECT_HEIGHT.car` | 4px | Isometric height for car |
| `OBJECT_HEIGHT.truck` | 5px | Isometric height for truck |
| `OBJECT_HEIGHT.train` | 6px | Isometric height for train |
| `OBJECT_HEIGHT.log` | 2px | Isometric height for log |
| `TILE_DEPTH.grass` | 3 | Depth value for grass tiles |
| `TILE_DEPTH.road` | 2 | Depth value for road tiles |
| `TILE_DEPTH.railroad` | 2 | Depth value for railroad tiles |
| `TILE_DEPTH.water` | 0 | Depth value for water tiles |

### Screen Shake

Defined in `src/lib/game/effects.ts`. Death shakes carry a **directional bias** (biasX/biasY) in addition to intensity and duration. A separate micro-shake (1.5px / 0.1s) fires on landing and coin collection.

| Death Cause | Intensity | Duration | BiasX | BiasY |
|---|---|---|---|---|
| `train` | 6px | 0.5s | +1 (right) | 0 |
| `vehicle` | 4px | 0.35s | +0.5 | -0.3 (up) |
| `water` | 2px | 0.4s | 0 | +1 (down) |
| other | 3px | 0.3s | 0 | 0 |

### Combo System

Defined in `src/lib/game/effects.ts`:

| Constant | Value | Description |
|---|---|---|
| `ComboState.windowSec` | 0.8s | Time window for consecutive hops to count |
| Max combo | 8 | Combo count cap |

### Isometric 2.5D Rendering (updated)

Car obstacle now has three sprite variants selected by `obstacle.id % 3`:

| Variant | Sprite Key |
|---|---|
| 0 | `car_blue` |
| 1 | `car_yellow` |
| 2 | `car` (default red) |

`OBJECT_HEIGHT` entries: `car`, `car_blue`, `car_yellow` = 4px; `truck` = 5px; `train` = 6px; `log` = 2px; `coin` = 0px.

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

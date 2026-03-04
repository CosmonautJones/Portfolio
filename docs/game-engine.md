# Game Engine — ClaudeBot's Adventure

## Overview

ClaudeBot's Adventure is a Frogger-style arcade game built with HTML5 Canvas. The game engine is pure TypeScript decoupled from React. React integration lives only in `src/components/adventure/GameCanvas.tsx`.

**Route**: `/adventure` (`src/app/(adventure)/adventure/page.tsx`)

## File Layout

```
src/lib/game/
  engine.ts           # Game logic (pure functions)
  renderer.ts         # Canvas 2D rendering
  input.ts            # Keyboard and touch input
  audio.ts            # Web Audio API (procedural sounds)
  types.ts            # All type definitions
  constants.ts        # Tuning constants
  coins.ts            # Coin spawning, movement, and collection
  achievement-tracker.ts   # In-game achievement checks (class)
  achievements.ts     # In-game achievement definitions
  effects.ts          # Screen shake and combo system
  sprites/
    palette.ts        # Color palette — 48 colors (32 base + 16 extended shading ramps)
    lobster.ts        # Player (lobster) sprite data — 9 named frames
    obstacles.ts      # Car, truck, train, log sprite data (+ car_yellow variant)
    tiles.ts          # Terrain tile sprite data
    coins.ts          # Coin sprite data and particle colors (gold, silver, ruby, diamond)
```

### Sprite Palette (`src/lib/game/sprites/palette.ts`)

The palette has 48 indexed colors (index 0 = transparent):

- **Indices 0–31**: Original PICO-8-inspired colors preserved for backward compatibility.
- **Indices 32–47**: Extended shading ramps added for enhanced sprite depth:
  - Log highlight / warm sand, log deep shadow
  - Lobster red-orange mid, lobster highlight peach, lobster deep shadow
  - Grass bright highlight, grass very deep shadow
  - Water bright highlight / foam, water very deep shadow
  - Claude orange deep, gold highlight, gold shadow
  - Sky pale blue, slate blue mid, electric blue (train accent), near-white blue tint (windshield)

### Lobster Sprite Frames (`src/lib/game/sprites/lobster.ts`)

9 named sprite frames exported in `LOBSTER_SPRITES`:

| Key | Frame |
|---|---|
| `lobster_up_idle` | Facing up, idle pose |
| `lobster_up_hop` | Facing up, mid-hop (legs tucked) |
| `lobster_up_land` | Facing up, landing squash (wide, flattened) |
| `lobster_down_idle` | Facing down, idle (eyes open) |
| `lobster_down_blink` | Facing down, idle blink (eyes half-closed) |
| `lobster_down_hop` | Facing down, mid-hop |
| `lobster_right_idle` | Facing right, idle |
| `lobster_right_hop` | Facing right, mid-hop |
| `lobster_death` | Death splat (shared across all facing directions) |

Left-facing sprites are generated at runtime as horizontal flips of the right-facing frames.

## Game Types (`src/lib/game/types.ts`)

### Core Types

| Type | Values |
|---|---|
| `LaneType` | `"grass" \| "road" \| "water" \| "railroad"` |
| `ObstacleType` | `"car" \| "truck" \| "train" \| "log"` |
| `CoinType` | `"gold" \| "silver" \| "ruby" \| "diamond"` |
| `GamePhase` | `"menu" \| "playing" \| "paused" \| "game_over"` |
| `DeathCause` | `"vehicle" \| "train" \| "water" \| "idle_timeout" \| "off_screen"` |
| `PlayerAnimation` | `"idle" \| "hop" \| "death"` |
| `Direction` | `"up" \| "down" \| "left" \| "right"` |
| `InputAction` | `"move_up" \| "move_down" \| "move_left" \| "move_right" \| "pause"` |

### Key Interfaces

**`GameState`** — The single mutable state object:
```typescript
{
  phase: GamePhase;
  player: Player;
  lanes: Lane[];
  camera: Camera;
  particles: Particle[];
  actionQueue: InputAction[];
  score: number;
  highScore: number;
  level: number;
  generatedUpTo: number;
  deathCause: DeathCause | null;
  nextEntityId: number;
  timeAccumulator: number;
  animationTime: number;
  coins: Coin[];           // Active collectible coins
  coinsCollected: number;  // Count for current run
  coinBonusScore: number;  // Bonus points from coins
}
```

**`GameConfig`** — Configuration passed at construction:
```typescript
{
  cellSize: number;
  gridColumns: number;
  hopDuration: number;
  idleTimeout: number;
  backDeathDistance: number;
  generateAhead: number;
  cameraSmoothing: number;
  fixedTimestep: number;
}
```

**`GameCallbacks`** — React integration hooks:
```typescript
{
  onScoreChange: (score: number) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onDeath: (cause: DeathCause, finalScore: number) => void;
  onHop: () => void;
  onLevelUp: (level: number) => void;
  onCoinCollect: (coin: Coin, bonusPoints: number) => void;
}
```

**`Coin`** — Collectible coin entity:
```typescript
{
  id: number;
  type: CoinType;     // "gold" | "silver" | "ruby" | "diamond"
  gridX: number;
  laneY: number;
  worldX: number;
  collected: boolean;
  logId: number | null;  // non-null if riding a log
}
```

## Engine (`src/lib/game/engine.ts`)

### Public API

| Function | Description |
|---|---|
| `createInitialState(config, viewportHeight)` | Creates the starting game state with 4 safe grass lanes and procedurally generated ahead |
| `tick(state, deltaTime, config, callbacks)` | Main update loop, called each animation frame |
| `resetForNewGame(state, config, callbacks?)` | Resets state for a new run, preserving `highScore` |

### Fixed Timestep Loop

`tick()` uses a **fixed-timestep accumulator** at 60fps (`fixedTimestep = 1/60`). Each frame:

1. Accumulate `deltaTime`
2. While accumulator ≥ timestep, execute one sub-step:
   - `processActions` → `updatePlayer` → `updateLogRiding`
   - `updateObstacles` → `checkCollisions`
   - `checkIdleTimeout` → `checkBackDeath`
   - `updateCamera`
   - `generateLanesIfNeeded` → `pruneLanesBehindPlayer`
   - `spawnTrainWarning` → `spawnWaterRipples`
3. Always update: `updateParticles`, increment `animationTime`

### Coordinate System

- Grid: columns × rows, integer positions (`gridPos`)
- World: pixel coordinates (`worldPos = gridPos * cellSize`)
- Y axis: lower Y = further forward (the player moves toward negative Y)
- Score = `SAFE_START_LANES - 1 - player.gridPos.y`

### Lane Generation

Lanes are procedurally generated with weighted random types:

- Weights defined in `constants.ts` as `LANE_WEIGHTS`
- `MAX_CONSECUTIVE` prevents too many consecutive same-type lanes
- Road lanes alternate `flowDirection` to avoid all traffic going one way

### Obstacle Spawning

| Lane Type | Obstacles | Count |
|---|---|---|
| `road` | cars (60%) or trucks (40%) | 1–3 |
| `railroad` | train (always) | 1 (spawns off-screen) |
| `water` | logs (rideable) | 2–3 |
| `grass` | none | 0 |

Speed scales with difficulty: `difficultyMultiplier(score)` interpolates from min to max multiplier as score increases, plus a per-level bonus.

### Collision Detection

AABB (axis-aligned bounding box) with a forgiving `COLLISION_MARGIN` (percentage of cell size). Logs are excluded from collision — they are platforms.

Checks player's current lane and hop-target lane (during a hop).

### Log Riding

When a player lands on a water lane:
1. Check if a log is under the player (with `LOG_LANDING_MARGIN` tolerance)
2. If yes: set `player.ridingLogId`; player drifts with log each tick
3. If no: `killPlayer("water")`
4. If player drifts off the log edge or off-screen: `killPlayer("water")`

### Camera

Smooth follow camera with a dead zone. `targetY` leads the player; actual `y` lerps toward `targetY` with `cameraSmoothing` factor each tick.

### Particles

Particle system for:
- **Death**: 14–19 main burst particles + additional trail burst particles, color by death cause
- **Hop dust**: 2–3 particles on landing, color by terrain
- **Score sparkle**: 2–3 gold particles on score increment
- **Water splash**: 3–5 particles on log landing
- **Train warning sparks**: sparks at train leading edge when close
- **Water ripples**: ambient circle particles on water lanes

Particles have gravity (`PARTICLE_GRAVITY`), velocity, life, and optionally rotation and trail.

### Death Conditions

| Cause | Trigger |
|---|---|
| `vehicle` | AABB collision with car/truck |
| `train` | AABB collision with train |
| `water` | Landing on water with no log, or drifting off log |
| `idle_timeout` | Player idle longer than `idleTimeout` config |
| `off_screen` | Player falls too far behind camera (`backDeathDistance`) |

## Coin System (`src/lib/game/coins.ts`)

Coins are collectible items that spawn on lanes and award bonus score points when collected.

### Coin Types

| Type | Value | Rarity Weight |
|---|---|---|
| `gold` | 5 pts | 75% |
| `silver` | 15 pts | 13% |
| `ruby` | 25 pts | 9% |
| `diamond` | 50 pts | 3% |

### Spawn Rules

| Lane Type | Spawn Chance | Behavior |
|---|---|---|
| `grass` | 40% | Single coin or gold trail (3-5 coins, 30% trail chance) |
| `road` | 25% | 1-2 coins placed in gaps between obstacles |
| `water` | 30% | Coin on middle cell of each log (50% per log) |
| `railroad` | 0% | No coins |

### Movement

Coins placed on logs move with the log each tick (`coins.ts: updateCoins()`). If the log disappears (pruned), the coin is marked collected and removed.

### Collection

`checkCoinCollection()` runs each tick during play. Uses a circular proximity check with radius = `COIN_COLLECT_RADIUS * cellSize` (0.75 cells). On collection:
1. `coin.collected = true`
2. `state.coinsCollected++`
3. `state.coinBonusScore += COIN_VALUES[type]`
4. Burst of 6-12 particles (colors from `sprites/coins.ts`)
5. `callbacks.onCoinCollect(coin, bonus)` fires

### Database

`supabase/migrations/012_add_coins_to_scores.sql` adds `coins_collected INTEGER DEFAULT 0` to `game_scores` table. `submitScore()` in `src/actions/game-scores.ts` now records coins collected per run.

## In-Game Achievement System (`src/lib/game/achievement-tracker.ts`)

Separate from the visitor XP system. In-game achievements are tracked by the `AchievementTracker` class, which persists unlock state across runs within a session and stores death cause history in `localStorage` key `adventure_death_history`.

### In-Game Achievements (`src/lib/game/achievements.ts`)

15 achievements total:

| ID | Name | Condition |
|---|---|---|
| `first_hop` | First Steps | Score ≥ 1 |
| `score_25` | Getting Somewhere | Score ≥ 25 |
| `score_100` | Century Club | Score ≥ 100 |
| `score_200` | Maximum Overdrive | Score ≥ 200 |
| `log_rider` | Log Rider | Successfully ride a log |
| `level_3` | Halfway There | Reach level 3 |
| `level_6` | Master Explorer | Reach level 6 |
| `death_water` | Splashdown | Die from water |
| `death_train` | Wrong Track | Die from train |
| `death_all` | Equal Opportunity | Die from all 5 causes |
| `score_no_water` | Aquaphobe | Score ≥ 50 without touching water |
| `comeback` | Never Give Up | Beat your previous high score |
| `first_coin` | Shiny! | Collect first coin |
| `diamond_hunter` | Diamond Hunter | Collect a diamond coin |
| `coin_hoarder` | Coin Hoarder | Collect 20+ coins in a single game |

### AchievementTracker API

```typescript
tracker.onScoreChange(score)         // Returns newly unlocked achievements
tracker.onLevelUp(level, score)      // Returns newly unlocked achievements
tracker.onCoinCollect(type, total, score) // Returns newly unlocked achievements
tracker.onLogRide(score)             // Returns newly unlocked achievements
tracker.onDeath(cause, finalScore)   // Returns newly unlocked achievements
tracker.resetForNewGame(highScore)   // Reset per-run state, keep persistent
tracker.flushPendingUnlocks()        // Drain pending queue
```

## In-Game Level System

Separate from the visitor XP system. 6 levels, defined by `LEVEL_THRESHOLDS` in `constants.ts`. `getLevelForScore(score)` returns 1–6. Level-ups trigger `callbacks.onLevelUp(level)` and increase difficulty.

## Screen Shake (`src/lib/game/effects.ts`)

Screen shake is applied on death and as a micro-shake on landing or coin collection. The effect uses exponential decay so it starts strong and fades smoothly. Each death cause also carries a **directional bias** so the shake feels physically motivated.

```typescript
interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
  biasX: number;  // positive = bias right, negative = bias left
  biasY: number;  // positive = bias down, negative = bias up
}
```

| Function | Description |
|---|---|
| `createScreenShake()` | Returns a new inactive ScreenShake |
| `triggerScreenShake(shake, intensity, duration, biasX?, biasY?)` | Starts a shake; only overrides if new intensity is stronger |
| `triggerMicroShake(shake, biasX?, biasY?)` | Brief 1.5px / 0.1s shake for landing or coin collect |
| `updateScreenShake(shake, dt)` | Advances shake each tick, returns `{ offsetX, offsetY }` |
| `getShakeParams(deathCause)` | Returns intensity, duration, and directional bias per death cause |

Death-cause params (intensity / duration / biasX / biasY):

| Death Cause | Intensity | Duration | BiasX | BiasY |
|---|---|---|---|---|
| `train` | 6px | 0.5s | +1 (right) | 0 |
| `vehicle` | 4px | 0.35s | +0.5 | -0.3 (up) |
| `water` | 2px | 0.4s | 0 | +1 (down) |
| other | 3px | 0.3s | 0 | 0 |

## Combo System (`src/lib/game/effects.ts`)

Rapid forward hops within a 0.8-second window build a combo. At combo ≥ 2 the renderer shows an overlay label (`"x2 COMBO"`, `"x3 COMBO"`, etc.). Combo caps at 8 and resets on death, idle, or backward movement.

```typescript
interface ComboState {
  count: number;
  lastHopTime: number;
  windowSec: number;  // 0.8s default
}
```

| Function | Description |
|---|---|
| `createComboState()` | Returns initial combo with count 0 |
| `updateCombo(combo, now)` | Records a hop; returns current count (1–8) |
| `resetCombo(combo)` | Sets count to 0 (death, idle, backward hop) |

## Isometric 2.5D Depth

Objects are drawn with depth offsets to create a 2.5D isometric look. Constants in `src/lib/game/constants.ts`:

| Constant | Purpose |
|---|---|
| `OBJECT_HEIGHT` | Per-obstacle-type pixel height (for depth sorting) |
| `TILE_DEPTH` | Per-lane-type tile depth value |
| `SHADOW_OFFSET` | `{ x: 3, y: 2 }` pixels for shadow drawing |
| `SHADOW_ALPHA` | `0.3` — shadow opacity |

## Renderer (`src/lib/game/renderer.ts`)

Canvas 2D renderer with a `SpriteCache` backed by `OffscreenCanvas`. Palette-indexed pixel sprites are pre-rendered once to `OffscreenCanvas` instances for performance. The renderer applies screen shake offsets from `effects.ts` and draws drop shadows under objects using `SHADOW_OFFSET` and `SHADOW_ALPHA`.

### Background & Atmosphere

- **Aurora shimmer** — three animated radial gradients drawn with `screen` blend mode across the upper sky area. Hue cycles between cyan (`#73eff7`) and medium blue (`#3b5dc9`) with a slow drift.
- **Star field** — 8 stars limited to the top 35% of the canvas. Stars have variable sizes (1px or 2px) and **twinkle** via a sinusoidal opacity modulation each frame.
- **Enhanced vignette** — two-layer post effect: an amber inner glow (`rgba(239,125,87,…)`) at the gameplay center that breathes at 0.4 Hz, plus a dark radial outer shadow that softens edges.

### Ambient Lane Particles

Each visible lane gets low-opacity ambient particles drawn before obstacles:

| Lane Type | Effect |
|---|---|
| `grass` | 6 drifting dust motes (1×1px, `#a7f070`, alpha 6–10%) |
| `road` | Horizontal heat shimmer streaks (`#566c86`, alpha 4–6%) |
| `water` | 3 rising bubble dots (`#73eff7`, alpha up to 12%) |
| `railroad` | Occasional 2×1px spark (`#ffff00`, alpha ≤ 50%) |

### Water Reflections

Water lanes render scrolling reflection strips using `lighter` composite blending. Four strips per lane shift with the flow direction and pulse in opacity (3.5–5.5% alpha).

### Player Animation

- **Squash & stretch** — during a hop, the lobster sprite is scaled via `ctx.save/translate/scale/restore`:
  - Anticipation (0–15% of hop): squash wide (+20% X, -15% Y)
  - Peak stretch (15–70%): elongate vertical (-12% X, +18% Y)
  - Landing squash (70–100%): flatten (+15% X, -12% Y)
- **Idle breathing** — when idle, a gentle sinusoidal scale pulse (±2.5% Y, ±1.25% X) runs at 1.8 Hz.
- **Eye blink cycle** — when facing down and idle, the sprite switches to `LOBSTER_DOWN_BLINK` for 0.1s every 3.5s.

### Car Variants

Road obstacles select a sprite variant by `obstacle.id % 3`:
- Variant 0: `car_blue` / `car_blue_flip`
- Variant 1: `car_yellow` / `car_yellow_flip`
- Variant 2 (default): `car` / `car_flip`

### Log Riding Effects

- **Bob animation** — coins on logs have a gentle vertical oscillation (±1.5px at 2.5 Hz).
- **Coin wake particles** — coins on logs emit trailing particle effects on movement.

## Input (`src/lib/game/input.ts`)

- **Keyboard**: Arrow keys, WASD for movement; Esc/P for pause
- **Touch**: Swipe gestures (30px threshold); tap = move up

Input is buffered into `state.actionQueue` and processed once per tick.

## Audio (`src/lib/game/audio.ts`)

Web Audio API with **procedurally generated sounds** — no audio files. Sounds include hop, death, level-up, score milestone. Mute state persisted in `localStorage` key `adventure_muted`.

## React Integration (`src/components/adventure/GameCanvas.tsx`)

- Creates `GameState` via `createInitialState()`
- Runs `requestAnimationFrame` loop calling `tick()`
- Sets up input handlers
- Passes `GameCallbacks` for React state updates
- Manages canvas resize and responsive scaling

## Leaderboard

`src/actions/game-scores.ts` — score submission and leaderboard queries.

`game_scores` table has a `game_type` column to support multiple arcade games.

After game over, `GameCanvas` submits the score. The leaderboard panel (`src/components/adventure/LeaderboardPanel.tsx`) displays top scores.

## Adventure UI Components (`src/components/adventure/`)

| Component | Description |
|---|---|
| `AdventureShell.tsx` | Main layout wrapper |
| `GameCanvas.tsx` | Canvas + game loop |
| `CRTOverlay.tsx` | CRT scanline visual overlay |
| `ControlsPanel.tsx` | On-screen controls display |
| `CurrentRunPanel.tsx` | Current score, level, death cause |
| `GameInfoPanel.tsx` | Game info sidebar |
| `LeaderboardPanel.tsx` | Top scores from database |
| `RecentScoresPanel.tsx` | Player's recent scores |
| `RetroPanel.tsx` | Retro-styled side panel |
| `StatsPanel.tsx` | Player stats display |
| `welcome-banner.tsx` | First-time welcome message |

## Related Files

- `src/lib/game/` — All engine files (engine, renderer, input, audio, coins, effects, achievement-tracker, achievements, types, constants)
- `src/components/adventure/` — React integration
- `src/app/(adventure)/adventure/page.tsx` — Page route
- `src/actions/game-scores.ts` — Leaderboard server actions
- `supabase/migrations/008_create_game_scores.sql` — Schema
- `supabase/migrations/011_add_game_type.sql` — game_type column
- `supabase/migrations/012_add_coins_to_scores.sql` — coins_collected column

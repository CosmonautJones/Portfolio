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
  achievement-tracker.ts   # In-game achievement checks
  achievements.ts     # In-game achievement definitions
  effects.ts          # Visual effect helpers
  sprites/
    palette.ts        # Color palette (indexed)
    lobster.ts        # Player (lobster) sprite data
    obstacles.ts      # Car, truck, train, log sprite data
    tiles.ts          # Terrain tile sprite data
```

## Game Types (`src/lib/game/types.ts`)

### Core Types

| Type | Values |
|---|---|
| `LaneType` | `"grass" \| "road" \| "water" \| "railroad"` |
| `ObstacleType` | `"car" \| "truck" \| "train" \| "log"` |
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
- **Death**: 8–12 particles, color by death cause
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

## In-Game Level System

Separate from the visitor XP system. 6 levels, defined by `LEVEL_THRESHOLDS` in `constants.ts`. `getLevelForScore(score)` returns 1–6. Level-ups trigger `callbacks.onLevelUp(level)` and increase difficulty.

## Renderer (`src/lib/game/renderer.ts`)

Canvas 2D renderer with a `SpriteCache` backed by `OffscreenCanvas`. Palette-indexed pixel sprites are pre-rendered once to `OffscreenCanvas` instances for performance.

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

- `src/lib/game/` — All engine files
- `src/components/adventure/` — React integration
- `src/app/(adventure)/adventure/page.tsx` — Page route
- `src/actions/game-scores.ts` — Leaderboard server actions
- `supabase/migrations/008_create_game_scores.sql` — Schema
- `supabase/migrations/011_add_game_type.sql` — game_type column

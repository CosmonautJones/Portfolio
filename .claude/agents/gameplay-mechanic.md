---
name: gameplay-mechanic
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Edit
  - Write
  - SendMessage
  - TaskGet
  - TaskUpdate
  - TaskList
---

# Gameplay Mechanic — New Features Engineer

You implement new gameplay mechanics for ClaudeBot's Adventure. Your code lives in the pure TypeScript engine layer — no React imports allowed.

## Features to Build

### 1. Power-Up System

**New file:** `src/lib/game/power-ups.ts`

**Power-up types:**

| Power-Up | Effect | Duration | Spawn Rate |
|---|---|---|---|
| Shield | Absorbs one hit (any death cause) | Until hit | Rare (2% per grass lane) |
| Speed Boost | 1.5x hop speed, shorter hop duration | 5 seconds | Uncommon (4%) |
| Magnet | Attracts coins within 3-cell radius | 8 seconds | Uncommon (3%) |
| Slow-Mo | 0.6x obstacle speed | 6 seconds | Rare (2%) |

**Implementation:**
- Add `PowerUp` type to `src/lib/game/types.ts`: `{ type, gridX, gridY, laneIndex }`
- Add `ActivePowerUp` type: `{ type, remainingTime, startTime }`
- Add `powerUps: PowerUp[]` and `activePowerUps: ActivePowerUp[]` to `GameState`
- Spawn power-ups on grass lanes (similar to coin spawning pattern in `coins.ts`)
- Collection: distance-based pickup (same as coins, 0.75 cell radius)
- Activation: immediately on pickup, one active per type, new pickup replaces existing
- Timer: decrement `remainingTime` each tick, remove when expired
- Effects: modify relevant engine parameters during active duration
  - Shield: skip the first `killPlayer` call, then consume
  - Speed: multiply hop duration by 0.67
  - Magnet: in coin update, move coins toward player if within radius
  - Slow-Mo: multiply obstacle speed by 0.6

**Visual indicators (for visual-polish agent):**
- Each power-up needs a sprite (add to `src/lib/game/sprites/`)
- Active power-up shown as icon + timer bar in HUD
- Shield: glowing outline around player
- Speed: motion trail particles behind player
- Magnet: subtle pull lines toward nearby coins
- Slow-Mo: slight blue tint overlay

### 2. Boss Lanes

**New file:** `src/lib/game/boss-lanes.ts`

Special high-difficulty lane sequences that appear at level milestones (levels 2, 4, 6).

**Boss lane patterns:**
- **Gauntlet** (level 2): 3 consecutive road lanes with maximum obstacles, tighter gaps
- **Rapids** (level 4): 3 water lanes with fast, short logs and no coins
- **Train Yard** (level 6): 2 railroad lanes back-to-back with staggered timing

**Implementation:**
- Add `BossLane` type to types.ts with `pattern` and `lanes` fields
- Hook into lane generation (`lanes.ts`): when player's score crosses a level threshold, inject the boss pattern instead of random generation
- Boss lanes have a visual warning: 2 grass "buffer" lanes before with warning decorations
- After surviving a boss section, award bonus XP and show "BOSS CLEARED!" text
- Each boss pattern appears only once per run

### 3. Weather Effects

**New file:** `src/lib/game/weather.ts`

Dynamic weather that changes gameplay feel at higher difficulty levels.

**Weather types:**

| Weather | Visual | Gameplay Effect | Trigger |
|---|---|---|---|
| Clear | Default | None | Score 0-49 |
| Rain | Falling particles, puddle splashes | Player slides 0.5 cells on hop (ice physics) | Score 50-99 |
| Fog | Reduced visibility (fade distant lanes) | Only 4 lanes visible ahead (vs default 8) | Score 100-149 |
| Wind | Horizontal particle streaks | Player drifts 0.3 cells left/right per tick | Score 150+ |

**Implementation:**
- Add `Weather` type to types.ts: `{ type, intensity, windDirection }`
- Add `weather: Weather` to `GameState`
- Update weather based on score thresholds in the tick loop
- Rain: add slide offset after hop completes (modify player.ts hop logic)
- Fog: pass visibility range to renderer (renderer reads `state.weather`)
- Wind: apply horizontal drift to player position each tick
- Transition smoothly between weather states (lerp intensity over 2 seconds)

### 4. Unlockable Characters/Skins

**New file:** `src/lib/game/skins.ts`

Characters earned through achievements or XP milestones.

**Skins:**

| Skin | Unlock Condition | Visual |
|---|---|---|
| Lobster (default) | Always available | Red lobster (current) |
| Golden Lobster | Score 200+ | Gold palette swap |
| Ghost Lobster | Die 50 times total | Translucent white |
| Diamond Lobster | Collect 100 total diamonds | Blue sparkle |
| Rainbow Lobster | Unlock all game achievements | Cycling rainbow palette |

**Implementation:**
- Add `Skin` type to types.ts: `{ id, name, unlockCondition, palette }`
- Define skins with palette index overrides (remap lobster sprite colors)
- Store selected skin in localStorage (`adventure_skin`)
- Store unlocked skins in the profile (extend achievements or add discovery)
- Skin selector on the game menu screen
- Each skin uses the same sprite data but with remapped palette indices

## Key Files to Read

| File | Why |
|---|---|
| `src/lib/game/engine.ts` (or refactored `tick.ts`) | Main game loop to integrate with |
| `src/lib/game/coins.ts` | Pattern for spawning/collecting pickups (follow this for power-ups) |
| `src/lib/game/types.ts` | Add all new types here |
| `src/lib/game/constants.ts` | Add all new constants here |
| `src/lib/game/lanes.ts` (or refactored) | Lane generation to hook boss lanes into |
| `src/lib/game/sprites/palette.ts` | Palette system for skin color remapping |
| `src/lib/game/sprites/lobster.ts` | Player sprite data |

## Architecture Rules

1. **Pure TypeScript only** — NO React imports in any file under `src/lib/game/`
2. **All types in `types.ts`** — don't define types inline
3. **All constants in `constants.ts`** — no magic numbers
4. **Follow the coins.ts pattern** — it's the best example of an extracted gameplay module
5. **Functions take state, return state** — pure functions, side effects only via callbacks
6. **Max 400 LOC per file, 80 lines per function**
7. **Run `npm test` after every change**

## After Completion

1. Mark tasks as completed
2. Send message to `visual-polish` with the render data shapes for each new feature
3. Send message to `game-balance` requesting difficulty tuning for new features
4. Send message to `game-qa` requesting test coverage

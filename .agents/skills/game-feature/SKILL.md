---
name: game-feature
description: Build a new game feature end-to-end for ClaudeBot's Adventure (Frogger-style pixel art arcade game) — from design through implementation, testing, and shipping
argument-hint: <feature description>
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, AskUserQuestion, Agent
---

# Game Feature Workflow

Build a new game feature end-to-end for ClaudeBot's Adventure: concept design, pixel art creation, code implementation, testing, and shipping.

**Feature request:** $ARGUMENTS

## Game Architecture Reference

Before starting, read the relevant source files to understand the current state of the game:

| File | Purpose |
|------|---------|
| `src/lib/game/types.ts` | All game types (GameState, Player, Obstacle, Lane, Particle, etc.) |
| `src/lib/game/constants.ts` | Config values, speed ranges, difficulty scaling, level thresholds |
| `src/lib/game/engine.ts` | Pure game logic (tick-based, fixed timestep) — NO DOM/React here |
| `src/lib/game/renderer.ts` | Canvas 2D rendering (sprites, particles, effects, HUD) |
| `src/lib/game/effects.ts` | Screen shake, particle emitters, visual juice |
| `src/lib/game/audio.ts` | Web Audio API synthesized sounds (no asset files) |
| `src/lib/game/input.ts` | Keyboard + touch/swipe input handling |
| `src/lib/game/sprites/palette.ts` | 32-color palette (PICO-8 inspired + custom colors) |
| `src/lib/game/sprites/lobster.ts` | Player character sprite (lobster) + animation frames |
| `src/lib/game/sprites/obstacles.ts` | Obstacle sprites (car, truck, train, log) |
| `src/lib/game/sprites/tiles.ts` | Tile sprites (grass, road, water, railroad) |
| `src/lib/game/achievements.ts` | Achievement definitions |
| `src/lib/game/achievement-tracker.ts` | Achievement unlock logic |
| `src/components/adventure/GameCanvas.tsx` | React wrapper that wires engine + renderer + audio |
| `src/lib/game/__tests__/*.test.ts` | Existing test suite |

## Design Principles

Encode these into every decision:

1. **Game feel ("juice") matters** — screen shake, particles, sound, animation on every meaningful event
2. **Difficulty scales with levels** — levels 1-6+ controlled by `LEVEL_THRESHOLDS` and `DIFFICULTY` in constants
3. **Engine stays pure** — no DOM, no React, no side effects in `src/lib/game/engine.ts`. Only pure logic with `GameState` in, `GameState` out
4. **Pixel art uses the existing palette** — 32 indexed colors in `palette.ts` (index 0 = transparent). Sprites are `number[][]` arrays
5. **Arcade aesthetic** — short sessions, high replayability, score-chasing. Think classic Frogger/Crossy Road
6. **Small and polished beats large and unfinished** — scope ruthlessly. One well-tuned mechanic is better than three half-baked ones

---

## Phase 1: Game Design

Research and brainstorm the feature before writing any code.

### Steps

1. **Read the existing codebase** — Read all files in the architecture table above to understand the current game state. Pay attention to `types.ts`, `engine.ts`, and `constants.ts` to understand the data model and game loop.

2. **Analyze the feature request** in context of existing mechanics:
   - How does it interact with the lane system (grass/road/water/railroad)?
   - Does it introduce new entity types, or extend existing ones?
   - How does it affect difficulty scaling across levels?
   - What happens on collision/interaction?
   - Does it need new input handling?

3. **Research inspiration** — Think about how similar mechanics work in classic arcade games (Frogger, Crossy Road, Pac-Man, Space Invaders). What makes them feel good?

4. **Consider game feel** — For every mechanic, plan the "juice":
   - What particles spawn? (shape, color, count, velocity, lifetime)
   - What sound plays? (Web Audio synthesis parameters)
   - Screen shake? (intensity, duration)
   - Animation? (sprite frames, hop arcs, flashes)

5. **Write a concise design document** covering:
   - **What**: One-paragraph description of the feature
   - **Why**: How it improves the game (variety, challenge, reward, visual interest)
   - **Mechanics**: Detailed behavior rules (spawn conditions, movement, collision, scoring)
   - **Difficulty scaling**: How the feature changes across levels 1-6+
   - **Interactions**: How it affects existing systems (player, obstacles, scoring, achievements)
   - **New types/data**: Any additions to `types.ts` or `constants.ts`
   - **Scope check**: Is this achievable as a single, polished feature? If too large, propose a smaller v1

6. **Present the design to the user** using `AskUserQuestion` and wait for approval before proceeding. Include the full design document in the question. Do NOT proceed to Phase 2 until the user explicitly approves.

---

## Phase 2: Art Design

Design pixel art sprites for the feature.

### Sprite Rules

- Sprites are `number[][]` arrays (type `SpritePixels` from `types.ts`)
- Each number is a palette index from `palette.ts` (0 = transparent)
- Standard grid: 16x16 for single-cell entities, 32x16 for cars, 48x16 for trucks
- Obstacles face RIGHT by default; the renderer flips for left-flowing lanes
- Use the existing palette colors — do NOT add new palette entries unless absolutely necessary
- Include animation frames if the feature requires them (idle, active, death states)

### Steps

1. **Design each needed sprite** as a `number[][]` array with a comment header explaining:
   - What it represents
   - Which palette indices are used and why
   - Dimensions

2. **Present sprites to the user** using `AskUserQuestion`. Display them in a code block with the palette color names annotated. Ask for approval before proceeding.

3. If the feature needs animation, design multiple frames and explain the animation cycle.

---

## Phase 3: Implementation

Implement the feature following the engine/renderer separation pattern.

### Implementation Order

1. **Types first** (`src/lib/game/types.ts`)
   - Add any new types, interfaces, or extend existing ones (new ObstacleType, new fields on GameState, etc.)

2. **Constants** (`src/lib/game/constants.ts`)
   - Add speed ranges, spawn rates, difficulty parameters, thresholds

3. **Sprites** (`src/lib/game/sprites/`)
   - Add sprite data to the appropriate file, or create a new sprite file if the feature introduces a major new entity category
   - Export sprites and register them in the renderer

4. **Engine logic** (`src/lib/game/engine.ts`)
   - Implement pure game logic: spawning, movement, collision detection, scoring
   - Remember: NO DOM, NO canvas, NO React. Only pure functions operating on GameState
   - Follow existing patterns for obstacle spawning and lane generation

5. **Renderer** (`src/lib/game/renderer.ts`)
   - Add rendering code for new sprites/entities
   - Wire up any new visual effects (flashes, overlays, indicators)

6. **Effects** (`src/lib/game/effects.ts`)
   - Add particle emitters for new events
   - Add screen shake triggers if appropriate

7. **Audio** (`src/lib/game/audio.ts`)
   - Add synthesized sound effects using Web Audio API
   - Keep sounds short and punchy (arcade-style)
   - Follow the existing pattern of oscillator + gain envelope

8. **Achievements** (`src/lib/game/achievements.ts` + `achievement-tracker.ts`)
   - Add any achievements related to the new feature
   - Wire up unlock conditions in the tracker

9. **GameCanvas wiring** (`src/components/adventure/GameCanvas.tsx`)
   - Connect new audio triggers
   - Wire up any new callbacks
   - Only thin glue code here — logic stays in the engine

---

## Phase 4: Testing and Polish

### Steps

1. **Write unit tests** for new engine logic in `src/lib/game/__tests__/`:
   - Test spawning behavior
   - Test collision detection
   - Test scoring changes
   - Test difficulty scaling across levels
   - Test edge cases (off-screen, boundary conditions)
   - Follow the patterns in existing test files

2. **Run existing tests** to ensure no regressions:
   ```
   npx vitest run src/lib/game/__tests__/
   ```

3. **Run the full test suite**:
   ```
   npm run test
   ```

4. **Run lint**:
   ```
   npm run lint
   ```

5. **Run build** to catch type errors:
   ```
   npm run build
   ```

6. **Fix any failures** before proceeding.

---

## Phase 5: Ship

1. **Stage all changes**:
   ```
   git add -A
   ```

2. **Commit with a descriptive message** following the pattern:
   ```
   feat: add <concise feature description> to adventure game
   ```

3. **Push to main**:
   ```
   git push origin main
   ```

---

## Workflow Diagram

```text
Phase 1: DESIGN          Phase 2: ART           Phase 3: IMPLEMENT
+-----------------+      +---------------+      +------------------+
| Read codebase   |      | Design sprites|      | types.ts         |
| Analyze request |----->| (number[][])  |----->| constants.ts     |
| Research arcade |      | Show to user  |      | sprites/*.ts     |
| Plan game feel  |      | Get approval  |      | engine.ts        |
| Write design doc|      +---------------+      | renderer.ts      |
| Get user OK     |                             | effects.ts       |
+-----------------+                             | audio.ts         |
       |                                        | achievements.ts  |
       | User must approve                      | GameCanvas.tsx   |
       | before proceeding                      +------------------+
                                                        |
                                                        v
                                Phase 4: TEST & POLISH          Phase 5: SHIP
                                +---------------------+      +---------------+
                                | Write unit tests    |      | git add -A    |
                                | Run game tests      |----->| git commit    |
                                | Run full suite      |      | git push main |
                                | Run lint + build    |      +---------------+
                                | Fix failures        |
                                +---------------------+
```

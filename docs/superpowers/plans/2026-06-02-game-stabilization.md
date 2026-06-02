# Game Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize ClaudeBot's Adventure by unifying its two renderers (WebGL2 + Three.js) behind one `GameRenderer` interface that consumes a single pure `RenderScene` view-model with centralized camera math, fixing the 3D path's SSR/build error and isometric projection, cleaning the repo, and getting `test`/`build`/`lint` to green.

**Architecture:** Introduce a pure `buildScene(state) → RenderScene` layer (formalizing the existing `RenderState`) plus a `camera-projection` module. Both `WebGLRenderer` and `ThreeRenderer` implement a shared `GameRenderer` interface (`resize`/`render(scene, alpha)`/`setStyle`/`resetState`/`destroy`) and consume `RenderScene` only — neither touches raw `GameState`. The game loop dispatches to whichever renderer is active through that one interface.

**Tech Stack:** TypeScript, Next.js 15 App Router, WebGL2, Three.js, Vitest, React.

---

## Spec reference

Design: `docs/superpowers/specs/2026-06-02-game-stabilization-design.md`

## Execution model (multi-agent)

This plan is executed by the agent team, not solo. Recommended binding:

- **Phase 0** (cleanup + diagnosis + baseline) — `engineer` + a diagnostic pass (`/diagnose` or general-purpose). Tasks 1–4 are independent and may run in parallel.
- **Phase 1** (scene + camera-projection + interface) — `game-architect`, sequential (Tasks 5–8).
- **Phase 2** (renderer porting + loop unify + 3D fix) — sequential, single-threaded; files are interdependent (Tasks 9–14).
- **Phase 3** (QA sweep + smoke + playtest + plan-file regen) — `game-qa`, `game-smoke-tester`, `game-playtester` in parallel (Tasks 15–18).
- **Gate:** all green → final commit & push to `main` (Task 19).

## Current-state facts (verified, for the implementer)

- WebGL2 renderer: `src/lib/game/renderer/renderer.ts`, class `GameRenderer`. Granular API:
  `beginFrame()`, `renderBackground(t)`, `setShakeOffset(x,y)`, `renderLanes(state: GameState)`,
  `renderAmbientEffects(_state)`, `renderCoins(_state)`, `renderPlayer(_state)`,
  `renderParticles(particles, cameraY)`, `clearShakeOffset()`, `endFrame(t)`, `resetState()`,
  `setSpriteStyle(style)`, `destroy()`. (Note: `renderCoins`/`renderPlayer`/`renderAmbientEffects`
  ignore their arg — state is held by the pass graph.)
- 3D renderer: `src/lib/game/renderer/three-renderer.ts`, class `ThreeRenderer`. API:
  `render(state: RenderState)`, `resize(w,h)`, `destroy()`, private `camera: THREE.OrthographicCamera`.
- Existing partial view-model: `RenderState` in `src/lib/game/renderer/render-pass.ts`.
- The loop already builds `RenderState` inline: `src/hooks/use-game-engine.ts:428-441`, and branches
  between renderers at `:419-471`.
- 2D camera: `src/lib/game/camera.ts` (`updateCamera` smooth-follows player Y).
- Barrel: `src/lib/game/renderer.ts` re-exports `GameRenderer`, `SpriteCache`.
- Public renderer API: `src/lib/game/renderer/index.ts`.

---

# Phase 0 — Cleanup, diagnosis, baseline

### Task 1: Remove stale agent worktrees

**Files:**
- Delete: `.claude/worktrees/agent-a1371bf8/` … `.claude/worktrees/agent-af16f396/` (8 dirs)

- [ ] **Step 1: Confirm they are not registered git worktrees**

Run: `git worktree list`
Expected: only the main checkout listed (the `.claude/worktrees/*` dirs are stale copies, not active worktrees). If any ARE listed, run `git worktree remove <path>` for each instead of deleting.

- [ ] **Step 2: Delete the stale directories**

```bash
rm -rf .claude/worktrees/agent-a1371bf8 .claude/worktrees/agent-a271aa28 .claude/worktrees/agent-a331b813 .claude/worktrees/agent-a86e0452 .claude/worktrees/agent-a8e1073e .claude/worktrees/agent-ac973c44 .claude/worktrees/agent-adbb5d72 .claude/worktrees/agent-af16f396
```

- [ ] **Step 3: Verify `.gitignore` already excludes worktrees**

Run: `git check-ignore .claude/worktrees/agent-x` (a prior commit added worktrees to `.gitignore`).
Expected: prints the path (ignored). If it prints nothing, add `.claude/worktrees/` to `.gitignore`.

- [ ] **Step 4: Commit**

```bash
git add -A .claude/worktrees .gitignore
git commit -m "chore: remove stale agent worktrees"
```

### Task 2: Remove stray root screenshots

**Files:**
- Delete: `3d-1-pixel.png`, `3d-2-threejs-menu.png`, `3d-3-threejs-play.png`, `3d-4-threejs-deep.png`, `final-1-pixel.png`, `final-2-3d-menu.png`, `final-3-3d-play.png`

- [ ] **Step 1: Delete the screenshots**

```bash
git rm --ignore-unmatch 3d-1-pixel.png 3d-2-threejs-menu.png 3d-3-threejs-play.png 3d-4-threejs-deep.png final-1-pixel.png final-2-3d-menu.png final-3-3d-play.png
rm -f 3d-*.png final-*.png
```

- [ ] **Step 2: Add a guard to `.gitignore`**

Append to `.gitignore`:
```
# stray debug screenshots
/3d-*.png
/final-*.png
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove stray debug screenshots"
```

### Task 3: Capture the baseline (test/build/lint)

**Files:**
- Create: `docs/superpowers/plans/baseline-2026-06-02.md`

- [ ] **Step 1: Run each gate and record raw output**

```bash
npm test 2>&1 | tail -40
npm run build 2>&1 | tail -40
npm run lint 2>&1 | tail -40
```

- [ ] **Step 2: Write the results to the baseline file**

Record, for each command: pass/fail, failure count, and the first failing message. This is the "before" snapshot so Phase 3 can prove green. Example structure:

```markdown
# Stabilization baseline — 2026-06-02
## npm test
<pass/fail, N passed / M failed, first failure>
## npm run build
<pass/fail, first error>
## npm run lint
<pass/fail, N problems>
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/baseline-2026-06-02.md
git commit -m "docs: capture stabilization baseline"
```

### Task 4: Diagnose the Three.js / Turbopack SSR error

**Files:**
- Read: `src/hooks/use-three-renderer.ts`, `src/lib/game/renderer/three-renderer.ts`, `next.config.*`
- Create: `docs/superpowers/plans/3d-ssr-diagnosis.md`

The observed error was `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'` referencing
`pages/_document.js` — anomalous because this is an App Router app, so something pulls in the Pages runtime.

- [ ] **Step 1: Reproduce**

Run: `npm run build 2>&1 | tail -60` and `npm run dev` then load `/adventure` and toggle voxel/3D mode. Record the exact error and stack.

- [ ] **Step 2: Trace the import chain**

Run: `npx grep -rn "from \"three\"\|from 'three'\|import(\"three\")" src` (or use the Grep tool). Confirm whether `three` is imported at module top-level anywhere reachable from a Server Component / layout (top-level `three` import in a non-`"use client"` module is the prime suspect for the SSR runtime pull).

Run: `npx grep -rn "_document\|pages/" src` to confirm no stray Pages-router file exists.

- [ ] **Step 3: Record root cause + chosen fix**

Write `docs/superpowers/plans/3d-ssr-diagnosis.md` with: the exact error, the offending import chain, and the chosen fix. The fix is one of (decide from evidence, do not guess blind):
- (a) Ensure `ThreeRenderer` and any `three` import live only in `"use client"` modules dynamically imported (`next/dynamic` with `{ ssr: false }` for the wrapper, or `await import("three")` inside a client effect).
- (b) Remove an accidental top-level `three` import from a shared module.

This task is diagnosis only — the fix is applied in Task 13. Output is the written diagnosis.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/3d-ssr-diagnosis.md
git commit -m "docs: diagnose 3D SSR/Turbopack runtime error"
```

---

# Phase 1 — Scene view-model, camera projection, renderer interface

### Task 5: Define `RenderScene` (formalize + extend `RenderState`)

**Files:**
- Create: `src/lib/game/scene/types.ts`
- Test: `src/lib/game/scene/__tests__/types.test.ts`

`RenderScene` supersedes `RenderState`. It is the only thing renderers consume. It adds the
shake offset and weather (both renderers should honor them) and an explicit `alpha` is passed
separately to `render`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/game/scene/__tests__/types.test.ts
import { describe, it, expect } from "vitest";
import type { RenderScene } from "../types";

describe("RenderScene", () => {
  it("is structurally assignable from a minimal scene literal", () => {
    const scene: RenderScene = {
      phase: "playing",
      player: {} as RenderScene["player"],
      lanes: [],
      camera: { y: 0, targetY: 0, viewportWidth: 416, viewportHeight: 640 },
      particles: [],
      coins: [],
      powerUps: [],
      weather: { type: "clear", intensity: 0, windDirection: 1 },
      animationTime: 0,
      score: 0,
      level: 1,
      deathCause: null,
      deathProgress: 0,
      deathPosition: null,
      shake: { x: 0, y: 0 },
    };
    expect(scene.camera.viewportHeight).toBe(640);
    expect(scene.shake.x).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/game/scene/__tests__/types.test.ts`
Expected: FAIL — cannot find module `../types`.

- [ ] **Step 3: Create the type**

```typescript
// src/lib/game/scene/types.ts
import type { GameState, Particle } from "../types";

/**
 * Render-agnostic scene description. The single contract both renderers
 * (WebGL2 + Three.js) consume. Pure data — no GL, no canvas, no Three.
 * Supersedes the legacy `RenderState` in renderer/render-pass.ts.
 */
export interface RenderScene {
  phase: GameState["phase"];
  player: GameState["player"];
  lanes: GameState["lanes"];
  camera: GameState["camera"];
  particles: readonly Particle[];
  coins: GameState["coins"];
  powerUps: GameState["powerUps"];
  weather: GameState["weather"];
  animationTime: number;
  score: number;
  level: number;
  deathCause: GameState["deathCause"];
  /** 0→1 progress through death animation (0 = alive, >0 = dying) */
  deathProgress: number;
  /** World position where death occurred */
  deathPosition: { x: number; y: number } | null;
  /** Screen-space camera shake offset, in CSS pixels */
  shake: { x: number; y: number };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/game/scene/__tests__/types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/scene/types.ts src/lib/game/scene/__tests__/types.test.ts
git commit -m "feat(scene): add RenderScene view-model type"
```

### Task 6: Implement `buildScene(state, opts)`

**Files:**
- Create: `src/lib/game/scene/build-scene.ts`
- Test: `src/lib/game/scene/__tests__/build-scene.test.ts`

This formalizes the inline `RenderState` construction at `use-game-engine.ts:428-441`,
adding shake + weather + powerUps. Pure function, fully unit-testable without a canvas.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/game/scene/__tests__/build-scene.test.ts
import { describe, it, expect } from "vitest";
import { buildScene } from "../build-scene";
import { createInitialState } from "../../engine";
import { DEFAULT_CONFIG } from "../../constants";

describe("buildScene", () => {
  it("copies core fields from game state", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.score = 42;
    state.level = 3;
    const scene = buildScene(state, { shake: { x: 2, y: -1 } });
    expect(scene.score).toBe(42);
    expect(scene.level).toBe(3);
    expect(scene.shake).toEqual({ x: 2, y: -1 });
    expect(scene.camera).toBe(state.camera);
    expect(scene.weather).toBe(state.weather);
  });

  it("computes deathProgress only when dying", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    const alive = buildScene(state, { shake: { x: 0, y: 0 } });
    expect(alive.deathProgress).toBe(0);
    expect(alive.deathPosition).toBeNull();

    state.phase = "game_over";
    state.deathCause = "vehicle";
    state.dyingTimer = 250;
    state.dyingDuration = 500;
    const dying = buildScene(state, { shake: { x: 0, y: 0 } });
    expect(dying.deathProgress).toBeCloseTo(0.5);
    expect(dying.deathPosition).toEqual({
      x: state.player.worldPos.x,
      y: state.player.worldPos.y,
    });
  });

  it("defaults shake to zero when omitted", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    const scene = buildScene(state);
    expect(scene.shake).toEqual({ x: 0, y: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/game/scene/__tests__/build-scene.test.ts`
Expected: FAIL — cannot find module `../build-scene`.

- [ ] **Step 3: Implement**

```typescript
// src/lib/game/scene/build-scene.ts
import type { GameState } from "../types";
import type { RenderScene } from "./types";

export interface BuildSceneOptions {
  /** Screen-space camera shake offset, in CSS pixels. Defaults to {x:0,y:0}. */
  shake?: { x: number; y: number };
}

/**
 * Pure conversion of GameState → RenderScene. No canvas / GL / Three access.
 * This is the single source of presentation data for both renderers.
 */
export function buildScene(
  state: GameState,
  opts: BuildSceneOptions = {},
): RenderScene {
  let deathProgress = 0;
  let deathPosition: { x: number; y: number } | null = null;
  if (state.phase === "game_over" && state.deathCause !== null) {
    deathProgress = Math.min(1, state.dyingTimer / state.dyingDuration);
    deathPosition = { x: state.player.worldPos.x, y: state.player.worldPos.y };
  }

  return {
    phase: state.phase,
    player: state.player,
    lanes: state.lanes,
    camera: state.camera,
    particles: state.particles,
    coins: state.coins,
    powerUps: state.powerUps,
    weather: state.weather,
    animationTime: state.animationTime,
    score: state.score,
    level: state.level,
    deathCause: state.deathCause,
    deathProgress,
    deathPosition,
    shake: opts.shake ?? { x: 0, y: 0 },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/game/scene/__tests__/build-scene.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/scene/build-scene.ts src/lib/game/scene/__tests__/build-scene.test.ts
git commit -m "feat(scene): add pure buildScene(state) converter"
```

### Task 7: Centralize camera projection

**Files:**
- Create: `src/lib/game/scene/camera-projection.ts`
- Test: `src/lib/game/scene/__tests__/camera-projection.test.ts`

One module owns world→screen math for both projections. The 2D path is the orthographic
top-down mapping the WebGL passes already use implicitly (`screenY = worldY - camera.y`).
The isometric path is the math the `ThreeRenderer` camera must follow. Centralizing it makes
camera behavior testable and stops the per-commit tweaking.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/game/scene/__tests__/camera-projection.test.ts
import { describe, it, expect } from "vitest";
import { projectTopDown, projectIsometric } from "../camera-projection";
import type { Camera } from "../../types";

const cam: Camera = { y: 100, targetY: 100, viewportWidth: 416, viewportHeight: 640 };

describe("projectTopDown", () => {
  it("maps world to screen by subtracting camera.y", () => {
    expect(projectTopDown({ x: 50, y: 300 }, cam)).toEqual({ x: 50, y: 200 });
  });
});

describe("projectIsometric", () => {
  it("is deterministic and centers X around the viewport", () => {
    const a = projectIsometric({ x: 208, y: 300 }, cam);
    const b = projectIsometric({ x: 208, y: 300 }, cam);
    expect(a).toEqual(b);
    // player column at viewport center maps near horizontal center
    expect(Math.abs(a.x - cam.viewportWidth / 2)).toBeLessThan(cam.viewportWidth / 2);
  });

  it("moves screen-up as world-forward increases", () => {
    const near = projectIsometric({ x: 208, y: 200 }, cam);
    const far = projectIsometric({ x: 208, y: 400 }, cam);
    expect(far.y).toBeLessThan(near.y);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/game/scene/__tests__/camera-projection.test.ts`
Expected: FAIL — cannot find module `../camera-projection`.

- [ ] **Step 3: Implement**

```typescript
// src/lib/game/scene/camera-projection.ts
import type { Camera, WorldPosition } from "../types";

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Orthographic top-down projection (the 2D / WebGL view). */
export function projectTopDown(world: WorldPosition, camera: Camera): ScreenPoint {
  return { x: world.x, y: world.y - camera.y };
}

/**
 * Isometric projection (the 3D / Three view). Shared, deterministic math so the
 * isometric camera is defined in ONE place. Tuned so forward world movement
 * (increasing y, toward the top of the play area after camera subtraction) moves
 * the point up the screen, with a fixed diamond ratio.
 */
const ISO_TILT = 0.5; // vertical compression of the iso diamond

export function projectIsometric(world: WorldPosition, camera: Camera): ScreenPoint {
  const relY = world.y - camera.y; // camera-relative forward axis
  const cx = camera.viewportWidth / 2;
  // X stays centered around the viewport; Y is compressed for the iso look.
  return {
    x: cx + (world.x - cx),
    y: relY * ISO_TILT,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/game/scene/__tests__/camera-projection.test.ts`
Expected: PASS (3 tests).

> Implementation note for Task 13: `projectIsometric` is the canonical iso mapping. The
> `ThreeRenderer` camera setup must be derived from these same constants (`ISO_TILT`,
> viewport-centered X) so the 3D view matches this tested contract instead of ad-hoc frustum
> numbers. If the visual tuning needs different constants, change them HERE and update the test —
> never re-tune inside the renderer.

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/scene/camera-projection.ts src/lib/game/scene/__tests__/camera-projection.test.ts
git commit -m "feat(scene): centralize world→screen camera projection"
```

### Task 8: Define the `GameRenderer` interface

**Files:**
- Create: `src/lib/game/renderer/game-renderer.ts`
- Test: `src/lib/game/renderer/__tests__/game-renderer.test.ts`
- Create barrel re-export in: `src/lib/game/scene/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/game/renderer/__tests__/game-renderer.test.ts
import { describe, it, expect } from "vitest";
import type { GameRenderer } from "../game-renderer";
import type { RenderScene } from "../../scene/types";

describe("GameRenderer interface", () => {
  it("can be implemented by a stub conforming to the contract", () => {
    const calls: string[] = [];
    const stub: GameRenderer = {
      resize: () => calls.push("resize"),
      render: (_scene: RenderScene, _alpha: number) => calls.push("render"),
      setStyle: () => calls.push("setStyle"),
      resetState: () => calls.push("resetState"),
      destroy: () => calls.push("destroy"),
    };
    stub.resize(416, 640);
    stub.render({} as RenderScene, 0);
    stub.setStyle("pixel");
    stub.resetState();
    stub.destroy();
    expect(calls).toEqual(["resize", "render", "setStyle", "resetState", "destroy"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/game/renderer/__tests__/game-renderer.test.ts`
Expected: FAIL — cannot find module `../game-renderer`.

- [ ] **Step 3: Implement the interface + scene barrel**

```typescript
// src/lib/game/renderer/game-renderer.ts
import type { RenderScene } from "../scene/types";
import type { SpriteStyle } from "../sprites/sprite-style";

/**
 * The single render contract. Both WebGLRenderer and ThreeRenderer implement it.
 * Implementations consume RenderScene only — never raw GameState.
 */
export interface GameRenderer {
  resize(width: number, height: number): void;
  render(scene: RenderScene, alpha: number): void;
  setStyle(style: SpriteStyle): void;
  /** Reset per-run renderer state (called on new game). */
  resetState(): void;
  destroy(): void;
}
```

```typescript
// src/lib/game/scene/index.ts
export type { RenderScene } from "./types";
export { buildScene, type BuildSceneOptions } from "./build-scene";
export {
  projectTopDown,
  projectIsometric,
  type ScreenPoint,
} from "./camera-projection";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/game/renderer/__tests__/game-renderer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/renderer/game-renderer.ts src/lib/game/renderer/__tests__/game-renderer.test.ts src/lib/game/scene/index.ts
git commit -m "feat(renderer): add shared GameRenderer interface"
```

---

# Phase 2 — Port renderers onto the interface, unify the loop, fix 3D

> These tasks touch interdependent files. Execute strictly in order, one at a time, running
> the FULL suite (`npm test`) after each implementation step, not just the focused test.

### Task 9: Add `render(scene, alpha)` to the WebGL renderer

**Files:**
- Modify: `src/lib/game/renderer/renderer.ts` (class `GameRenderer`)
- Test: `src/lib/game/renderer/__tests__/webgl-render-scene.test.ts`

The new method orchestrates the existing granular calls in the exact sequence the loop uses
today (`use-game-engine.ts:446-471`), driven by the scene. Keep the granular methods (other
code/tests use them); `render` is an additive orchestrator. The class thereby satisfies
`GameRenderer` (it already has `resize`? — if not, add a thin `resize` that updates viewport;
verify against the file). Add `setStyle` as an alias to `setSpriteStyle`.

- [ ] **Step 1: Write the failing test (spy-based, no real GL)**

```typescript
// src/lib/game/renderer/__tests__/webgl-render-scene.test.ts
import { describe, it, expect, vi } from "vitest";
import { GameRenderer } from "../renderer";
import type { RenderScene } from "../../scene/types";

function sceneStub(shake = { x: 0, y: 0 }): RenderScene {
  return {
    phase: "playing",
    player: { worldPos: { x: 0, y: 0 } } as RenderScene["player"],
    lanes: [],
    camera: { y: 0, targetY: 0, viewportWidth: 416, viewportHeight: 640 },
    particles: [],
    coins: [],
    powerUps: [],
    weather: { type: "clear", intensity: 0, windDirection: 1 },
    animationTime: 1.5,
    score: 0,
    level: 1,
    deathCause: null,
    deathProgress: 0,
    deathPosition: null,
    shake,
  };
}

describe("GameRenderer.render(scene)", () => {
  it("invokes the granular pipeline in order", () => {
    const r = Object.create(GameRenderer.prototype) as GameRenderer & Record<string, unknown>;
    const order: string[] = [];
    for (const m of [
      "beginFrame", "renderBackground", "renderLanes", "renderAmbientEffects",
      "renderCoins", "renderPlayer", "renderParticles", "endFrame",
      "setShakeOffset", "clearShakeOffset",
    ]) {
      (r as Record<string, unknown>)[m] = vi.fn(() => order.push(m));
    }
    (r as unknown as { render: (s: RenderScene, a: number) => void }).render(sceneStub(), 0);
    expect(order.indexOf("beginFrame")).toBeLessThan(order.indexOf("renderPlayer"));
    expect(order.indexOf("renderPlayer")).toBeLessThan(order.indexOf("endFrame"));
  });

  it("applies and clears shake when non-zero", () => {
    const r = Object.create(GameRenderer.prototype) as Record<string, unknown>;
    for (const m of [
      "beginFrame", "renderBackground", "renderLanes", "renderAmbientEffects",
      "renderCoins", "renderPlayer", "renderParticles", "endFrame",
      "setShakeOffset", "clearShakeOffset",
    ]) {
      r[m] = vi.fn();
    }
    (r as unknown as { render: (s: RenderScene, a: number) => void }).render(sceneStub({ x: 3, y: -2 }), 0);
    expect(r.setShakeOffset).toHaveBeenCalledWith(3, -2);
    expect(r.clearShakeOffset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/game/renderer/__tests__/webgl-render-scene.test.ts`
Expected: FAIL — `render` is not a function.

- [ ] **Step 3: Implement `render`, `setStyle`, and `resize` (if missing) on `GameRenderer`**

Add these methods to the `GameRenderer` class in `src/lib/game/renderer/renderer.ts`. Import the type at the top: `import type { RenderScene } from "../scene/types";`

```typescript
  /** Unified entry point — consumes a RenderScene (GameRenderer interface). */
  render(scene: RenderScene, _alpha: number): void {
    this.beginFrame();
    this.renderBackground(scene.animationTime);

    const { x, y } = scene.shake;
    const shaking = x !== 0 || y !== 0;
    if (shaking) this.setShakeOffset(Math.round(x), Math.round(y));

    this.renderLanes(scene as unknown as Parameters<GameRenderer["renderLanes"]>[0]);
    this.renderAmbientEffects(scene as unknown as Parameters<GameRenderer["renderAmbientEffects"]>[0]);
    this.renderCoins(scene as unknown as Parameters<GameRenderer["renderCoins"]>[0]);
    this.renderPlayer(scene as unknown as Parameters<GameRenderer["renderPlayer"]>[0]);
    this.renderParticles(scene.particles, scene.camera.y);

    if (shaking) this.clearShakeOffset();
    this.endFrame(scene.animationTime);
  }

  /** GameRenderer interface alias. */
  setStyle(style: SpriteStyle): void {
    this.setSpriteStyle(style);
  }
```

> Note: `renderLanes` currently typed `(state: GameState)` but only reads lane/camera/animation
> fields present on `RenderScene`. The cast bridges the structural gap without changing the
> granular methods. A follow-up (Task 11) narrows `renderLanes` to accept `RenderScene`.
> If `resize(width, height)` does not already exist on the class, add one that updates the
> viewport/canvas size the same way the constructor does (mirror the existing resize logic;
> if the WebGL renderer has no resize concept, add a no-op `resize() {}` to satisfy the interface
> and document why).

- [ ] **Step 4: Run the focused test, then the full suite**

Run: `npx vitest run src/lib/game/renderer/__tests__/webgl-render-scene.test.ts`
Expected: PASS (2 tests).
Run: `npm test`
Expected: no new failures vs. baseline.

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/renderer/renderer.ts src/lib/game/renderer/__tests__/webgl-render-scene.test.ts
git commit -m "feat(renderer): WebGL renderer consumes RenderScene via render()"
```

### Task 10: Adapt `ThreeRenderer` to the interface signature

**Files:**
- Modify: `src/lib/game/renderer/three-renderer.ts`
- Test: `src/lib/game/renderer/__tests__/three-renderer.test.ts` (existing — extend it)

`ThreeRenderer.render` currently takes `RenderState`. Change it to `render(scene: RenderScene, alpha: number)`
and add `setStyle`/`resetState` so it conforms to `GameRenderer`. `RenderScene` is a structural
superset of `RenderState`, so existing field reads keep working.

- [ ] **Step 1: Extend the existing test**

Add to `src/lib/game/renderer/__tests__/three-renderer.test.ts`:

```typescript
import type { GameRenderer } from "../game-renderer";
import { ThreeRenderer } from "../three-renderer";

it("conforms to the GameRenderer interface", () => {
  // Type-level conformance: assignment compiles only if the shape matches.
  const assertConforms = (_r: GameRenderer) => {};
  // Construct against a stub canvas guarded for jsdom (see existing test setup).
  const proto = ThreeRenderer.prototype as unknown as GameRenderer;
  expect(typeof proto.render).toBe("function");
  expect(typeof proto.resize).toBe("function");
  expect(typeof proto.setStyle).toBe("function");
  expect(typeof proto.resetState).toBe("function");
  expect(typeof proto.destroy).toBe("function");
  void assertConforms;
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/game/renderer/__tests__/three-renderer.test.ts`
Expected: FAIL — `setStyle`/`resetState` undefined on prototype.

- [ ] **Step 3: Update `ThreeRenderer`**

In `src/lib/game/renderer/three-renderer.ts`:
- Change the import from `RenderState` to `import type { RenderScene } from "../scene/types";` and update the method signature to `render(scene: RenderScene, _alpha: number): void {` (rename the param `state`→`scene` throughout the method body, or alias `const state = scene;` at the top to minimize churn).
- Add:

```typescript
  setStyle(_style: import("../sprites/sprite-style").SpriteStyle): void {
    // Three renderer is voxel-only; style switching is handled by canvas toggle.
  }

  resetState(): void {
    // No per-run GPU state to reset for the Three path yet.
  }
```

- [ ] **Step 4: Run focused test, then full suite**

Run: `npx vitest run src/lib/game/renderer/__tests__/three-renderer.test.ts`
Expected: PASS.
Run: `npm test`
Expected: no new failures.

- [ ] **Step 5: Commit**

```bash
git add src/lib/game/renderer/three-renderer.ts src/lib/game/renderer/__tests__/three-renderer.test.ts
git commit -m "feat(renderer): ThreeRenderer conforms to GameRenderer interface"
```

### Task 11: Narrow granular WebGL methods to `RenderScene`

**Files:**
- Modify: `src/lib/game/renderer/renderer.ts` (`renderLanes`, `renderAmbientEffects`, `renderCoins`, `renderPlayer` signatures)
- Modify: `src/hooks/use-game-engine.ts` (any direct granular calls — see Task 12)
- Test: existing `renderer.test.ts` must still pass

Remove the `as unknown as` casts introduced in Task 9 by changing the granular method param
types from `GameState` to `RenderScene` (they only read fields common to both).

- [ ] **Step 1: Change the signatures**

In `renderer.ts`, replace `state: GameState` with `scene: RenderScene` on `renderLanes`,
and `_state: GameState` with `_scene: RenderScene` on `renderAmbientEffects`/`renderCoins`/`renderPlayer`.
Update `renderLanes` body field accesses (they use `state.lanes`, `state.camera`, `state.animationTime` — all present on `RenderScene`).

- [ ] **Step 2: Remove the casts in `render()`**

Replace the cast calls from Task 9 with direct passes:

```typescript
    this.renderLanes(scene);
    this.renderAmbientEffects(scene);
    this.renderCoins(scene);
    this.renderPlayer(scene);
```

- [ ] **Step 3: Run the renderer tests + full suite**

Run: `npx vitest run src/lib/game/renderer/__tests__/renderer.test.ts`
Expected: PASS (update any call sites in that test that passed a full `GameState` — a `GameState` is still structurally assignable to `RenderScene` for these reads, so most will compile unchanged).
Run: `npm test`
Expected: no new failures.

- [ ] **Step 4: Commit**

```bash
git add src/lib/game/renderer/renderer.ts
git commit -m "refactor(renderer): granular WebGL methods accept RenderScene"
```

### Task 12: Unify the game loop dispatch

**Files:**
- Modify: `src/hooks/use-game-engine.ts:418-471` (the per-frame render branch)

Replace the two divergent render paths with one: build the scene once, pick the active
renderer, call `render(scene, alpha)`.

- [ ] **Step 1: Replace the render block**

Replace the block from `// Three.js 3D renderer path` through the end of the WebGL `if (r && !tr)`
block (`use-game-engine.ts:418-471`) with:

```typescript
        // Unified render dispatch — one interface, one scene.
        const scene = buildScene(gameStateRef.current, {
          shake: { x: shake.offsetX, y: shake.offsetY },
        });
        const active: GameRenderer | null =
          (threeRendererRef?.current as GameRenderer | null) ??
          (rendererRef.current as GameRenderer | null);
        active?.render(scene, 0);
```

- [ ] **Step 2: Update imports at the top of the file**

Add: `import { buildScene } from "@/lib/game/scene";`
Add: `import type { GameRenderer } from "@/lib/game/renderer/game-renderer";`
Remove the now-unused `import type { RenderState } from "@/lib/game/renderer/render-pass";` (only if no longer referenced).

- [ ] **Step 3: Verify the loop condition still gates correctly**

The guard `if (gameStateRef.current && (r || threeRendererRef?.current))` stays. `r` is
`rendererRef.current`. Confirm the file compiles.

Run: `npm run build`
Expected: build succeeds (App Router compiles the adventure route).

- [ ] **Step 4: Run full suite + manual smoke**

Run: `npm test`
Expected: no new failures.
Run: `npm run dev`, open `/adventure`, play in 2D (pixel) mode.
Expected: game renders and plays exactly as before; screen shake still works on death.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-game-engine.ts
git commit -m "refactor(loop): unify render dispatch through GameRenderer"
```

### Task 13: Apply the 3D SSR fix + iso projection from the diagnosis

**Files:**
- Per `docs/superpowers/plans/3d-ssr-diagnosis.md` (Task 4): likely `src/hooks/use-three-renderer.ts`, `src/lib/game/renderer/three-renderer.ts`, and/or the adventure page/layout.
- Modify: `src/lib/game/renderer/three-renderer.ts` (camera setup → use `projectIsometric` constants)

- [ ] **Step 1: Apply the SSR fix chosen in Task 4**

Implement the fix recorded in the diagnosis doc. Most likely: ensure all `three` imports are
in `"use client"` modules and the renderer is only instantiated inside a client effect
(it already is, via `useThreeRenderer`), and that nothing imports `three` at the top level of a
server-reachable module. If a dynamic import is the fix, convert the static
`import { ThreeRenderer } from "@/lib/game/renderer/three-renderer"` in `use-three-renderer.ts`
to `const { ThreeRenderer } = await import("@/lib/game/renderer/three-renderer")` inside the
activation effect, storing the class in a ref.

- [ ] **Step 2: Derive the Three camera from the shared iso constants**

In `three-renderer.ts`, replace ad-hoc frustum/offset numbers in the camera setup with values
derived from `projectIsometric` semantics (import `ISO_TILT` by exporting it from
`camera-projection.ts`, or reproduce the vertical compression). The orthographic camera's
vertical extent and the lane-depth spacing must match `ISO_TILT` so the 3D view honors the
same tested projection. Add an export to `camera-projection.ts`:

```typescript
export const ISO_TILT = 0.5;
```
and change the local `const ISO_TILT` to use the exported one.

- [ ] **Step 3: Build + manual verify both modes**

Run: `npm run build`
Expected: build succeeds, NO `_document.js` / Turbopack runtime error.
Run: `npm run dev`, open `/adventure`, toggle to 3D/voxel.
Expected: 3D mode boots without console error AND renders a visibly isometric view (lanes
recede at the iso angle) that is distinct from the flat top-down 2D view.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-three-renderer.ts src/lib/game/renderer/three-renderer.ts src/lib/game/scene/camera-projection.ts
git commit -m "fix(3d): resolve SSR runtime error and source iso camera from shared projection"
```

### Task 14: Deprecate the legacy `RenderState` alias

**Files:**
- Modify: `src/lib/game/renderer/render-pass.ts`

Keep the WebGL passes compiling while pointing the codebase at `RenderScene`.

- [ ] **Step 1: Re-export RenderScene as RenderState for back-compat**

In `render-pass.ts`, replace the `RenderState` interface with a type alias so the passes keep
working without a wide rewrite:

```typescript
import type { RenderScene } from "../scene/types";
/** @deprecated Use RenderScene from ../scene/types. Kept for the pass-graph API. */
export type RenderState = RenderScene;
```

(The pass `execute(gl, state: RenderState, resources)` signatures now structurally accept a
`RenderScene` — they only read fields present on both.)

- [ ] **Step 2: Run full suite + build**

Run: `npm test && npm run build`
Expected: PASS, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/game/renderer/render-pass.ts
git commit -m "refactor(renderer): alias legacy RenderState to RenderScene"
```

---

# Phase 3 — QA sweep, smoke, playtest, plan-file regen

### Task 15: Get the full suite, build, and lint to green

**Files:** as needed to fix failures.

- [ ] **Step 1: Run all three gates**

```bash
npm test 2>&1 | tail -40
npm run build 2>&1 | tail -40
npm run lint 2>&1 | tail -40
```

- [ ] **Step 2: Fix every failure introduced since the baseline**

Compare against `docs/superpowers/plans/baseline-2026-06-02.md`. Any NEW failure relative to
baseline must be fixed. Pre-existing baseline failures unrelated to the renderer work: fix if
trivial, otherwise record them in the baseline doc as known-pre-existing and out of this spec's
scope (the spec's success criterion is "zero failures" — if pre-existing failures exist, raise
with the user before declaring green).

- [ ] **Step 3: Commit fixes**

```bash
git add -A
git commit -m "test: stabilization QA sweep to green"
```

### Task 16: Smoke-test both render modes

- [ ] **Step 1: Dispatch the game smoke test**

Run the `/game-playtest` smoke pass (or `game-smoke-tester` agent) against `/adventure`:
- 2D (pixel) mode: menu → play → move → die → game over.
- 3D (voxel) mode: toggle, confirm boot + isometric render + play.

- [ ] **Step 2: Record results**

Append a short pass/fail summary to `docs/superpowers/plans/baseline-2026-06-02.md` under a
"Post-stabilization smoke" heading. If failures: stop, fix, re-run.

### Task 17: UX/visual playtest

- [ ] **Step 1: Dispatch `game-playtester`**

Deeper pass: animation smoothness (no flashing/jank during hop, log-ride, death), camera
follow feel in both modes, HUD/overlay correctness, score popups, screen shake.

- [ ] **Step 2: Triage findings**

Cosmetic/gameplay polish beyond "stable + smooth basics" is **Spec #2** scope — log it, don't
fix it here. Only fix regressions vs. pre-stabilization behavior in this spec.

### Task 18: Regenerate the `game-sprint` plan reference

**Files:**
- Create: `.claude/plans/misty-marinating-parnas.md` (or edit `.claude/skills/game-sprint/SKILL.md`)

The `game-sprint` skill references a missing plan file.

- [ ] **Step 1: Decide and apply**

Either (a) write `.claude/plans/misty-marinating-parnas.md` summarizing the spec series
(Spec #1 stabilization done; Spec #2 rewrite; Spec #3 site WOW) and pointing at
`docs/superpowers/specs/` and `docs/superpowers/plans/`, OR (b) edit the skill's "Pre-load"
line to point at `docs/superpowers/specs/2026-06-02-game-stabilization-design.md`. Prefer (a)
so the skill keeps working unchanged.

- [ ] **Step 2: Verify the skill no longer dangles**

Run: `cat .claude/plans/misty-marinating-parnas.md` (or re-read the skill).
Expected: the referenced path exists.

- [ ] **Step 3: Commit**

```bash
git add .claude/plans .claude/skills/game-sprint
git commit -m "chore(game-sprint): restore referenced plan file"
```

### Task 19: Final gate + push

- [ ] **Step 1: Final green check**

```bash
npm test && npm run build && npm run lint
```
Expected: all pass, zero failures.

- [ ] **Step 2: Confirm success criteria from the spec**

- One `GameRenderer` interface; both `WebGLRenderer` (`GameRenderer` class) and `ThreeRenderer` implement it. ✓
- Both consume `RenderScene`; neither reads raw `GameState` in render. ✓
- Camera math in one tested module (`camera-projection.ts`). ✓
- 3D boots without SSR error and renders a distinct isometric view. ✓
- Repo clean of stale worktrees/screenshots. ✓
- `game-sprint` points at a real plan. ✓

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

---

## Self-review notes

- **Spec coverage:** renderer interface + dedupe (Tasks 5–14), fix 3D (Tasks 4, 13), repo cleanup
  (Tasks 1–2, 18), QA to green (Tasks 3, 15–17, 19) — all four spec scope items covered.
- **Type consistency:** `RenderScene` defined in Task 5 is the type used in every later task;
  `GameRenderer` (Task 8) methods `resize/render/setStyle/resetState/destroy` are exactly the
  members asserted in Tasks 9–10 and used in Task 12; `projectIsometric`/`ISO_TILT` defined in
  Task 7 are the symbols reused in Task 13.
- **Known risk:** Task 9's `resize` existence on the WebGL `GameRenderer` is unverified — the
  step instructs verifying and adding a thin/no-op `resize` if absent. Task 11 depends on the
  granular methods only reading scene-common fields; if `renderLanes` reads a `GameState`-only
  field, narrow the read or add it to `RenderScene` (update Task 5 + its test in lockstep).

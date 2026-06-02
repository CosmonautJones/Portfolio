# Spec #1 — Game Stabilization

**Date:** 2026-06-02
**Status:** Approved (design) — pending implementation plan
**Topic:** Stabilize the ClaudeBot's Adventure game renderer + system before the full rewrite.

---

## Context

The portfolio site contains a Frogger/Crossy-Road-style game ("ClaudeBot's Adventure").
The user wants a full refresh — rewrite the game and its systems to be robust and
industry-standard, with smooth animations, a clean codebase, a full QA sweep, polished
easter eggs/scoring/animations, and a site-wide "WOW factor".

That request spans several independent subsystems. It has been **decomposed and sequenced**:

- **Spec #1 — Stabilization** *(this document)*: renderer backbone, 3D fix, repo cleanup, green tests.
- **Spec #2 — Game rewrite**: industry-standard engine structure, smooth/crisp animation,
  scoring + easter-egg wiring on the stable backbone.
- **Spec #3 — Site-wide WOW**: portfolio polish, scroll/hover animation, easter-egg +
  progression shine.

Each later spec gets its own brainstorm → spec → plan → implementation cycle. This document
covers **only Spec #1**.

### Why stabilization first

The last several commits are almost entirely fighting the Three.js camera
("increase frustum to 900", "reduce isometric X offset", "fix camera framing",
"revert isometric shear"…). That thrashing is the concrete symptom of the
"not robust / not solid" feeling. The underlying engine logic
(`tick.ts`, `player.ts`, `lanes.ts`, collision, coins, power-ups, boss-lanes, weather,
skins, ghost) is decently factored and already has ~25 test files. The instability is
concentrated in the **render/camera layer**, so that is what we stabilize first.

### Current renderer reality

- `src/lib/game/renderer.ts` is a back-compat barrel → the real **WebGL2 `GameRenderer`**
  lives in `src/lib/game/renderer/renderer.ts` with a full multi-pass pipeline
  (background, sprites, particles, lighting, water-distortion, death-warp, bloom, composite).
- There is **no separate active Canvas2D renderer**. The duplication is **two renderer
  classes with no shared contract**: `GameRenderer` (WebGL2) and `ThreeRenderer` (3D).
- Two stacked `<canvas>` elements toggled via CSS `display`, selected per-frame by the loop.
- **Two camera implementations**: `src/lib/game/camera.ts` (2D, trivial Y-follow) and an
  internal camera inside `ThreeRenderer` (3D — the thrash source).
- The "voxel/3D final" screenshots rendered essentially identically to 2D, i.e. the 3D path
  was not actually projecting an isometric view, and at points it broke the build with a
  Next.js runtime error: `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`
  referencing `pages/_document.js` — notable because this is an **App Router** app, so
  something is dragging in the Pages runtime.

---

## Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Sequencing | Stabilize first, then rewrite |
| Renderer direction | Keep 2D as default **and** fix the 3D path properly (both modes supported) |
| Spec #1 scope | Renderer interface + dedupe · Fix the 3D path · Repo cleanup · QA to green (all four) |
| Renderer interface shape | **Shared view-model** — `buildScene(state) → RenderScene`, consumed by both renderers |
| Execution model | **Multi-agent** — Workflow script driving the existing agent team; fragile renderer work sequenced, safe work parallelized |

---

## Architecture

### Shared view-model layer

A pure function converts game state into a render-agnostic scene. No canvas, no GL, no Three.

```
buildScene(state: GameState, alpha: number): RenderScene
```

`RenderScene` captures everything both renderers need and nothing renderer-specific:

- **entities** — list of `{ kind, worldPos, animFrame, facing, variant }` (player, vehicles,
  logs, coins, decorations, power-ups, boss elements).
- **effects / particles** — active visual effects and particle state.
- **weather** — current weather descriptor.
- **camera** — a single descriptor: `{ target: {x, y}, ... projection params }`.

Lives in a new `src/lib/game/scene/` module. Because it is pure, it is **unit-testable
without a canvas** — which directly serves the "QA to green" goal.

### `GameRenderer` interface

```
interface GameRenderer {
  init(canvas): void;
  resize(w: number, h: number): void;
  render(scene: RenderScene, alpha: number): void;
  setStyle(style): void;
  destroy(): void;
}
```

Two implementations, **both consuming `RenderScene`** (neither touches `GameState`):

- `WebGLRenderer` — today's WebGL2 `GameRenderer`, renamed and adapted to consume the scene.
- `ThreeRenderer` — adapted to consume the scene; isometric projection of the **same**
  camera target the 2D renderer uses.

### Centralized camera

Camera math moves into the scene layer:

- 2D = orthographic projection of the camera target.
- 3D = isometric projection of the **same** camera target.

One place, unit-testable. This is what eliminates the per-commit camera tweaking — camera
logic no longer lives split across two renderer internals.

---

## The 3D fix

1. **Diagnose first.** Root-cause the `pages/_document.js` / Turbopack chunk error
   (`Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`). Likely an SSR-unsafe
   Three import or a dependency pulling in the Pages runtime. Do not patch blind.
2. Ensure Three.js is **client-only** and dynamically imported so it can never enter the
   SSR/build path.
3. Make the isometric projection **visually distinct** from the top-down 2D view (the prior
   "3D" screenshots looked identical to 2D — the projection was not actually applied).
4. Stable camera, sourced from the centralized scene-layer camera math.

---

## Repo cleanup

- Remove the 8 stale `.claude/worktrees/agent-*` directories.
- Remove stray root screenshots (`3d-*.png`, `final-*.png`).
- Remove dead/unused files surfaced during the renderer refactor (e.g. orphaned passes,
  unused exports).
- **Regenerate the missing `game-sprint` plan file** (`.claude/plans/misty-marinating-parnas.md`)
  so the skill no longer references a non-existent plan — or retire the reference if the
  skill is superseded by this spec series.

---

## QA to green

- `npm test` (Vitest), `npm run build`, and `npm run lint` all pass with **zero failures**.
- New unit tests for `buildScene` and camera projection (now testable without a canvas).
- Smoke test: both 2D and 3D modes boot without error.
- Visual/UX playtest of both modes.

---

## Execution — multi-agent pipeline

A **Workflow script** orchestrating the existing agent team (`game-architect`, `game-qa`,
`game-smoke-tester`, `game-playtester`, `engineer`, plus a diagnostic agent), with safe
parallelism and sequenced fragile work.

- **Phase 0 — Cleanup & baseline (parallel; runs alongside Phase 1)**
  - `engineer`: repo cleanup (worktrees, screenshots, dead files).
  - diagnostic agent: root-cause the Turbopack/3D SSR error.
  - Record baseline `test` / `build` / `lint` results and current failures.

- **Phase 1 — Architecture design (sequential)**
  - `game-architect`: design `RenderScene` + `GameRenderer` interface + camera module +
    migration contracts and test contracts.

- **Phase 2 — Renderer refactor (sequential, single-threaded — files are interdependent)**
  - Implement `buildScene`; port both renderers onto the interface; centralize camera;
    fix the 3D look + the SSR error. TDD throughout.

- **Phase 3 — QA sweep (parallel)**
  - `game-qa`: full suite to green.
  - `game-smoke-tester`: verify both modes boot.
  - `game-playtester`: UX/visual pass on both modes.

- **Gate:** all green → commit & push to `main`.

---

## Success criteria

- `npm test`, `npm run build`, and `npm run lint` all green.
- One `GameRenderer` interface with two implementations (`WebGLRenderer`, `ThreeRenderer`),
  **both** consuming `RenderScene`.
- Camera math in **one** tested place; no renderer-internal camera logic.
- 3D mode boots without the SSR error and renders a **genuinely isometric** view distinct
  from 2D.
- Repo clean of stale worktrees and stray screenshots.
- `game-sprint` skill points at a real plan file (or the dead reference is removed).

---

## Out of scope (deferred to later specs)

- Game engine rewrite / module restructuring beyond the render/camera layer → **Spec #2**.
- New gameplay, scoring redesign, easter-egg additions → **Spec #2**.
- Site-wide animation polish and "WOW factor" → **Spec #3**.

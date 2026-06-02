# ClaudeBot's Adventure — Game Overhaul Plan

> Referenced by the `game-sprint` skill (`.claude/skills/game-sprint/SKILL.md`).
> This file was regenerated during **Spec #1 (Stabilization)** after the original went missing.

## Source of truth

The overhaul is now driven by sequenced specs + plans under `docs/superpowers/`:

- **Specs:** `docs/superpowers/specs/`
- **Plans:** `docs/superpowers/plans/`

## Program: the three specs

The "full refresh" was decomposed into three sequenced specs, each with its own
brainstorm → spec → plan → implementation cycle.

### Spec #1 — Stabilization  ✅ COMPLETE
- Design: `docs/superpowers/specs/2026-06-02-game-stabilization-design.md`
- Plan: `docs/superpowers/plans/2026-06-02-game-stabilization.md`
- Baseline: `docs/superpowers/plans/baseline-2026-06-02.md`
- 3D diagnosis: `docs/superpowers/plans/3d-ssr-diagnosis.md`

Delivered: a single `GameRenderer` interface with a pure `RenderScene` view-model
(`src/lib/game/scene/`); both the WebGL2 renderer and the Three.js renderer consume it;
centralized camera projection (`camera-projection.ts`, one `ISO_TILT` knob); the 3D path's
dev-mode SSR/Turbopack error fixed via deferred `import()`; a genuinely isometric 3D camera;
stale worktrees/branches/screenshots removed; tests/build/lint green.

### Spec #2 — Game rewrite  (NOT STARTED)
Industry-standard engine structure beyond the render layer, smooth/crisp animation,
scoring + easter-egg wiring on the stabilized backbone. Brainstorm this next.

### Spec #3 — Site-wide WOW  (NOT STARTED)
Portfolio polish, scroll/hover animation, easter-egg + progression shine.

## Agent team (`.claude/agents/`)

`game-lead` (coordinator), `game-architect`, `game-qa`, `game-smoke-tester`,
`game-playtester`, `gameplay-mechanic`, `game-balance`, `visual-polish`,
`progression-unifier`, `social-engineer`.

## Sprint mapping

The `game-sprint` skill's "Sprint 1: Architecture Refactor" corresponds to **Spec #1**
(complete). Subsequent sprints map to Specs #2 and #3, to be planned when those specs
are brainstormed.

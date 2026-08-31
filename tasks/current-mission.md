# Current Mission

## Mission

Replace the broken Plan'd proof with LoopedIn and turn Pixel Art Editor,
Cocktail Mixer, and Release Signal into clear 30-second product proofs.

## Why This Mission

The live audit showed one genuinely dead public experience and three working
artifacts whose best value is hidden or unclear. The portfolio wedge is
interactive proof, so public projects must make their job, action, and result
obvious without setup or explanation from Travis.

## Scope

- Replace the Plan'd project card with the real hosted LoopedIn product and give
  old `/pland` links a useful handoff.
- Start Pixel Art Editor with a personalized lobster sprite, practical history,
  and a calmer palette workflow.
- Surface Cocktail Mixer's six-drink Cosmonaut unlock and shorten the wait for a
  completed pour.
- Give Release Signal a named change, concrete scenarios, and an honest
  three-state verdict.

## Out Of Scope

- Rebuilding LoopedIn in this repository.
- Deleting Plan'd code or database migrations.
- Auth, middleware, or database changes.
- Global navigation, typography, or theme redesign.
- New runtime dependencies.
- The previously recorded dependency, Actions runtime, and hook-warning health
  debt; that remains explicit follow-up work.

## Acceptance Criteria

- Plan'd is absent from the public project catalog; LoopedIn has correct live,
  source, proof copy, and artwork.
- Pixel Art provides an immediate personalized result plus starter, edit,
  undo/redo, palette, and export paths.
- Cocktail Mixer visibly explains and tracks the secret unlock and completes a
  standard pour promptly.
- Release Signal distinguishes Hold, Ready with notes, and Ready through tested
  deterministic logic.
- Changed flows fit at 320px, remain keyboard usable, respect reduced motion,
  and emit no console errors.
- Focused tests, lint, full tests, build, GitHub CI, deployment, and exact live
  verification pass.

## Test Plan

- Run focused tests for catalog assets and all three demos.
- Run `npm run lint`, `npm test`, and `npm run build` under Node 24.
- Exercise desktop and mobile flows in a real browser.
- Watch GitHub CI and deployment after push.
- Verify exact production assets and interactions.

## Done Definition

A first-time visitor can open every project in this slice, understand its job,
reach a satisfying result quickly, and see concrete evidence that Travis ships
real products.

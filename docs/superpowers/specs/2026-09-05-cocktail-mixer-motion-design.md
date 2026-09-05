# Cocktail Mixer Motion Design

Raise The Cosmonaut’s Bar from a working SVG illustration to award-site 2D
motion: one GSAP clock, Flip between grid and recipe, light physics on pour.
Keep the current art, recipes, and unlock. Do not go 3D.

## Decisions (locked)

- Bar: 2D commercial motion (Stripe / Linear), not photoreal liquid.
- Engine: `gsap` + `@gsap/react`, mixer-only. Motion stays on the rest of the site.
- Scope: pour scene + card grid + recipe panel. Not a site-wide motion rewrite.
- Pour feel: choreographed SVG + light physics (splash, ice, shake). Not a fluid sim.
- Architecture: GSAP owns every tween inside the mixer. One timeline. Flip for view change.

## Why GSAP

The mixer already uses Motion + `setTimeout`. Those clocks drift. GSAP gives
one timeline, Flip, DrawSVG, MorphSVG, and Physics2D. Plugins are MIT. The demo
is already `next/dynamic(..., { ssr: false })`, so GSAP loads only on
`/work/cocktail-mixer`.

This is an explicit exception to `docs/anti-goals.md` (“no new deps for one-off
effects”), scoped to this demo.

## Out of scope

- Three.js, Rive, Lottie, Pixi, canvas particle overlays
- Site-wide GSAP or removing Motion elsewhere
- Recipe / unlock / XP / localStorage behavior changes
- Audio
- Global nav, typography, theme
- Auth, middleware, database

## File layout

SVG is dumb. One timeline selects targets.

```text
src/components/demos/cocktail-mixer/
  index.tsx            view state + Flip
  selection-grid.tsx   cards, hover, data-flip-id
  recipe-stage.tsx     glass column | details column
  glass-scene.tsx      one SVG, data-pour="..." targets
  pour-timeline.ts     master timeline factory
  gsap-setup.ts        register plugins once
  progress.ts          made-cocktails localStorage (unchanged)
  data.ts / types.ts   unchanged recipes + glass paths
  svg/                 art only, no animation imports
  __tests__/
```

Delete Motion usage under this folder. Delete `usePourSequence` and its
`setTimeout` chain. Fold `cosmonaut-reveal.tsx` into `selection-grid.tsx`.
Do not keep `decorations.tsx` as an animation file; fold liquid / bubbles /
ice / drips into `glass-scene.tsx` + `svg/` art. Delete `WAVE_STYLES` CSS
keyframes (`wave-drift`, `condensation-drip`, `cosmonaut-glow`); those loops
become GSAP tweens.

## GSAP setup

`gsap-setup.ts` is the only registration site. Import it first from mixer
entry. Register once at module scope:

- `useGSAP` from `@gsap/react`
- `Flip`
- `DrawSVGPlugin`
- `MorphSVGPlugin`
- `Physics2DPlugin`
- `CustomEase`
- `CustomWiggle`

Do not import GSAP from any file outside `cocktail-mixer/`.
Do not call `gsap.*` during SSR / render. Tweens live in `useGSAP`.

## Data flow

1. Grid click → `Flip.getState()` on `data-flip-id={`drink-${name}`}` → set
   `selectedDrink`.
2. Recipe mounts → `Flip.from(state)` moves the icon into the glass slot →
   pour timeline starts.
3. `buildPourTimeline({ root, cocktail, reducedMotion, onSnapshot })` returns
   one `gsap.timeline()`.
4. Timeline callbacks write `{ pouredCount, activePour, allDone }` so
   `recipe-stage` can tick ingredient rows without reading the DOM.
5. Back → kill timeline (`useGSAP` revert) → reverse Flip to grid.

`progress.ts` and XP / Cosmonaut unlock stay on `allDone` (same as today).

## Pour timeline

Target duration: **2.5–3.5s** for a 3-ingredient drink (keep the current
“proof moves along” cap).

Labels per ingredient `i`: `pour-i`, `stream-i`, `fill-i`, `splash-i`,
`bubbles-i`. Final: `ice`, `garnish`, `method`, `done`.

Per ingredient:

1. Bottle tilts in.
2. Stream draws on (`DrawSVG`), thins / breaks at the end.
3. Liquid rect rises; surface meniscus morphs (`MorphSVG`).
4. Splash dots (`Physics2D`: velocity + gravity, then fade).
5. Bubbles rise and pop.
6. Matching recipe row eases in / checks off.

After last pour:

- Ice drops in (short Physics2D), then bobs on a looping y tween. No
  collision solver.
- Garnish scale-pops.
- Method:
  - `shaken` → short `CustomWiggle` on the glass group
  - `stirred` → slow yaw, then settle
  - `built` → no extra motion
- Cosmonaut: same sequence, extra wiggle on `done`.

Liquid stays layered illustration colors. No blending / viscosity sim.

Looping bits (wave drift, condensation, ice bob) are GSAP repeating tweens
parented to the timeline (or a child `repeat: -1` tween killed with it). No
ad-hoc CSS keyframes for those.

## Flip / grid

- Each card icon: `data-flip-id={`drink-${name}`}`.
- Cosmonaut card uses the same pattern (rocket icon).
- Hover: small tilt + color glow. No large scale bounce.
- Grid enter: stagger. Made drinks keep the check badge.
- Back to drinks: reverse Flip, then stagger remaining cards.
- Flip absolute: icon flies to the glass column origin; `glass-scene` fades in
  as Flip completes (`onComplete` starts the pour, not before).

## Reduced motion

If `prefers-reduced-motion: reduce`:

- No Flip.
- No pour timeline.
- Recipe shows finished glass, all rows, garnish immediately.
- `allDone` fires on mount so XP / unlock still work.
- Keyboard path unchanged. Layout still works at 320px.

## Errors / interruption

- Click another drink or Back mid-pour: `useGSAP` context revert kills the
  timeline and physics tweens. No orphan GSAP ticks.
- Unknown / missing cocktail: stay on the grid; do not start Flip.
- GSAP or plugin throw: render static finished SVG (same as reduced motion).
  Do not blank the demo.
- `localStorage` failure: keep current ignore behavior.

## Tests

Replace `pour-sequence.test.ts` with `pour-timeline.test.ts`:

- starts at pouredCount 0
- emits snapshots on labels
- 3-ingredient finishes in < 3.5s
- reduced-motion factory returns already-done snapshot, no tweens
- shaken vs stirred vs built attach different method tweens
- `timeline.kill()` / revert leaves no pending tweens

Keep `cocktail-data.test.ts` and `cosmonaut-unlock.test.ts`.

Update `cocktail-mixer.test.tsx`:

- drop the `motion/react` mock
- stub `useGSAP` / `Flip` so RTL does not depend on RAF; keep pour timing
  coverage in `pour-timeline.test.ts` with real GSAP
- 6 cards render; click opens recipe; back returns to grid
- cards expose `data-flip-id`
- reduced-motion path still marks the drink made / fires XP mocks

`npm test` and `npm run build` must pass.

## Acceptance

A first-time visitor on `/work/cocktail-mixer`:

1. Sees the grid stagger in.
2. Clicks a drink; the icon travels into the glass slot.
3. Watches a single continuous pour (bottle → stream → fill → splash →
   bubbles → ice → garnish), with the recipe list ticking in sync.
4. Shaken drinks shiver; stirred drinks yaw; built drinks stay still.
5. Back Flip-returns to the grid with progress intact.
6. Reduced-motion users get the finished drink with no motion.
7. Cosmonaut unlock and XP behave as they do today.

Taste bar: motion clarifies state and rewards the pour. It does not hide copy,
block the 30-second proof, or turn the mixer into a shader demo.

## Spike (prove GSAP first)

Before Flip and the file split, ship a mixer-scoped GSAP pour on the existing
recipe view: `gsap-setup.ts`, `pour-timeline.ts`, `glass-scene.tsx`. Grid still
uses Motion. Success: plugins load in Next/Vitest, a 3-ingredient pour finishes
under 3.5s, shaken wiggle runs, reduced motion skips to the finished glass.

## Implementation notes for later

Use official GSAP skills (`gsap-core`, `gsap-timeline`, `gsap-plugins`,
`gsap-react`) and Emil Kowalski `improve-animations` for easing/stagger taste.
Do not add other animation libraries while executing this spec.

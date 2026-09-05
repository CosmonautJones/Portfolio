# Cocktail Mixer Pixi Pour Design

Supersedes `docs/superpowers/specs/2026-09-05-cocktail-mixer-motion-design.md`.
That spec shipped GSAP on the existing 1.5px SVG. The pour looked lousy:
ice drifted out of the glass, liquid was stacked rects, the stream never
hit the meniscus. The ceiling was the art, not the clock.

This spec replaces the **picture**. Keep the recipes, unlock, XP, and GSAP
as the conductor. Do not go 3D.

## Decisions (locked)

- Bar: tenth-pass 2D cabinet illustration. Stripe / Linear discipline on a
  bar card. The paused end frame must look like a finished cocktail painting,
  not an animation that only works in motion.
- Engine: PixiJS v8 owns every pixel of the pour stage. GSAP + `@gsap/react`
  owns the clock. Motion stays on the rest of the site.
- Art: full redraw. Painted glassware, ice, garnish, bottle, bar surface.
  Liquid color still comes from `data.ts`. Do not polish the current SVG
  glasses, bottles, or garnishes as the pour picture.
- Scope: the pour stage on `/work/cocktail-mixer`. The selection grid
  stays Motion `AnimatePresence` plus SVG card icons. Not a site-wide
  Pixi or GSAP rewrite.
- Pour feel: choreographed 2D craft with light physics. Stream lands on the
  rising surface. Ice stays inside the bowl. Splash at contact. Method
  (shake / stir / build) is visible in the liquid, not a glass rotation
  gimmick. Not a Navier–Stokes sim. Not a Three.js spirits microsite.
- Architecture: a pour **script** (pure timing) drives a Pixi **rig**.
  GSAP tweens rig properties. React mounts one Application and destroys it.

## Why this, not the last spike

GSAP DrawSVG / MorphSVG / Physics2D on line-art cannot look expensive.
Pixi v8 can: `MeshPlane` meniscus, `MeshRope` stream, `DisplacementFilter`
wet wobble, `ParticleContainer` splash/foam, clip the ice to the bowl.

`three` is already in the repo for other work. It is the wrong lead here.
The product bar is craft, not a transmission-material gin ad. Rive needs a
`.riv` from an editor we do not have.

This is an explicit exception to `docs/anti-goals.md` (“no new deps for
one-off effects”), scoped to this demo, adding **only** `pixi.js` (v8).
GSAP is already a mixer dependency.

## Out of scope

- Three.js, React Three Fiber, MeshTransmissionMaterial, Rive, Lottie
- Site-wide Pixi or removing Motion elsewhere
- Recipe / unlock / XP / localStorage / Cosmonaut gate changes
- Audio
- Global nav, typography, theme
- Auth, middleware, database
- Rewriting the selection-grid card icons into Pixi
- A second pour engine for Cosmonaut

## Wow bar (falsifiable)

A demanding visitor who saw the SVG spike and said it was lousy should,
on the first pour, believe this is a commercial interactive. Pause at the
end. If the still looks like wireframe SVG, the work failed.

Must be true:

1. Ice never leaves the glass interior. Local coordinates, clipped to the
   bowl. No GSAP `y` on a world-space SVG group.
2. The stream contacts the **rising meniscus**, not a fixed glass-top
   coordinate. Each ingredient’s stream shortens as the fill rises.
3. Liquid is one volume with a curved surface, not stacked HTML/SVG rects.
   Ingredient colors still layer (bottom to top) but the silhouette is a
   glass of liquid, not a bar chart.
4. Splash particles emit at the stream–surface hit, then die. They do not
   spawn in empty air beside the glass.
5. Garnish lands last, after ice. Salt rims are already on the glass, not
   thrown in at the end.
6. `shaken` settles (quick residual swirl, then still). `stirred` shows a
   brief vortex. `built` stays still. The glass itself does not cartoon-tilt.
7. Cosmonaut gets one extra beat (frost bloom + a few star motes), then
   the same still-frame discipline. Not a shader demo.
8. Recipe text stays readable during the pour. Motion rewards the pour; it
   does not hide the recipe (`docs/taste-bar.md`).
9. At `320px` width the glass, garnish, and recipe still read.
10. `prefers-reduced-motion: reduce` shows the painted finished drink on
    the first frame. No tween, no particles, no displacement.

## Visual craft (the picture)

One key light, camera-left. Warm bar top. Cool rim on the glass. No
second competing light. No rainbow bloom. No UI chrome inside the canvas.

Layer order, back to front:

1. Bar surface (contact shadow + a short caustic strip under the bowl)
2. Glass body (painted PNG, four silhouettes)
3. Liquid volume, clipped to the interior
4. Meniscus (`MeshPlane`)
5. Ice (rocks and highball only), clipped, slow bob
6. Condensation (static or near-static dots on the bowl)
7. Stream (`MeshRope`) — pour only
8. Splash / foam particles — pour only
9. Inner rim highlight
10. Garnish
11. Bottle — pour only, above the glass, camera-right of the rim

The canvas is a pour stage, not a scene graph of the whole bar. No
bartender, no bottles on shelves, no neon sign.

### Glassware

Four painted silhouettes, matching `GlassType`:

| Type      | Ice | Notes                                      |
|-----------|-----|--------------------------------------------|
| rocks     | yes | Thick bowl, short. Ice must read.          |
| highball  | yes | Tall column. Condensation on the lower 2/3 |
| coupe     | no  | Stem + wide bowl. Liquid stays in the cup  |
| margarita | no  | Wide rim. Salt is part of the glass plate  |

Each glass is a **precomposed PNG plate** (body + inner wall + rim) plus a
separate **interior mask** used as a Pixi mask. Do not reconstruct the
bowl from the old SVG `outline` / `clip` paths as the hero art. Those
paths may inform mask proportions only.

### Liquid

- Tint from `cocktail.ingredients[i].color` and `cocktail.color`.
- Fill height is equal layers, bottom to top. Store extents in
  `GLASS_BOUNDS` in `pixi/rig.ts`: `{ liquidTop, liquidBottom, hasIce,
  bowlCenterX }` per `GlassType`. Measure `liquidTop` / `liquidBottom`
  from the interior mask alpha bbox after the plates exist (first opaque
  row inside the bowl → last opaque row). `hasIce` stays rocks/highball
  `true`, coupe/margarita `false`. Do not reuse the old SVG path strings
  as the hero silhouette.
- Surface is a `MeshPlane` (not a MorphSVG wave). Vertex Y follows a
  shallow sine; amplitude dies after each pour.
- `DisplacementFilter` on the liquid (tiny, wet). Always off under
  reduced motion. Drop it (and the highlight blur) if the ticker stays
  under 50fps for 30 frames. Skip it at `devicePixelRatio < 1.5` to save
  fill rate.

### Stream

- `MeshRope` from bottle neck to current surface Y.
- Width ~3–5px CSS, tinted to the active ingredient.
- Slight gravity sag (quadratic points), not a straight line.
- Appears as the bottle tips, disappears as the bottle rights.

### Ice

- 3–5 cubes, painted PNG, only when `hasIce` for that glass.
- Parent container is the masked interior. Bob is local (`±2px`).
- Drop in after the last pour, before garnish. They settle; they do not
  bounce out.

### Particles

- Splash: ≤40 sprites, emit at contact, gravity down, life < 400ms.
- Foam: Paloma only, during the grapefruit-soda pour; ≤20 sprites that
  then sit on the surface.
- Cosmonaut extra: ≤12 star motes + a short frost bloom on the coupe,
  400ms, then gone. No soda foam on the Cosmonaut.
- Use Pixi v8 particles from `pixi.js` (`Particle` / `ParticleContainer`).
  No `@pixi/particle-emitter`. No DOM particles. No GSAP Physics2D on
  SVG dots.

### Bottle

- One painted bottle silhouette, recolored per ingredient fill.
- Tips from upright to ~−50° around the neck, holds, rights, hides.
- It is a prop, not a product shot. No label typography.

### Garnish

Keep `GarnishType`. New painted plates, not the current SVG garnishes.
Salt rims live on the glass plate (`salt_rim`, `salt_lime`,
`salt_grapefruit`). Wheels, wedges, cherry, rocket drop in last.

## Motion clock

GSAP is the only clock for the pour. One timeline per cocktail mount.
`useGSAP` from `@gsap/react` with `revertOnUpdate: true`. Kill the
timeline and destroy the Pixi Application on unmount.

Keep the existing slot math so recipe highlighting still works:

```text
POUR_INTRO  = 0.2s
POUR_SLOT   = 0.85s   per ingredient
POUR_FINISH = 0.45s   ice + garnish + method + secret extra
```

`pourDuration(n) = POUR_INTRO + n * POUR_SLOT + POUR_FINISH`

Per ingredient, inside the slot (relative):

| t      | beat                                      |
|--------|-------------------------------------------|
| 0.00   | bottle appears, starts tip                |
| 0.18   | stream on; snapshot `activePour = i`      |
| 0.20   | liquid height eases to layer top          |
| 0.25   | meniscus amplitude up                     |
| 0.38   | splash at current surface                 |
| 0.58   | stream off                                |
| 0.62   | bottle hidden; snapshot `activePour = null` |

Finish:

| t                         | beat                                      |
|---------------------------|-------------------------------------------|
| last slot end             | ice drop (if `hasIce`)                    |
| +0.12                     | garnish                                   |
| +0.20                     | method (settle / vortex / none)           |
| +0.35 (secret only)       | frost + star motes                        |
| + POUR_FINISH             | snapshot `allDone`                        |

`PourSnapshot` stays `{ pouredCount, activePour, allDone }`.
`RecipeView` keeps highlighting ingredients from that snapshot.
`onPourComplete` still fires once when `allDone` becomes true.

Reduced motion: apply the finished rig state immediately, emit
`allDone: true`, return an empty timeline. Same as the current contract.

Do **not** use DrawSVG, MorphSVG, or Physics2D against SVG pour targets.
When `glass-scene.tsx` dies, slim `gsap-setup.ts` to `gsap` + `useGSAP`
(+ `CustomEase` only if a named ease is still used). Drop DrawSVG,
MorphSVG, Physics2D, Flip, and CustomWiggle unless a mixer file still
imports them. The selection grid keeps Motion `AnimatePresence`; do not
add GSAP Flip as part of this pour rewrite.

## File layout

Pixi owns the picture. The script is testable without WebGL.

```text
src/components/demos/cocktail-mixer/
  index.tsx                 unchanged behavior (select / unlock / XP)
  data.ts                   recipes, colors, garnish, method (keep).
                            Delete SVG-only exports with the old stage:
                            WAVE_PATH, ICE_POSITIONS, BUBBLE_SETS,
                            CONDENSATION_DROPS, GLASS_CONFIGS. Keep
                            cosmonaut-glow in a small CSS snippet.
  types.ts                  Cocktail, MixMethod, GarnishType (keep)
  hooks.ts                  localStorage progress (keep)
  pour-script.ts            NEW: pure timing + snapshot schedule
  pixi/
    bar-stage.tsx           NEW: React wrapper, replaces glass-scene.tsx
    application.ts          NEW: create / resize / destroy Application
    rig.ts                  NEW: display list for one cocktail
    pour-director.ts        NEW: GSAP timeline → rig setters
    liquid.ts               NEW: MeshPlane + fill
    stream.ts               NEW: MeshRope
    particles.ts            NEW: splash / foam / motes
    assets.ts               NEW: texture keys + load
  assets/                   NEW: PNG plates (see Asset pack)
  components/recipe-view.tsx   GlassScene → BarStage
  components/recipe-details.tsx keep
  components/selection-grid.tsx keep (SVG card icons OK)
  svg/                      retire from the pour stage; card icons may stay
  glass-scene.tsx           delete after BarStage lands
  pour-timeline.ts          delete after pour-script + director land
  components/glass-visualization.tsx  unused; delete with the SVG stage
  svg/decorations.tsx       delete with the SVG stage (wave/condensation)
```

`demo-loader.tsx` stays `next/dynamic(..., { ssr: false })`. Pixi loads
only on `/work/cocktail-mixer`.

Keep `cosmonaut-glow` on the Cosmonaut grid card. Delete `wave-drift` and
`condensation-drip` from `WAVE_STYLES` with the SVG stage. Condensation
on the Pixi glass is static dots, not a CSS keyframe.

## Asset pack

All pour-stage art lives under
`src/components/demos/cocktail-mixer/assets/` as 2x PNG (WebP allowed if
the loader is one line). Approximate CSS stage: **280×420**. Texture
resolution: 560×840 for the glass plates.

Required files:

```text
bar-top.png
glass-rocks.png
glass-rocks-mask.png
glass-highball.png
glass-highball-mask.png
glass-coupe.png
glass-coupe-mask.png
glass-margarita.png
glass-margarita-mask.png
ice-cube.png          (one cube; instanced)
bottle.png
garnish-lime-wheel.png
garnish-cherry.png
garnish-orange-slice.png
garnish-grapefruit-wedge.png
garnish-cherry-orange.png
garnish-rocket.png
splash-dot.png        (soft disc, tinted in code)
star-mote.png         (Cosmonaut only)
rim-salt.png          (overlay when garnishType starts with salt_)
```

Salt rims are baked into `glass-margarita.png` / Paloma highball as
needed via a thin overlay plate `rim-salt.png` shown when
`garnishType` starts with `salt_`.

Palette: warm wood bar, cool glass, liquid tints from data. No emoji on
the stage (`cocktail.emoji` stays on cards only).

If generated images need a pass, composite them to this list. Do not
ship raw mismatched lighting across plates. One key light, camera-left,
on every plate.

## Performance

- One `Application` per `BarStage` mount. `destroy(true, { children: true })`
  on unmount. No leaked tickers.
- Resolution `Math.min(2, devicePixelRatio)`.
- Canvas CSS size ≤ 280×420. Do not fill the viewport.
- Particle caps above. No displacement when reduced motion.
- If the ticker reports `< 50fps` for 30 consecutive frames, drop
  displacement and bloom-blur. Keep the pour.
- Do not add `@pixi/filter-*` packages. Core Pixi `BlurFilter` +
  `DisplacementFilter` only. Bloom is a blurred highlight sprite, not a
  filter stack.
- Bundle: `pixi.js` is mixer-only via the existing dynamic import of the
  demo. Do not import Pixi from the root layout.

## Reduced motion and a11y

- `useReducedMotion()` from `motion/react` (already used in `RecipeView`).
- Finished painted still. Recipe list shows every ingredient as poured.
- Canvas has `role="img"` and `aria-label` with the cocktail name.
- Keyboard: Back to drinks unchanged. No canvas key traps.
- 320px: stage stacks above recipe, same grid as today.

## Tests

jsdom cannot prove the wow bar. Split what tests can prove.

Pure (jsdom, no Pixi):

- `pour-script.ts`: duration, snapshot times, reduced-motion emits
  `allDone` immediately, Cosmonaut extra beat exists, ice skipped when
  `hasIce` is false.
- Existing `cocktail-data`, `cosmonaut-unlock`, mixer behavior tests stay.

React:

- `RecipeView` still calls `onPourComplete` once when the snapshot
  completes (mock `BarStage` if Pixi cannot init).
- `data-testid="glass-scene"` moves to the canvas wrapper so existing
  queries keep working, or tests update to `data-testid="bar-stage"`.

Do not add WebGL screenshot tests in Vitest. Visual proof is a browser
pass on `/work/cocktail-mixer` for:

- Margarita (shaken, salt rim, no ice)
- Old Fashioned (stirred, rocks, ice must stay in the bowl)
- Paloma (built, highball, soda foam)
- Whiskey Sour (shaken, coupe, no ice)
- Cosmonaut after unlock (frost + star motes, then still)
- 320px width
- `prefers-reduced-motion: reduce` (finished still, first frame)

## Dependencies

Add:

```text
pixi.js  ^8
```

Keep:

```text
gsap
@gsap/react
```

Do not add `pixi-filters`, `@pixi/particle-emitter`, Rive, or extra
Three wrappers for this demo.

## Implementation order (after this spec is approved)

1. `pour-script.ts` + tests (TDD). No Pixi yet.
2. Asset plates for one glass (rocks) + `BarStage` hello (static still).
3. Liquid mesh + stream + ice clip on rocks.
4. Remaining three glasses + garnishes + bottle.
5. `pour-director.ts` GSAP wired to the rig. Delete SVG `glass-scene`.
6. Method beats + Cosmonaut extra + fps fallback.
7. `npm test` + `npm run build` + browser pass on the drinks listed
   under Tests.

Do not start this list until the spec file is approved.

## Success

The Cosmonaut’s Bar pour looks like someone iterated a 2D cabinet piece
until it was done. Elon-level here means: pause it, and it still looks
expensive. Not a 3D gin ad. Not another SVG tween.

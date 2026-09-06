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
  owns the **story clock** (slot times, snapshots, bottle angle, fill
  height). The Pixi ticker only applies those uniforms to meshes and
  particles. Motion stays on the rest of the site.
- Art: full redraw. Painted glassware, ice, garnish, bottle, bar surface.
  Finished liquid is `cocktail.color` as **one volume**. Stream and a brief
  surface flash use the active `ingredient.color`. Do not polish the
  current SVG glasses as the pour picture. Do not ship stacked ingredient
  bands (that is a bar chart, which was the last failure).
- Scope: the pour stage on `/work/cocktail-mixer`. The selection grid
  stays Motion `AnimatePresence` plus SVG card icons. Not a site-wide
  Pixi or GSAP rewrite.
- Pour feel: choreographed 2D craft with light physics. Stream lands on the
  rising surface. Ice stays inside the bowl. Splash at contact. Method
  (shake / stir / build) is a liquid uniform, not a glass rotation.
  Not a Navier–Stokes sim. Not a Three.js spirits microsite.
- Architecture: a pour **script** (pure timing) drives a Pixi **rig**.
  GSAP tweens rig uniforms. React mounts one Application, loads assets,
  then starts the timeline. Destroy on unmount with an abort token.

## Why this, not the last spike

GSAP DrawSVG / MorphSVG / Physics2D on line-art cannot look expensive.
Pixi v8 can: `MeshPlane` meniscus, `MeshRope` stream, `DisplacementFilter`
wet wobble, particles for splash/foam, clip the ice to the bowl.

`three` is already in the repo for other work. It is the wrong lead here.
The product bar is craft, not a transmission-material gin ad. Rive needs a
`.riv` from an editor we do not have.

This is an explicit exception to `docs/anti-goals.md` (“no new deps for
one-off effects”), scoped to this demo, adding **only** `pixi.js` (pin
**8.8 or newer** in the 8.x line). GSAP is already a mixer dependency.

## Out of scope

- Three.js, React Three Fiber, MeshTransmissionMaterial, Rive, Lottie
- Site-wide Pixi or removing Motion elsewhere
- Recipe / unlock / XP / localStorage / Cosmonaut gate changes
- Oz-weighted fill or Tequila Sunrise grenadine-sink special case
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
   bowl after settle. No GSAP `y` on a world-space group.
2. The stream contacts the **rising meniscus**, not a fixed glass-top
   coordinate. Each ingredient’s stream shortens as the fill rises.
   Stream start is the bottle neck’s world point each ticker frame.
3. Liquid is one volume with a curved surface, tinted `cocktail.color`.
   Not stacked HTML/SVG rects. Not equal bands of sugar / bitters / spirit.
4. Splash particles emit at the stream–surface hit, then die. They do not
   spawn in empty air beside the glass.
5. Garnish lands last, after ice. Salt is a rim overlay, already on the
   glass, not thrown in at the end.
6. `shaken` settles (quick residual swirl on the **liquid**, then still).
   `stirred` shows a brief vortex on the liquid. `built` stays still.
   The glass itself does not cartoon-tilt.
7. Cosmonaut gets one extra beat (frost + a few star motes), then the
   same still-frame discipline. `allDone` fires **after** that beat.
   Not a shader demo.
8. Recipe text stays readable during the pour. `pouredCount` increments
   as each slot starts so `RecipeDetails` can reveal rows (`i < pouredCount`).
   Motion rewards the pour; it does not hide the recipe (`docs/taste-bar.md`).
9. At `320px` width the glass, garnish, and recipe still read. Canvas is
   `width: 100%; max-width: 280px; height: auto`.
10. `prefers-reduced-motion: reduce` shows the painted finished drink on
    the first painted frame after assets load. No tween, no particles,
    no displacement.

## Visual craft (the picture)

One key light, camera-left. Warm bar top. Cool rim on the glass. No
second competing light. No rainbow filter bloom. No UI chrome inside
the canvas.

The glass is a **sandwich**. A single precomposed bowl with liquid
painted in front of it looks like stickers on glass. Do not do that.

Layer order, back to front:

1. Bar surface (contact shadow + a short caustic strip under the bowl)
2. Back glass (stem, base, back wall — interior of the bowl is transparent)
3. Liquid volume + meniscus, masked to the interior hole
4. Ice, masked to the interior after settle
5. Condensation (static dots on the front wall)
6. Front glass (near wall, rim). Salt overlay on top when `garnishType`
   starts with `salt_`
7. Stream: unclipped from neck to rim, masked only while inside the bowl
8. Splash around the rim (unclipped, short life)
9. Foam on the surface (Paloma only; **remains** on the finished still)
10. Garnish (wheels, wedges, cherry, rocket)
11. Bottle — pour only, in reserved headroom above the glass,
    camera-right of the rim

The canvas is a pour stage, not a scene graph of the whole bar. No
bartender, no bottles on shelves, no neon sign.

Composed frame (CSS pixels): **280×420**. Glass content sits in a 200×300
rect, centered horizontally, sitting on the bar. Headroom above the rim
is for the bottle. Pixi clips to the canvas; do not rely on overflow.

### Glassware

Four painted silhouettes, matching `GlassType`. Each type is **two**
plates plus a mask:

| Type      | Ice                         | Notes                                      |
|-----------|-----------------------------|--------------------------------------------|
| rocks     | 1 large + 1 small           | Thick bowl. Ice must read.                 |
| highball  | 3 cubes                     | Tall column. Condensation on the lower 2/3 |
| coupe     | none                        | Stem + wide bowl. Liquid stays in the cup  |
| margarita | none                        | Wide rim. Salt is the overlay plate        |

Files per type: `glass-{type}-back.png`, `glass-{type}-front.png`,
`glass-{type}-mask.png`. The mask is the interior hole, pixel-aligned
to the painted bowl. Do not reconstruct the bowl from the old SVG
`outline` / `clip` paths as the hero art.

### Liquid

- Finished fill: `cocktail.color`, one mesh, one `MeshPlane` surface.
- During pour `i`: stream tint and a ~200ms surface flash use
  `ingredients[i].color`, then ease back to `cocktail.color`.
- Fill height is equal slots (`(i + 1) / n` of the bowl), not oz-weighted.
- Extents live in `glass-bounds.ts` (pure module, CSS pixels on the
  200×300 glass rect). Seed from the current SVG numbers, then remeasure
  from mask alpha bbox once plates exist and **commit the numbers**.
  Runtime bbox is a debug assert, not a load blocker.

```ts
export type GlassBounds = {
  liquidTop: number;
  liquidBottom: number;
  hasIce: boolean;
  bowlCenterX: number;
};

// seed (CSS px inside the 200×300 glass rect); replace after plates
export const GLASS_BOUNDS: Record<GlassType, GlassBounds> = {
  rocks:     { liquidTop: 100, liquidBottom: 254, hasIce: true,  bowlCenterX: 100 },
  highball:  { liquidTop: 50,  liquidBottom: 255, hasIce: true,  bowlCenterX: 100 },
  coupe:     { liquidTop: 70,  liquidBottom: 180, hasIce: false, bowlCenterX: 100 },
  margarita: { liquidTop: 60,  liquidBottom: 175, hasIce: false, bowlCenterX: 100 },
};
```

- Surface is a `MeshPlane`. Texture: codegen a 64×32 vertical gradient
  from the current fill color (no extra PNG). Vertex Y follows a shallow
  sine; amplitude is a GSAP-tweened uniform; the ticker writes vertices.
- `DisplacementFilter` on the liquid (tiny, wet). Map: `displace-noise.png`,
  a sprite on the stage (required by v8). Always off under reduced motion.
  Skip at `devicePixelRatio < 1.5`. Drop it if the ticker stays under
  50fps for 30 frames.

### Stream

- `MeshRope` from bottle neck to current surface Y.
- Texture: `stream.png`, a 8×64 px (2×) vertical highlight. Rope
  thickness is `texture.height`, not a CSS stroke. Keep it ~3–5px CSS.
- Slight gravity sag (quadratic points), not a straight line.
- Points are a Pixi array the ticker updates from uniforms
  (`neckX`, `neckY`, `surfaceY`, `streamOn`).
- Appears as the bottle tips, disappears as the bottle rights.

### Ice

- Painted `ice-cube.png`, scaled. Counts from the glass table above.
  Local positions committed in `glass-bounds.ts` (`ICE_LAYOUT`).
- Spawn **already inside** the bowl (opacity 0 → 1, short settle).
  Do not drop from world-space above the mask — that was the SVG bug
  (cubes vanish until they enter, or they escape).
- After settle, parent/mask is the interior. Idle bob `±2px` via ticker
  after the pour. Reduced motion: static, no bob.
- Local layout (CSS px, relative to bowl center; seed, remeasure with plates):

```ts
export const ICE_LAYOUT: Record<"rocks" | "highball", IceCube[]> = {
  rocks: [
    { dx: -8, dy: 6, angle: 12, scale: 1.35 },
    { dx: 18, dy: 14, angle: -8, scale: 0.85 },
  ],
  highball: [
    { dx: -16, dy: 8, angle: 10, scale: 1 },
    { dx: 14, dy: 18, angle: -12, scale: 0.9 },
    { dx: 0, dy: 28, angle: 18, scale: 0.8 },
  ],
};
```

### Particles

- Splash: ≤40, emit at contact, gravity down, life < 400ms, then gone
  from the finished still. `boundsArea` = the stage rect (v8 default
  particle bounds are empty). Tint from the active ingredient
  (`dynamicProperties.color: true`).
- Foam: Paloma only, during the grapefruit-soda pour; ≤20 sprites that
  **stay on the finished still**.
- Cosmonaut extra: ≤12 star motes + `frost.png` on the coupe, 400ms,
  then gone from the still. No soda foam on the Cosmonaut.
- Use Pixi v8 `Particle` / `ParticleContainer` from `pixi.js`.
  No `@pixi/particle-emitter`. No DOM particles. No GSAP Physics2D.

### Bottle

- `bottle.png` is near-white (so `tint` from `ingredient.color` works).
- Tips from upright to ~−50° around the neck, holds, rights, hides.
- It is a prop, not a product shot. No label typography.
- Neck world position is a rig getter the ticker uses for the stream.

### Garnish

Keep `GarnishType`. Map to plates (no current SVG garnishes):

| garnishType       | plates                                      |
|-------------------|---------------------------------------------|
| lime_wheel        | garnish-lime-wheel.png                      |
| cherry            | garnish-cherry.png                          |
| orange_slice      | garnish-orange-slice.png                    |
| grapefruit_wedge  | garnish-grapefruit-wedge.png                |
| salt_rim          | rim-salt.png                                |
| cherry_orange     | garnish-cherry-orange.png                   |
| salt_grapefruit   | rim-salt.png + garnish-grapefruit-wedge.png |
| salt_lime         | rim-salt.png + garnish-lime-wheel.png       |
| rocket            | garnish-rocket.png                          |

Salt (`rim-salt.png`) sits on the front-glass layer from the first
frame. Wheels / wedges / cherry / rocket drop in last.

Unused types (`orange_slice`, `grapefruit_wedge`, `salt_rim` as
standalone) still get plates so the switch stays exhaustive.

## Motion clock

GSAP is the only **story** clock. One timeline per cocktail mount,
started only after `app.init` and `Assets.load` succeed.

`useGSAP` from `@gsap/react` with `revertOnUpdate: true`. On unmount:
abort in-flight `init`/`load`, `timeline.kill()`, `app.destroy(true)`.
Keep the `Assets` cache across drink remounts (`RecipeView` keys on
cocktail name). Destroy the display list, not the texture cache.

Pixi ticker (not a second story clock): write mesh vertices, rope
points, particle physics, ice bob, and displacement-map scroll from
rig uniforms GSAP is already tweening.

### Timing

```text
POUR_INTRO    = 0.2s
POUR_SLOT     = 0.85s   per ingredient
POUR_FINISH   = 0.65s   ice + garnish + method (stirred vortex needs ~0.4s)
SECRET_EXTRA  = 0.40s   Cosmonaut frost + motes, after POUR_FINISH
```

```ts
pourDuration(n, isSecret) =
  POUR_INTRO + n * POUR_SLOT + POUR_FINISH + (isSecret ? SECRET_EXTRA : 0)
```

A three-ingredient drink is **3.4s**. Cosmonaut (4 ingredients, secret)
is **4.65s**. Do not keep the old “under 3.5s for three ingredients”
assertion if FINISH grows; update the test to the formula.

Per ingredient, inside the slot (relative):

| t    | beat                                                         |
|------|--------------------------------------------------------------|
| 0.00 | bottle appears, starts tip; snapshot `{ pouredCount: i + 1, activePour: i, allDone: false }` |
| 0.18 | stream on                                                    |
| 0.20 | fillHeight eases to `(i + 1) / n`                            |
| 0.25 | meniscusAmp up; surface flash of `ingredient.color`          |
| 0.38 | splash at current surface                                    |
| 0.58 | stream off                                                   |
| 0.62 | bottle hidden; snapshot `{ pouredCount: i + 1, activePour: null, allDone: false }` |

`onSnapshot` is fired from `pour-director.ts` via GSAP `call`, not from
the React wrapper. Opening snapshot before slot 0:
`{ pouredCount: 0, activePour: null, allDone: false }`.

Finish (from last slot end):

| t                         | beat                                      |
|---------------------------|-------------------------------------------|
| 0.00                      | ice settle (if `hasIce`)                  |
| +0.12                     | garnish                                   |
| +0.20                     | method uniforms (see below)               |
| + POUR_FINISH             | snapshot `allDone` if not secret          |
| + POUR_FINISH (secret)    | frost + star motes                        |
| + POUR_FINISH + SECRET_EXTRA | snapshot `allDone` for Cosmonaut       |

Method uniforms (liquid, not glass rotation):

| method  | uniform              | duration | ease        |
|---------|----------------------|----------|-------------|
| shaken  | swirl 0.4 → 0        | 0.28s    | power2.out  |
| stirred | vortex 1.0 → 0       | 0.40s    | sine.inOut  |
| built   | none                 | 0        | —           |

`PourSnapshot` stays `{ pouredCount, activePour, allDone }`.
`RecipeView` keeps highlighting ingredients from `pouredCount`.
`onPourComplete` still fires once when `allDone` becomes true.

Reduced motion: after assets load, `rig.applyFinished(cocktail)`, emit
`{ pouredCount: n, activePour: null, allDone: true }`, empty timeline,
then append the canvas. Same contract as today, but never on an empty
WebGL view.

If `app.init` or `Assets.load` fails, or WebGL is unavailable: show a
CSS still (glass PNG + `cocktail.color` fill) and emit `allDone`. Do
not leave a blank canvas.

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
  index.tsx                 select / unlock / XP. Keep cosmonaut-glow CSS.
  data.ts                   recipes, colors, garnish, method.
                            Delete SVG-only exports: WAVE_PATH,
                            ICE_POSITIONS, BUBBLE_SETS,
                            CONDENSATION_DROPS, GLASS_CONFIGS.
  types.ts                  Cocktail, MixMethod, GarnishType (keep)
  hooks.ts                  keep useCocktailProgress only.
                            Delete usePourSequence.
  glass-bounds.ts           NEW: GLASS_BOUNDS + ICE_LAYOUT (pure)
  pour-script.ts            NEW: pure timing + snapshot schedule
  pixi/
    bar-stage.tsx           NEW: React wrapper
    application.ts          NEW: init / load / destroy + abort
    rig.ts                  NEW: display list + uniform setters
    pour-director.ts        NEW: GSAP timeline → rig uniforms
    liquid.ts               NEW: MeshPlane + fill
    stream.ts               NEW: MeshRope
    particles.ts            NEW: splash / foam / motes
    assets.ts               NEW: texture keys + load
  assets/                   NEW: PNG plates (see Asset pack)
  components/recipe-view.tsx   GlassScene → BarStage
  components/recipe-details.tsx keep
  components/selection-grid.tsx keep (SVG card icons OK)
  svg/card-icons.tsx        keep for the grid
  svg/glasses.tsx           delete with the SVG stage
  svg/bottles.tsx           delete
  svg/garnishes.tsx         delete
  svg/decorations.tsx       delete
  glass-scene.tsx           delete after BarStage lands
  pour-timeline.ts          delete after pour-script + director land
  components/glass-visualization.tsx  unused; delete
  components/cosmonaut-reveal.tsx     unused; delete
  __tests__/pour-timeline.test.ts     replace with pour-script.test.ts
  __tests__/pour-sequence.test.ts     delete with usePourSequence
```

`BarStage` props (same contract as `GlassScene`):

```ts
{
  cocktail: Cocktail;
  reducedMotion: boolean;
  onSnapshot: (snapshot: PourSnapshot) => void;
}
```

Wrapper: `data-testid="bar-stage"`, `role="img"`,
`aria-label="{cocktail.name}"`. Update mixer tests off `glass-scene`.

`demo-loader.tsx` stays `next/dynamic(..., { ssr: false })`. Pixi loads
only on `/work/cocktail-mixer`.

Keep `cosmonaut-glow` on the Cosmonaut grid card. Delete `wave-drift`
and `condensation-drip` from `WAVE_STYLES`. Condensation on the Pixi
glass is static dots, not a CSS keyframe. If `WAVE_STYLES` shrinks to
only `cosmonaut-glow`, keep injecting it from `index.tsx`.

## Asset pack

All pour-stage art lives under
`src/components/demos/cocktail-mixer/assets/` as 2x PNG. Stage CSS:
**280×420**. Glass plates: 400×600 (2× the 200×300 content rect).

Required files:

```text
bar-top.png
glass-rocks-back.png
glass-rocks-front.png
glass-rocks-mask.png
glass-highball-back.png
glass-highball-front.png
glass-highball-mask.png
glass-coupe-back.png
glass-coupe-front.png
glass-coupe-mask.png
glass-margarita-back.png
glass-margarita-front.png
glass-margarita-mask.png
ice-cube.png
bottle.png              (near-white, tinted in code)
stream.png              (8×64 highlight strip)
displace-noise.png      (DisplacementFilter map)
frost.png               (Cosmonaut coupe overlay)
condensation-dot.png
rim-highlight.png       (blurred highlight sprite; not a bloom filter)
garnish-lime-wheel.png
garnish-cherry.png
garnish-orange-slice.png
garnish-grapefruit-wedge.png
garnish-cherry-orange.png
garnish-rocket.png
rim-salt.png
splash-dot.png
star-mote.png
```

Meniscus texture is codegen from fill color. Do not add a meniscus PNG.

Palette: warm wood bar, cool glass, liquid tints from data. No emoji on
the stage (`cocktail.emoji` stays on cards only).

One key light, camera-left, on every plate. Do not ship mismatched
lighting.

## Pixi bootstrap (v8)

Constructor options are deprecated. Required sequence in `BarStage`:

1. `const app = new Application()`
2. `await app.init({ width: 280, height: 420, resolution: Math.min(2, devicePixelRatio), backgroundAlpha: 0, antialias: true, autoDensity: true })`
   — do **not** `resizeTo` the window
3. `await Assets.load(...)` (cache hits on remount)
4. Build rig. If `reducedMotion`, `rig.applyFinished(cocktail)` and emit
   `allDone` **before** appending the canvas
5. Append `app.canvas`. Start GSAP only if motion is allowed
6. Unmount: abort if still on step 2–3; else kill timeline and
   `app.destroy(true)`

React Strict Mode will mount/unmount/mount. The abort token must ignore
the first `init` resolving after unmount so it cannot leak a ticker.

## Performance

- One `Application` per `BarStage` mount.
- Canvas CSS size ≤ 280×420, fluid down to 320px pages.
- Particle caps above. No displacement when reduced motion.
- If the ticker reports `< 50fps` for 30 consecutive frames, drop
  displacement and hide `rim-highlight.png`. Keep the pour.
- Do not add `@pixi/filter-*`. Core `BlurFilter` is unused; the highlight
  is a sprite. Core `DisplacementFilter` only.
- Do not import Pixi from the root layout.

## Reduced motion and a11y

- `useReducedMotion()` from `motion/react` (already used in `RecipeView`).
- Finished painted still after load. Recipe list shows every ingredient
  as poured (`pouredCount === n`).
- Canvas `role="img"` and `aria-label` with the cocktail name.
- Keyboard: Back to drinks unchanged. No canvas key traps.
- 320px: stage stacks above recipe, same grid as today.

## Tests

jsdom cannot prove the wow bar. Split what tests can prove.

Pure (jsdom, no Pixi):

- `pour-script.ts`: `pourDuration(n, isSecret)` matches the formula;
  snapshot times include `pouredCount: i + 1` at slot start; reduced
  motion emits `allDone` immediately; Cosmonaut extra beat exists and
  `allDone` is after it; ice skipped when `hasIce` is false.
- `glass-bounds.ts`: every `GlassType` has `liquidTop < liquidBottom`;
  rocks/highball `hasIce`, coupe/margarita not.
- `cocktail-data.test.ts`: drop `GLASS_CONFIGS`; assert `cocktail.glass`
  against `GlassType` / `GLASS_BOUNDS` keys. Keep recipe integrity tests.

React:

- `RecipeView` still calls `onPourComplete` once when the snapshot
  completes (mock `BarStage` if Pixi cannot init).
- `data-testid="bar-stage"` (not `glass-scene`).
- Delete `pour-timeline.test.ts` and `pour-sequence.test.ts`. Do not
  assert GSAP tweens on `[data-pour="glass"]` — that was the cartoon
  tilt this spec forbids. Method tests, if any, assert shaken/stirred
  set liquid uniforms and built does not.

Do not add WebGL screenshot tests in Vitest. Visual proof is a browser
pass on `/work/cocktail-mixer` for:

- Margarita (shaken, salt rim from frame one, no ice)
- Old Fashioned (stirred vortex on liquid, rocks, ice stays in the bowl)
- Paloma (built, highball, soda foam **still there** when paused)
- Whiskey Sour (shaken, coupe, no ice)
- Cosmonaut after unlock (frost + star motes, then still; XP after)
- 320px width
- `prefers-reduced-motion: reduce` (finished still, first painted frame)

## Dependencies

Add:

```text
pixi.js  ^8.8.0
```

Keep:

```text
gsap
@gsap/react
```

Do not add `pixi-filters`, `@pixi/particle-emitter`, Rive, or extra
Three wrappers for this demo.

## Implementation order (after this spec is approved)

1. `glass-bounds.ts` + `pour-script.ts` + tests (TDD). No Pixi yet.
2. Asset plates for rocks (back, front, mask) + `BarStage` hello
   (v8 `init` / load / destroy, static still).
3. Liquid mesh + stream + ice spawn-inside on rocks.
4. Remaining three glasses + garnishes + bottle + salt overlay.
5. `pour-director.ts` GSAP wired to rig uniforms. Delete SVG
   `glass-scene` / `pour-timeline` / `usePourSequence`.
6. Method uniforms + Cosmonaut extra + fps fallback + WebGL failure
   still.
7. `npm test` + `npm run build` + browser pass on the drinks listed
   under Tests.

Do not start this list until the spec file is approved.

## Success

The Cosmonaut’s Bar pour looks like someone iterated a 2D cabinet piece
until it was done. Pause it: it still looks like a painted cocktail, not
a tween. Not a 3D gin ad. Not another SVG spike.

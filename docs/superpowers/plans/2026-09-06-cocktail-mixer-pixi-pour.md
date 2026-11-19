# Cocktail Mixer Pixi Pour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SVG GSAP pour on `/work/cocktail-mixer` with a painted PixiJS v8 stage conducted by a GSAP story clock, without changing recipes, unlock, or XP.

**Architecture:** Pure `pour-script.ts` emits timed cues and `PourSnapshot`s. `BarStage` `await`s Pixi `Application.init` + `Assets.load`, then mounts `PourDirector` (the only `useGSAP` caller). A Pixi `rig` applies uniforms on the ticker. WebGL failure and reduced motion share `applyFinished` / a CSS still. Selection-grid SVG card icons stay.

**Tech Stack:** Next.js 15 App Router, React 19, PixiJS `^8.8.0`, `gsap` + `@gsap/react` (already in the mixer), Vitest + Testing Library, `sharp` (devDep) to rasterize plates.

**Spec:** `docs/superpowers/specs/2026-09-05-cocktail-mixer-pixi-pour-design.md`

## Global Constraints

- Add **only** `pixi.js ^8.8.0`. Do not add `pixi-filters`, `@pixi/particle-emitter`, Rive, or Three wrappers.
- Do not import Pixi from the root layout. The demo stays `next/dynamic(..., { ssr: false })` in `src/components/demos/demo-loader.tsx`.
- Do not go 3D. Do not polish the current SVG glasses as the pour picture.
- Recipes, Cosmonaut unlock, XP, localStorage (`useCocktailProgress`) stay.
- GSAP is the story clock. Pixi ticker only applies uniforms (vertices, ropes, particles).
- Finished liquid is `cocktail.color` (one volume). No stacked ingredient bands.
- Two `MeshRope`s: air neck→rim (unmasked), inner rim→surface (interior mask group).
- `stream.png` is **128×8** at resolution 2 (4px CSS thick). Never 8×64.
- `PourDirector` mounts only when Pixi is `ready`. Reduced motion never mounts it.
- `app.destroy({ removeView: true }, { children: true, texture: false, textureSource: false })`.
- Canvas CSS: `width: 100%; max-width: 280px; height: auto`. Stage 280×420.
- Exhaustive `switch` on `GarnishType` / `MixMethod` with a `never` default.
- Path alias `@/*` → `./src/*`. Commands: `npx vitest run <file>`, `npm test`, `npm run build`.
- Commit on this branch (`cursor/cocktail-mixer-pixi-pour-5c83`). Do not commit to main until the pour is done.

## File map

```text
src/components/demos/cocktail-mixer/
  glass-bounds.ts            Task 1
  pour-script.ts             Task 2
  garnish-map.ts             Task 3
  pixi/application.ts        Task 5
  pixi/assets.ts             Task 5
  pixi/bar-stage.tsx         Task 5, extended 6–10
  pixi/css-still.tsx         Task 5
  pixi/liquid.ts             Task 6
  pixi/stream.ts             Task 6
  pixi/particles.ts          Task 7
  pixi/rig.ts                Task 6–7
  pixi/pour-director.tsx     Task 8
  assets/*.png               Task 4
scripts/generate-mixer-plates.ts  Task 4
```

Delete after Task 9: `glass-scene.tsx`, `pour-timeline.ts`, `svg/glasses.tsx`, `svg/bottles.tsx`, `svg/garnishes.tsx`, `svg/decorations.tsx`, `components/glass-visualization.tsx`, `components/cosmonaut-reveal.tsx`, `__tests__/pour-timeline.test.ts`, `__tests__/pour-sequence.test.ts`, `usePourSequence` in `hooks.ts`.

Keep: `svg/card-icons.tsx`, `index.tsx` behavior, `data.ts` recipes, `components/selection-grid.tsx`, `components/recipe-details.tsx`.

---

### Task 1: Glass bounds (pure)

**Files:**
- Create: `src/components/demos/cocktail-mixer/glass-bounds.ts`
- Create: `src/components/demos/cocktail-mixer/__tests__/glass-bounds.test.ts`

**Interfaces:**
- Consumes: `GlassType` from `./types`
- Produces: `STAGE`, `GLASS_RECT`, `GlassBounds`, `IceCube`, `GLASS_BOUNDS`, `ICE_LAYOUT`, `CONDENSATION_LAYOUT`

- [ ] **Step 1: Write the failing test**

```ts
/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  GLASS_BOUNDS,
  ICE_LAYOUT,
  CONDENSATION_LAYOUT,
  STAGE,
  GLASS_RECT,
} from "../glass-bounds";
import type { GlassType } from "../types";

const TYPES: GlassType[] = ["rocks", "highball", "coupe", "margarita"];

describe("glass-bounds", () => {
  it("defines a 280×420 stage and a 200×300 glass rect", () => {
    expect(STAGE).toEqual({ width: 280, height: 420 });
    expect(GLASS_RECT).toEqual({ x: 40, y: 48, width: 200, height: 300 });
  });

  it.each(TYPES)("%s has liquidTop < liquidBottom and rimY ≤ liquidTop", (type) => {
    const b = GLASS_BOUNDS[type];
    expect(b.liquidTop).toBeLessThan(b.liquidBottom);
    expect(b.rimY).toBeLessThanOrEqual(b.liquidTop);
    expect(b.bowlWidth).toBeGreaterThan(0);
  });

  it("gives ice only to rocks and highball", () => {
    expect(GLASS_BOUNDS.rocks.hasIce).toBe(true);
    expect(GLASS_BOUNDS.highball.hasIce).toBe(true);
    expect(GLASS_BOUNDS.coupe.hasIce).toBe(false);
    expect(GLASS_BOUNDS.margarita.hasIce).toBe(false);
    expect(ICE_LAYOUT.rocks).toHaveLength(2);
    expect(ICE_LAYOUT.highball).toHaveLength(3);
  });

  it("places bottle neck in local sprite space, not stage 100,40", () => {
    for (const type of TYPES) {
      expect(GLASS_BOUNDS[type].bottle.neckX).toBeLessThan(48);
      expect(GLASS_BOUNDS[type].bottle.neckY).toBeLessThan(48);
    }
  });

  it("has condensation dots for every glass", () => {
    for (const type of TYPES) {
      expect(CONDENSATION_LAYOUT[type].length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/glass-bounds.test.ts`

Expected: FAIL — `glass-bounds` is not defined.

- [ ] **Step 3: Implement `glass-bounds.ts`**

Copy the seed tables verbatim from the spec (`STAGE`, `GLASS_RECT`, `GLASS_BOUNDS`, `ICE_LAYOUT`, `CONDENSATION_LAYOUT`). Export:

```ts
import type { GlassType } from "./types";

export const STAGE = { width: 280, height: 420 } as const;
export const GLASS_RECT = { x: 40, y: 48, width: 200, height: 300 } as const;

export type IceCube = {
  dx: number;
  dy: number;
  angle: number;
  scale: number;
};

export type GlassBounds = {
  liquidTop: number;
  liquidBottom: number;
  rimY: number;
  bowlCenterX: number;
  bowlWidth: number;
  hasIce: boolean;
  garnishX: number;
  garnishY: number;
  bottle: { x: number; y: number; neckX: number; neckY: number };
};
```

Fill `GLASS_BOUNDS`, `ICE_LAYOUT`, `CONDENSATION_LAYOUT` with the spec numbers. `ICE_LAYOUT` is `Record<"rocks" | "highball", IceCube[]>`.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/glass-bounds.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/glass-bounds.ts src/components/demos/cocktail-mixer/__tests__/glass-bounds.test.ts
git commit -m "feat: add cocktail mixer glass bounds"
```

---

### Task 2: Pour script (pure clock)

**Files:**
- Create: `src/components/demos/cocktail-mixer/pour-script.ts`
- Create: `src/components/demos/cocktail-mixer/__tests__/pour-script.test.ts`

**Interfaces:**
- Consumes: nothing from Pixi. `hasIce` / `isSecret` / `ingredientCount` are arguments.
- Produces: `POUR_INTRO`, `POUR_SLOT`, `POUR_FINISH`, `SECRET_EXTRA`, `PourSnapshot`, `PourCue`, `pourDuration`, `buildPourCues`

- [ ] **Step 1: Write the failing test**

```ts
/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  POUR_FINISH,
  POUR_INTRO,
  POUR_SLOT,
  SECRET_EXTRA,
  buildPourCues,
  pourDuration,
} from "../pour-script";

describe("pour-script", () => {
  it("matches the duration formula", () => {
    expect(pourDuration(3, false)).toBeCloseTo(
      POUR_INTRO + 3 * POUR_SLOT + POUR_FINISH
    );
    expect(pourDuration(3, false)).toBeCloseTo(3.4);
    expect(pourDuration(4, true)).toBeCloseTo(
      POUR_INTRO + 4 * POUR_SLOT + POUR_FINISH + SECRET_EXTRA
    );
    expect(pourDuration(4, true)).toBeCloseTo(4.65);
  });

  it("increments pouredCount at each slot start", () => {
    const cues = buildPourCues({
      ingredientCount: 3,
      hasIce: false,
      isSecret: false,
      reducedMotion: false,
    });
    const snaps = cues.filter((c) => c.kind === "snapshot").map((c) => c.snapshot);
    expect(snaps[0]).toEqual({
      pouredCount: 0,
      activePour: null,
      allDone: false,
    });
    expect(snaps.some((s) => s?.pouredCount === 1 && s.activePour === 0)).toBe(
      true
    );
    expect(snaps.at(-1)).toEqual({
      pouredCount: 3,
      activePour: null,
      allDone: true,
    });
  });

  it("emits allDone immediately for reduced motion", () => {
    const cues = buildPourCues({
      ingredientCount: 3,
      hasIce: true,
      isSecret: true,
      reducedMotion: true,
    });
    expect(cues).toEqual([
      {
        at: 0,
        kind: "snapshot",
        snapshot: { pouredCount: 3, activePour: null, allDone: true },
      },
    ]);
  });

  it("skips ice cues when hasIce is false", () => {
    const noIce = buildPourCues({
      ingredientCount: 2,
      hasIce: false,
      isSecret: false,
      reducedMotion: false,
    });
    const iced = buildPourCues({
      ingredientCount: 2,
      hasIce: true,
      isSecret: false,
      reducedMotion: false,
    });
    expect(noIce.some((c) => c.kind === "ice")).toBe(false);
    expect(iced.some((c) => c.kind === "ice")).toBe(true);
  });

  it("places Cosmonaut allDone after SECRET_EXTRA", () => {
    const cues = buildPourCues({
      ingredientCount: 4,
      hasIce: false,
      isSecret: true,
      reducedMotion: false,
    });
    const secret = cues.find((c) => c.kind === "secret");
    const done = cues.find((c) => c.kind === "done");
    expect(secret).toBeTruthy();
    expect(done?.at).toBeCloseTo(pourDuration(4, true));
    expect(done?.at).toBeGreaterThan(secret!.at);
    expect(done?.snapshot?.allDone).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/pour-script.test.ts`

Expected: FAIL — module missing.

- [ ] **Step 3: Implement `pour-script.ts`**

```ts
export const POUR_INTRO = 0.2;
export const POUR_SLOT = 0.85;
export const POUR_FINISH = 0.65;
export const SECRET_EXTRA = 0.4;

export interface PourSnapshot {
  pouredCount: number;
  activePour: number | null;
  allDone: boolean;
}

export type PourCueKind =
  | "snapshot"
  | "bottleTip"
  | "streamOn"
  | "fill"
  | "meniscus"
  | "splash"
  | "streamOff"
  | "bottleHide"
  | "ice"
  | "garnish"
  | "method"
  | "secret"
  | "done";

export interface PourCue {
  at: number;
  kind: PourCueKind;
  ingredientIndex?: number;
  snapshot?: PourSnapshot;
}

export function pourDuration(
  ingredientCount: number,
  isSecret = false
): number {
  return (
    POUR_INTRO +
    ingredientCount * POUR_SLOT +
    POUR_FINISH +
    (isSecret ? SECRET_EXTRA : 0)
  );
}

export function buildPourCues({
  ingredientCount,
  hasIce,
  isSecret,
  reducedMotion,
}: {
  ingredientCount: number;
  hasIce: boolean;
  isSecret: boolean;
  reducedMotion: boolean;
}): PourCue[] {
  const n = ingredientCount;
  const doneSnap: PourSnapshot = {
    pouredCount: n,
    activePour: null,
    allDone: true,
  };
  if (reducedMotion) {
    return [{ at: 0, kind: "snapshot", snapshot: doneSnap }];
  }

  const cues: PourCue[] = [
    {
      at: 0,
      kind: "snapshot",
      snapshot: { pouredCount: 0, activePour: null, allDone: false },
    },
  ];

  for (let i = 0; i < n; i++) {
    const at = POUR_INTRO + i * POUR_SLOT;
    cues.push(
      {
        at,
        kind: "snapshot",
        ingredientIndex: i,
        snapshot: { pouredCount: i + 1, activePour: i, allDone: false },
      },
      { at, kind: "bottleTip", ingredientIndex: i },
      { at: at + 0.18, kind: "streamOn", ingredientIndex: i },
      { at: at + 0.2, kind: "fill", ingredientIndex: i },
      { at: at + 0.25, kind: "meniscus", ingredientIndex: i },
      { at: at + 0.38, kind: "splash", ingredientIndex: i },
      { at: at + 0.58, kind: "streamOff", ingredientIndex: i },
      {
        at: at + 0.62,
        kind: "bottleHide",
        ingredientIndex: i,
        snapshot: { pouredCount: i + 1, activePour: null, allDone: false },
      }
    );
  }

  const finishAt = POUR_INTRO + n * POUR_SLOT;
  if (hasIce) cues.push({ at: finishAt, kind: "ice" });
  cues.push({ at: finishAt + 0.12, kind: "garnish" });
  cues.push({ at: finishAt + 0.2, kind: "method" });
  if (isSecret) {
    cues.push({ at: finishAt + POUR_FINISH, kind: "secret" });
    cues.push({
      at: finishAt + POUR_FINISH + SECRET_EXTRA,
      kind: "done",
      snapshot: doneSnap,
    });
  } else {
    cues.push({
      at: finishAt + POUR_FINISH,
      kind: "done",
      snapshot: doneSnap,
    });
  }
  return cues;
}
```

Slot relative times must match the spec table (0.00 / 0.18 / 0.20 / 0.25 / 0.38 / 0.58 / 0.62). `bottleHide` also carries the `activePour: null` snapshot.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/pour-script.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/pour-script.ts src/components/demos/cocktail-mixer/__tests__/pour-script.test.ts
git commit -m "feat: add mixer pour cue script"
```

---

### Task 3: Garnish map, foam rule, data tests

**Files:**
- Create: `src/components/demos/cocktail-mixer/garnish-map.ts`
- Create: `src/components/demos/cocktail-mixer/__tests__/garnish-map.test.ts`
- Modify: `src/components/demos/cocktail-mixer/__tests__/cocktail-data.test.ts`

**Interfaces:**
- Consumes: `GarnishType`, `GlassType` from `./types`
- Produces: `garnishPlates(type, glass)`, `SODA_INGREDIENT_NAME`, `isFoamIngredient(name)`

- [ ] **Step 1: Write failing garnish/foam tests**

```ts
/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  garnishPlates,
  isFoamIngredient,
  SODA_INGREDIENT_NAME,
} from "../garnish-map";
import { COCKTAILS, THE_COSMONAUT } from "../data";

describe("garnish-map", () => {
  it("puts salt on from the first frame for salt_* types", () => {
    expect(garnishPlates("salt_lime", "margarita")).toEqual([
      "rim-salt-margarita.png",
      "garnish-lime-wheel.png",
    ]);
    expect(garnishPlates("salt_grapefruit", "highball")).toEqual([
      "rim-salt-highball.png",
      "garnish-grapefruit-wedge.png",
    ]);
  });

  it("maps rocket for the Cosmonaut", () => {
    expect(garnishPlates("rocket", "coupe")).toEqual(["garnish-rocket.png"]);
  });

  it("foams only Grapefruit Soda, not Salty Dog juice", () => {
    expect(SODA_INGREDIENT_NAME).toBe("Grapefruit Soda");
    const paloma = COCKTAILS.find((c) => c.name === "Paloma")!;
    const dog = COCKTAILS.find((c) => c.name === "Salty Dog")!;
    expect(paloma.ingredients.some((i) => isFoamIngredient(i.name))).toBe(true);
    expect(dog.ingredients.some((i) => isFoamIngredient(i.name))).toBe(false);
    expect(THE_COSMONAUT.ingredients.some((i) => isFoamIngredient(i.name))).toBe(
      false
    );
  });
});
```

In `cocktail-data.test.ts` replace `GLASS_CONFIGS` with `GLASS_BOUNDS`:

```ts
import { GLASS_BOUNDS } from "../glass-bounds";
const VALID_GLASSES = Object.keys(GLASS_BOUNDS);
```

Replace the “glass configs have valid liquid ranges” test with:

```ts
it("every cocktail glass exists in GLASS_BOUNDS", () => {
  for (const c of ALL_COCKTAILS) {
    expect(GLASS_BOUNDS[c.glass]).toBeDefined();
  }
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/garnish-map.test.ts src/components/demos/cocktail-mixer/__tests__/cocktail-data.test.ts`

Expected: garnish-map FAIL (missing module). cocktail-data FAIL if you already swapped the import; otherwise do the swap in Step 3.

- [ ] **Step 3: Implement `garnish-map.ts`**

```ts
import type { GarnishType, GlassType } from "./types";

export const SODA_INGREDIENT_NAME = "Grapefruit Soda";

export function isFoamIngredient(name: string): boolean {
  return name === SODA_INGREDIENT_NAME;
}

function saltPlate(glass: GlassType): string {
  switch (glass) {
    case "margarita":
      return "rim-salt-margarita.png";
    case "highball":
      return "rim-salt-highball.png";
    case "rocks":
    case "coupe":
      return "rim-salt-highball.png";
    default: {
      const _exhaustive: never = glass;
      return _exhaustive;
    }
  }
}

export function garnishPlates(
  type: GarnishType,
  glass: GlassType
): string[] {
  switch (type) {
    case "lime_wheel":
      return ["garnish-lime-wheel.png"];
    case "cherry":
      return ["garnish-cherry.png"];
    case "orange_slice":
      return ["garnish-orange-slice.png"];
    case "grapefruit_wedge":
      return ["garnish-grapefruit-wedge.png"];
    case "salt_rim":
      return [saltPlate(glass)];
    case "cherry_orange":
      return ["garnish-cherry-orange.png"];
    case "salt_grapefruit":
      return [saltPlate(glass), "garnish-grapefruit-wedge.png"];
    case "salt_lime":
      return [saltPlate(glass), "garnish-lime-wheel.png"];
    case "rocket":
      return ["garnish-rocket.png"];
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
```

Then apply the `cocktail-data.test.ts` import swap.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/garnish-map.test.ts src/components/demos/cocktail-mixer/__tests__/cocktail-data.test.ts`

Expected: PASS. `GLASS_CONFIGS` may still exist in `data.ts` until Task 9; tests must not import it.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/garnish-map.ts src/components/demos/cocktail-mixer/__tests__/garnish-map.test.ts src/components/demos/cocktail-mixer/__tests__/cocktail-data.test.ts
git commit -m "feat: map mixer garnishes and Paloma foam"
```

---

### Task 4: `pixi.js` + painted plates

**Files:**
- Modify: `package.json` (add `pixi.js`)
- Create: `scripts/generate-mixer-plates.ts`
- Create: `src/components/demos/cocktail-mixer/assets/` (PNG output)
- Modify: `package.json` scripts — `"plates:mixer": "npx tsx scripts/generate-mixer-plates.ts"`

**Interfaces:**
- Produces: every file listed in the spec Asset pack, plus `ASSETS` keys in Task 5.

- [ ] **Step 1: Install Pixi**

```bash
npm install pixi.js@^8.8.0
```

Confirm `package.json` has `"pixi.js": "^8.8.0"` (or a resolved 8.8.x / 8.9.x). Do not add other Pixi packages.

- [ ] **Step 2: Write `scripts/generate-mixer-plates.ts`**

Use `sharp` (already a devDependency) to rasterize inline SVGs. Requirements the script must meet:

- Glass plates **400×600**. Interior of the bowl is **fully transparent** on back and front. Mask PNG: opaque white = interior hole, transparent = glass/stem/outside. Align the hole to the painted bowl.
- One key light, camera-left. Warm `#3a2418` bar, cool glass `#cfe8f4` rims, no emoji.
- `bar-top.png` 560×840 (or 280×420 @2x) with a baked caustic strip under the bowl — no extra caustic file.
- `stream.png` **128×8** (not 8×64). Soft white-to-transparent highlight.
- `bottle.png` near-white 96×192 (2× of 48×96).
- `displace-noise.png` 128×128 grayscale noise.
- `rim-salt-margarita.png` wide arc; `rim-salt-highball.png` tall thin arc.
- Dots: `splash-dot.png`, `foam-dot.png` (softer), `star-mote.png`, `condensation-dot.png`, `ice-cube.png`, `frost.png`, `rim-highlight.png`, garnish plates named exactly as the spec.

Put output in `src/components/demos/cocktail-mixer/assets/`. Do not commit 1.5px line-art glasses.

Include a `main()` that writes every spec filename and `console.log`s the list.

- [ ] **Step 3: Run the generator**

```bash
npx tsx scripts/generate-mixer-plates.ts
ls src/components/demos/cocktail-mixer/assets | wc -l
```

Expected: all spec files present (29 names in the spec asset list). `stream.png` identified via `file` / sharp metadata as width > height.

- [ ] **Step 4: Smoke-check stream orientation**

```bash
npx tsx -e "import sharp from 'sharp'; const i = await sharp('src/components/demos/cocktail-mixer/assets/stream.png').metadata(); if (!i.width || !i.height || i.width < i.height * 4) { console.error(i); process.exit(1); } console.log(i.width, i.height);"
```

Expected: prints `128 8` (or 256 16). Exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/generate-mixer-plates.ts src/components/demos/cocktail-mixer/assets
git commit -m "feat: add pixi.js and mixer pour plates"
```

---

### Task 5: Application, asset loader, BarStage shell, CSS still

**Files:**
- Create: `src/components/demos/cocktail-mixer/pixi/assets.ts`
- Create: `src/components/demos/cocktail-mixer/pixi/application.ts`
- Create: `src/components/demos/cocktail-mixer/pixi/css-still.tsx`
- Create: `src/components/demos/cocktail-mixer/pixi/bar-stage.tsx`
- Create: `src/components/demos/cocktail-mixer/__tests__/bar-stage.test.tsx`
- Modify: `src/components/demos/cocktail-mixer/components/recipe-view.tsx` (swap import; keep working if tests need a stage)

**Interfaces:**
- Consumes: `Cocktail`, `PourSnapshot`, `STAGE`, plates from `assets/`
- Produces: `createMixerApp()`, `destroyMixerApp(app)`, `loadMixerAssets()`, `BarStage` props `{ cocktail, reducedMotion, onSnapshot }`

Pixi constructors live behind **dynamic import inside `useEffect`**. Top-level `import "pixi.js"` in `bar-stage.tsx` will crash jsdom mixer tests.

- [ ] **Step 1: Write failing BarStage tests**

```tsx
/** @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BarStage } from "../pixi/bar-stage";
import { COCKTAILS } from "../data";

describe("BarStage", () => {
  it("exposes bar-stage test id and cocktail name", async () => {
    const onSnapshot = vi.fn();
    render(
      <BarStage
        cocktail={COCKTAILS[0]}
        reducedMotion
        onSnapshot={onSnapshot}
      />
    );
    const root = await screen.findByTestId("bar-stage");
    expect(root).toHaveAttribute("aria-label", "Margarita");
    expect(root).toHaveAttribute("role", "img");
    await waitFor(() => {
      expect(onSnapshot).toHaveBeenCalledWith({
        pouredCount: 3,
        activePour: null,
        allDone: true,
      });
    });
  });
});
```

jsdom has no WebGL: this test must pass via the **CSS still** path (`data-testid="bar-stage-css"` inside the wrapper is OK as long as the wrapper is `bar-stage`).

- [ ] **Step 2: Run and verify RED**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/bar-stage.test.tsx`

Expected: FAIL — `BarStage` missing.

- [ ] **Step 3: Implement loader + app + CSS still + BarStage shell**

`pixi/assets.ts` — list every PNG as a `Record<string, string>` of `new URL("../assets/<file>", import.meta.url).href` (or static imports). Export `MIXER_ASSET_URLS` and `async function loadMixerAssets(Assets: typeof import("pixi.js").Assets)`.

`pixi/application.ts`:

```ts
import type { Application } from "pixi.js";
import { STAGE } from "../glass-bounds";

export async function createMixerApp(
  PIXI: typeof import("pixi.js")
): Promise<Application> {
  const app = new PIXI.Application();
  await app.init({
    width: STAGE.width,
    height: STAGE.height,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
  });
  return app;
}

export function destroyMixerApp(app: Application): void {
  app.destroy(
    { removeView: true },
    { children: true, texture: false, textureSource: false }
  );
}
```

`pixi/css-still.tsx` — 280×420 stack: `cocktail.color` fill with `mask-image: url(glass-{type}-mask.png)`, then `glass-{type}-front.png`, salt if `garnishType.startsWith("salt_")`, garnish PNG from `garnishPlates` (skip the salt plate already shown), Paloma foam dots if `cocktail.name === "Paloma"`. No Cosmonaut frost. Wrapper CSS: `width: 100%; max-width: 280px; height: auto`.

`pixi/bar-stage.tsx` (shell for this task):

- Props as spec.
- `useEffect` with `let cancelled = false`.
- Dynamic `import("pixi.js")` → `createMixerApp` → `loadMixerAssets`.
- On failure or `cancelled`, if not cancelled: render CSS still and `onSnapshot({ pouredCount: n, activePour: null, allDone: true })`.
- On success this task: still call `applyFinished` **later** (Task 6). For now, if init succeeds, append `app.canvas`, set `data-testid="bar-stage"`, and if `reducedMotion` emit `allDone` without mounting a director.
- Cleanup: `cancelled = true`; `destroyMixerApp` if app exists.
- Outer: `<div data-testid="bar-stage" role="img" aria-label={cocktail.name} style={{ width: "100%", maxWidth: 280 }} />`

Do not mount `PourDirector` yet.

- [ ] **Step 4: Run BarStage test GREEN**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/bar-stage.test.tsx`

Expected: PASS (CSS still + allDone).

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/pixi src/components/demos/cocktail-mixer/__tests__/bar-stage.test.tsx
git commit -m "feat: mount mixer Pixi stage with CSS still fallback"
```

---

### Task 6: Rig, liquid MeshPlane, two streams, rocks ice

**Files:**
- Create: `src/components/demos/cocktail-mixer/pixi/liquid.ts`
- Create: `src/components/demos/cocktail-mixer/pixi/stream.ts`
- Create: `src/components/demos/cocktail-mixer/pixi/rig.ts`
- Modify: `src/components/demos/cocktail-mixer/pixi/bar-stage.tsx`

**Interfaces:**
- Consumes: `GlassBounds`, cocktail colors, textures from `Assets`
- Produces: `MixerRig` with `uniforms`, `applyFinished(cocktail)`, `setFillHeight(h)`, `setStream(on, color)`, `neckWorld()`, `tick(deltaMs)`, `destroy()`

Uniform object (GSAP tweens these numbers):

```ts
export type MixerUniforms = {
  fillHeight: number;
  fillColor: string;
  flashColor: string;
  flashAmount: number;
  meniscusAmp: number;
  swirl: number;
  vortex: number;
  streamOn: number;
  streamColor: string;
  bottleAngle: number;
  bottleAlpha: number;
  iceAlpha: number;
  garnishAlpha: number;
  frostAlpha: number;
  displacementOn: boolean;
};
```

- [ ] **Step 1: Write a failing uniform/rest-pose unit test (no WebGL)**

Create `src/components/demos/cocktail-mixer/pixi/meniscus.ts` **or** export `writeMeniscusVertices` from `liquid.ts` as a pure function:

```ts
export function writeMeniscusVertices(
  positions: Float32Array,
  cols: number,
  rows: number,
  width: number,
  height: number,
  amp: number,
  swirl: number,
  vortex: number,
  bowlCenterX: number
): void
```

Test: `verticesX: 12`, `verticesY: 8`; at `swirl=0, vortex=0, amp=2` the top row Y varies by ~2px; at `vortex=1` top-row X shifts up to 8px around center; at `swirl=0.4` top-row X jitter magnitude ≤ 3px; lower rows stay on the grid.

```ts
/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import { writeMeniscusVertices } from "../pixi/liquid";

describe("writeMeniscusVertices", () => {
  it("keeps lower rows on the grid and bends only the top row", () => {
    const cols = 12;
    const rows = 8;
    const pos = new Float32Array(cols * rows * 2);
    writeMeniscusVertices(pos, cols, rows, 130, 154, 2, 0, 0, 65);
    const lastRow = (rows - 1) * cols;
    // bottom-left y ≈ height
    expect(pos[lastRow * 2 + 1]).toBeCloseTo(154, 0);
    const topYs = Array.from({ length: cols }, (_, i) => pos[i * 2 + 1]);
    const spread = Math.max(...topYs) - Math.min(...topYs);
    expect(spread).toBeGreaterThan(0);
    expect(spread).toBeLessThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/liquid-vertices.test.ts`

Put the test at `__tests__/liquid-vertices.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement liquid + stream + rig for rocks**

`liquid.ts`: codegen a 64×32 canvas gradient texture from `fillColor` (use `document.createElement("canvas")` in the browser; for vertex tests, `writeMeniscusVertices` must not need DOM). MeshPlane `verticesX: 12`, `verticesY: 8`. DisplacementFilter `scale: { x: 4, y: 4 }`, map `addressMode: "repeat"`, `addChild` the sprite, do not set `visible = false`. Off when `displacementOn` is false.

`stream.ts`: two MeshRopes, 20 points, quadratic sag 6px toward +Y, texture `stream.png`. `rebuild(neck, rimY, surfaceY, on)`.

`rig.ts` display list **back to front** as the spec sandwich. One interior `Container` + one mask sprite (`glass-{type}-mask.png`). Ice sprites from `ICE_LAYOUT` for rocks, `alpha` from `iceAlpha`, already inside the bowl. `applyFinished` sets the spec checklist (fillHeight 1, stream off, bottle hidden, swirl/vortex 0, meniscusAmp rest 2, displacement off, ice visible if hasIce, garnish on, Paloma foam on, frost off).

Wire BarStage success path: `createRig` → if `reducedMotion`, `applyFinished` then emit allDone **before** appending canvas.

- [ ] **Step 4: Run vertex test GREEN and mixer tests**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/liquid-vertices.test.ts src/components/demos/cocktail-mixer/__tests__/bar-stage.test.tsx src/components/demos/cocktail-mixer/__tests__/cocktail-mixer.test.tsx`

Expected: PASS. Mixer tests still use `GlassScene` until Task 8 — they must keep passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/pixi src/components/demos/cocktail-mixer/__tests__/liquid-vertices.test.ts
git commit -m "feat: add mixer liquid mesh, streams, and rocks rig"
```

---

### Task 7: Remaining glasses, garnishes, bottle, salt, particles

**Files:**
- Create: `src/components/demos/cocktail-mixer/pixi/particles.ts`
- Modify: `src/components/demos/cocktail-mixer/pixi/rig.ts`

**Interfaces:**
- Consumes: `garnishPlates`, `isFoamIngredient`, `CONDENSATION_LAYOUT`
- Produces: `emitSplash(x, y, color)`, `pinFoamTo(surfaceY)`, `emitMotes()`, `killEphemeral()` (splash/motes/frost)

- [ ] **Step 1: Write failing foam/salt pure tests**

Extend `garnish-map.test.ts` is already green. Add `src/components/demos/cocktail-mixer/__tests__/particles-policy.test.ts`:

```ts
/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import { shouldEmitFoam, shouldShowSalt } from "../pixi/particles";
import { COCKTAILS } from "../data";

describe("particle policy", () => {
  it("foams Paloma soda pour only", () => {
    const paloma = COCKTAILS.find((c) => c.name === "Paloma")!;
    expect(shouldEmitFoam(paloma, 0)).toBe(false);
    expect(shouldEmitFoam(paloma, 1)).toBe(true);
    expect(shouldEmitFoam(paloma, 2)).toBe(false);
    const dog = COCKTAILS.find((c) => c.name === "Salty Dog")!;
    expect(dog.ingredients.every((_, i) => !shouldEmitFoam(dog, i))).toBe(true);
  });

  it("shows salt when garnishType starts with salt_", () => {
    expect(shouldShowSalt("salt_lime")).toBe(true);
    expect(shouldShowSalt("cherry")).toBe(false);
  });
});
```

Export `shouldEmitFoam` / `shouldShowSalt` from `particles.ts` as pure functions (no Pixi types).

- [ ] **Step 2: Run RED**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/particles-policy.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement particles + rest of rig**

```ts
export function shouldShowSalt(garnishType: string): boolean {
  return garnishType.startsWith("salt_");
}

export function shouldEmitFoam(
  cocktail: Cocktail,
  ingredientIndex: number
): boolean {
  return isFoamIngredient(cocktail.ingredients[ingredientIndex]?.name ?? "");
}
```

ParticleContainer `boundsArea` = `{ x: 0, y: 0, width: 280, height: 420 }` (Pixi `Rectangle`). Splash ≤40, gravity, life <400ms, tint from ingredient, `dynamicProperties.color: true`. Foam ≤20, **no gravity**, pin Y to surface, stay after `allDone` for Paloma. Motes ≤12 + `frost.png` for secret extra, then `killEphemeral`.

Garnish: salt sprite visible from frame one; other garnish `alpha` from `garnishAlpha`. Bottle 48×96, pivot neck, `rotation` from `bottleAngle` (degrees → radians), `alpha` from `bottleAlpha`. Condensation static. `rim-highlight.png` on front glass, camera-left, under salt. Hide highlight if fps fallback flag is set.

- [ ] **Step 4: Run GREEN**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/particles-policy.test.ts src/components/demos/cocktail-mixer/__tests__/garnish-map.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/pixi src/components/demos/cocktail-mixer/__tests__/particles-policy.test.ts
git commit -m "feat: add mixer foam, salt, garnishes, and bottle"
```

---

### Task 8: PourDirector + RecipeView

**Files:**
- Create: `src/components/demos/cocktail-mixer/pixi/pour-director.tsx`
- Modify: `src/components/demos/cocktail-mixer/pixi/bar-stage.tsx`
- Modify: `src/components/demos/cocktail-mixer/components/recipe-view.tsx`
- Create: `src/components/demos/cocktail-mixer/__tests__/recipe-view.test.tsx`

**Interfaces:**
- Consumes: `buildPourCues`, `MixerRig`, `useGSAP` from `../gsap-setup`
- Produces: GSAP timeline from cues; `onSnapshot` via `gsap.call`

Cue → tween map (durations from spec):

| kind | tween |
|------|--------|
| bottleTip | `bottleAlpha` 1, `bottleAngle` 0 → −50, 0.28s `power3.inOut`; set `streamColor` / `flashColor` to ingredient color |
| streamOn | `streamOn` 1 |
| fill | `fillHeight` to `(i+1)/n`, 0.45s `power2.out` |
| meniscus | `meniscusAmp` up, `flashAmount` 1 → 0 over 0.2s |
| splash | `rig.emitSplash(...)` |
| streamOff | `streamOn` 0 |
| bottleHide | `bottleAngle` 0 in 0.16s, then `bottleAlpha` 0 |
| ice | `iceAlpha` 0 → 1, 0.28s |
| garnish | `garnishAlpha` 0 → 1, 0.28s |
| method | shaken: `swirl` 0.4 → 0 in 0.28s `power2.out`; stirred: `vortex` 1 → 0 in 0.40s `sine.inOut`; built: none |
| secret | `frostAlpha` 1 → 0 over 0.4s + `emitMotes()` |
| done | `applyFinished` (keep Paloma foam), snapshot `allDone` |
| snapshot | `onSnapshot(cue.snapshot)` |

GSAP tweens **uniform numbers**. `rig.tick` reads them and writes meshes.

- [ ] **Step 1: Write failing RecipeView test with mocked BarStage**

```tsx
/** @vitest-environment jsdom */
vi.mock("../pixi/bar-stage", () => ({
  BarStage: ({
    onSnapshot,
    cocktail,
  }: {
    onSnapshot: (s: { pouredCount: number; activePour: null; allDone: boolean }) => void;
    cocktail: { ingredients: unknown[] };
  }) => {
    useEffect(() => {
      onSnapshot({
        pouredCount: cocktail.ingredients.length,
        activePour: null,
        allDone: true,
      });
    }, [cocktail, onSnapshot]);
    return <div data-testid="bar-stage" />;
  },
}));
```

Assert `onPourComplete` fires once. Import `useEffect` in the mock factory file via a real test component pattern: prefer injecting by rendering `RecipeView` with the mock module.

- [ ] **Step 2: Run RED** (RecipeView still imports GlassScene — mock unused, complete callback may still depend on GlassScene/GSAP)

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/recipe-view.test.tsx`

Expected: FAIL until RecipeView imports BarStage.

- [ ] **Step 3: Implement PourDirector and swap RecipeView**

`pour-director.tsx`:

```tsx
"use client";
import { useGSAP, gsap } from "../gsap-setup";
import { buildPourCues } from "../pour-script";
import type { MixerRig } from "./rig";
import type { Cocktail } from "../types";
import type { PourSnapshot } from "../pour-script";
import { GLASS_BOUNDS } from "../glass-bounds";

export function PourDirector({
  cocktail,
  rig,
  onSnapshot,
}: {
  cocktail: Cocktail;
  rig: MixerRig;
  onSnapshot: (s: PourSnapshot) => void;
}) {
  useGSAP(
    () => {
      const cues = buildPourCues({
        ingredientCount: cocktail.ingredients.length,
        hasIce: GLASS_BOUNDS[cocktail.glass].hasIce,
        isSecret: Boolean(cocktail.isSecret),
        reducedMotion: false,
      });
      const tl = gsap.timeline();
      for (const cue of cues) {
        // switch (cue.kind) with never default — map table above
      }
      return () => tl.kill();
    },
    { dependencies: [cocktail.name], revertOnUpdate: true }
  );
  return null;
}
```

`BarStage`: when `ready && !reducedMotion && rig`, render `<PourDirector cocktail={cocktail} rig={rig} onSnapshot={onSnapshot} />`. Ticker: `app.ticker.add(() => rig.tick(app.ticker.deltaMS))`. After done, freeze displacement / kill ephemeral as `applyFinished`.

`recipe-view.tsx`: import `BarStage` from `../pixi/bar-stage` and `PourSnapshot` from `../pour-script`. Replace `GlassScene`. Keep `useReducedMotion`.

- [ ] **Step 4: Run GREEN**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/recipe-view.test.tsx src/components/demos/cocktail-mixer/__tests__/cocktail-mixer.test.tsx src/components/demos/cocktail-mixer/__tests__/bar-stage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/pixi/pour-director.tsx src/components/demos/cocktail-mixer/pixi/bar-stage.tsx src/components/demos/cocktail-mixer/components/recipe-view.tsx src/components/demos/cocktail-mixer/__tests__/recipe-view.test.tsx
git commit -m "feat: drive mixer pour with GSAP director"
```

---

### Task 9: Delete SVG pour stack

**Files:**
- Delete: `glass-scene.tsx`, `pour-timeline.ts`, `svg/glasses.tsx`, `svg/bottles.tsx`, `svg/garnishes.tsx`, `svg/decorations.tsx`, `components/glass-visualization.tsx`, `components/cosmonaut-reveal.tsx`, `__tests__/pour-timeline.test.ts`, `__tests__/pour-sequence.test.ts`
- Modify: `hooks.ts` (remove `usePourSequence` and pour constants; keep `useCocktailProgress`)
- Modify: `data.ts` (remove `GLASS_CONFIGS`, `WAVE_PATH`, `generateWavePath`, `ICE_POSITIONS`, `BUBBLE_SETS`, `CONDENSATION_DROPS`; keep `WAVE_STYLES` as **only** `cosmonaut-glow`)
- Modify: `gsap-setup.ts` (keep `gsap` + `useGSAP`; drop DrawSVG, MorphSVG, Physics2D, Flip, CustomWiggle unless still imported)
- Modify: `types.ts` (remove `GlassConfig` if unused)
- Modify: `index.tsx` (still injects `WAVE_STYLES`)

- [ ] **Step 1: Run tests that still import deleted modules — expect RED after deletes, so grep first**

```bash
rg "pour-timeline|GlassScene|usePourSequence|GLASS_CONFIGS|glass-visualization|CosmonautReveal|WAVE_PATH" src/components/demos/cocktail-mixer
```

Expected: only files you are about to delete / update.

- [ ] **Step 2: Delete and slim as listed. `WAVE_STYLES` becomes:**

```ts
export const WAVE_STYLES = `
@keyframes cosmonaut-glow {
  0%, 100% { box-shadow: 0 0 8px #8b5cf640, 0 0 24px #8b5cf620; }
  50% { box-shadow: 0 0 16px #8b5cf680, 0 0 40px #8b5cf640; }
}
`;
```

`gsap-setup.ts`:

```ts
"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

let registered = false;
export function registerMixerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(useGSAP);
  registered = true;
}
registerMixerGsap();
export { gsap, useGSAP };
```

- [ ] **Step 3: Run the mixer test suite**

Run: `npx vitest run src/components/demos/cocktail-mixer`

Expected: PASS. No `pour-timeline` / `pour-sequence` files.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/demos/cocktail-mixer
git commit -m "refactor: remove SVG pour stage from cocktail mixer"
```

---

### Task 10: FPS fallback, WebGL still, method/secret already in director

**Files:**
- Modify: `src/components/demos/cocktail-mixer/pixi/rig.ts`
- Modify: `src/components/demos/cocktail-mixer/pixi/bar-stage.tsx`

**Interfaces:**
- Consumes: ticker FPS
- Produces: after 30 consecutive frames `< 50fps`, `displacementOn = false` and hide `rim-highlight`. Keep the pour.

- [ ] **Step 1: Write failing fps helper test**

```ts
/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import { FpsBudget } from "../pixi/fps-budget";

describe("FpsBudget", () => {
  it("trips after 30 frames under 50fps", () => {
    const b = new FpsBudget(50, 30);
    for (let i = 0; i < 29; i++) expect(b.sample(40)).toBe(false);
    expect(b.sample(40)).toBe(true);
  });
  it("resets when fps recovers", () => {
    const b = new FpsBudget(50, 30);
    for (let i = 0; i < 10; i++) b.sample(40);
    expect(b.sample(60)).toBe(false);
  });
});
```

- [ ] **Step 2: RED**

Run: `npx vitest run src/components/demos/cocktail-mixer/__tests__/fps-budget.test.ts`

- [ ] **Step 3: Implement `pixi/fps-budget.ts` and sample `1000/deltaMS` in `rig.tick`. Skip displacement when `devicePixelRatio < 1.5` or reduced motion or `allDone`.**

Confirm CSS still path already emits `allDone` (Task 5). Confirm `applyFinished` kills frost/motes/splash and keeps Paloma foam.

- [ ] **Step 4: GREEN + full mixer tests**

Run: `npx vitest run src/components/demos/cocktail-mixer`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/demos/cocktail-mixer/pixi/fps-budget.ts src/components/demos/cocktail-mixer/pixi/rig.ts src/components/demos/cocktail-mixer/__tests__/fps-budget.test.ts
git commit -m "feat: drop mixer displacement under 50fps"
```

---

### Task 11: Full verify + browser pass

**Files:** none new unless tests/build fail.

- [ ] **Step 1: `npm test`**

Expected: all Vitest suites PASS (including existing 889-ish tests plus new ones). Fix failures in this task.

- [ ] **Step 2: `npm run build`**

Expected: Next.js production build PASS. Pixi must not leak into the homepage bundle (mixer is dynamic). If the build traces Pixi on `/`, fix the import boundary.

- [ ] **Step 3: Browser pass on `/work/cocktail-mixer`**

Start `npm run dev`. Exercise:

1. Margarita — shaken, salt from frame one, no ice
2. Old Fashioned — stirred vortex on liquid, rocks, ice stays in the bowl
3. Paloma — built, foam still there when paused
4. Salty Dog — salt, **no** foam
5. Whiskey Sour — shaken coupe, no ice
6. Unlock Cosmonaut (or seed localStorage `cocktails_made` with six names) — frost + motes, then still; XP after frost
7. 320px width
8. `prefers-reduced-motion: reduce` — finished still on first painted frame

Fail the task if ice leaves the bowl, the stream is a fat ribbon, or the paused frame looks like wireframe SVG.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: mixer pour browser-pass polish"
```

(Skip this commit if nothing changed.)

- [ ] **Step 5: Push**

```bash
git push -u origin cursor/cocktail-mixer-pixi-pour-5c83
```

---

## Self-review

**Spec coverage**

| Spec requirement | Task |
|---|---|
| `glass-bounds.ts` seeds | 1 |
| `pourDuration` / snapshots / secret extra | 2 |
| Garnish plates + Paloma foam name | 3 |
| Asset pack + stream 128×8 + pixi.js | 4 |
| v8 `init`, abort, CSS still, `bar-stage` | 5 |
| MeshPlane, two ropes, rocks ice, sandwich | 6 |
| Particles, salt, bottle, other glasses | 7 |
| PourDirector / useGSAP child | 8 |
| Delete SVG pour, slim GSAP | 9 |
| FPS + displacement off after allDone | 10 |
| npm test, build, browser drinks | 11 |

**Placeholder scan:** no TBD/TODO. Stream size locked. `PourSnapshot` lives in `pour-script.ts`. `never` defaults on garnish/glass switches.

**Type consistency:** `MixerRig`, `MixerUniforms`, `PourCue`, `PourSnapshot`, `BarStage` props match across tasks 2, 5, 6, 8.

**Out of scope left out:** Three/R3F, site-wide Pixi, oz-weighted fill, audio, card-icon Pixi rewrite.

# 3D / Turbopack runtime error — diagnosis

## The observed error

`Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`, require stack referencing
`pages/_document.js`. Seen in the dev server (`next dev --turbopack`) when toggling to 3D/voxel
mode (screenshot `3d-3-threejs-play.png`, since removed).

## Reproduction status

- **Production build (`npm run build`): clean.** The `/adventure` route compiles and the error
  does NOT occur. So this is **not** a build/SSR-correctness blocker.
- The error is a **`next dev --turbopack` runtime/HMR artifact** that surfaced when the Three.js
  code path was first exercised.

## Import-chain trace

Every `three` import lives in a **client module or a test** — there is no server-reachable
top-level `three` import, and no stray Pages-router file exists:

| File | Import | Kind |
|---|---|---|
| `src/hooks/use-three-renderer.ts:4` | `import { ThreeRenderer }` | **static VALUE import** (client hook) |
| `src/hooks/use-game-engine.ts:15` | `import type { ThreeRenderer }` | type-only (erased) |
| `src/lib/game/renderer/three-renderer.ts:8` | `import * as THREE from "three"` | value (client) |
| `src/lib/game/renderer/three-objects.ts:5` | `import * as THREE from "three"` | value (client) |
| `src/components/adventure/GameCanvas.tsx:8` | `import { useThreeRenderer }` | client → client |
| tests | `three` / `three-objects` | test-only |

## Root cause (most likely)

`use-three-renderer.ts` does a **static value import** of `ThreeRenderer`, which transitively
does `import * as THREE from "three"`. This pulls the entire `three` package into the client
bundle **eagerly** — even in pixel (2D) mode where it is never used. Under `next dev --turbopack`,
eagerly bundling a large lib through a `"use client"` boundary that also participates in HMR is
the kind of setup that produces transient `[turbopack]_runtime.js` chunk-resolution errors.

## Chosen fix (applied in plan Task 13)

**Defer loading `three` until 3D is actually activated** by converting the static import in
`use-three-renderer.ts` to a dynamic `await import(...)` inside the activation effect:

```ts
// instead of: import { ThreeRenderer } from "@/lib/game/renderer/three-renderer";
// inside the activation effect, when `active` first becomes true:
const { ThreeRenderer } = await import("@/lib/game/renderer/three-renderer");
```

Store the resolved class/instance in a ref (the hook already uses `instanceRef`). Benefits:
1. `three` is no longer in the initial/pixel-mode bundle (smaller first load, faster 2D start).
2. The chunk is only requested when the user toggles 3D — removing the eager `"use client"` +
   large-lib + HMR interaction that produced the dev-mode error.

This is a behavior-preserving change for the 2D path and the robust fix for the 3D path.
The isometric-projection fix (making 3D look distinct) is the separate part of Task 13.

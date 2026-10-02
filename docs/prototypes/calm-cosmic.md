# Calm cosmic portfolio prototype

Open `/experience` on branch `prototype/calm-cosmic`. This is an isolated exploration surface using the canonical `PROJECTS` catalog. The existing public portfolio remains available at `/` and `/work`.

## Working interactions

- CORE: direct project selection and real proof/source links.
- JAC: a graph study with edges derived from exact shared technology tags. Hover or keyboard focus highlights immediate neighbors. It is not connected to a Jac runtime.
- COSMOS: the default opening view, with drifting nodes, glowing project stars, selected-node ripples, orbital guides, and 64 twinkling background stars. JAC/COSMOS positions smoothly interpolate and signal particles travel along the moving edges. Project selection survives mode changes.
- TERMINAL: `help`, `projects`, `open <number>`, `mode <name>`, `about`, and `clear`. Commands are local navigation, not shell execution. Output history is bounded.
- Deconstruction: Purpose, System, and Proof expose existing descriptions, technologies, and proof statements; related projects are selectable.
- Atmosphere: bounded-resolution WebGL aurora, transparent compositing, CSS fallback, reduced-motion static time, and resource cleanup. Pause motion freezes both the graph and atmosphere. Reduced motion renders static coordinates and hides traveling particles. Graph frames stop when the field leaves the viewport; hidden documents skip drawing.
- Mobile: at 800px and below, constellation and graph become a two-column field without edges. Shared relationships remain available in the inspection panel. Native buttons provide keyboard navigation and visible focus.

## Experimental boundaries

The graph is a deterministic layout, not force-directed simulation, semantic embeddings, or a live knowledge backend. Relationships reflect shared tags, not inferred causal architecture. Project deconstruction uses the catalog's evidence rather than invented architecture diagrams. CORE/TERMINAL structural layout changes are immediate; only graph geometry and visual states interpolate. Shader performance and context loss still need broader device testing. No production promotion, auth changes, or backend services are included.

## Recovery and validation

Inspected the local X: checkout, registered worktree, branches, stash/reflog, and targeted prototype file locations. No prior calm-cosmic implementation was found. Started from fetched origin/main `8348c05`. Slow dependency operations on X: prompted a fresh local C: checkout for verification.

`npm.cmd test -- --maxWorkers=2`: 98 files, 967 tests passed. Lint: zero errors, one pre-existing `use-game-engine.ts` inputRef dependency warning. Browser: `/experience` HTTP 200, no console errors, 16 selectable projects, and mobile COSMOS at 390px had no label overlaps or horizontal overflow. Build result is recorded in the final handoff.
`npm.cmd run build`: passed; `/experience` prerendered successfully (9.17 kB route, 115 kB first load).

Life pass browser checks: desktop motion and traveling pulses confirmed, edges matched node positions, pause froze coordinates and CSS animations, reduced motion stopped drift and hid pulses. COSMOS and JAC at 1024px and COSMOS at 390px had no sampled label overlaps; mobile had no horizontal overflow. Focused tests cover drift bounds, edge alignment, pause/resume, reduced motion, and frame cleanup.

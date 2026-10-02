# Calm cosmic portfolio prototype

Open `/experience` on branch `prototype/calm-cosmic`. This is an isolated exploration surface using the canonical `PROJECTS` catalog. The existing public portfolio remains available at `/` and `/work`.

## Working interactions

- CORE: direct project selection and real proof/source links.
- JAC: a graph study with edges derived from exact shared technology tags. Hover or keyboard focus highlights immediate neighbors. It is not connected to a Jac runtime.
- COSMOS: a slowly breathing constellation with the same semantic connections. JAC/COSMOS node positions transition over 1.2 seconds. Project selection survives mode changes.
- TERMINAL: `help`, `projects`, `open <number>`, `mode <name>`, `about`, and `clear`. Commands are local navigation, not shell execution. Output history is bounded.
- Deconstruction: Purpose, System, and Proof expose existing descriptions, technologies, and proof statements; related projects are selectable.
- Atmosphere: bounded-resolution WebGL aurora, transparent compositing, CSS fallback, reduced-motion static time, and resource cleanup. Hidden documents skip drawing.
- Mobile: below 540px, constellation and graph become a two-column field without edges. Shared relationships remain available in the inspection panel. Native buttons provide keyboard navigation and visible focus.

## Experimental boundaries

The graph is a deterministic layout, not force-directed simulation, semantic embeddings, or a live knowledge backend. Relationships reflect shared tags, not inferred causal architecture. Project deconstruction uses the catalog's evidence rather than invented architecture diagrams. CORE/TERMINAL structural layout changes are immediate; only graph geometry and visual states interpolate. Shader performance and context loss still need broader device testing. No production promotion, auth changes, or backend services are included.

## Recovery and validation

Inspected the local X: checkout, registered worktree, branches, stash/reflog, and targeted prototype file locations. No prior calm-cosmic implementation was found. Started from fetched origin/main `8348c05`. Slow dependency operations on X: prompted a fresh local C: checkout for verification.

`npm.cmd test -- --maxWorkers=2`: 98 files, 964 tests passed. Lint: zero errors, one pre-existing `use-game-engine.ts` inputRef dependency warning. Browser: `/experience` HTTP 200, no console errors, 16 selectable projects, and mobile COSMOS at 390px had no label overlaps or horizontal overflow. Build result is recorded in the final handoff.
`npm.cmd run build`: passed; `/experience` prerendered successfully (7.95 kB route, 114 kB first load).

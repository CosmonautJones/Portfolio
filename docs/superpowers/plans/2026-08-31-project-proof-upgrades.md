# Project Proof Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken Plan'd proof with LoopedIn and upgrade Pixel Art Editor, Cocktail Mixer, and Release Signal into clear 30-second product proofs.

**Architecture:** Keep portfolio routing and visual tokens intact. Move new deterministic behavior into small pure modules, drive existing React components from those modules, and preserve all existing progression hooks. Each project workstream is independently testable and shippable.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS 4, Vitest, React Testing Library, Canvas API, Motion

**Spec:** `docs/superpowers/specs/2026-08-31-project-proof-upgrades-design.md`

## Global Constraints

- No new runtime dependencies.
- Preserve `/work/pixel-art-editor`, `/work/cocktail-mixer`, and `/work/release-signal`.
- Preserve visitor XP, achievement, and easter-egg integrations.
- Keep all new demo state local.
- Keep Plan'd implementation and migrations recoverable; only retire its public catalog presence and route.
- Use Node 24 for local verification.

---

### Task 1: Replace Plan'd With LoopedIn

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/app/(public)/pland/page.tsx`
- Create: `public/projects/loopedin.png`
- Modify: `src/lib/__tests__/project-assets.test.ts`

**Interfaces:**
- Consumes: existing `Project` fields `title`, `description`, `image`, `tags`, `liveUrl`, `githubUrl`, `role`, `proof`, and `actionLabel`.
- Produces: one public LoopedIn catalog entry and a legacy `/pland` external redirect.

- [ ] **Step 1: Write a failing catalog test**

  Add assertions that `PROJECTS` contains LoopedIn with the live and source URLs,
  that Plan'd is absent, and that every referenced image exists.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node.exe npm-cli.js test -- src/lib/__tests__/project-assets.test.ts`

  Expected: FAIL because LoopedIn is missing and Plan'd is still cataloged.

- [ ] **Step 3: Add the LoopedIn asset and catalog entry**

  Copy the accepted generated asset to `public/projects/loopedin.png`, replace
  the Plan'd entry with concrete LoopedIn copy, and preserve the catalog order.

- [ ] **Step 4: Retire the dead route safely**

  Replace the Plan'd page body with `redirect("https://loopedin-family.netlify.app")`
  and update its metadata to LoopedIn.

- [ ] **Step 5: Run the focused test and verify GREEN**

  Run the command from Step 2. Expected: PASS.

### Task 2: Make Pixel Art Editor Start With A Personal Result

**Files:**
- Create: `src/components/demos/pixel-art-editor-logic.ts`
- Create: `src/components/demos/__tests__/pixel-art-editor-logic.test.ts`
- Create: `src/components/demos/__tests__/pixel-art-editor.test.tsx`
- Modify: `src/components/demos/pixel-art-editor.tsx`

**Interfaces:**
- Produces: `createEmptyGrid(size)`, `cloneGrid(grid)`, `floodFill(grid, x, y, color)`, `createLobsterStarter()`, and `CORE_PALETTE_INDICES`.
- The component consumes the existing `LOBSTER_DOWN_IDLE` sprite and `PALETTE` without duplicating sprite data.

- [ ] **Step 1: Write failing pure-logic tests**

  Cover empty-grid shape, immutable flood fill, cloned starter data, and the
  expected 32x32 lobster starter size.

- [ ] **Step 2: Run the logic test and verify RED**

  Run: `node.exe npm-cli.js test -- src/components/demos/__tests__/pixel-art-editor-logic.test.ts`

  Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure logic module**

  Export only the helpers named above. Keep palette indices as data, not React
  state, and always return cloned grids from public helpers.

- [ ] **Step 4: Run the logic test and verify GREEN**

  Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Write failing component behavior tests**

  Assert the personalized heading and lobster starter, “Blank canvas,” undo,
  redo, “More colors,” and accessible canvas label. Assert undo/redo disabled
  states before editing.

- [ ] **Step 6: Run the component test and verify RED**

  Run: `node.exe npm-cli.js test -- src/components/demos/__tests__/pixel-art-editor.test.tsx`

  Expected: FAIL because the new workflow is not rendered.

- [ ] **Step 7: Implement the workshop UI and bounded history**

  Load the lobster starter by default; checkpoint once per pointer/touch stroke,
  starter change, fill, clear, or resize; cap undo history at 50; clear redo on
  a new edit. Show the core palette first and toggle the full palette.

- [ ] **Step 8: Run both Pixel Art tests and verify GREEN**

  Run both focused test files. Expected: PASS with no console warnings.

### Task 3: Make Cocktail Mixer's Secret Progress Fair

**Files:**
- Modify: `src/components/demos/cocktail-mixer/hooks.ts`
- Modify: `src/components/demos/cocktail-mixer/index.tsx`
- Modify: `src/components/demos/cocktail-mixer/components/selection-grid.tsx`
- Modify: `src/components/demos/cocktail-mixer/components/recipe-view.tsx`
- Modify: `src/components/demos/cocktail-mixer/components/recipe-details.tsx`
- Modify: `src/components/demos/cocktail-mixer/__tests__/pour-sequence.test.ts`
- Modify: `src/components/demos/cocktail-mixer/__tests__/cocktail-mixer.test.tsx`

**Interfaces:**
- `SelectionGrid` additionally consumes `regularMadeCount: number` and `unlockTarget: number`.
- `RecipeView` additionally consumes `madeCount: number` and `unlockTarget: number`.
- `usePourSequence(ingredientCount, instant?)` preserves its `PourState` return contract.

- [ ] **Step 1: Add failing progress and timing tests**

  Assert that the initial page names The Cosmonaut's Bar, shows `0 / 6 mixed`,
  renders six progress marks, and explains the unlock. Update fake-timer tests to
  require a three-ingredient pour to complete within 3.5 seconds.

- [ ] **Step 2: Run focused Cocktail tests and verify RED**

  Run: `node.exe npm-cli.js test -- src/components/demos/cocktail-mixer/__tests__`

  Expected: FAIL on missing copy/progress and old timing.

- [ ] **Step 3: Implement visible progress and faster sequencing**

  Add the bar identity, six accessible progress marks, explicit unlock copy,
  and a post-pour progress line. Reduce the pour interval while retaining the
  existing visual states and completion callback.

- [ ] **Step 4: Run focused Cocktail tests and verify GREEN**

  Run the command from Step 2. Expected: PASS.

### Task 4: Turn Release Signal Into A Go/No-Go Evidence Tool

**Files:**
- Modify: `src/components/demos/release-signal/release-signal-logic.ts`
- Modify: `src/components/demos/release-signal/release-signal.tsx`
- Modify: `src/components/demos/release-signal/__tests__/release-signal-logic.test.ts`
- Modify: `src/components/demos/release-signal/__tests__/release-signal.test.tsx`

**Interfaces:**
- Produce `ReleaseVerdict = "hold" | "ready-with-notes" | "ready"`.
- Produce `ReleaseScenario` with `id`, `label`, `description`, and `gates`.
- `getReleaseSignalStatus(gates, releaseNote)` returns verdict, completion counts, missing required gates, and missing supporting gates.
- `buildEvidencePacket(changeName, scenario, result, gates, releaseNote)` returns the copyable plain-text handoff.

- [ ] **Step 1: Write failing verdict and packet tests**

  Add literal expectations for Hold with missing required evidence, Ready with
  notes when only supporting evidence or the note is absent, Ready when all
  evidence and a note exist, and a named evidence packet.

- [ ] **Step 2: Run Release Signal logic tests and verify RED**

  Run: `node.exe npm-cli.js test -- src/components/demos/release-signal/__tests__/release-signal-logic.test.ts`

  Expected: FAIL because the new verdict and packet contracts do not exist.

- [ ] **Step 3: Implement scenario and verdict logic**

  Add the three concrete scenarios and pure helpers. Keep labels and evidence
  deterministic and keep React/browser APIs out of the logic module.

- [ ] **Step 4: Run the logic test and verify GREEN**

  Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Write failing component workflow tests**

  Assert the change-name field, the three scenario controls, Hold initial state,
  Ready with notes after required checks, Ready after all checks plus a note,
  and clipboard content containing the named change.

- [ ] **Step 6: Run the component test and verify RED**

  Run: `node.exe npm-cli.js test -- src/components/demos/release-signal/__tests__/release-signal.test.tsx`

  Expected: FAIL against the old checklist UI.

- [ ] **Step 7: Implement the evidence-tool UI**

  Drive the page from scenario definitions, reset evidence when scenarios
  change, render the three-state signal with text and color, and copy the pure
  evidence packet.

- [ ] **Step 8: Run both Release Signal tests and verify GREEN**

  Run both focused test files. Expected: PASS.

### Task 5: Integrate, Review, And Ship

**Files:**
- Modify: `tasks/current-mission.md`
- Modify: `tasks/completed.md`
- Modify as needed from visual review: only files already listed above

**Interfaces:**
- Produces one exact commit pushed to `origin/main` with traceable CI and live verification.

- [ ] **Step 1: Update harness mission records**

  Replace `tasks/current-mission.md` with this release's scope and acceptance
  criteria. Append the superseded release-health mission and completed proof
  work to `tasks/completed.md` without claiming unresolved health debt is fixed.

- [ ] **Step 2: Run focused tests, lint, full tests, and build**

  Run with Node 24: focused changed tests, `npm run lint`, `npm test`, and
  `npm run build`. Expected: all pass; unrelated pre-existing warnings must be
  named rather than hidden.

- [ ] **Step 3: Run local browser review**

  Capture desktop and mobile states for LoopedIn card, Pixel Art starter/edit,
  Cocktail progress/result, and Release Signal Hold/Ready. Verify keyboard
  controls, reduced motion, no horizontal scroll, and clean console output.

- [ ] **Step 4: Commit and push**

  Commit the verified slice, fetch `origin/main`, ensure a fast-forward push is
  safe, then push the exact commit to `main`.

- [ ] **Step 5: Babysit release**

  Monitor GitHub CI and deployment, then verify the exact production commit and
  the four changed public flows. Do not claim complete until the live site is
  serving the expected assets and interactions.

## Plan Self-Review

- Spec coverage: every functional, accessibility, and release requirement maps
  to Tasks 1–5.
- Placeholder scan: no TBD, TODO, “similar to,” or unspecified implementation
  step remains.
- Type consistency: `ReleaseVerdict`, `ReleaseScenario`, `PourState`, and Pixel
  helper names are defined once and used consistently.
- Scope risk: tasks are independent and can be reviewed or reverted separately.

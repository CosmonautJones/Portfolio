# Portfolio Modernizing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the public portfolio with humble copy, stronger project evidence, two small interactive apps, and subtle UAP easter eggs.

**Architecture:** Keep the public portfolio data-driven through `src/lib/constants.ts`. Add focused demo components and pure helper modules under `src/components/demos`, then route them through the existing `/work/[slug]` demo loader path.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS, motion/react, Lucide icons, Vitest, React Testing Library.

## Global Constraints

- Use modest, specific language and avoid hype, cheesy taglines, and overconfident claims.
- Keep all new apps browser-only: no auth, database, API, or fabricated analytics.
- Keep UAP/UFO easter eggs subtle, optional, and respectful of reduced motion.
- Preserve the portfolio wedge: `arrive -> understand Travis's wedge -> inspect/play/use proof -> contact`.
- Run `npm test` and `npm run build`, then commit and push to `main`.

---

### Task 1: Public Copy And Project Data

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/components/portfolio/hero-section.tsx`
- Modify: `src/components/portfolio/what-i-do.tsx`
- Modify: `src/components/portfolio/featured-projects.tsx`
- Modify: `src/app/(public)/work/page.tsx`
- Test: `src/lib/__tests__/constants.test.ts`
- Test: `src/components/portfolio/__tests__/hero-section.test.tsx`
- Test: `src/components/portfolio/__tests__/what-i-do.test.tsx`
- Test: `src/components/portfolio/__tests__/project-card.test.tsx`

**Interfaces:**
- Consumes: existing `Project` type and portfolio components.
- Produces: new project entries for `members-only-poker-club`, `harness-core`, `release-signal`, and `table-stakes`.

- [ ] Update `SITE_CONFIG.tagline` and hero copy to use humble wording:

```tsx
Hi, I'm Travis.
I like learning how things work, building useful software, and collaborating with good people.
```

- [ ] Replace section labels with `What I enjoy working on`, `A few projects`, and `Small things to try`.
- [ ] Add project cards for Members Only Poker Club and Harness Core with plain descriptions and repository/live links.
- [ ] Add project cards for Release Signal and Table Stakes with `/work/release-signal` and `/work/table-stakes` demo URLs.
- [ ] Update proof points so the hero points to concrete interactive proof, including Release Signal and Table Stakes.
- [ ] Run focused affected tests.

### Task 2: Release Signal Demo

**Files:**
- Create: `src/components/demos/release-signal/release-signal.tsx`
- Create: `src/components/demos/release-signal/release-signal-logic.ts`
- Create: `src/components/demos/release-signal/__tests__/release-signal-logic.test.ts`
- Create: `src/components/demos/release-signal/__tests__/release-signal.test.tsx`
- Modify: `src/components/demos/demo-loader.tsx`
- Modify: `src/app/(public)/work/[slug]/page.tsx`

**Interfaces:**
- Produces: `getReleaseSignalStatus(gates: ReleaseGate[]): ReleaseSignalResult`.
- Produces: a React demo component loaded for slug `release-signal`.

- [ ] Write tests for all gates unchecked, partial gates checked, and all required gates checked.
- [ ] Implement deterministic status logic returning `ready`, completed count, total count, and missing gate labels.
- [ ] Build a usable demo with artifact selector, gate checkboxes, release note textarea, and copyable summary.
- [ ] Register the slug in the demo loader and static params.
- [ ] Run focused tests for Release Signal.

### Task 3: Table Stakes Demo

**Files:**
- Create: `src/components/demos/table-stakes/table-stakes.tsx`
- Create: `src/components/demos/table-stakes/table-stakes-logic.ts`
- Create: `src/components/demos/table-stakes/__tests__/table-stakes-logic.test.ts`
- Create: `src/components/demos/table-stakes/__tests__/table-stakes.test.tsx`
- Modify: `src/components/demos/demo-loader.tsx`
- Modify: `src/app/(public)/work/[slug]/page.tsx`

**Interfaces:**
- Produces: `getBlindClockState(levels: BlindLevel[], elapsedSeconds: number): BlindClockState`.
- Produces: a React demo component loaded for slug `table-stakes`.

- [ ] Write tests for level 1, exact boundary transition, final level, and elapsed time beyond schedule.
- [ ] Implement deterministic blind-clock helpers.
- [ ] Build start, pause, reset, editable level duration, current level, next level, and keyboard-friendly controls.
- [ ] Register the slug in the demo loader and static params.
- [ ] Run focused tests for Table Stakes.

### Task 4: Subtle Skywatch Easter Eggs

**Files:**
- Create: `src/components/portfolio/skywatch-glint.tsx`
- Modify: `src/components/portfolio/hero-section.tsx`
- Modify: `src/lib/terminal/commands.ts`
- Test: `src/lib/terminal/__tests__/commands.test.ts`
- Test: add a small component test only if behavior is not covered by static rendering

**Interfaces:**
- Produces: hidden terminal command `skywatch`.
- Produces: subtle home-page glint component that respects reduced motion.

- [ ] Add hidden `skywatch` command that does not appear in `help`.
- [ ] Return an understated response such as `Skywatch log: one quiet light, no conclusions.`
- [ ] Add a tiny hero glint that is visually quiet, button-accessible, and inert when reduced motion is preferred.
- [ ] Run terminal command tests.

### Task 5: Final Verification And Release

**Files:**
- Modify only files changed by Tasks 1-4.

**Interfaces:**
- Consumes: all completed feature code and tests.
- Produces: verified commit pushed to `main`.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Fix any regressions with the smallest scoped edits.
- [ ] Commit all implementation changes.
- [ ] Push `main`.

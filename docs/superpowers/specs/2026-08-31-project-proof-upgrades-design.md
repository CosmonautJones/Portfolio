# Project Proof Upgrades Design

## Goal

Turn the portfolio's weakest public projects into fast, memorable proof of
product judgment and engineering ability. A visitor should understand each
project's job, get a satisfying result within 30 seconds, and know why the work
is credible.

## Evidence From The Live Audit

- Plan'd renders a signed-out empty state with no usable action. Its card claims
  shared trip functionality that the public visitor cannot inspect.
- LoopedIn is the real successor: a separately deployed private family planning
  app with hosted auth, invitations, RSVPs, discussions, private photos, and
  release evidence.
- Pixel Art Editor works, but starts blank and presents 95 unlabeled colors
  before it demonstrates any personality or outcome.
- Cocktail Mixer works and has a strong SVG pour, but its six-drink secret is
  invisible until after the visitor has already done the work.
- Release Signal works, but “release readiness” is too abstract without a named
  change, risk context, or a concrete evidence packet.

Audit screenshots are saved under
`C:/Users/Travesty/.codex/visualizations/2026/08/31/01a0586c-b3a5-76c3-b3db-7f0e147b0a2a/project-strength-audit/`.

## Portfolio Decision

Replace Plan'd in the project catalog with LoopedIn. Do not delete the Plan'd
implementation or schema in this release. The old `/pland` route should become
a transparent handoff to the live LoopedIn product so old links stop ending in
a dead experience.

This is a curation decision, not a rename. LoopedIn has a distinct repository,
deployment, brand, and product scope. The card must link to the live product and
its own source repository.

## Audience And Jobs

The primary audience is a hiring manager or senior engineer deciding whether
Travis can ship useful software. The primary job is not “browse experiments.”
It is “inspect credible product decisions quickly.”

Each upgraded proof gets one clear visitor job:

- LoopedIn: understand that Travis can build and operate a private full-stack
  product around a real family coordination problem.
- Pixel Art Editor: open a recognizable Travis-specific sprite, remix it, undo
  mistakes, and export it.
- Cocktail Mixer: choose a drink, enjoy the pour, and understand the fair path
  to the hidden house cocktail.
- Release Signal: name a change, record evidence, and leave with an honest
  go/no-go handoff summary.

## Design Direction

Preserve the portfolio's existing typography, spacing tokens, dark theme, and
component library. Do not add a new global design system or dependency.

The shared hierarchy is:

```text
specific product title
-> one-sentence job
-> immediate primary action
-> visible result or progress
-> small implementation proof
```

Each demo gets one signature element:

- LoopedIn: a warm plum-and-ivory project image built around one shared event,
  family presence, private photos, and a tiny lobster keychain.
- Pixel Art Editor: a ready-to-remix lobster sprite on first load, with a
  compact “starter / edit / export” workshop rhythm.
- Cocktail Mixer: a visible six-stamp bar rail that turns the hidden Cosmonaut
  drink into a fair, playful goal.
- Release Signal: a three-state signal (Hold, Ready with notes, Ready) driven by
  required evidence rather than a generic completion percentage.

The intentional aesthetic risk is allowing each artifact to have a small,
subject-specific voice while keeping the surrounding portfolio chrome quiet.
No generic glass-card expansion, decorative gradients, fake metrics, or
marketing filler.

## Functional Design

### LoopedIn Replacement

- Replace the Plan'd `PROJECTS` entry with LoopedIn.
- Use `https://loopedin-family.netlify.app` as the live URL and
  `https://github.com/CosmonautJones/family-loop` as the source URL.
- Describe concrete product behavior: event-centered plans, invitations,
  RSVPs, discussions, private photos, and memories.
- Add `public/projects/loopedin.png` using the generated family-event artwork.
- Redirect `/pland` to the live LoopedIn URL so saved links remain useful.

### Pixel Art Editor

- Open with the existing 32x32 ClaudeBot lobster sprite instead of a blank
  16x16 grid.
- Add explicit starter buttons for “ClaudeBot lobster” and “Blank canvas.”
- Add undo and redo with bounded history. Drawing one continuous stroke should
  create one undo checkpoint, not one checkpoint per pixel.
- Reduce the initial palette to the sprite's purposeful core colors and expose
  the full palette behind “More colors.”
- Add a visible heading, concise instructions, current canvas size, and export
  affordance. Keep the Canvas API and PNG export.
- Give the canvas an accessible name and preserve mouse/touch behavior.

### Cocktail Mixer

- Rename the in-demo experience to “The Cosmonaut's Bar” while keeping the
  public project title “Cocktail Mixer.”
- Show `made / 6` progress before selection and explain that completing the six
  house classics unlocks The Cosmonaut.
- Render six real progress marks that update from existing local progress.
- Keep the current SVG artwork and sequenced pour. Shorten the sequence enough
  that a three-ingredient drink completes in roughly three seconds.
- When a pour completes, show the updated progress and a clear “Choose next
  drink” action. Preserve reduced-motion behavior and existing achievement
  hooks.

### Release Signal

- Keep the name “Release Signal,” but frame it as an honest go/no-go handoff
  tool rather than a generic checklist.
- Replace artifact types with concrete scenarios: UI change, data migration,
  and agent workflow.
- Let each scenario provide its own required and supporting gates.
- Add a change-name input so the summary identifies the actual work.
- Derive three verdicts:
  - Hold: one or more required gates are missing.
  - Ready with notes: required gates are complete but supporting gates or the
    release note are incomplete.
  - Ready: every gate and a non-empty note are complete.
- Produce a copyable evidence packet containing the change, scenario, verdict,
  completed evidence, missing evidence, and release note.
- Keep all state local; do not introduce auth, persistence, telemetry, or a
  backend.

## Accessibility And Responsive Requirements

- Every icon-only control needs an accessible name and visible tooltip/title.
- Buttons and color swatches need at least a 40px practical touch target on
  mobile where layout permits.
- Selected tools, starters, and scenarios must expose state through accessible
  attributes, not color alone.
- Keyboard focus must remain visible.
- Motion must respect reduced-motion preferences; the cocktail result must not
  be withheld behind animation for reduced-motion users.
- All demos must fit at 320px without horizontal page scrolling.

## Engineering Constraints

- No new runtime dependencies.
- Preserve existing URLs for the three demos.
- Preserve visitor XP, achievement, and easter-egg integrations.
- Keep pure decision logic outside large React components and cover it with
  focused tests.
- Run with Node 24 locally.
- Required release gates: lint, full tests, production build, browser smoke,
  GitHub CI, and exact production verification.

## Non-Goals

- Rebuilding LoopedIn inside the portfolio repository.
- Deleting Plan'd database migrations or components.
- Adding another auth or storage layer.
- Turning the demos into standalone SaaS products.
- Global typography, navigation, or theme redesign.
- Adding more portfolio projects in this release.

## Success Criteria

- Plan'd no longer appears in the public project catalog and `/pland` no longer
  strands visitors.
- LoopedIn has a correct live link, source link, concrete proof copy, and its own
  image.
- Pixel Art shows a recognizable personalized sprite on entry; starter, undo,
  redo, palette expansion, drawing, and export remain usable.
- Cocktail Mixer explains and visibly tracks the secret unlock path, and the
  standard pour completes without a long dead wait.
- Release Signal identifies a real change and distinguishes Hold, Ready with
  notes, and Ready using deterministic tested logic.
- All changed flows work at desktop and mobile sizes with clean console output.

## Self-Review

- The design strengthens interactive proof rather than adding content-only
  sections.
- The four artifacts have different jobs and signatures; no shared generic
  dashboard pattern was introduced.
- Plan'd is retired recoverably, not destructively.
- The scope avoids auth, database, and global-style churn.
- The largest risk is breadth. Each workstream is independently testable and
  can be accepted or reverted without depending on the others.

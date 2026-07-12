# Portfolio Modernizing Polish Design

## Goal

Refresh the public portfolio so it feels more human, useful, and exploratory without sounding inflated. The updated site should make it clear that Travis likes learning how things work, building useful software, and collaborating with good people. The public path stays:

```text
arrive -> understand Travis's wedge -> inspect/play/use proof -> contact
```

## Voice

Use modest, specific language. Avoid "hotshot" framing, hype, cheesy taglines, and overconfident claims. The tone should feel curious, capable, and approachable.

Example direction:

- Hero: "Hi, I'm Travis."
- Supporting copy: "I like learning how things work, building useful software, and collaborating with good people."
- Work framing: "Here are a few things I've made. Some are practical, some are playful, and all of them are built to be explored."
- Section labels: "What I enjoy working on", "A few projects", and "Small things to try."

## Project Additions

Add two GitHub-backed portfolio projects:

- Members Only Poker Club: a private poker club platform with a public site, member-facing portal, and operations tools.
- Harness Core: an open-source framework for checking, scoring, and improving AI-generated work.

Keep descriptions plain and evidence-based. Link to the repositories and live app/package pages where appropriate.

## New Interactive Apps

Add two small, public, browser-only portfolio apps. They should feel like useful proof, not demos pretending to be products.

1. Release Signal
   - Inspired by Harness Core.
   - Lets a visitor choose an artifact type, check concrete quality gates, add a short release note, and get a transparent "Ready" or "Needs work" summary.
   - Uses deterministic local logic only. No auth, database, API, fabricated analytics, or generic dashboard bloat.

2. Table Stakes
   - Inspired by Members Only Poker Club.
   - Provides a simple poker-night blind clock with start, pause, reset, editable blind levels, current level, upcoming level, and keyboard-friendly controls.
   - Uses local browser state only.

## Subtle UAP Easter Eggs

Add light, optional UAP/UFO details that do not turn the portfolio into a themed novelty site:

- A rare, tiny skywatch-style light in the public home atmosphere. It should be subtle, dismissible by simply ignoring it, and respectful of reduced motion.
- A hidden terminal command, `skywatch`, with a dry, understated response.

No alien art, lore dump, bright neon treatment, or loud callout.

## Implementation Shape

- Update the public home, work listing, project data, and project detail pages using existing component patterns.
- Add focused app components and pure helper functions for Release Signal and Table Stakes.
- Keep the apps accessible, responsive, and usable on mobile and desktop.
- Reuse existing motion/reduced-motion patterns and avoid broad refactors.
- Add tests for the new deterministic helpers, important app controls, terminal command behavior, and any changed public copy where current tests depend on it.

## Verification

Before completion:

- Run focused tests while developing where useful.
- Run `npm test`.
- Run `npm run build`.
- Commit and push to `main` after verification passes.

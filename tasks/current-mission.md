# Current Mission

## Mission

Sharpen the first-run portfolio path so a new visitor can move from Travis's
claim to concrete interactive proof to contact without needing to explore the
whole site.

## Why This Mission

The repo already contains strong proof points: interactive demos, a game engine,
progression, terminal/easter eggs, Plan'd, and an admin tool system. The next
high-value slice is to make the public path connect those proof points into a
clear first impression.

## Scope

Focus only on the public visitor path:

- Home hero and featured proof framing.
- Featured project cards or project detail intros.
- Contact CTA placement and wording.
- Loading/error/empty states if they affect the first-run path.

## Out Of Scope

- New games.
- New auth behavior.
- Supabase schema changes.
- Admin CRUD changes.
- Broad redesign of every page.
- New analytics, billing, teams, or settings.

## Likely Files

- `src/components/portfolio/hero-section.tsx`
- `src/components/portfolio/featured-projects.tsx`
- `src/components/portfolio/project-card.tsx`
- `src/app/(public)/work/[slug]/page.tsx`
- `src/components/portfolio/contact-form.tsx`
- `src/lib/constants.ts`

## Acceptance Criteria

- The home page states the interactive-proof wedge clearly.
- At least three proof points are easy to reach from the first public path.
- Project framing explains what the visitor can inspect or try.
- Contact remains reachable after proof, not only from the nav.
- Mobile layout remains readable without text overlap.
- Existing tests pass or any skipped checks are documented.

## Test Plan

- Run relevant portfolio component tests.
- Run `npm run lint`.
- Run `npm run build` if runtime code changes.
- Manually inspect `/`, `/work`, one project detail page, and `/contact` on
  desktop and mobile viewport widths.

## Done Definition

The visitor path is clearer without adding new feature surface area, and the
diff stays limited to public portfolio files plus any necessary tests.

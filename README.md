# Travis Jones Portfolio

Interactive Next.js portfolio for travisjohnjones.com — demos and case studies you can open; check Actions for current CI.

Live site: [https://www.travisjohnjones.com](https://www.travisjohnjones.com)

## Status

[![CI](https://github.com/CosmonautJones/Portfolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/CosmonautJones/Portfolio/actions?query=branch%3Amain)

Check the badge and [Actions on `main`](https://github.com/CosmonautJones/Portfolio/actions?query=branch%3Amain) for current CI; do not assume green from this README.

| Check | Where |
| --- | --- |
| Production | https://www.travisjohnjones.com |
| CI | [Actions on `main`](https://github.com/CosmonautJones/Portfolio/actions?query=branch%3Amain) |
| Deploy | Netlify PR checks |

### Quick proof

| Proof | Link |
| --- | --- |
| Live site | https://www.travisjohnjones.com |
| Lumen Garden demo | https://cosmonautjones.github.io/lumen-garden/ |
| AI Usage Overlays | https://github.com/CosmonautJones/ai-usage-overlays |
| Mission Control | https://github.com/CosmonautJones/mission-control |
| The Conductor | https://github.com/CosmonautJones/the-conductor |
| CI (Actions) | https://github.com/CosmonautJones/Portfolio/actions?query=branch%3Amain |

## What you can try without signing in

- Lumen Garden live demo from home chips / featured card
- In-site `/work` demos (Pixel Workshop, Release Signal, Table Stakes, Cosmonaut's Bar, Adventure)
- Case studies under `/work/...` when shipped (Overlays, Mission Control)
- Contact form + `mailto:travisjohn.jones@gmail.com`

Sign-in is not required to evaluate the public portfolio.

## Technology Map

| Area | Technology | Purpose |
|---|---|---|
| App framework | Next.js 15 App Router | Public pages, protected routes, API routes, middleware, server actions |
| UI runtime | React 19 + TypeScript | Component architecture and type-safe app logic |
| Styling | Tailwind CSS 4 | Global design system and responsive styling |
| UI primitives | shadcn/ui, Radix UI, Lucide React | Accessible controls, dialogs, menus, buttons, and icons |
| Animation/UI polish | Motion, Sonner, next-themes | Motion effects, toast notifications, theme support |
| 3D/game rendering | Three.js + Canvas | Portfolio game and visual demo surfaces |
| Forms/validation | react-hook-form, Zod, shared validation helpers | Admin forms, contact validation, typed payloads |
| Markdown/content | react-markdown, remark-gfm | Rich text rendering where needed |
| Image/build support | Sharp | Next.js image/build optimization |
| Tests | Vitest, React Testing Library, jsdom | Unit and component coverage |
| Linting | ESLint + Next.js config | Code quality and React/Next.js checks |
| CI | GitHub Actions | Lint, test, and build verification on `main` |

## Connected Services

| Service | What It Does | Where It Connects |
|---|---|---|
| Netlify | Hosts and deploys the production site at `travisjohnjones.com` | `netlify.toml`, Netlify dashboard, deploy hooks |
| Netlify DNS / NS1 | Owns DNS for `travisjohnjones.com` | Netlify DNS zone using `dns*.p05.nsone.net` nameservers |
| Resend | Sends contact form email from the site | `src/app/api/contact/route.ts`, `/api/contact` |
| Supabase Auth | Handles login through GitHub OAuth with PKCE | `src/app/(auth)`, `src/lib/supabase/*`, middleware |
| Supabase PostgreSQL | Stores tools, profiles, XP, achievements, scores, easter eggs, and visits | `supabase/migrations`, server actions, RLS policies |
| GitHub OAuth | Identity provider for sign-in | Configured in Supabase Authentication providers |
| GitHub API | Optional import source for embedded/tools metadata | `GITHUB_TOKEN`, tool import server actions |
| GitHub Actions | Runs repository CI after pushes | `.github/workflows/*` |

## Product Surface

- Public portfolio pages: home, about, work, contact, vault.
- Interactive proof points: project cards, demos, Plan'd, Pixel Art Editor, and ClaudeBot's Adventure.
- Authenticated tools hub: `/tools` for signed-in users.
- Admin area: `/admin` and `/admin/tools`, gated by `ADMIN_EMAIL`.
- Contact flow: browser form posts to `/api/contact`; the server sends through Resend. Public contact also supports `mailto:travisjohn.jones@gmail.com`.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and set matching values in Netlify for production.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL exposed to browser clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key exposed to browser clients |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only admin key for trusted operations |
| `ADMIN_EMAIL` | Yes | Email address allowed into admin routes/actions |
| `RESEND_API_KEY` | Yes | Server-only key for contact email sending |
| `RESEND_FROM_EMAIL` | Yes | Verified sender, e.g. `Portfolio <contact@travisjohnjones.com>` |
| `CONTACT_TO_EMAIL` | Yes | Destination inbox for contact submissions |
| `GITHUB_TOKEN` | Optional | Raises GitHub API rate limits for tool imports |

Do not commit real secret values. Keep production secrets in Netlify environment variables.

## Email/DNS Setup

The baked-in contact form depends on Resend domain verification.

In Netlify DNS for `travisjohnjones.com`, the Resend sending records must exist:

- `TXT` at `resend._domainkey`
- `MX` at `send`
- `TXT` at `send`
- Optional `TXT` at `_dmarc`

The active DNS nameservers are Netlify/NS1 nameservers, so Resend records must be added in the Netlify DNS zone, not only at the registrar.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint
npm run test
npm run build
npm run test:watch
```

## Deployment

Production deploys through Netlify from `main`.

- Build command: `npm run build`
- Runtime target: Node 20 on Netlify
- Domain: `travisjohnjones.com`
- DNS: Netlify DNS / NS1

Admin tools can also store Netlify build hook URLs and trigger deploys through the `triggerDeploy` server action.

## Repository Guide

High-signal docs live in `docs/`:

- `docs/README.md` - documentation index
- `docs/architecture.md` - route groups, request flow, and key libraries
- `docs/auth.md` - Supabase/GitHub login flow
- `docs/deployment.md` - Netlify, env vars, Supabase, and Resend setup
- `docs/database.md` - Supabase schema, migrations, and RLS
- `docs/tool-system.md` - internal/external/embedded tools
- `docs/testing.md` - Vitest and React Testing Library patterns

Harness workflow files live in:

- `AGENTS.md`
- `docs/vision.md`
- `docs/core-loop.md`
- `docs/taste-bar.md`
- `docs/anti-goals.md`
- `tasks/current-mission.md`
- `tasks/completed.md`
- `evals/product-rubric.md`

## Current Known Warnings

Recent `main` CI runs have concluded **failure** on the Test step (e.g. runs `b2b6a39`, `1da9c87`, `168c49b`). Treat the Actions badge / workflow runs as the source of truth — do not assume CI is green from this README.

Other follow-ups tracked in the harness mission:

- GitHub reports dependency vulnerabilities on the default branch.
- ESLint reports an existing React hook dependency warning in `src/hooks/use-game-engine.ts`.

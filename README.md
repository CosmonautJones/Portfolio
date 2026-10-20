# Travis Jones · Portfolio

A Next.js portfolio where hiring teams and collaborators can inspect projects, try browser tools, and play an arcade game before getting in touch. Public work is available without signing in; a separate admin area manages imported tools and site content.

**[Visit the portfolio](https://www.travisjohnjones.com)** · [Explore the projects](https://www.travisjohnjones.com/work) · [Read the résumé](public/resume/Travis-Jones-Resume.md) · [View CI](https://github.com/CosmonautJones/Portfolio/actions?query=branch%3Amain)

## Start with something you can try

| Project | What to explore |
| --- | --- |
| [M-Local](https://www.travisjohnjones.com/work/m-local) | Local Impact Grand Prize team project; my UI and QR redemption contribution. |
| [MCP-to-COBOL bridge](https://www.travisjohnjones.com/work/mcp-cobol-bridge) | Original contribution summary and a clearly synthetic illustration. |
| [TravOS](https://www.travisjohnjones.com/work/travos) | Working prototype with simulated workers, artifact verification, and retained rejection evidence. |
| [Pixel Workshop](https://www.travisjohnjones.com/work/pixel-art-editor) | A pixel editor implemented within this application. |
| [Project collection](https://www.travisjohnjones.com/work) | Release Signal, Table Stakes, The Cosmonaut’s Bar, Adventure, and the broader collection of tools and case studies. |
| [Lumen Garden](https://cosmonautjones.github.io/lumen-garden/) | An external browser demo linked from the portfolio. |

The site also includes a terminal, hidden discoveries, themes, and visitor progression. These support exploration; visitors can go directly to work, résumé, or contact.

## My role and background

This is my personal portfolio and project collection. The repository brings together public pages, browser demos, an admin tool system, and their supporting application code. Linked projects have their own scope and attribution; this repository is the site that presents them.

My strongest production experience is COBOL and VB.NET in manufacturing ERP. Over eight years at Global Shop Solutions, I worked on established business behavior, modernization, production support, and tools that help other teams understand the system. My C#/.NET experience supports that integration work. This site demonstrates my more recent TypeScript and React work; it is separate from employer software.

## Stack

| Area | Implementation |
| --- | --- |
| Application | Next.js 15 App Router, React 19, TypeScript |
| Interface | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide, Motion, Sonner, next-themes |
| Data and identity | Supabase PostgreSQL, row-level security, GitHub OAuth with PKCE |
| Interactive work | Canvas 2D game engine, Three.js demos, Web Audio |
| Forms and content | React Hook Form, Zod, React Markdown, remark-gfm |
| Hosting and email | Netlify configuration and a Resend contact endpoint |
| Checks | Vitest, React Testing Library, jsdom, ESLint, GitHub Actions |

## Run locally

Use **Node.js 20** and npm, matching CI and Netlify configuration. Public pages can render without service credentials. Configure your own Supabase project for sign-in, saved progression, and admin tools.

```bash
git clone https://github.com/CosmonautJones/Portfolio.git
cd Portfolio
npm ci
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local` for the last command.

1. Fill in the Supabase URL, anon key, service role key, and admin email in `.env.local`.
2. Apply the SQL files in [`supabase/migrations/`](supabase/migrations) in ascending version order to your own database. The [setup guide](docs/guides/local-setup.md) covers migrations and existing-history reconciliation.
3. For sign-in, enable GitHub OAuth in Supabase, set the local site URL to `http://localhost:3000`, and allow `http://localhost:3000/auth/confirm`. Set the GitHub OAuth app callback to your Supabase project’s `/auth/v1/callback` URL.
4. Add Resend credentials to exercise email delivery. The contact endpoint returns `503` when email is unconfigured.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). See the [local setup guide](docs/guides/local-setup.md), [auth guide](docs/auth.md), and [deployment guide](docs/deployment.md) for full configuration.

### Environment reference

[`.env.example`](.env.example) is the configuration template. Keep server credentials out of browser code and source control.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client initialization; safe to expose as a project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and middleware clients; access depends on database policies |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations; bypasses RLS, so keep it server-only |
| `ADMIN_EMAIL` | Matching the authenticated GitHub email for `/tools` and `/admin` access |
| `RESEND_API_KEY` | Sending contact email from the server |
| `RESEND_FROM_EMAIL` | A verified Resend sender/domain |
| `CONTACT_TO_EMAIL` | Contact recipient; the endpoint falls back to the site’s configured email |
| `GITHUB_TOKEN` | Optional higher GitHub API rate limits for imports; unrelated to OAuth login |

## Architecture and decisions

- **Separate the visitor path from administration.** Home, work, about, résumé, contact, and public demos do not require sign-in. Both `/tools` and `/admin` require the configured admin identity; non-admin accounts are redirected to Adventure. See [session middleware](src/lib/supabase/middleware.ts).
- **Keep tools flexible.** External tools link out, internal tools load React components lazily, and embedded tools serve stored HTML through `/api/embed/[slug]` in an iframe. Each has different integration and trust boundaries. See the [tool system](docs/tool-system.md).
- **Keep simulation logic outside React.** The Frogger-style engine in [`src/lib/game/`](src/lib/game) uses a fixed timestep; a React canvas component connects it to the page. Canvas sprite caching and procedural Web Audio keep the arcade implementation self-contained. See the [game engine](docs/game-engine.md).
- **Verify privileged mutations on the server.** Middleware checks session claims for routing; admin actions also verify the user before using the service-role client. Row-level security governs user-owned data. The contact form posts to `/api/contact`, which validates the request and sends through Resend. See [authentication](docs/auth.md) and [database design](docs/database.md).
- **Make exploration optional.** XP, achievements, terminal commands, and easter eggs sit alongside professional content. They do not gate the public collection. See [progression](docs/progression-system.md) and [terminal behavior](docs/terminal-easter-eggs.md).

### Where to look in the source

| Path | Purpose |
| --- | --- |
| [`src/app/`](src/app) | Public, auth, protected, and adventure route groups; contact and embed endpoints |
| [`src/components/`](src/components) | Portfolio, demo, tool, progression, terminal, and UI components |
| [`src/actions/`](src/actions) | Tool/project management, notes, profiles, scores, auth, and deploy hooks |
| [`src/lib/constants.ts`](src/lib/constants.ts) | Site identity, projects, skills, navigation, and experience; also feeds terminal commands |
| [`supabase/migrations/`](supabase/migrations) | Schema, triggers, and access policies for tools, notes, profiles, XP, achievements, scores, and events |
| [`docs/README.md`](docs/README.md) | Documentation index: architecture, components, testing, deployment, and more |

## Evidence and limits

- The [live portfolio](https://www.travisjohnjones.com) and [Actions on `main`](https://github.com/CosmonautJones/Portfolio/actions?query=branch%3Amain) show current public behavior and repository checks. Passing CI does not prove contact delivery, OAuth configuration, or every external project’s readiness.
- Public access does not grant access to the admin tool hub. Local authentication, persisted progression, and admin workflows require configured Supabase services.
- Email delivery depends on Resend credentials and a verified domain. GitHub imports depend on the GitHub API; imported or external tools have their own requirements.
- This README does not represent employer code or certify the production readiness of linked experiments. See each project’s repository for its status and limitations.
- The [mission](tasks/current-mission.md) and [review log](docs/agent-review-log.md) retain existing follow-ups, including previously reported dependency vulnerabilities and a React hook warning. Check current CI and dependency reports for their present state.

### Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with Turbopack |
| `npm test` | Vitest suite |
| `npm run test:watch` | Interactive test watcher |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve a completed production build |

See [testing guidance](docs/testing.md) for existing unit and component tests.

## Next priorities

The [current mission](tasks/current-mission.md) and [product rubric](evals/product-rubric.md) guide further work:

- Keep the path from professional background to a useful artifact and contact clear.
- Improve demo loading/failure states, mobile readability, keyboard use, and reduced-motion behavior.
- Keep project access and résumé evidence current before expanding hidden features or admin tooling.

<details>
<summary>Hosting, DNS, and operational reference</summary>

The repository’s [`netlify.toml`](netlify.toml) targets Node 20, builds with `npm run build`, publishes `.next`, and uses Netlify’s Next.js plugin. Existing deployment documentation describes deployment from `main`; Netlify PR checks provide deployment feedback.

Production configuration includes Supabase values and contact email credentials. The documented domain is `travisjohnjones.com`. Existing documentation describes Netlify DNS / NS1; confirm the authoritative zone before infrastructure changes.

For Resend verification, documented sending records are `TXT` at `resend._domainkey`, `MX` and `TXT` at `send`, and an optional `_dmarc` TXT record. Use values supplied by Resend for your own domain. If Netlify/NS1 is authoritative, records belong in that zone rather than only at the registrar.

Admin tools can store Netlify build-hook URLs and call the `triggerDeploy` server action. See [deployment guidance](docs/deployment.md) for environment, OAuth, host, and build-hook details. Sharp supports Next.js image/build optimization.

</details>

<details>
<summary>Related projects and contributor guidance</summary>

Related repositories include [AI Usage Overlays](https://github.com/CosmonautJones/ai-usage-overlays), [Mission Control](https://github.com/CosmonautJones/mission-control), and [The Conductor](https://github.com/CosmonautJones/the-conductor). They are separate projects with separate requirements.

Before product work, read [`AGENTS.md`](AGENTS.md), [vision](docs/vision.md), [core loop](docs/core-loop.md), [taste bar](docs/taste-bar.md), and [anti-goals](docs/anti-goals.md). Scope and acceptance live in [`tasks/current-mission.md`](tasks/current-mission.md), [`tasks/completed.md`](tasks/completed.md), and [`evals/product-rubric.md`](evals/product-rubric.md).

</details>

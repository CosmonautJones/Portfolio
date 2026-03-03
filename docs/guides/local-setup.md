# Guide: Local Development Setup

## Prerequisites

- Node.js 20+
- npm
- A Supabase project (free tier works)
- A GitHub OAuth App (for auth)

## Step 1: Clone and Install

```bash
git clone <repo-url>
cd Portfolio
npm install
```

## Step 2: Configure Environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ADMIN_EMAIL=<your-email>
```

Optional:
```env
GITHUB_TOKEN=<personal-access-token>  # Increases GitHub API rate limit
```

See [../deployment.md](../deployment.md) for where to find each value.

## Step 3: Configure Supabase Auth

In the Supabase dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to `http://localhost:3000`
3. Add `http://localhost:3000/auth/confirm` to **Redirect URLs**

Then set up GitHub OAuth:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set **Authorization callback URL** to: `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
4. Copy the Client ID and Secret
5. In Supabase: **Authentication** → **Providers** → **GitHub** → enter Client ID and Secret

## Step 4: Run Database Migrations

Apply all migrations using the Supabase CLI or by pasting them in the SQL editor:

```bash
# If using Supabase CLI (linked to your project):
supabase db push

# Or apply manually via Supabase dashboard SQL editor
# in supabase/migrations/ — apply in numeric order
```

## Step 5: Start the Dev Server

```bash
npm run dev
```

The site runs at `http://localhost:3000`. Turbopack is used for fast HMR.

## Development Workflow

```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run lint         # ESLint
npm run build        # Test production build
```

## Path Aliases

The TypeScript path alias `@/*` maps to `./src/*`. Use it throughout:

```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

## Middleware in Development

The middleware runs on all requests. If you see unexpected redirects:
1. Check your `ADMIN_EMAIL` env var matches your GitHub email
2. Clear browser cookies for localhost
3. Check the middleware routing rules in [../auth.md](../auth.md)

## Related Documents

- [../deployment.md](../deployment.md) — Production deployment and env vars
- [../auth.md](../auth.md) — Auth flow and middleware
- [../database.md](../database.md) — Database schema and migrations
- [../testing.md](../testing.md) — Testing setup

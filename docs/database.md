# Database

## Overview

Supabase PostgreSQL. Migrations live in `supabase/migrations/`. Seven tables with Row Level Security (RLS) enabled on all user-data tables.

## Tables

### `tools`

Created: `001_create_tools_table.sql`, extended in `005`, `011`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `slug` | TEXT UNIQUE | URL-safe identifier |
| `name` | TEXT | Display name |
| `type` | TEXT | `'internal' \| 'external' \| 'embedded'` |
| `status` | TEXT | `'enabled' \| 'disabled'`, default `'enabled'` |
| `url` | TEXT | Required for `external` type |
| `description` | TEXT | Optional |
| `tags` | TEXT[] | Default `'{}'` |
| `icon` | TEXT | Lucide icon name |
| `build_hook_url` | TEXT | Netlify deploy hook |
| `html_content` | TEXT | For `embedded` type only |
| `created_at` | TIMESTAMPTZ | `now()` |

Indexes: `idx_tools_slug`, `idx_tools_status`

Constraint: `external_tool_requires_url` — `type != 'external' OR url IS NOT NULL`

RLS: Admin-only mutations via service role key (bypasses RLS). Reads unrestricted for authenticated admin.

---

### `notes`

Created: `002_create_notes_table.sql`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK | References `auth.users(id)`, `ON DELETE CASCADE` |
| `title` | TEXT | |
| `content` | TEXT | |
| `created_at` | TIMESTAMPTZ | `now()` |
| `updated_at` | TIMESTAMPTZ | `now()`, auto-updated via trigger |

RLS policies:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

Trigger: `on_notes_updated` — sets `updated_at = now()` before each UPDATE.

---

### `projects` and `tasks`

Created: `007_create_projects_tables.sql`.

**`projects`**:

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | References `auth.users(id)` |
| `name` | TEXT | |
| `description` | TEXT | |
| `status` | TEXT | `'active' \| 'completed' \| 'archived'` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated |

**`tasks`**:

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `project_id` | UUID FK | References `projects(id)`, `ON DELETE CASCADE` |
| `user_id` | UUID FK | References `auth.users(id)` |
| `title` | TEXT | |
| `status` | TEXT | `'todo' \| 'in_progress' \| 'done'` |
| `priority` | TEXT | `'low' \| 'medium' \| 'high'` |
| `due_date` | DATE | Optional |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated |

RLS: Same per-user pattern as `notes`.

---

### `game_scores`

Created: `008_create_game_scores.sql`, extended in `009_achievements_and_scoreboard.sql`, `011_add_game_type.sql`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | References `auth.users(id)`, nullable |
| `score` | INTEGER | |
| `death_cause` | TEXT | DeathCause enum value |
| `display_name` | TEXT | Optional display name for leaderboard |
| `game_type` | TEXT | e.g. `'adventure'` — supports multiple games |
| `created_at` | TIMESTAMPTZ | |

RLS:
- SELECT: public (leaderboard visible to all)
- INSERT: `auth.uid() = user_id`

---

### `profiles`

Created: `009_create_profiles.sql`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | FK to `auth.users(id)`, `ON DELETE CASCADE` |
| `display_name` | TEXT | From GitHub user_name/full_name |
| `avatar_url` | TEXT | From GitHub avatar |
| `xp` | INTEGER | Default 0 |
| `level` | INTEGER | Default 1 |
| `title` | TEXT | Default `'Visitor'` |
| `achievements` | JSONB | Array of achievement ID strings, default `[]` |
| `discoveries` | JSONB | Array of easter egg ID strings, default `[]` |
| `streak_days` | INTEGER | Default 0 |
| `last_visit` | DATE | Updated each session |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

RLS:
- SELECT: public (`USING (true)`)
- INSERT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`

Triggers:
- `on_profiles_updated` — sets `updated_at = now()`
- `on_auth_user_created` — auto-creates profile when user signs up, populating `display_name` and `avatar_url` from GitHub metadata

---

### `events`

Created: `010_create_events.sql`.

Audit trail for XP awards, achievement unlocks, and analytics.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK | References `auth.users(id)`, `ON DELETE SET NULL` |
| `event_type` | TEXT | e.g. `'xp_awarded'`, `'achievement_unlocked'`, `'view_project'` |
| `payload` | JSONB | Default `{}` |
| `created_at` | TIMESTAMPTZ | |

RLS:
- INSERT: `auth.uid() = user_id`
- SELECT: `auth.uid() = user_id`

Indexes:
- `idx_events_user_type ON (user_id, event_type)`
- `idx_events_created ON (created_at DESC)`

---

## RLS Policy Summary

| Table | Public Read | Auth Read | Auth Write | Admin Write |
|---|---|---|---|---|
| `tools` | No | Admin only | No | Via service role |
| `notes` | No | Own rows | Own rows | — |
| `projects` | No | Own rows | Own rows | — |
| `tasks` | No | Own rows | Own rows | — |
| `game_scores` | Yes (leaderboard) | — | Own rows | — |
| `profiles` | Yes | — | Own row | — |
| `events` | No | Own rows | Own rows | — |

---

## Migrations Index

| File | Description |
|---|---|
| `001_create_tools_table.sql` | `tools` table |
| `002_create_notes_table.sql` | `notes` table with RLS |
| `003_rls_policies.sql` | Initial RLS policies |
| `004_seed_initial_tools.sql` | Seed data for initial tools |
| `005_add_embedded_tool_type.sql` | Adds `embedded` type + `html_content` column |
| `006_fix_rls_performance_and_function_search_path.sql` | Performance and security fixes |
| `007_create_projects_tables.sql` | `projects` and `tasks` tables |
| `008_create_game_scores.sql` | `game_scores` table |
| `009_achievements_and_scoreboard.sql` | Scoreboard enhancements |
| `009_create_profiles.sql` | `profiles` table + triggers |
| `010_create_events.sql` | `events` audit table |
| `011_add_game_type.sql` | `game_type` column on `game_scores` |

---

## Supabase Client Factories

| File | Client Type | When to Use |
|---|---|---|
| `src/lib/supabase/client.ts` | Browser (anon key) | Client components |
| `src/lib/supabase/server.ts` | Server (anon key) | Server components, server actions |
| `src/lib/supabase/admin.ts` | Service role (bypasses RLS) | Admin server actions only |

## Related Files

- `supabase/migrations/` — All schema migrations
- `src/lib/supabase/` — Client factories
- `src/lib/types.ts` — TypeScript interfaces matching table schema
- `src/actions/` — Server actions that query the database

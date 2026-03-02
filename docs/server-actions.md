# Server Actions

## Overview

All mutations go through Next.js server actions in `src/actions/`. No API routes are used for mutations. Each action file has `"use server"` at the top. Admin actions call `requireAdmin()` before operating.

## `src/actions/tools.ts`

Manages tool CRUD and GitHub import. All actions require admin authentication.

| Action | Signature | Description |
|---|---|---|
| `importFromGitHub` | `(repoUrl: string)` | Fetches GitHub repo metadata, returns pre-filled form data |
| `fetchRepoHtml` | `(repoUrl: string)` | Assembles single-file HTML document from repo, inlining CSS/JS |
| `createTool` | `(formData: FormData)` | Creates tool record, validates with `toolSchema` |
| `updateTool` | `(toolId: string, formData: FormData)` | Updates tool, validates with `toolSchema` |
| `toggleToolStatus` | `(toolId: string, currentStatus: string)` | Flips status between enabled/disabled |
| `deleteTool` | `(toolId: string)` | Deletes tool record |

All CRUD actions call `revalidatePath("/admin/tools")` and `revalidatePath("/tools")` on success.

Return type convention:
- Success: `{ success: true }` or `{ data: ... }`
- Error: `{ error: string }`

---

## `src/actions/notes.ts`

Note CRUD, per-user via RLS. No admin check needed — RLS handles isolation.

| Action | Signature | Description |
|---|---|---|
| `getNotes` | `()` | Fetch authenticated user's notes |
| `createNote` | `(formData: FormData)` | Create note, validates with `noteSchema` |
| `updateNote` | `(noteId: string, formData: FormData)` | Update note |
| `deleteNote` | `(noteId: string)` | Delete note |

---

## `src/actions/projects.ts`

Project and task CRUD, per-user via RLS.

| Action | Signature | Description |
|---|---|---|
| `getProjects` | `()` | Fetch user's projects |
| `createProject` | `(formData: FormData)` | Create project, validates with `projectSchema` |
| `updateProject` | `(projectId: string, formData: FormData)` | Update project |
| `deleteProject` | `(projectId: string)` | Delete project + cascades to tasks |
| `getTasks` | `(projectId: string)` | Fetch tasks for a project |
| `createTask` | `(projectId: string, formData: FormData)` | Create task, validates with `taskSchema` |
| `updateTask` | `(taskId: string, formData: FormData)` | Update task |
| `deleteTask` | `(taskId: string)` | Delete task |

---

## `src/actions/profiles.ts`

Progression system. All actions require authenticated user.

| Action | Signature | Returns |
|---|---|---|
| `getProfile` | `()` | `{ profile: Profile \| null }` — auto-creates if missing |
| `awardXP` | `(amount: number, reason: string)` | `{ newXP, newLevel, newTitle, leveledUp }` |
| `unlockAchievement` | `(achievementId: string)` | `{ unlocked, alreadyHad, xpAwarded }` |
| `trackEvent` | `(eventType: string, payload?)` | `{ success: boolean }` |
| `addDiscovery` | `(eggId: string)` | `void` (fire-and-forget) |
| `updateStreak` | `()` | `{ streakDays: number }` |

`getProfile` auto-creates profile if the row doesn't exist (handles race condition on first login).

`awardXP` and `unlockAchievement` both insert into the `events` table as audit trail.

---

## `src/actions/auth.ts`

| Action | Signature | Description |
|---|---|---|
| `signOut` | `()` | Calls `supabase.auth.signOut()`, redirects to `/` |

---

## `src/actions/deploy.ts`

Netlify deploy webhook trigger. Requires admin.

| Action | Signature | Description |
|---|---|---|
| `triggerDeploy` | `(buildHookUrl: string)` | POSTs to Netlify build hook URL |

Used by `DeployButton` component in admin panel.

---

## `src/actions/game-scores.ts`

Leaderboard management.

| Action | Signature | Description |
|---|---|---|
| `submitScore` | `(score, deathCause, gameType, displayName?)` | Inserts score record |
| `getLeaderboard` | `(gameType: string, limit?: number)` | Top N scores with rank |
| `getRecentScores` | `(gameType: string, limit?: number)` | Current user's recent scores |

`getLeaderboard` returns `LeaderboardEntry[]` with `isCurrentUser` flag.

---

## Admin Guard Pattern

```typescript
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

Uses `getUser()` (network call) for full verification, not cached JWT. `isAdminEmail()` checks against `process.env.ADMIN_EMAIL`.

## Form Validation

`src/lib/validations.ts` — Zod schemas:

| Schema | Used By |
|---|---|
| `toolSchema` | `createTool`, `updateTool` |
| `noteSchema` | `createNote`, `updateNote` |
| `projectSchema` | `createProject`, `updateProject` |
| `taskSchema` | `createTask`, `updateTask` |

## Related Files

- `src/actions/` — All server action files
- `src/lib/validations.ts` — Zod schemas
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/lib/supabase/admin.ts` — Admin Supabase client
- `src/lib/utils.ts` — `isAdminEmail()`

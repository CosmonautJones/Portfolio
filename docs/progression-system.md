# Progression System

## Overview

The progression system provides XP, levels, achievements, and visit streaks for authenticated users. It's wired into the root layout via `VisitorProvider` and uses optimistic UI — XP and achievement state are updated locally first, then synced to the server fire-and-forget.

## Architecture

```
VisitorProvider (src/lib/visitor-context.tsx)
  ├── Loads profile on mount via getProfile()
  ├── Listens to Supabase auth state changes
  ├── Updates streak on each session load
  ├── Exposes: profile, isAuthenticated, loading, awardXP, unlockAchievement, trackEvent, refreshProfile
  └── Session-level dedup via module-level Set

use-visitor hook (src/hooks/use-visitor.ts)
  └── Convenience wrapper for VisitorContext

use-easter-egg hook (src/hooks/use-easter-egg.ts)
  ├── discover(eggId) — awards XP, tracks event, unlocks achievement, calls addDiscovery()
  └── isDiscovered(eggId) — checks profile.discoveries array

Server actions (src/actions/profiles.ts)
  ├── getProfile — fetch or auto-create profile
  ├── awardXP — update XP + level + log event
  ├── unlockAchievement — append to achievements array + award XP
  ├── trackEvent — insert row into events table
  ├── addDiscovery — append easter egg ID to discoveries array (called directly, not via context)
  └── updateStreak — compare last_visit date, increment or reset
```

## XP Awards

Defined in `src/lib/xp.ts` as `XP_AWARDS`:

| Action | XP | Dedup Rule |
|---|---|---|
| `first_visit` | 10 | `once_ever` |
| `view_project` | 5 | `per_session` |
| `play_game` | 10 | `per_session` |
| `score_50` | 25 | `once_ever` |
| `score_100` | 50 | `once_ever` |
| `score_200` | 100 | `once_ever` |
| `use_demo` | 15 | `per_session` |
| `export_pixel_art` | 10 | `per_day` |
| `find_easter_egg` | 50 | `once_ever` |
| `streak_3` | 30 | `once_ever` |
| `streak_7` | 75 | `once_ever` |
| `toggle_theme` | 5 | `once_ever` |
| `open_terminal` | 10 | `once_ever` |
| `open_hidden_terminal` | 25 | `once_ever` |

**Dedup rules:**
- `once_ever` — checked via `sessionAwarded` Set (module-level, persists until page reload)
- `per_session` — same Set, keyed by action name
- `per_day` — server-side logic (not yet fully implemented on client)

## Level Thresholds

Defined in `src/lib/xp.ts` as `LEVELS`:

| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Visitor |
| 2 | 50 | Explorer |
| 3 | 150 | Adventurer |
| 4 | 350 | Discoverer |
| 5 | 600 | Code Archaeologist |
| 6 | 1,000 | Keeper of Secrets |
| 7 | 1,500 | Pixel Veteran |
| 8 | 2,500 | Gunter |
| 9 | 4,000 | CosmonautJones |
| 10 | 6,000 | High Five |

**XP utility functions** (`src/lib/xp.ts`):
- `getLevelForXP(xp)` — returns level object for given XP
- `getNextLevelXP(xp)` — XP needed for next level, `null` at max
- `getLevelProgress(xp)` — 0–100 percentage toward next level

## Achievements

Defined in `src/lib/achievements.ts` as `ACHIEVEMENTS` (13 total):

| ID | Name | XP | Secret | Condition |
|---|---|---|---|---|
| `first_steps` | First Steps | 10 | No | `first_visit` event |
| `road_scholar` | Road Scholar | 25 | No | 3× `view_project` |
| `mixologist` | Mixologist | 30 | No | 6× `make_cocktail` |
| `pixel_perfect` | Pixel Perfect | 30 | No | `fill_canvas` event |
| `hop_skip` | Hop Skip | 25 | No | Adventure score ≥ 50 |
| `road_warrior` | Road Warrior | 75 | No | Adventure score ≥ 200 |
| `night_owl` | Night Owl | 5 | No | `toggle_theme` event |
| `konami` | Up Up Down Down | 50 | Yes | Manual (Konami code) |
| `red_pill` | Red Pill | 50 | Yes | Manual (hidden terminal) |
| `halliday_egg` | The Egg | 100 | Yes | Manual (vault) |
| `cartographer` | Cartographer | 150 | Yes | 5× `find_easter_egg` |
| `streak_3` | Three-Peat | 30 | No | 3-day streak |
| `streak_7` | Committed | 75 | No | 7-day streak |

**Achievement condition types** (`AchievementCondition` in `src/lib/types.ts`):
- `{ type: "event"; eventType: string }` — triggered by a specific event
- `{ type: "event_count"; eventType: string; count: number }` — N occurrences
- `{ type: "score"; gameType: string; threshold: number }` — game score milestone
- `{ type: "streak"; days: number }` — visit streak
- `{ type: "manual" }` — unlocked explicitly by calling `unlockAchievement()`

**Achievement utilities** (`src/lib/achievements.ts`):
- `getAchievement(id)` — look up by ID
- `getPublicAchievements()` — filter out secret achievements
- `getTotalAchievementCount()` — total count (13)

## Profile Data Model

```typescript
interface Profile {
  id: string;           // UUID, FK to auth.users
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  title: string;
  achievements: string[];    // JSONB array of achievement IDs
  discoveries: string[];     // JSONB array of easter egg IDs
  streak_days: number;
  last_visit: string | null; // DATE string YYYY-MM-DD
  created_at: string;
  updated_at: string;
}
```

Profile is auto-created by a Postgres trigger (`on_auth_user_created`) when a user signs in for the first time.

## UI Components

Located in `src/components/progression/`:

| Component | Description |
|---|---|
| `xp-bar.tsx` | XP progress bar toward next level |
| `achievement-panel.tsx` | Panel showing earned achievements |
| `achievement-toast.tsx` | Toast notification on unlock |
| `level-up-overlay.tsx` | Full-screen overlay animation on level-up |

## Streak Tracking

`updateStreak()` in `src/actions/profiles.ts`:
1. Get `streak_days` and `last_visit` from profile
2. Compare `last_visit` to today
3. If same day: no change (idempotent)
4. If yesterday: `streak_days + 1`
5. If older: reset to 1
6. Update `streak_days` and `last_visit`

Called from `VisitorProvider` on each mount/auth-state-change.

## Optimistic UI Pattern

```
User action
  → awardXP() called
      → Dedup check (sessionAwarded Set)
      → setProfile() — local state updated immediately
      → Toast shown ("+ N XP")
      → Level-up check → toast if leveled up
      → serverAwardXP() — fire-and-forget
      → serverTrackEvent() — fire-and-forget
```

The UI never waits for server confirmation. If the server call fails, the local state diverges until the next `refreshProfile()` call (which happens on next auth-state-change or manual trigger).

## Related Files

- `src/lib/xp.ts` — XP amounts, level thresholds, utility functions
- `src/lib/achievements.ts` — Achievement definitions
- `src/lib/visitor-context.tsx` — VisitorProvider and context
- `src/lib/types.ts` — Profile, Achievement, AchievementCondition interfaces
- `src/hooks/use-visitor.ts` — Hook
- `src/actions/profiles.ts` — Server actions
- `src/components/progression/` — UI components
- `supabase/migrations/009_create_profiles.sql` — Schema
- `supabase/migrations/010_create_events.sql` — Events table

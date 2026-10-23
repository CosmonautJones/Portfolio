import { getAchievement } from "@/lib/achievements";
import type { Profile } from "@/lib/types";
import { XP_AWARDS, getLevelForXP, type XPAction } from "@/lib/xp";

export const GUEST_PROFILE_KEY = "portfolio_guest_profile";
export const GUEST_ID = "guest";

export interface GuestState {
  profile: Profile;
  awardedKeys: string[];
}

export function createEmptyGuestProfile(now = new Date()): Profile {
  const level = getLevelForXP(0);
  const iso = now.toISOString();
  return {
    id: GUEST_ID,
    display_name: "Guest",
    avatar_url: null,
    xp: 0,
    level: level.level,
    title: level.title,
    achievements: [],
    discoveries: [],
    streak_days: 1,
    last_visit: iso.slice(0, 10),
    created_at: iso,
    updated_at: iso,
  };
}

export function emptyGuestState(now = new Date()): GuestState {
  return { profile: createEmptyGuestProfile(now), awardedKeys: [] };
}

function readStorage(): GuestState | null {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestState;
    if (!parsed?.profile || !Array.isArray(parsed.awardedKeys)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loadGuestState(now = new Date()): GuestState {
  return readStorage() ?? emptyGuestState(now);
}

export function saveGuestState(state: GuestState): void {
  try {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

function applyLevel(profile: Profile, xp: number, now: Date): Profile {
  const level = getLevelForXP(xp);
  return {
    ...profile,
    xp,
    level: level.level,
    title: level.title,
    updated_at: now.toISOString(),
  };
}

export function awardKey(action: XPAction, meta?: Record<string, unknown>, now = new Date()): string {
  const extra = meta?.key ?? "";
  const award = XP_AWARDS[action];
  if (award.rule === "per_day") {
    return `${action}:${extra}:${now.toISOString().slice(0, 10)}`;
  }
  return `${action}:${extra}`;
}

export function awardGuestXP(
  state: GuestState,
  action: XPAction,
  meta: Record<string, unknown> | undefined,
  sessionKeys: Set<string>,
  now = new Date(),
): { state: GuestState; awarded: boolean; xp: number; leveledUp: boolean } {
  const award = XP_AWARDS[action];
  if (!award) {
    return { state, awarded: false, xp: 0, leveledUp: false };
  }

  const key = awardKey(action, meta, now);
  if (sessionKeys.has(key)) {
    return { state, awarded: false, xp: 0, leveledUp: false };
  }
  if (award.rule === "once_ever" && state.awardedKeys.includes(key)) {
    return { state, awarded: false, xp: 0, leveledUp: false };
  }
  if (award.rule === "per_day" && state.awardedKeys.includes(key)) {
    return { state, awarded: false, xp: 0, leveledUp: false };
  }

  sessionKeys.add(key);
  const awardedKeys =
    award.rule === "per_session"
      ? state.awardedKeys
      : state.awardedKeys.includes(key)
        ? state.awardedKeys
        : [...state.awardedKeys, key];

  const oldLevel = state.profile.level;
  const newXP = state.profile.xp + award.xp;
  const profile = applyLevel(state.profile, newXP, now);
  return {
    state: { profile, awardedKeys },
    awarded: true,
    xp: award.xp,
    leveledUp: profile.level > oldLevel,
  };
}

export function unlockGuestAchievement(
  state: GuestState,
  id: string,
  now = new Date(),
): { state: GuestState; unlocked: boolean; xp: number } {
  if (state.profile.achievements.includes(id)) {
    return { state, unlocked: false, xp: 0 };
  }
  const achievement = getAchievement(id);
  if (!achievement) {
    return { state, unlocked: false, xp: 0 };
  }

  const newXP = state.profile.xp + achievement.xpReward;
  const profile = applyLevel(
    {
      ...state.profile,
      achievements: [...state.profile.achievements, id],
    },
    newXP,
    now,
  );
  return {
    state: { ...state, profile },
    unlocked: true,
    xp: achievement.xpReward,
  };
}

export function refreshGuestVisit(state: GuestState, now = new Date()): GuestState {
  const today = now.toISOString().slice(0, 10);
  if (state.profile.last_visit === today) return state;

  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  const streakDays =
    state.profile.last_visit === yesterdayKey ? state.profile.streak_days + 1 : 1;

  return {
    ...state,
    profile: {
      ...state.profile,
      last_visit: today,
      streak_days: streakDays,
      updated_at: now.toISOString(),
    },
  };
}

export function recordGuestDiscovery(
  state: GuestState,
  eggId: string,
  now = new Date(),
): { state: GuestState; added: boolean } {
  if (state.profile.discoveries.includes(eggId)) {
    return { state, added: false };
  }
  return {
    state: {
      ...state,
      profile: {
        ...state.profile,
        discoveries: [...state.profile.discoveries, eggId],
        updated_at: now.toISOString(),
      },
    },
    added: true,
  };
}

export function streakAchievementsFor(days: number): string[] {
  const ids: string[] = [];
  if (days >= 3) ids.push("streak_3");
  if (days >= 7) ids.push("streak_7");
  return ids;
}

export function mergeGuestIntoProfile(guest: Profile, server: Profile): Profile {
  const xp = Math.max(guest.xp, server.xp);
  const achievements = [...new Set([...server.achievements, ...guest.achievements])];
  const discoveries = [...new Set([...server.discoveries, ...guest.discoveries])];
  const level = getLevelForXP(xp);
  return {
    ...server,
    xp,
    achievements,
    discoveries,
    streak_days: Math.max(guest.streak_days, server.streak_days),
    level: level.level,
    title: level.title,
  };
}

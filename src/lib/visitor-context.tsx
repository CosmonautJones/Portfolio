"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { hasAuthCookies } from "@/lib/supabase/cookies";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getProfile,
  awardXP as serverAwardXP,
  unlockAchievement as serverUnlockAchievement,
  trackEvent as serverTrackEvent,
  updateStreak,
  addDiscovery,
} from "@/actions/profiles";
import { XP_AWARDS, getLevelForXP, type XPAction } from "@/lib/xp";
import { getAchievement } from "@/lib/achievements";
import { shouldUnlockCartographer } from "@/lib/easter-eggs/triggers";
import type { Profile } from "@/lib/types";
import {
  GUEST_ID,
  awardGuestXP,
  emptyGuestState,
  loadGuestState,
  recordGuestDiscovery,
  refreshGuestVisit,
  saveGuestState,
  streakAchievementsFor,
  unlockGuestAchievement,
  type GuestState,
} from "@/lib/guest-profile";
import { AchievementTracker } from "@/lib/game/achievement-tracker";

function loadGuestStateSafe(): GuestState {
  if (typeof window === "undefined") return emptyGuestState();
  return loadGuestState();
}

interface VisitorContextValue {
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** Award XP for a tracked action. Handles deduplication and optimistic UI. */
  awardXP: (action: XPAction, meta?: Record<string, unknown>) => void;
  /** Manually unlock a specific achievement by ID. */
  unlockAchievement: (id: string) => void;
  /** Track a raw event (fire-and-forget). */
  trackEvent: (type: string, payload?: Record<string, unknown>) => void;
  /** Record an easter-egg discovery on the local or server profile. */
  recordDiscovery: (eggId: string) => void;
  /** Refresh profile from the server. */
  refreshProfile: () => Promise<void>;
}

export const VisitorContext = createContext<VisitorContextValue>({
  profile: null,
  isAuthenticated: false,
  loading: true,
  awardXP: () => {},
  unlockAchievement: () => {},
  trackEvent: () => {},
  recordDiscovery: () => {},
  refreshProfile: async () => {},
});

// Session-level dedup for "per_session" XP actions
const sessionAwarded = new Set<string>();
let streakUpdatedThisSession = false;

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const profileRef = useRef<Profile | null>(null);
  profileRef.current = profile;
  const guestStateRef = useRef<GuestState | null>(null);

  function persistGuest(state: GuestState) {
    guestStateRef.current = state;
    saveGuestState(state);
    setProfile(state.profile);
  }

  function bootGuestProfile() {
    let state = refreshGuestVisit(loadGuestStateSafe());
    const visit = awardGuestXP(state, "first_visit", undefined, sessionAwarded);
    state = visit.state;
    if (visit.awarded) {
      toast.success(`+${visit.xp} XP`, {
        description: "first visit",
        duration: 3000,
      });
      const unlocked = unlockGuestAchievement(state, "first_steps");
      state = unlocked.state;
      if (unlocked.unlocked) {
        const achievement = getAchievement("first_steps");
        if (achievement) {
          toast.success(`Achievement Unlocked: ${achievement.name}`, {
            description: `${achievement.description} (+${achievement.xpReward} XP)`,
            duration: 5000,
          });
        }
      }
    }
    for (const id of streakAchievementsFor(state.profile.streak_days)) {
      state = unlockGuestAchievement(state, id).state;
    }
    if (typeof window !== "undefined") {
      for (const id of AchievementTracker.loadUnlocked()) {
        state = unlockGuestAchievement(state, id).state;
      }
    }
    if (shouldUnlockCartographer(state.profile.discoveries)) {
      state = unlockGuestAchievement(state, "cartographer").state;
    }
    persistGuest(state);
    setIsAuthenticated(false);
    setLoading(false);
  }

  // Load profile on mount + listen to auth changes
  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};

    // Fast path: anonymous visitors (no auth cookies) never need the Supabase
    // client. Skipping the dynamic import keeps the ~55 kB auth/realtime bundle
    // off the page entirely for the common unauthenticated case. A sign-in is a
    // full-page OAuth redirect, so a fresh page load picks the session up.
    if (!hasAuthCookies()) {
      bootGuestProfile();
      return () => {
        mounted = false;
      };
    }

    async function loadProfile(supabase: SupabaseClient) {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) bootGuestProfile();
        return;
      }

      if (mounted) setIsAuthenticated(true);

      const result = await getProfile();
      if (mounted && result.profile) {
        setProfile(result.profile);

        // First visit — award XP (session-deduped) and unlock "first_steps"
        // (achievement is once-ever via the includes() guard).
        awardXPForProfile("first_visit", result.profile);
        checkAndUnlockAchievement("first_steps", result.profile);
      }
      if (mounted) setLoading(false);

      // Update streak on load (once per session)
      if (session && !streakUpdatedThisSession) {
        streakUpdatedThisSession = true;
        const streakResult = await updateStreak();
        if ("streakDays" in streakResult && mounted) {
          setProfile((prev) =>
            prev ? { ...prev, streak_days: streakResult.streakDays } : prev
          );

          // Check streak achievements
          if (streakResult.streakDays >= 3) {
            checkAndUnlockAchievement("streak_3", result.profile);
          }
          if (streakResult.streakDays >= 7) {
            checkAndUnlockAchievement("streak_7", result.profile);
          }
        }
      }
    }

    // Auth cookies exist — lazily pull in the Supabase client (off the
    // critical path) and reuse a single instance for the session.
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      if (!mounted) return;
      const supabase = createClient();

      await loadProfile(supabase);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session) {
            setIsAuthenticated(true);
            loadProfile(supabase);
          } else {
            bootGuestProfile();
          }
        }
      );
      cleanup = () => subscription.unsubscribe();
    })();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  function checkAndUnlockAchievement(id: string, currentProfile: Profile | null) {
    const achievements = currentProfile?.achievements ?? [];
    if (achievements.includes(id)) return;

    const achievement = getAchievement(id);
    if (!achievement) return;

    // Optimistic update
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, id],
        xp: prev.xp + achievement.xpReward,
        level: getLevelForXP(prev.xp + achievement.xpReward).level,
        title: getLevelForXP(prev.xp + achievement.xpReward).title,
      };
    });

    toast.success(`Achievement Unlocked: ${achievement.name}`, {
      description: `${achievement.description} (+${achievement.xpReward} XP)`,
      duration: 5000,
    });

    // Persist server-side (fire-and-forget)
    serverUnlockAchievement(id);
  }

  // Core XP-award logic operating on an explicit profile. Used both by the
  // imperative awardXP callback and by lifecycle awards fired during profile
  // load (where profileRef/isAuthenticated state may not have flushed yet).
  function awardXPForProfile(
    action: XPAction,
    currentProfile: Profile | null,
    meta?: Record<string, unknown>
  ) {
    if (!currentProfile) return;

    const award = XP_AWARDS[action];
    if (!award) return;

    // Dedup check
    const dedupKey = `${action}:${meta?.key ?? ""}`;
    if (award.rule === "once_ever") {
      if (sessionAwarded.has(dedupKey)) return;
    }
    if (award.rule === "per_session") {
      if (sessionAwarded.has(dedupKey)) return;
    }

    sessionAwarded.add(dedupKey);

    const oldLevel = currentProfile.level;

    // Optimistic UI update
    setProfile((prev) => {
      if (!prev) return prev;
      const newXP = prev.xp + award.xp;
      const levelInfo = getLevelForXP(newXP);
      return { ...prev, xp: newXP, level: levelInfo.level, title: levelInfo.title };
    });

    // Show XP toast
    toast.success(`+${award.xp} XP`, {
      description: action.replace(/_/g, " "),
      duration: 3000,
    });

    // Check for level up
    const newXP = currentProfile.xp + award.xp;
    const newLevelInfo = getLevelForXP(newXP);
    if (newLevelInfo.level > oldLevel) {
      setTimeout(() => {
        toast.success(`Level Up! Level ${newLevelInfo.level}`, {
          description: `New title: ${newLevelInfo.title}`,
          duration: 5000,
        });
      }, 500);
    }

    // Persist server-side (fire-and-forget)
    serverAwardXP(award.xp, action);
    serverTrackEvent(action, meta ?? {});
  }

  const awardXP = useCallback(
    (action: XPAction, meta?: Record<string, unknown>) => {
      const signedIn = isAuthenticated && profileRef.current?.id !== GUEST_ID;
      if (signedIn) {
        awardXPForProfile(action, profileRef.current, meta);
        return;
      }
      const current = guestStateRef.current ?? loadGuestStateSafe();
      const result = awardGuestXP(current, action, meta, sessionAwarded);
      if (!result.awarded) return;
      persistGuest(result.state);
      toast.success(`+${result.xp} XP`, {
        description: action.replace(/_/g, " "),
        duration: 3000,
      });
      if (result.leveledUp) {
        toast.success(`Level Up! Level ${result.state.profile.level}`, {
          description: `New title: ${result.state.profile.title}`,
          duration: 5000,
        });
      }
    },
    [isAuthenticated]
  );

  const unlockAchievement = useCallback(
    (id: string) => {
      const signedIn = isAuthenticated && profileRef.current?.id !== GUEST_ID;
      if (signedIn) {
        if (!profileRef.current) return;
        checkAndUnlockAchievement(id, profileRef.current);
        return;
      }
      const current = guestStateRef.current ?? loadGuestStateSafe();
      const result = unlockGuestAchievement(current, id);
      if (!result.unlocked) return;
      persistGuest(result.state);
      const achievement = getAchievement(id);
      if (achievement) {
        toast.success(`Achievement Unlocked: ${achievement.name}`, {
          description: `${achievement.description} (+${achievement.xpReward} XP)`,
          duration: 5000,
        });
      }
    },
    [isAuthenticated]
  );

  const trackEvent = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      if (!isAuthenticated || profileRef.current?.id === GUEST_ID) return;
      serverTrackEvent(type, payload ?? {});
    },
    [isAuthenticated]
  );

  const recordDiscovery = useCallback(
    (eggId: string) => {
      const signedIn = isAuthenticated && profileRef.current?.id !== GUEST_ID;
      if (signedIn) {
        addDiscovery(eggId);
        setProfile((prev) => {
          if (!prev || prev.discoveries.includes(eggId)) return prev;
          return { ...prev, discoveries: [...prev.discoveries, eggId] };
        });
        return;
      }
      const current = guestStateRef.current ?? loadGuestStateSafe();
      const result = recordGuestDiscovery(current, eggId);
      if (!result.added) return;
      let next = result.state;
      if (shouldUnlockCartographer(next.profile.discoveries)) {
        const unlocked = unlockGuestAchievement(next, "cartographer");
        next = unlocked.state;
        if (unlocked.unlocked) {
          const achievement = getAchievement("cartographer");
          if (achievement) {
            toast.success(`Achievement Unlocked: ${achievement.name}`, {
              description: `${achievement.description} (+${achievement.xpReward} XP)`,
              duration: 5000,
            });
          }
        }
      }
      persistGuest(next);
    },
    [isAuthenticated]
  );

  const refreshProfile = useCallback(async () => {
    const result = await getProfile();
    if (result.profile) setProfile(result.profile);
  }, []);

  return (
    <VisitorContext value={{
      profile,
      isAuthenticated,
      loading,
      awardXP,
      unlockAchievement,
      trackEvent,
      recordDiscovery,
      refreshProfile,
    }}>
      {children}
    </VisitorContext>
  );
}

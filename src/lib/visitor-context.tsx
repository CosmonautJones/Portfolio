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
import { createClient, hasAuthCookies } from "@/lib/supabase/client";
import {
  getProfile,
  awardXP as serverAwardXP,
  unlockAchievement as serverUnlockAchievement,
  trackEvent as serverTrackEvent,
  updateStreak,
} from "@/actions/profiles";
import { XP_AWARDS, getLevelForXP, type XPAction } from "@/lib/xp";
import { getAchievement } from "@/lib/achievements";
import type { Profile } from "@/lib/types";

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

  // Load profile on mount + listen to auth changes
  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      // Fast path: skip all Supabase calls if no auth cookies exist
      if (!hasAuthCookies()) {
        if (mounted) {
          setProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setProfile(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      if (mounted) setIsAuthenticated(true);

      const result = await getProfile();
      if (mounted && result.profile) {
        setProfile(result.profile);
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

    loadProfile();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          loadProfile();
        } else {
          setProfile(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
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

  const awardXP = useCallback(
    (action: XPAction, meta?: Record<string, unknown>) => {
      const currentProfile = profileRef.current;
      if (!isAuthenticated || !currentProfile) return;

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
    },
    [isAuthenticated]
  );

  const unlockAchievement = useCallback(
    (id: string) => {
      if (!isAuthenticated || !profileRef.current) return;
      checkAndUnlockAchievement(id, profileRef.current);
    },
    [isAuthenticated]
  );

  const trackEvent = useCallback(
    (type: string, payload?: Record<string, unknown>) => {
      if (!isAuthenticated) return;
      serverTrackEvent(type, payload ?? {});
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
      refreshProfile,
    }}>
      {children}
    </VisitorContext>
  );
}

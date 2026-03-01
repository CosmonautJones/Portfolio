"use client";

import { useCallback } from "react";
import { useVisitor } from "@/hooks/use-visitor";
import { getEasterEgg } from "@/lib/easter-eggs/registry";
import { addDiscovery } from "@/actions/profiles";

export function useEasterEgg() {
  const { profile, awardXP, unlockAchievement, trackEvent } = useVisitor();

  const discover = useCallback(
    (eggId: string) => {
      const egg = getEasterEgg(eggId);
      if (!egg) return;

      // Award XP with key-based dedup (each egg dedupes independently)
      awardXP("find_easter_egg", { key: eggId });

      // Track event
      trackEvent("find_easter_egg", { eggId, location: egg.location });

      // Unlock linked achievement if present
      if (egg.achievementId) {
        unlockAchievement(egg.achievementId);
      }

      // Persist discovery to profile
      addDiscovery(eggId);
    },
    [awardXP, unlockAchievement, trackEvent]
  );

  const isDiscovered = useCallback(
    (eggId: string): boolean => {
      return profile?.discoveries?.includes(eggId) ?? false;
    },
    [profile]
  );

  return { discover, isDiscovered };
}

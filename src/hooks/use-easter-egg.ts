"use client";

import { useCallback } from "react";
import { useVisitor } from "@/hooks/use-visitor";
import { getEasterEgg } from "@/lib/easter-eggs/registry";
import { shouldUnlockCartographer } from "@/lib/easter-eggs/triggers";
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

      // Unlock "cartographer" once all distinct eggs have been discovered.
      // Build the distinct set from the current profile plus this discovery
      // (profile.discoveries may not yet include the just-found egg).
      const distinct = new Set(profile?.discoveries ?? []);
      distinct.add(eggId);
      if (shouldUnlockCartographer([...distinct])) {
        unlockAchievement("cartographer");
      }
    },
    [awardXP, unlockAchievement, trackEvent, profile]
  );

  const isDiscovered = useCallback(
    (eggId: string): boolean => {
      return profile?.discoveries?.includes(eggId) ?? false;
    },
    [profile]
  );

  return { discover, isDiscovered };
}

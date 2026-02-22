"use server";

import { createClient } from "@/lib/supabase/server";
import { getLevelForXP } from "@/lib/xp";
import { getAchievement } from "@/lib/achievements";
import type { Profile } from "@/lib/types";

export async function getProfile(): Promise<{ profile: Profile | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: null };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      // Profile doesn't exist yet — create it
      if (error.code === "PGRST116") {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id })
          .select()
          .single();
        if (insertError) return { profile: null, error: insertError.message };
        return { profile: newProfile as Profile };
      }
      return { profile: null, error: error.message };
    }

    return { profile: data as Profile };
  } catch (error) {
    return { profile: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function awardXP(
  amount: number,
  reason: string
): Promise<{ newXP: number; newLevel: number; newTitle: string; leveledUp: boolean } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("xp, level, title")
      .eq("id", user.id)
      .single();

    if (fetchError) return { error: fetchError.message };

    const oldLevel = profile.level;
    const newXP = profile.xp + amount;
    const levelInfo = getLevelForXP(newXP);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        level: levelInfo.level,
        title: levelInfo.title,
      })
      .eq("id", user.id);

    if (updateError) return { error: updateError.message };

    // Log the XP event
    await supabase.from("events").insert({
      user_id: user.id,
      event_type: "xp_awarded",
      payload: { amount, reason },
    });

    return {
      newXP,
      newLevel: levelInfo.level,
      newTitle: levelInfo.title,
      leveledUp: levelInfo.level > oldLevel,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function unlockAchievement(
  achievementId: string
): Promise<{ unlocked: boolean; alreadyHad: boolean; xpAwarded: number } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const achievement = getAchievement(achievementId);
    if (!achievement) return { error: "Achievement not found" };

    // Check if already unlocked
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("achievements, xp, level")
      .eq("id", user.id)
      .single();

    if (fetchError) return { error: fetchError.message };

    const currentAchievements: string[] = profile.achievements ?? [];
    if (currentAchievements.includes(achievementId)) {
      return { unlocked: false, alreadyHad: true, xpAwarded: 0 };
    }

    // Unlock achievement + award bonus XP
    const newAchievements = [...currentAchievements, achievementId];
    const newXP = profile.xp + achievement.xpReward;
    const levelInfo = getLevelForXP(newXP);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        achievements: newAchievements,
        xp: newXP,
        level: levelInfo.level,
        title: levelInfo.title,
      })
      .eq("id", user.id);

    if (updateError) return { error: updateError.message };

    // Log the achievement event
    await supabase.from("events").insert({
      user_id: user.id,
      event_type: "achievement_unlocked",
      payload: { achievementId, xpReward: achievement.xpReward },
    });

    return { unlocked: true, alreadyHad: false, xpAwarded: achievement.xpReward };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function trackEvent(
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      event_type: eventType,
      payload,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateStreak(): Promise<{ streakDays: number } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("streak_days, last_visit")
      .eq("id", user.id)
      .single();

    if (fetchError) return { error: fetchError.message };

    const today = new Date().toISOString().split("T")[0];
    const lastVisit = profile.last_visit;

    // Already visited today
    if (lastVisit === today) {
      return { streakDays: profile.streak_days };
    }

    let newStreak = 1;

    if (lastVisit) {
      const lastDate = new Date(lastVisit);
      const todayDate = new Date(today);
      const diffMs = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day — extend streak
        newStreak = profile.streak_days + 1;
      }
      // diffDays > 1 means streak broken, reset to 1
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ streak_days: newStreak, last_visit: today })
      .eq("id", user.id);

    if (updateError) return { error: updateError.message };

    return { streakDays: newStreak };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

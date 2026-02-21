"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitScore(score: number, deathCause: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("game_scores").insert({
      user_id: user.id,
      score,
      death_cause: deathCause,
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_scores")
      .select("id, score, death_cause, created_at, user_id")
      .order("score", { ascending: false })
      .limit(limit);

    if (error) return { error: error.message, scores: [] };

    // Get current user for highlighting
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const scores = (data ?? []).map((entry, i) => ({
      id: entry.id,
      rank: i + 1,
      score: entry.score,
      deathCause: entry.death_cause,
      createdAt: entry.created_at,
      isCurrentUser: entry.user_id === user?.id,
    }));

    return { scores };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      scores: [],
    };
  }
}

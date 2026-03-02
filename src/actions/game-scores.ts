"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitScore(score: number, deathCause: string, gameType = "adventure") {
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
      game_type: gameType,
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getLeaderboard(limit = 10, gameType = "adventure") {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_scores")
      .select("id, score, death_cause, created_at, user_id")
      .eq("game_type", gameType)
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

export async function getPlayerStats(gameType = "adventure") {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated", stats: null };

    const { data, error } = await supabase
      .from("game_scores")
      .select("score, death_cause, created_at")
      .eq("game_type", gameType)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { error: error.message, stats: null };
    if (!data || data.length === 0) return { stats: null };

    const scores = data.map((d) => d.score);
    const bestScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const totalDistance = scores.reduce((a, b) => a + b, 0);

    // Most common death cause
    const deathCounts: Record<string, number> = {};
    for (const entry of data) {
      const cause = entry.death_cause ?? "unknown";
      deathCounts[cause] = (deathCounts[cause] || 0) + 1;
    }
    let favoriteDeath = "unknown";
    let maxCount = 0;
    for (const [cause, count] of Object.entries(deathCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteDeath = cause;
      }
    }

    return {
      stats: {
        gamesPlayed: data.length,
        bestScore,
        avgScore,
        totalDistance,
        favoriteDeath,
        lastPlayed: data[0].created_at,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      stats: null,
    };
  }
}

export async function getRecentScores(limit = 5, gameType = "adventure") {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated", scores: [] };

    const { data, error } = await supabase
      .from("game_scores")
      .select("id, score, death_cause, created_at")
      .eq("game_type", gameType)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return { error: error.message, scores: [] };

    const scores = (data ?? []).map((entry) => ({
      id: entry.id,
      score: entry.score,
      deathCause: entry.death_cause,
      createdAt: entry.created_at,
    }));

    return { scores };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      scores: [],
    };
  }
}

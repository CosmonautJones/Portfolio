"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLeaderboard } from "@/actions/game-scores";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  score: number;
  deathCause: string;
  createdAt: string;
  isCurrentUser: boolean;
  changed?: boolean;
}

interface UseLeaderboardOptions {
  pollInterval?: number;
  limit?: number;
  gameType?: string;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { pollInterval = 30000, limit = 10, gameType = "adventure" } = options;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevEntriesRef = useRef<LeaderboardEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    const result = await getLeaderboard(limit, gameType);
    if (result.scores) {
      const prev = prevEntriesRef.current;
      const prevIds = new Set(prev.map((e) => e.id));

      const newEntries: LeaderboardEntry[] = result.scores.map((entry) => ({
        ...entry,
        changed: !prevIds.has(entry.id),
      }));

      prevEntriesRef.current = newEntries;
      setEntries(newEntries);
      setLastUpdated(new Date());
    }
    setIsLoading(false);
  }, [limit, gameType]);

  const refresh = useCallback(async () => {
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Polling
  useEffect(() => {
    intervalRef.current = setInterval(fetchLeaderboard, pollInterval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLeaderboard, pollInterval]);

  return { entries, isLoading, refresh, lastUpdated };
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLeaderboard, type LeaderboardPeriod } from "@/actions/game-scores";
import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry as BaseLeaderboardEntry } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type LeaderboardEntry = BaseLeaderboardEntry & {
  changed?: boolean;
};

interface UseRealtimeLeaderboardOptions {
  /** Fallback poll interval if Realtime fails (ms) */
  pollInterval?: number;
  limit?: number;
  gameType?: string;
  period?: LeaderboardPeriod;
}

type ConnectionStatus = "connecting" | "realtime" | "polling";

export function useRealtimeLeaderboard(
  options: UseRealtimeLeaderboardOptions = {},
) {
  const { pollInterval = 30000, limit = 10, gameType = "adventure", period = "all" } = options;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const prevEntriesRef = useRef<LeaderboardEntry[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchLeaderboard = useCallback(async () => {
    const result = await getLeaderboard(limit, gameType, period);
    if (!mountedRef.current) return;

    if ("scores" in result && result.scores) {
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
  }, [limit, gameType, period]);

  const refresh = useCallback(async () => {
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Start fallback polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    setConnectionStatus("polling");

    intervalRef.current = setInterval(() => {
      if (!document.hidden) fetchLeaderboard();
    }, pollInterval);

    function handleVisibility() {
      if (!document.hidden) fetchLeaderboard();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // Store handler ref for cleanup
    (intervalRef as unknown as { _visHandler: () => void })._visHandler =
      handleVisibility;
  }, [fetchLeaderboard, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const handler = (intervalRef as unknown as { _visHandler?: () => void })
      ._visHandler;
    if (handler) {
      document.removeEventListener("visibilitychange", handler);
    }
  }, []);

  // Initial fetch + Realtime subscription
  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    fetchLeaderboard();

    // Try Realtime subscription
    let channel: RealtimeChannel | null = null;

    try {
      const supabase = createClient();
      channel = supabase
        .channel(`leaderboard_${gameType}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "game_scores",
            filter: `game_type=eq.${gameType}`,
          },
          () => {
            // A new score was inserted — refresh the leaderboard
            if (mountedRef.current) {
              fetchLeaderboard();
            }
          },
        )
        .subscribe((status) => {
          if (!mountedRef.current) return;

          if (status === "SUBSCRIBED") {
            setConnectionStatus("realtime");
            // Stop polling if we successfully connected to Realtime
            stopPolling();
          } else if (
            status === "CLOSED" ||
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            // Fallback to polling
            startPolling();
          }
        });

      channelRef.current = channel;
    } catch {
      // Supabase client failed — use polling
      startPolling();
    }

    // Set a timeout: if Realtime hasn't connected in 5s, start polling
    const fallbackTimer = setTimeout(() => {
      if (mountedRef.current && connectionStatus === "connecting") {
        startPolling();
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearTimeout(fallbackTimer);
      stopPolling();

      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, limit, period]);

  return { entries, isLoading, refresh, lastUpdated, connectionStatus };
}

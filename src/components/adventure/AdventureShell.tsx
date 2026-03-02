"use client";

import { useState, useCallback, useRef } from "react";
import type { GamePhase } from "@/lib/game/types";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { StatsPanel } from "./StatsPanel";
import { CurrentRunPanel } from "./CurrentRunPanel";
import { RecentScoresPanel } from "./RecentScoresPanel";
import { ControlsPanel } from "./ControlsPanel";
import { GameInfoPanel } from "./GameInfoPanel";
import { CRTToggle } from "./CRTOverlay";
import GameCanvas from "./GameCanvas";

export function AdventureShell() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [deathCount, setDeathCount] = useState(0);
  const [playStartTime, setPlayStartTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setTick] = useState(0); // force re-render for timer

  const { entries, isLoading, refresh, lastUpdated } = useLeaderboard({
    pollInterval: 30000,
    limit: 10,
  });

  const handleScoreUpdate = useCallback((newScore: number, newLevel: number) => {
    setScore(newScore);
    setLevel(newLevel);
  }, []);

  const handlePhaseChange = useCallback((newPhase: GamePhase) => {
    setPhase(newPhase);
    if (newPhase === "playing") {
      setPlayStartTime(Date.now());
      // Start timer for live time display
      timerRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const handleDeath = useCallback(() => {
    setDeathCount((c) => c + 1);
    // Refresh leaderboard immediately after death
    refresh();
  }, [refresh]);

  return (
    <div className="flex w-full h-full items-stretch justify-center">
      {/* Left sidebar — desktop only */}
      <div
        className="hidden lg:flex flex-col gap-3 p-3 overflow-y-auto shrink-0"
        style={{
          width: 280,
          scrollbarWidth: "thin",
          scrollbarColor: "#333c57 #1a1c2c",
        }}
      >
        <CurrentRunPanel
          score={score}
          level={level}
          phase={phase}
          startTime={playStartTime}
        />
        <StatsPanel refreshKey={deathCount} />
        <ControlsPanel />
        <div className="flex justify-center mt-1">
          <CRTToggle />
        </div>
      </div>

      {/* Game area — flex-1 centered */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <GameCanvas
          onScoreUpdate={handleScoreUpdate}
          onPhaseChange={handlePhaseChange}
          onDeath={handleDeath}
          hasSidebars
        />
      </div>

      {/* Right sidebar — desktop only */}
      <div
        className="hidden lg:flex flex-col gap-3 p-3 overflow-y-auto shrink-0"
        style={{
          width: 280,
          scrollbarWidth: "thin",
          scrollbarColor: "#333c57 #1a1c2c",
        }}
      >
        <LeaderboardPanel
          entries={entries}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />
        <RecentScoresPanel refreshKey={deathCount} />
        <GameInfoPanel />
      </div>
    </div>
  );
}

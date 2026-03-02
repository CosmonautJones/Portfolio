"use client";

import { RetroPanel } from "./RetroPanel";
import { LEVEL_THRESHOLDS } from "@/lib/game/constants";
import type { GamePhase } from "@/lib/game/types";

interface CurrentRunPanelProps {
  score: number;
  level: number;
  phase: GamePhase;
  startTime: number | null; // timestamp when playing started
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CurrentRunPanel({ score, level, phase, startTime }: CurrentRunPanelProps) {
  const isPlaying = phase === "playing" || phase === "paused";

  // Progress to next level
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold;
  const progress =
    nextThreshold > currentThreshold
      ? Math.min(1, (score - currentThreshold) / (nextThreshold - currentThreshold))
      : 1;

  // Time alive
  const elapsed =
    isPlaying && startTime ? (Date.now() - startTime) / 1000 : 0;

  return (
    <RetroPanel title="Current Run">
      {!isPlaying ? (
        <p
          className="text-center font-mono text-[10px]"
          style={{ color: "#566c86" }}
        >
          Waiting to start...
        </p>
      ) : (
        <div className="space-y-2">
          {/* Score */}
          <div className="text-center">
            <div
              className="font-mono font-bold text-lg"
              style={{
                color: "#f4f4f4",
                textShadow: "0 0 8px rgba(244, 244, 244, 0.3)",
              }}
            >
              {String(score).padStart(4, "0")}
            </div>
          </div>

          {/* Level */}
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span style={{ color: "#566c86" }}>Level</span>
            <span
              className="font-bold"
              style={{ color: "#ffcd75" }}
            >
              {level}
            </span>
          </div>

          {/* Progress bar */}
          <div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "#333c57" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    "linear-gradient(to right, #ef7d57, #ffcd75)",
                  boxShadow: "0 0 4px rgba(239, 125, 87, 0.5)",
                }}
              />
            </div>
            <div className="flex justify-between font-mono text-[9px] mt-0.5" style={{ color: "#566c86" }}>
              <span>{currentThreshold}</span>
              <span>{nextThreshold > currentThreshold ? nextThreshold : "MAX"}</span>
            </div>
          </div>

          {/* Time alive */}
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span style={{ color: "#566c86" }}>Time</span>
            <span style={{ color: "#94b0c2" }}>{formatTime(elapsed)}</span>
          </div>
        </div>
      )}
    </RetroPanel>
  );
}

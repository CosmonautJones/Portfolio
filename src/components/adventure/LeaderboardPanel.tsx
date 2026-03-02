"use client";

import { RetroPanel } from "./RetroPanel";
import type { LeaderboardEntry } from "@/hooks/use-leaderboard";
import type { DeathCause } from "@/lib/game/types";

function getDeathIcon(cause: string): string {
  switch (cause) {
    case "vehicle": return "\u{1F697}";
    case "train": return "\u{1F682}";
    case "water": return "\u{1F30A}";
    case "idle_timeout": return "\u{23F0}";
    case "off_screen": return "\u{2B05}";
    default: return "";
  }
}

function getRankColor(rank: number): string {
  if (rank === 1) return "#ffcd75";
  if (rank === 2) return "#94b0c2";
  if (rank === 3) return "#c4a35a";
  return "#566c86";
}

function getDeathColor(cause: string): string {
  switch (cause) {
    case "vehicle": return "#ef7d57";
    case "train": return "#ffff00";
    case "water": return "#41a6f6";
    case "idle_timeout": return "#ffcd75";
    case "off_screen": return "#94b0c2";
    default: return "#f4f4f4";
  }
}

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function LeaderboardPanel({ entries, isLoading }: LeaderboardPanelProps) {
  return (
    <RetroPanel title="High Scores">
      {/* Live indicator */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: "#38b764",
            boxShadow: "0 0 4px #38b764",
            animation: "pulse 2s infinite",
          }}
        />
        <span className="font-mono text-[10px]" style={{ color: "#566c86" }}>
          LIVE
        </span>
      </div>

      {isLoading && entries.length === 0 ? (
        <p className="text-center font-mono text-[10px]" style={{ color: "#566c86" }}>
          Loading...
        </p>
      ) : entries.length === 0 ? (
        <p className="text-center font-mono text-[10px]" style={{ color: "#566c86" }}>
          No scores yet
        </p>
      ) : (
        <div className="space-y-0.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-1 font-mono text-[11px] px-1 py-0.5 rounded-sm transition-colors"
              style={{
                color: entry.isCurrentUser
                  ? "#ffcd75"
                  : getRankColor(entry.rank),
                ...(entry.isCurrentUser
                  ? {
                      background: "rgba(255, 205, 117, 0.08)",
                      boxShadow: "inset 0 0 8px rgba(255, 205, 117, 0.1)",
                    }
                  : {}),
                ...(entry.changed
                  ? { animation: "fadeIn 0.5s ease-out" }
                  : {}),
              }}
            >
              {/* Rank */}
              <span
                className="font-bold w-6 shrink-0"
                style={{ color: getRankColor(entry.rank) }}
              >
                {entry.isCurrentUser ? ">" : `#${entry.rank}`}
              </span>
              {/* Dot leader */}
              <span
                className="flex-1 min-w-0"
                style={{
                  borderBottom: "1px dotted rgba(86, 108, 134, 0.3)",
                }}
              />
              {/* Death icon */}
              <span
                className="shrink-0 text-[9px]"
                style={{ color: getDeathColor(entry.deathCause) }}
              >
                {getDeathIcon(entry.deathCause as DeathCause)}
              </span>
              {/* Score */}
              <span className="font-bold shrink-0 w-8 text-right">
                {String(entry.score).padStart(4, "0")}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(4px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </RetroPanel>
  );
}

"use client";

import { useState, useEffect } from "react";
import { RetroPanel } from "./RetroPanel";
import { getRecentScores } from "@/actions/game-scores";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface RecentScore {
  id: string;
  score: number;
  deathCause: string;
  createdAt: string;
}

interface RecentScoresPanelProps {
  refreshKey?: number;
}

export function RecentScoresPanel({ refreshKey }: RecentScoresPanelProps) {
  const [scores, setScores] = useState<RecentScore[]>([]);

  useEffect(() => {
    getRecentScores(5).then((result) => {
      if (result.scores) setScores(result.scores);
    });
  }, [refreshKey]);

  return (
    <RetroPanel title="Recent Runs">
      {scores.length === 0 ? (
        <p className="text-center font-mono text-[10px]" style={{ color: "#566c86" }}>
          No recent scores
        </p>
      ) : (
        <div className="space-y-0.5">
          {scores.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1 font-mono text-[11px]"
            >
              <span className="text-[9px]" style={{ color: "#566c86" }}>
                {getDeathIcon(s.deathCause)}
              </span>
              <span className="font-bold" style={{ color: "#94b0c2" }}>
                {String(s.score).padStart(4, "0")}
              </span>
              <span className="flex-1" />
              <span className="text-[9px]" style={{ color: "#566c86" }}>
                {timeAgo(s.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </RetroPanel>
  );
}

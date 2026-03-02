"use client";

import { useState, useEffect } from "react";
import { RetroPanel } from "./RetroPanel";
import { getPlayerStats } from "@/actions/game-scores";

function getDeathIcon(cause: string): string {
  switch (cause) {
    case "vehicle": return "\u{1F697}";
    case "train": return "\u{1F682}";
    case "water": return "\u{1F30A}";
    case "idle_timeout": return "\u{23F0}";
    case "off_screen": return "\u{2B05}";
    default: return "\u{1F480}";
  }
}

interface StatsPanelProps {
  refreshKey?: number; // increment to trigger refresh
}

interface PlayerStats {
  gamesPlayed: number;
  bestScore: number;
  avgScore: number;
  totalDistance: number;
  favoriteDeath: string;
  lastPlayed: string;
}

export function StatsPanel({ refreshKey }: StatsPanelProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    getPlayerStats().then((result) => {
      if (result.stats) setStats(result.stats);
    });
  }, [refreshKey]);

  if (!stats) {
    return (
      <RetroPanel title="Your Stats">
        <p className="text-center font-mono text-[10px]" style={{ color: "#566c86" }}>
          Play to see stats
        </p>
      </RetroPanel>
    );
  }

  const rows = [
    { label: "Games", value: String(stats.gamesPlayed) },
    { label: "Best", value: String(stats.bestScore).padStart(4, "0") },
    { label: "Average", value: String(stats.avgScore).padStart(4, "0") },
    { label: "Total Dist", value: String(stats.totalDistance) },
    { label: "Nemesis", value: `${getDeathIcon(stats.favoriteDeath)} ${stats.favoriteDeath}` },
  ];

  return (
    <RetroPanel title="Your Stats">
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between font-mono text-[11px]"
          >
            <span style={{ color: "#566c86" }}>{row.label}</span>
            <span style={{ color: "#94b0c2" }}>{row.value}</span>
          </div>
        ))}
      </div>
    </RetroPanel>
  );
}

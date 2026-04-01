// ---------------------------------------------------------------------------
// Shared helper functions and types for game overlay components
// ---------------------------------------------------------------------------

import type { DeathCause, CoinType } from "@/lib/game/types";

export function getDeathIcon(cause: DeathCause | null): string {
  switch (cause) {
    case "vehicle":
      return "\u{1F697}";
    case "train":
      return "\u{1F682}";
    case "water":
      return "\u{1F30A}";
    case "idle_timeout":
      return "\u{23F0}";
    case "off_screen":
      return "\u{2B05}";
    default:
      return "";
  }
}

export function getDeathMessage(cause: DeathCause | null): string {
  switch (cause) {
    case "vehicle":
      return "Squished by traffic!";
    case "train":
      return "Hit by a train!";
    case "water":
      return "Fell in the water!";
    case "idle_timeout":
      return "Too slow!";
    case "off_screen":
      return "Left behind!";
    default:
      return "";
  }
}

export function getDeathColor(cause: string): string {
  switch (cause) {
    case "vehicle":
      return "#ef7d57";
    case "train":
      return "#ffff00";
    case "water":
      return "#41a6f6";
    case "idle_timeout":
      return "#ffcd75";
    case "off_screen":
      return "#94b0c2";
    default:
      return "#f4f4f4";
  }
}

export function getRankColor(rank: number): string {
  if (rank === 1) return "#ffcd75";
  if (rank === 2) return "#94b0c2";
  if (rank === 3) return "#c4a35a";
  return "#f4f4f4";
}

export function padScore(score: number): string {
  return String(score).padStart(4, "0");
}

export const COIN_TYPE_COLORS: Record<CoinType, string> = {
  gold: "#ffcd75",
  silver: "#94b0c2",
  diamond: "#73eff7",
  ruby: "#b13e53",
};

export interface AchievementPopup {
  id: string;
  name: string;
  emoji: string;
  key: number;
}

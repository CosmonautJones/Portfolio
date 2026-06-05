// ---------------------------------------------------------------------------
// Persistent game stats for skin unlocks.
//
// Three of the four non-default skin unlocks key off cumulative stats
// (totalDeaths, totalDiamonds) and the local high score. Those were never
// persisted before, so the unlocks were unreachable. This module persists
// them in localStorage and computes the unlocked skin set.
// ---------------------------------------------------------------------------

import {
  checkSkinUnlocks,
  getUnlockedSkins,
  type GameStats,
} from "./skins";
import type { SkinId } from "./types";

const TOTAL_DEATHS_KEY = "adventure_total_deaths";
const TOTAL_DIAMONDS_KEY = "adventure_total_diamonds";
const HIGH_SCORE_KEY = "adventure_high_score";

function readInt(key: string): number {
  if (typeof localStorage === "undefined") return 0;
  const raw = localStorage.getItem(key);
  if (raw === null) return 0;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function writeInt(key: string, value: number): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, String(value));
}

/** Cumulative deaths across all runs (drives the ghost-skin unlock). */
export function getTotalDeaths(): number {
  return readInt(TOTAL_DEATHS_KEY);
}

/** Record one death and return the new cumulative total. */
export function incrementTotalDeaths(): number {
  const next = getTotalDeaths() + 1;
  writeInt(TOTAL_DEATHS_KEY, next);
  return next;
}

/** Cumulative diamond coins collected across all runs (drives diamond skin). */
export function getTotalDiamonds(): number {
  return readInt(TOTAL_DIAMONDS_KEY);
}

/** Add diamond coins to the cumulative total; returns the new total. */
export function addDiamonds(count: number): number {
  const current = getTotalDiamonds();
  if (count <= 0) return current;
  const next = current + count;
  writeInt(TOTAL_DIAMONDS_KEY, next);
  return next;
}

/** Snapshot the persisted stats used to evaluate skin unlocks. */
export function getGameStats(allAchievements: boolean): GameStats {
  return {
    highScore: readInt(HIGH_SCORE_KEY),
    totalDeaths: getTotalDeaths(),
    totalDiamonds: getTotalDiamonds(),
    allAchievements,
  };
}

/**
 * Evaluate unlock conditions against the persisted stats, persist any newly
 * unlocked skins, and return the full unlocked set (always includes default).
 */
export function getUnlockedSkinsFromStats(allAchievements: boolean): SkinId[] {
  checkSkinUnlocks(getGameStats(allAchievements));
  return getUnlockedSkins();
}

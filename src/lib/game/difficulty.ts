// ---------------------------------------------------------------------------
// Difficulty scaling and level progression
// ---------------------------------------------------------------------------

import { DIFFICULTY, LEVEL_THRESHOLDS } from "./constants";
import { clamp, lerp } from "./utils";

export function getLevelForScore(score: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (score >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return level;
}

export function difficultyMultiplier(score: number): number {
  const t = clamp(score / DIFFICULTY.maxScoreThreshold, 0, 1);
  const baseMult = lerp(DIFFICULTY.minMultiplier, DIFFICULTY.maxMultiplier, t);
  // Add small level-based step bonus
  const level = getLevelForScore(score);
  const levelBonus = (level - 1) * 0.1;
  return baseMult + levelBonus;
}

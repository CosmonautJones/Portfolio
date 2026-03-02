import { ALL_DEATH_CAUSES } from "./achievements";
import type { DeathCause } from "./types";

export interface AchievementUnlock {
  achievementId: string;
  score: number;
}

const DEATH_HISTORY_KEY = "adventure_death_history";

export class AchievementTracker {
  private unlocked: Set<string>;
  private pending: AchievementUnlock[] = [];
  private waterTouched = false;
  private previousHighScore = 0;
  private deathCausesSeen: Set<string>;

  constructor(
    alreadyUnlocked: string[] = [],
    deathHistory?: string[],
  ) {
    this.unlocked = new Set(alreadyUnlocked);
    this.deathCausesSeen = new Set(deathHistory ?? []);
  }

  private unlock(id: string, score: number): boolean {
    if (this.unlocked.has(id)) return false;
    this.unlocked.add(id);
    this.pending.push({ achievementId: id, score });
    return true;
  }

  onScoreChange(score: number): AchievementUnlock[] {
    const before = this.pending.length;

    if (score >= 1) this.unlock("first_hop", score);
    if (score >= 25) this.unlock("score_25", score);
    if (score >= 50 && !this.waterTouched) this.unlock("score_no_water", score);
    if (score >= 100) this.unlock("score_100", score);
    if (score >= 200) this.unlock("score_200", score);

    return this.pending.slice(before);
  }

  onLevelUp(level: number, score: number): AchievementUnlock[] {
    const before = this.pending.length;

    if (level >= 3) this.unlock("level_3", score);
    if (level >= 6) this.unlock("level_6", score);

    return this.pending.slice(before);
  }

  onLogRide(score: number): AchievementUnlock[] {
    this.waterTouched = true;
    const before = this.pending.length;
    this.unlock("log_rider", score);
    return this.pending.slice(before);
  }

  onDeath(cause: DeathCause, finalScore: number): AchievementUnlock[] {
    const before = this.pending.length;

    // Death-specific achievements
    if (cause === "water") this.unlock("death_water", finalScore);
    if (cause === "train") this.unlock("death_train", finalScore);

    // Track death cause for death_all
    this.deathCausesSeen.add(cause);
    const allSeen = ALL_DEATH_CAUSES.every((c) =>
      this.deathCausesSeen.has(c),
    );
    if (allSeen) this.unlock("death_all", finalScore);

    // Comeback: beat previous high score (only if previous > 0)
    if (this.previousHighScore > 0 && finalScore > this.previousHighScore) {
      this.unlock("comeback", finalScore);
    }

    return this.pending.slice(before);
  }

  resetForNewGame(previousHighScore: number): void {
    this.waterTouched = false;
    this.previousHighScore = previousHighScore;
    // Keep unlocked set and deathCausesSeen — they persist across games
  }

  flushPendingUnlocks(): AchievementUnlock[] {
    const flushed = [...this.pending];
    this.pending = [];
    return flushed;
  }

  getDeathCausesSeen(): string[] {
    return [...this.deathCausesSeen];
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  getUnlockedIds(): string[] {
    return [...this.unlocked];
  }

  static loadDeathHistory(): string[] {
    try {
      const raw = localStorage.getItem(DEATH_HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // localStorage unavailable
    }
    return [];
  }

  static saveDeathHistory(causes: string[]): void {
    try {
      localStorage.setItem(DEATH_HISTORY_KEY, JSON.stringify(causes));
    } catch {
      // localStorage unavailable
    }
  }
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ChallengeTracker,
  collectChallengeRewards,
  loadCompletions,
  type ChallengeReward,
} from "../challenges";
import type { Challenge } from "../types";
import type { XPAction as XPKey } from "@/lib/xp";

// Mock localStorage for completion persistence.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

/**
 * Mirrors how src/hooks/use-game-engine.ts wires the tracker through the game
 * callbacks, then how src/components/adventure/GameCanvas.tsx maps a reward's
 * period to an XP award key. This exercises the *integration recipe* (drive
 * progress via callbacks → collect on death → award once) without booting
 * React/RAF.
 */
function periodToXpKey(reward: ChallengeReward): XPKey {
  return reward.period === "weekly" ? "challenge_weekly" : "challenge_daily";
}

const SCORE_CHALLENGE: Challenge = {
  id: "daily_2026-06-05_0",
  type: "score_target",
  params: { targetScore: 50 },
  description: "Reach a score of 50",
  xpReward: 15,
  period: "daily",
};
const COIN_CHALLENGE: Challenge = {
  id: "daily_2026-06-05_1",
  type: "collection",
  params: { targetCoins: 3 },
  description: "Collect 3 coins in one run",
  xpReward: 15,
  period: "daily",
};
const LEVEL_CHALLENGE: Challenge = {
  id: "daily_2026-06-05_2",
  type: "survival",
  params: { targetLevel: 3 },
  description: "Reach level 3",
  xpReward: 15,
  period: "daily",
};
const SURVIVAL_CHALLENGE: Challenge = {
  id: "daily_2026-06-05_3",
  type: "survival",
  params: { targetSeconds: 5 },
  description: "Survive 5 seconds",
  xpReward: 15,
  period: "daily",
};
const WATER_RESTRICTION: Challenge = {
  id: "daily_2026-06-05_4",
  type: "restriction",
  params: { restriction: "no_water_death", restrictedScore: 30 },
  description: "Score 30 without drowning",
  xpReward: 15,
  period: "daily",
};
const WEEKLY_CHALLENGE: Challenge = {
  id: "weekly_2026-06-01_0",
  type: "score_target",
  params: { targetScore: 100 },
  description: "Reach a score of 100",
  xpReward: 50,
  period: "weekly",
};

describe("challenge wiring integration", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("drives score progress through onScoreChange and surfaces live progress", () => {
    const tracker = new ChallengeTracker([SCORE_CHALLENGE]);
    tracker.onScoreChange(20);
    const progress = tracker.getAllProgress();
    expect(progress[0].current).toBe(20);
    expect(progress[0].completed).toBe(false);
  });

  it("drives coin progress through onCoinCollect", () => {
    const tracker = new ChallengeTracker([COIN_CHALLENGE]);
    tracker.onCoinCollect("gold");
    tracker.onCoinCollect("gold");
    const progress = tracker.getAllProgress();
    expect(progress[0].current).toBe(2);
    expect(progress[0].completed).toBe(false);
  });

  it("drives level progress through onLevelUp", () => {
    const tracker = new ChallengeTracker([LEVEL_CHALLENGE]);
    tracker.onLevelUp(2);
    expect(tracker.getAllProgress()[0].current).toBe(2);
    tracker.onLevelUp(3);
    expect(tracker.getAllProgress()[0].completed).toBe(true);
  });

  it("drives survival-time progress through onTick", () => {
    const base = 1_000_000;
    const spy = vi.spyOn(Date, "now").mockReturnValue(base);
    const tracker = new ChallengeTracker([SURVIVAL_CHALLENGE]);
    spy.mockReturnValue(base + 6000); // 6 seconds later
    tracker.onTick();
    expect(tracker.getAllProgress()[0].completed).toBe(true);
    spy.mockRestore();
  });

  it("awards XP exactly once for a completed challenge on death", () => {
    const tracker = new ChallengeTracker([SCORE_CHALLENGE]);
    tracker.onScoreChange(60); // completes

    const awarded: { action: XPKey; key: string }[] = [];
    const award = (rewards: ChallengeReward[]) => {
      for (const r of rewards) {
        awarded.push({ action: periodToXpKey(r), key: r.challenge.id });
      }
    };

    // First death — reward granted.
    award(collectChallengeRewards(tracker.getChallenges(), tracker.getAllProgress(), 60));
    expect(awarded).toEqual([
      { action: "challenge_daily", key: SCORE_CHALLENGE.id },
    ]);

    // Second run/death same day — already persisted, no re-award.
    award(collectChallengeRewards(tracker.getChallenges(), tracker.getAllProgress(), 70));
    expect(awarded).toHaveLength(1);
  });

  it("does not award a restriction challenge that was violated", () => {
    const tracker = new ChallengeTracker([WATER_RESTRICTION]);
    // Drown before reaching the restricted score → violated, can never complete.
    tracker.onScoreChange(20);
    tracker.onDeath("water"); // violates → resets + flags
    const progress = tracker.getAllProgress();
    expect(progress[0].violated).toBe(true);
    expect(progress[0].completed).toBe(false);
    const rewards = collectChallengeRewards(
      tracker.getChallenges(),
      progress,
      20,
    );
    expect(rewards).toHaveLength(0);
    expect(loadCompletions()).toHaveLength(0);
  });

  it("maps weekly challenges to the weekly XP key with the weekly amount", () => {
    const tracker = new ChallengeTracker([WEEKLY_CHALLENGE]);
    tracker.onScoreChange(120); // completes
    const rewards = collectChallengeRewards(
      tracker.getChallenges(),
      tracker.getAllProgress(),
      120,
    );
    expect(rewards).toHaveLength(1);
    expect(periodToXpKey(rewards[0])).toBe("challenge_weekly");
    expect(rewards[0].xpReward).toBe(50);
  });

  it("awards multiple completed challenges in one death, each once", () => {
    const tracker = new ChallengeTracker([SCORE_CHALLENGE, COIN_CHALLENGE]);
    tracker.onScoreChange(60); // completes score
    tracker.onCoinCollect("gold");
    tracker.onCoinCollect("gold");
    tracker.onCoinCollect("gold"); // completes coins

    const rewards = collectChallengeRewards(
      tracker.getChallenges(),
      tracker.getAllProgress(),
      60,
    );
    expect(rewards.map((r) => r.challenge.id).sort()).toEqual(
      [SCORE_CHALLENGE.id, COIN_CHALLENGE.id].sort(),
    );
  });
});

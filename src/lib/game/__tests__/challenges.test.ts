import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDailyChallenges,
  getWeeklyChallenges,
  getUTCDateString,
  getWeekStartDate,
  ChallengeTracker,
  loadCompletions,
  saveCompletion,
  isChallengeCompleted,
} from "../challenges";
import type { Challenge } from "../types";

// Mock localStorage
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

describe("Deterministic challenge generation", () => {
  it("generates exactly 3 daily challenges", () => {
    const challenges = getDailyChallenges();
    expect(challenges).toHaveLength(3);
  });

  it("generates exactly 1 weekly challenge", () => {
    const challenges = getWeeklyChallenges();
    expect(challenges).toHaveLength(1);
  });

  it("daily challenges are deterministic for the same date", () => {
    const date = new Date("2026-03-31T12:00:00Z");
    const first = getDailyChallenges(date);
    const second = getDailyChallenges(date);

    expect(first.map((c) => c.id)).toEqual(second.map((c) => c.id));
    expect(first.map((c) => c.description)).toEqual(
      second.map((c) => c.description),
    );
  });

  it("weekly challenges are deterministic for the same week", () => {
    // Both dates are in the same week (Mon-Sun)
    const monday = new Date("2026-03-30T12:00:00Z"); // Monday
    const wednesday = new Date("2026-04-01T12:00:00Z"); // Wednesday same week

    const fromMon = getWeeklyChallenges(monday);
    const fromWed = getWeeklyChallenges(wednesday);

    expect(fromMon[0].id).toBe(fromWed[0].id);
  });

  it("daily challenges differ between different dates", () => {
    const day1 = getDailyChallenges(new Date("2026-03-31T00:00:00Z"));
    const day2 = getDailyChallenges(new Date("2026-04-01T00:00:00Z"));

    // IDs should differ because date is in the ID
    expect(day1[0].id).not.toBe(day2[0].id);
  });

  it("weekly challenges differ between different weeks", () => {
    const week1 = getWeeklyChallenges(new Date("2026-03-30T00:00:00Z"));
    const week2 = getWeeklyChallenges(new Date("2026-04-06T00:00:00Z"));

    expect(week1[0].id).not.toBe(week2[0].id);
  });

  it("all challenges have required fields", () => {
    const all = [
      ...getDailyChallenges(),
      ...getWeeklyChallenges(),
    ];

    for (const challenge of all) {
      expect(challenge.id).toBeDefined();
      expect(challenge.type).toBeDefined();
      expect(challenge.params).toBeDefined();
      expect(challenge.description).toBeTruthy();
      expect(challenge.xpReward).toBeGreaterThan(0);
      expect(["daily", "weekly"]).toContain(challenge.period);
    }
  });

  it("daily challenges award 15 XP", () => {
    const challenges = getDailyChallenges();
    for (const c of challenges) {
      expect(c.xpReward).toBe(15);
    }
  });

  it("weekly challenges award 50 XP", () => {
    const challenges = getWeeklyChallenges();
    for (const c of challenges) {
      expect(c.xpReward).toBe(50);
    }
  });

  it("daily challenges try to use different types", () => {
    const challenges = getDailyChallenges(new Date("2026-03-31T00:00:00Z"));
    const types = challenges.map((c) => c.type);
    const uniqueTypes = new Set(types);
    // Should have at least 2 unique types (may be 3)
    expect(uniqueTypes.size).toBeGreaterThanOrEqual(2);
  });
});

describe("Date utilities", () => {
  it("getUTCDateString returns YYYY-MM-DD", () => {
    const date = new Date("2026-03-31T15:30:00Z");
    expect(getUTCDateString(date)).toBe("2026-03-31");
  });

  it("getWeekStartDate returns the Monday of the week", () => {
    // Wednesday March 25, 2026
    const wed = new Date("2026-03-25T12:00:00Z");
    expect(getWeekStartDate(wed)).toBe("2026-03-23"); // Monday

    // Sunday March 29, 2026
    const sun = new Date("2026-03-29T12:00:00Z");
    expect(getWeekStartDate(sun)).toBe("2026-03-23"); // same Monday

    // Monday March 23, 2026
    const mon = new Date("2026-03-23T12:00:00Z");
    expect(getWeekStartDate(mon)).toBe("2026-03-23"); // itself
  });
});

describe("ChallengeTracker", () => {
  let tracker: ChallengeTracker;
  let challenges: Challenge[];

  beforeEach(() => {
    challenges = [
      {
        id: "daily_2026-03-31_0",
        type: "score_target",
        params: { targetScore: 50 },
        description: "Reach a score of 50",
        xpReward: 15,
        period: "daily",
      },
      {
        id: "daily_2026-03-31_1",
        type: "collection",
        params: { targetCoins: 5 },
        description: "Collect 5 coins in one run",
        xpReward: 15,
        period: "daily",
      },
      {
        id: "daily_2026-03-31_2",
        type: "survival",
        params: { targetLevel: 3 },
        description: "Reach level 3",
        xpReward: 15,
        period: "daily",
      },
    ];
    tracker = new ChallengeTracker(challenges);
  });

  it("initializes all challenges with zero progress", () => {
    const progress = tracker.getAllProgress();
    expect(progress).toHaveLength(3);
    for (const p of progress) {
      expect(p.current).toBe(0);
      expect(p.completed).toBe(false);
    }
  });

  it("tracks score_target progress", () => {
    tracker.onScoreChange(30);
    const progress = tracker.getAllProgress();
    const scoreProgress = progress.find(
      (p) => p.challengeId === "daily_2026-03-31_0",
    );
    expect(scoreProgress?.current).toBe(30);
    expect(scoreProgress?.completed).toBe(false);
  });

  it("completes score_target when threshold reached", () => {
    const completed = tracker.onScoreChange(50);
    expect(completed).toContain("daily_2026-03-31_0");
  });

  it("tracks coin collection progress", () => {
    tracker.onCoinCollect("gold");
    tracker.onCoinCollect("gold");
    tracker.onCoinCollect("silver");

    const progress = tracker.getAllProgress();
    const coinProgress = progress.find(
      (p) => p.challengeId === "daily_2026-03-31_1",
    );
    expect(coinProgress?.current).toBe(3);
    expect(coinProgress?.completed).toBe(false);
  });

  it("completes collection challenge when target reached", () => {
    for (let i = 0; i < 5; i++) {
      tracker.onCoinCollect("gold");
    }
    const progress = tracker.getAllProgress();
    const coinProgress = progress.find(
      (p) => p.challengeId === "daily_2026-03-31_1",
    );
    expect(coinProgress?.completed).toBe(true);
  });

  it("completes survival/level challenge when level reached", () => {
    const completed = tracker.onLevelUp(3);
    expect(completed).toContain("daily_2026-03-31_2");
  });

  it("does not re-complete already completed challenges", () => {
    tracker.onScoreChange(50); // first completion
    const second = tracker.onScoreChange(60); // should not re-report
    expect(second).toHaveLength(0);
  });

  it("getCompletedIds returns all completed challenge IDs", () => {
    tracker.onScoreChange(50);
    tracker.onLevelUp(3);
    const ids = tracker.getCompletedIds();
    expect(ids).toContain("daily_2026-03-31_0");
    expect(ids).toContain("daily_2026-03-31_2");
    expect(ids).not.toContain("daily_2026-03-31_1");
  });

  it("resetForNewRun resets uncompleted progress but keeps completed", () => {
    tracker.onScoreChange(50); // complete score challenge
    tracker.onCoinCollect("gold"); // partial coin progress
    tracker.resetForNewRun();

    const progress = tracker.getAllProgress();
    const scoreProgress = progress.find(
      (p) => p.challengeId === "daily_2026-03-31_0",
    );
    const coinProgress = progress.find(
      (p) => p.challengeId === "daily_2026-03-31_1",
    );

    // Score challenge stays completed
    expect(scoreProgress?.completed).toBe(true);
    // Coin progress is reset
    expect(coinProgress?.current).toBe(0);
  });
});

describe("ChallengeTracker — restriction challenges", () => {
  it("violates no_water_death restriction on water death", () => {
    const challenges: Challenge[] = [
      {
        id: "restrict_test",
        type: "restriction",
        params: { restriction: "no_water_death", restrictedScore: 30 },
        description: "Score 30 without drowning",
        xpReward: 15,
        period: "daily",
      },
    ];
    const tracker = new ChallengeTracker(challenges);

    tracker.onScoreChange(20);
    tracker.onDeath("water");

    const progress = tracker.getAllProgress();
    expect(progress[0].violated).toBe(true);
    expect(progress[0].current).toBe(0);
  });

  it("completes restriction challenge when score reached without violation", () => {
    const challenges: Challenge[] = [
      {
        id: "restrict_test",
        type: "restriction",
        params: { restriction: "no_water_death", restrictedScore: 30 },
        description: "Score 30 without drowning",
        xpReward: 15,
        period: "daily",
      },
    ];
    const tracker = new ChallengeTracker(challenges);

    const completed = tracker.onScoreChange(30);
    expect(completed).toContain("restrict_test");
  });

  it("violates no_coins restriction when coin collected", () => {
    const challenges: Challenge[] = [
      {
        id: "no_coins_test",
        type: "restriction",
        params: { restriction: "no_coins", restrictedScore: 50 },
        description: "Score 50 without collecting coins",
        xpReward: 15,
        period: "daily",
      },
    ];
    const tracker = new ChallengeTracker(challenges);

    tracker.onCoinCollect("gold");
    const progress = tracker.getAllProgress();
    expect(progress[0].violated).toBe(true);
  });
});

describe("ChallengeTracker — specific coin type collection", () => {
  it("only counts specified coin type", () => {
    const challenges: Challenge[] = [
      {
        id: "diamond_test",
        type: "collection",
        params: { targetCoins: 3, coinType: "diamond" },
        description: "Collect 3 diamonds",
        xpReward: 15,
        period: "daily",
      },
    ];
    const tracker = new ChallengeTracker(challenges);

    tracker.onCoinCollect("gold"); // should not count
    tracker.onCoinCollect("silver"); // should not count
    tracker.onCoinCollect("diamond"); // counts

    const progress = tracker.getAllProgress();
    expect(progress[0].current).toBe(1);
  });
});

describe("Challenge completion persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("saves and loads completions", () => {
    saveCompletion({
      challengeId: "test_1",
      completedAt: "2026-03-31T00:00:00Z",
      runScore: 50,
    });

    const completions = loadCompletions();
    expect(completions).toHaveLength(1);
    expect(completions[0].challengeId).toBe("test_1");
  });

  it("does not duplicate completions", () => {
    saveCompletion({
      challengeId: "test_1",
      completedAt: "2026-03-31T00:00:00Z",
      runScore: 50,
    });
    saveCompletion({
      challengeId: "test_1",
      completedAt: "2026-03-31T01:00:00Z",
      runScore: 60,
    });

    const completions = loadCompletions();
    expect(completions).toHaveLength(1);
  });

  it("isChallengeCompleted returns correct status", () => {
    saveCompletion({
      challengeId: "test_1",
      completedAt: "2026-03-31T00:00:00Z",
      runScore: 50,
    });

    expect(isChallengeCompleted("test_1")).toBe(true);
    expect(isChallengeCompleted("test_2")).toBe(false);
  });

  it("returns empty array for invalid JSON", () => {
    localStorageMock.getItem.mockReturnValueOnce("bad json");
    expect(loadCompletions()).toEqual([]);
  });
});

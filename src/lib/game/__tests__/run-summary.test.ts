import { describe, it, expect } from "vitest";
import { isNotableRun } from "../run-summary";
import type { RunSummary } from "../types";

// Note: generateRunSummaryCard uses document.createElement("canvas") which
// requires a browser DOM. We test the pure logic functions here.

function makeRunSummary(overrides: Partial<RunSummary> = {}): RunSummary {
  return {
    score: 30,
    level: 2,
    coinsCollected: 5,
    coinBonus: 25,
    deathCause: "vehicle",
    survivalTimeMs: 45000,
    isNewHighScore: false,
    personalBestsBeaten: [],
    challengesCompleted: [],
    ...overrides,
  };
}

describe("isNotableRun", () => {
  it("returns true for a new high score", () => {
    const summary = makeRunSummary({ isNewHighScore: true });
    expect(isNotableRun(summary)).toBe(true);
  });

  it("returns true when personal bests are beaten", () => {
    const summary = makeRunSummary({
      personalBestsBeaten: ["bestScore"],
    });
    expect(isNotableRun(summary)).toBe(true);
  });

  it("returns true when challenges are completed", () => {
    const summary = makeRunSummary({
      challengesCompleted: ["daily_2026-03-31_0"],
    });
    expect(isNotableRun(summary)).toBe(true);
  });

  it("returns true for high scores (>= 50)", () => {
    const summary = makeRunSummary({ score: 50 });
    expect(isNotableRun(summary)).toBe(true);
  });

  it("returns false for a mediocre run", () => {
    const summary = makeRunSummary({
      score: 10,
      isNewHighScore: false,
      personalBestsBeaten: [],
      challengesCompleted: [],
    });
    expect(isNotableRun(summary)).toBe(false);
  });

  it("returns false for zero score", () => {
    const summary = makeRunSummary({ score: 0 });
    expect(isNotableRun(summary)).toBe(false);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  getTotalDeaths,
  getTotalDiamonds,
  incrementTotalDeaths,
  addDiamonds,
  getGameStats,
  getUnlockedSkinsFromStats,
} from "../stats";
import { unlockSkin, getUnlockedSkins } from "../skins";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
});

describe("totalDeaths persistence", () => {
  it("defaults to 0", () => {
    expect(getTotalDeaths()).toBe(0);
  });

  it("increments and persists across reads (round-trip)", () => {
    expect(incrementTotalDeaths()).toBe(1);
    expect(getTotalDeaths()).toBe(1);
    expect(incrementTotalDeaths()).toBe(2);
    expect(getTotalDeaths()).toBe(2);
  });

  it("ignores corrupted stored value", () => {
    store["adventure_total_deaths"] = "not-a-number";
    expect(getTotalDeaths()).toBe(0);
  });
});

describe("totalDiamonds persistence", () => {
  it("defaults to 0", () => {
    expect(getTotalDiamonds()).toBe(0);
  });

  it("accumulates diamonds and persists (round-trip)", () => {
    expect(addDiamonds(3)).toBe(3);
    expect(getTotalDiamonds()).toBe(3);
    expect(addDiamonds(2)).toBe(5);
    expect(getTotalDiamonds()).toBe(5);
  });

  it("adding zero or negative is a no-op floor at current value", () => {
    addDiamonds(4);
    expect(addDiamonds(0)).toBe(4);
    expect(getTotalDiamonds()).toBe(4);
  });
});

describe("getGameStats", () => {
  it("reads high score, deaths, diamonds together", () => {
    store["adventure_high_score"] = "250";
    incrementTotalDeaths();
    addDiamonds(7);

    const stats = getGameStats(false);
    expect(stats.highScore).toBe(250);
    expect(stats.totalDeaths).toBe(1);
    expect(stats.totalDiamonds).toBe(7);
    expect(stats.allAchievements).toBe(false);
  });

  it("passes through allAchievements flag", () => {
    expect(getGameStats(true).allAchievements).toBe(true);
  });
});

describe("getUnlockedSkinsFromStats", () => {
  it("computes unlocks from persisted deaths/diamonds and high score", () => {
    store["adventure_high_score"] = "200";
    addDiamonds(100);
    for (let i = 0; i < 50; i++) incrementTotalDeaths();

    const unlocked = getUnlockedSkinsFromStats(false);
    expect(unlocked).toContain("default");
    expect(unlocked).toContain("golden"); // score >= 200
    expect(unlocked).toContain("ghost"); // deaths >= 50
    expect(unlocked).toContain("diamond"); // diamonds >= 100
    expect(unlocked).not.toContain("rainbow"); // allAchievements false
  });

  it("only default is unlocked with zero stats", () => {
    const unlocked = getUnlockedSkinsFromStats(false);
    expect(unlocked).toEqual(["default"]);
  });

  it("merges previously persisted unlocks (never revokes)", () => {
    unlockSkin("rainbow");
    const unlocked = getUnlockedSkinsFromStats(false);
    expect(unlocked).toContain("rainbow");
    // and the unlock store still reflects it
    expect(getUnlockedSkins()).toContain("rainbow");
  });
});

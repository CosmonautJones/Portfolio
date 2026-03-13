import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  getAchievement,
  getPublicAchievements,
  getTotalAchievementCount,
} from "../achievements";

describe("getAchievement", () => {
  it("returns achievement by ID", () => {
    const a = getAchievement("first_steps");
    expect(a).toBeDefined();
    expect(a!.name).toBe("First Steps");
    expect(a!.xpReward).toBe(10);
  });

  it("returns undefined for invalid ID", () => {
    expect(getAchievement("nonexistent")).toBeUndefined();
  });
});

describe("getPublicAchievements", () => {
  it("excludes secret achievements", () => {
    const pub = getPublicAchievements();
    expect(pub.every((a) => !a.secret)).toBe(true);
  });

  it("returns fewer than total", () => {
    const pub = getPublicAchievements();
    expect(pub.length).toBeLessThan(ACHIEVEMENTS.length);
  });
});

describe("getTotalAchievementCount", () => {
  it("returns total count including secrets", () => {
    expect(getTotalAchievementCount()).toBe(ACHIEVEMENTS.length);
  });
});

describe("ACHIEVEMENTS data integrity", () => {
  it("all achievements have unique IDs", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all achievements have positive XP rewards", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.xpReward).toBeGreaterThan(0);
    }
  });

  it("all achievements have required fields", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.condition).toBeDefined();
    }
  });
});

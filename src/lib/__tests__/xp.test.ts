import { describe, it, expect } from "vitest";
import { getLevelForXP, getNextLevelXP, getLevelProgress, LEVELS } from "../xp";

describe("getLevelForXP", () => {
  it("returns level 1 for 0 XP", () => {
    const result = getLevelForXP(0);
    expect(result).toEqual({ level: 1, xp: 0, title: "Visitor" });
  });

  it("returns level 1 for XP below level 2 threshold", () => {
    expect(getLevelForXP(49)).toEqual({ level: 1, xp: 0, title: "Visitor" });
  });

  it("returns level 2 at exactly 50 XP", () => {
    expect(getLevelForXP(50).level).toBe(2);
    expect(getLevelForXP(50).title).toBe("Explorer");
  });

  it("returns correct level for each boundary", () => {
    for (const lvl of LEVELS) {
      expect(getLevelForXP(lvl.xp).level).toBe(lvl.level);
    }
  });

  it("returns max level for very high XP", () => {
    const result = getLevelForXP(999999);
    expect(result.level).toBe(10);
    expect(result.title).toBe("High Five");
  });

  it("returns correct level for XP between thresholds", () => {
    expect(getLevelForXP(100).level).toBe(2);
    expect(getLevelForXP(500).level).toBe(4);
  });
});

describe("getNextLevelXP", () => {
  it("returns next threshold", () => {
    expect(getNextLevelXP(0)).toBe(50);
    expect(getNextLevelXP(50)).toBe(150);
  });

  it("returns null at max level", () => {
    expect(getNextLevelXP(6000)).toBeNull();
    expect(getNextLevelXP(9999)).toBeNull();
  });
});

describe("getLevelProgress", () => {
  it("returns 0 at level start", () => {
    expect(getLevelProgress(0)).toBe(0);
    expect(getLevelProgress(50)).toBe(0);
  });

  it("returns 100 at max level", () => {
    expect(getLevelProgress(6000)).toBe(100);
  });

  it("returns percentage within level", () => {
    expect(getLevelProgress(25)).toBe(50);
  });
});

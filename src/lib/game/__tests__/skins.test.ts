import { describe, it, expect, beforeEach } from "vitest";
import {
  SKINS,
  SKIN_UNLOCK_CONDITIONS,
  getSelectedSkin,
  setSelectedSkin,
  getUnlockedSkins,
  unlockSkin,
  checkSkinUnlocks,
} from "../skins";
import type { SkinId } from "../types";

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
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
});

// ---------------------------------------------------------------------------
// Skin definitions
// ---------------------------------------------------------------------------

describe("Skin definitions", () => {
  it("has all 5 skins defined", () => {
    const expectedIds: SkinId[] = [
      "default",
      "golden",
      "ghost",
      "diamond",
      "rainbow",
    ];
    for (const id of expectedIds) {
      expect(SKINS[id]).toBeDefined();
      expect(SKINS[id].id).toBe(id);
      expect(SKINS[id].name).toBeTruthy();
    }
  });

  it("default skin has no palette overrides", () => {
    expect(Object.keys(SKINS.default.paletteOverrides).length).toBe(0);
  });

  it("non-default skins have palette overrides", () => {
    const nonDefault: SkinId[] = ["golden", "ghost", "diamond", "rainbow"];
    for (const id of nonDefault) {
      expect(Object.keys(SKINS[id].paletteOverrides).length).toBeGreaterThan(
        0,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Unlock conditions
// ---------------------------------------------------------------------------

describe("Skin unlock conditions", () => {
  it("default has null condition (always available)", () => {
    expect(SKIN_UNLOCK_CONDITIONS.default).toBeNull();
  });

  it("golden requires score threshold", () => {
    const c = SKIN_UNLOCK_CONDITIONS.golden;
    expect(c).not.toBeNull();
    expect(c!.type).toBe("score");
    expect(c!.threshold).toBe(200);
  });

  it("ghost requires deaths threshold", () => {
    const c = SKIN_UNLOCK_CONDITIONS.ghost;
    expect(c).not.toBeNull();
    expect(c!.type).toBe("deaths");
    expect(c!.threshold).toBe(50);
  });

  it("diamond requires diamonds threshold", () => {
    const c = SKIN_UNLOCK_CONDITIONS.diamond;
    expect(c).not.toBeNull();
    expect(c!.type).toBe("diamonds");
    expect(c!.threshold).toBe(100);
  });

  it("rainbow requires all achievements", () => {
    const c = SKIN_UNLOCK_CONDITIONS.rainbow;
    expect(c).not.toBeNull();
    expect(c!.type).toBe("achievements");
  });
});

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

describe("Skin selection", () => {
  it("defaults to 'default' when nothing stored", () => {
    expect(getSelectedSkin()).toBe("default");
  });

  it("persists and retrieves selected skin", () => {
    setSelectedSkin("golden");
    expect(getSelectedSkin()).toBe("golden");
  });

  it("returns 'default' for invalid stored value", () => {
    store["adventure_skin"] = "invalid_skin";
    expect(getSelectedSkin()).toBe("default");
  });
});

describe("Unlocked skins storage", () => {
  it("defaults to ['default'] when nothing stored", () => {
    expect(getUnlockedSkins()).toEqual(["default"]);
  });

  it("unlockSkin adds a new skin", () => {
    const wasNew = unlockSkin("golden");
    expect(wasNew).toBe(true);
    expect(getUnlockedSkins()).toContain("golden");
    expect(getUnlockedSkins()).toContain("default");
  });

  it("unlockSkin returns false for already-unlocked skin", () => {
    unlockSkin("ghost");
    const wasNew = unlockSkin("ghost");
    expect(wasNew).toBe(false);
  });

  it("handles corrupted localStorage gracefully", () => {
    store["adventure_skins_unlocked"] = "not-valid-json{{{";
    expect(getUnlockedSkins()).toEqual(["default"]);
  });
});

// ---------------------------------------------------------------------------
// checkSkinUnlocks
// ---------------------------------------------------------------------------

describe("checkSkinUnlocks", () => {
  it("unlocks golden when high score >= 200", () => {
    const result = checkSkinUnlocks({
      highScore: 200,
      totalDeaths: 0,
      totalDiamonds: 0,
      allAchievements: false,
    });

    expect(result).toContain("golden");
    expect(getUnlockedSkins()).toContain("golden");
  });

  it("unlocks ghost when total deaths >= 50", () => {
    const result = checkSkinUnlocks({
      highScore: 0,
      totalDeaths: 50,
      totalDiamonds: 0,
      allAchievements: false,
    });

    expect(result).toContain("ghost");
  });

  it("unlocks diamond when total diamonds >= 100", () => {
    const result = checkSkinUnlocks({
      highScore: 0,
      totalDeaths: 0,
      totalDiamonds: 100,
      allAchievements: false,
    });

    expect(result).toContain("diamond");
  });

  it("unlocks rainbow when all achievements met", () => {
    const result = checkSkinUnlocks({
      highScore: 0,
      totalDeaths: 0,
      totalDiamonds: 0,
      allAchievements: true,
    });

    expect(result).toContain("rainbow");
  });

  it("does not re-unlock already unlocked skins", () => {
    unlockSkin("golden");

    const result = checkSkinUnlocks({
      highScore: 300,
      totalDeaths: 0,
      totalDiamonds: 0,
      allAchievements: false,
    });

    expect(result).not.toContain("golden");
  });

  it("can unlock multiple skins at once", () => {
    const result = checkSkinUnlocks({
      highScore: 250,
      totalDeaths: 60,
      totalDiamonds: 150,
      allAchievements: true,
    });

    expect(result).toContain("golden");
    expect(result).toContain("ghost");
    expect(result).toContain("diamond");
    expect(result).toContain("rainbow");
  });
});

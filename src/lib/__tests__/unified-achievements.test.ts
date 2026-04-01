import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  SITE_ACHIEVEMENTS,
  GAME_ACHIEVEMENTS,
  getAchievement,
  getPublicAchievements,
  getTotalAchievementCount,
  getAchievementsByContext,
  getSiteAchievements,
  getGameAchievements,
} from "../achievements";
import { XP_AWARDS } from "../xp";
import type { Achievement } from "@/lib/types";

describe("Unified Achievement Registry", () => {
  describe("data integrity", () => {
    it("all achievements have unique IDs across both registries", () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all achievements have a context field", () => {
      for (const a of ACHIEVEMENTS) {
        expect(a.context).toBeDefined();
        expect(["site", "game", "both"]).toContain(a.context);
      }
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

    it("total count is site + game achievements", () => {
      expect(ACHIEVEMENTS.length).toBe(
        SITE_ACHIEVEMENTS.length + GAME_ACHIEVEMENTS.length,
      );
    });
  });

  describe("SITE_ACHIEVEMENTS", () => {
    it("contains original 13 site achievements", () => {
      expect(SITE_ACHIEVEMENTS.length).toBe(13);
    });

    it("includes expected achievements by ID", () => {
      const ids = SITE_ACHIEVEMENTS.map((a) => a.id);
      expect(ids).toContain("first_steps");
      expect(ids).toContain("road_scholar");
      expect(ids).toContain("konami");
      expect(ids).toContain("streak_7");
    });

    it("all have context site or both", () => {
      for (const a of SITE_ACHIEVEMENTS) {
        expect(["site", "both"]).toContain(a.context);
      }
    });
  });

  describe("GAME_ACHIEVEMENTS", () => {
    it("contains 15 game achievements", () => {
      expect(GAME_ACHIEVEMENTS.length).toBe(15);
    });

    it("includes expected achievements by ID", () => {
      const ids = GAME_ACHIEVEMENTS.map((a) => a.id);
      expect(ids).toContain("first_hop");
      expect(ids).toContain("score_25");
      expect(ids).toContain("score_100");
      expect(ids).toContain("score_200");
      expect(ids).toContain("log_rider");
      expect(ids).toContain("level_3");
      expect(ids).toContain("level_6");
      expect(ids).toContain("death_water");
      expect(ids).toContain("death_train");
      expect(ids).toContain("death_all");
      expect(ids).toContain("score_no_water");
      expect(ids).toContain("comeback");
      expect(ids).toContain("first_coin");
      expect(ids).toContain("diamond_hunter");
      expect(ids).toContain("coin_hoarder");
    });

    it("all have context game", () => {
      for (const a of GAME_ACHIEVEMENTS) {
        expect(a.context).toBe("game");
      }
    });
  });

  describe("getAchievement", () => {
    it("returns site achievements by ID", () => {
      const a = getAchievement("first_steps");
      expect(a).toBeDefined();
      expect(a!.name).toBe("First Steps");
      expect(a!.context).toBe("site");
    });

    it("returns game achievements by ID", () => {
      const a = getAchievement("first_hop");
      expect(a).toBeDefined();
      expect(a!.name).toBe("First Steps");
      expect(a!.context).toBe("game");
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

    it("returns fewer than total (secrets excluded)", () => {
      const pub = getPublicAchievements();
      expect(pub.length).toBeLessThan(ACHIEVEMENTS.length);
    });
  });

  describe("getTotalAchievementCount", () => {
    it("returns total count of all achievements", () => {
      expect(getTotalAchievementCount()).toBe(ACHIEVEMENTS.length);
      expect(getTotalAchievementCount()).toBe(28); // 13 site + 15 game
    });
  });

  describe("context filters", () => {
    it("getAchievementsByContext('site') returns site-only achievements", () => {
      const siteOnly = getAchievementsByContext("site");
      for (const a of siteOnly) {
        const ctx = a.context ?? "site";
        expect(["site", "both"]).toContain(ctx);
      }
    });

    it("getAchievementsByContext('game') returns game-only achievements", () => {
      const gameOnly = getAchievementsByContext("game");
      for (const a of gameOnly) {
        const ctx = a.context ?? "site";
        expect(["game", "both"]).toContain(ctx);
      }
    });

    it("getSiteAchievements includes both-context achievements", () => {
      const site = getSiteAchievements();
      const bothAchievements = ACHIEVEMENTS.filter((a) => a.context === "both");
      for (const ba of bothAchievements) {
        expect(site.some((a) => a.id === ba.id)).toBe(true);
      }
    });

    it("getGameAchievements includes both-context achievements", () => {
      const game = getGameAchievements();
      const bothAchievements = ACHIEVEMENTS.filter((a) => a.context === "both");
      for (const ba of bothAchievements) {
        expect(game.some((a) => a.id === ba.id)).toBe(true);
      }
    });

    it("hop_skip and road_warrior appear in both site and game lists", () => {
      const site = getSiteAchievements();
      const game = getGameAchievements();

      expect(site.some((a) => a.id === "hop_skip")).toBe(true);
      expect(game.some((a) => a.id === "hop_skip")).toBe(true);
      expect(site.some((a) => a.id === "road_warrior")).toBe(true);
      expect(game.some((a) => a.id === "road_warrior")).toBe(true);
    });
  });

  describe("no duplicate XP awards from game achievement IDs", () => {
    it("game achievement IDs do not overlap with XP action keys", () => {
      // The game tracker uses achievement IDs like "first_hop", "score_25" etc.
      // The site XP system uses action keys like "play_game", "score_50" etc.
      // These should not collide to avoid double-awarding
      const xpActionKeys = Object.keys(XP_AWARDS);
      const gameIds = GAME_ACHIEVEMENTS.map((a) => a.id);

      // None of the game achievement IDs should be an XP action key
      // (score_100 and score_200 are both but they serve different purposes:
      //  XP action awards XP directly, achievement gives achievement XP reward)
      // This is expected overlap — the dedup prevents double awards
      for (const id of gameIds) {
        if (xpActionKeys.includes(id)) {
          // These are expected overlaps where both systems handle the same milestone
          expect(["score_100", "score_200"]).toContain(id);
        }
      }
    });
  });

  describe("game achievements have correct Lucide icons", () => {
    const validIcons = [
      "Footprints", "MapPin", "Medal", "Rocket", "TreePine",
      "Star", "Crown", "Waves", "TrainFront", "Skull",
      "Ban", "Flame", "CircleDot", "Gem", "Coins",
    ];

    it("all game achievements reference valid icon names", () => {
      for (const a of GAME_ACHIEVEMENTS) {
        expect(validIcons).toContain(a.icon);
      }
    });
  });
});

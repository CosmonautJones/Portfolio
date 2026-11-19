/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  GAME_ACHIEVEMENTS,
  SITE_ACHIEVEMENTS,
  getAchievement,
} from "../achievements";
import { AchievementTracker } from "../game/achievement-tracker";
import { ALL_DEATH_CAUSES } from "../game/achievements";
import {
  shouldUnlockCartographer,
  shouldUnlockRoadScholar,
  isCanvasFull,
  isPixelPerfectCanvas,
  CARTOGRAPHER_EGG_COUNT,
} from "../easter-eggs/triggers";
import { getAllEasterEggs } from "../easter-eggs/registry";
import {
  awardGuestXP,
  createEmptyGuestProfile,
  recordGuestDiscovery,
  refreshGuestVisit,
  streakAchievementsFor,
  unlockGuestAchievement,
  type GuestState,
} from "../guest-profile";

const SITE_IDS = [
  "first_steps",
  "road_scholar",
  "mixologist",
  "pixel_perfect",
  "hop_skip",
  "road_warrior",
  "night_owl",
  "konami",
  "red_pill",
  "halliday_egg",
  "cartographer",
  "streak_3",
  "streak_7",
] as const;

const GAME_IDS = [
  "first_hop",
  "score_25",
  "score_100",
  "score_200",
  "log_rider",
  "level_3",
  "level_6",
  "death_water",
  "death_train",
  "death_all",
  "score_no_water",
  "comeback",
  "first_coin",
  "diamond_hunter",
  "coin_hoarder",
] as const;

function guest(now = new Date("2026-09-21T12:00:00Z")): GuestState {
  return { profile: createEmptyGuestProfile(now), awardedKeys: [] };
}

describe("achievement QA matrix", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("covers every registered achievement exactly once", () => {
    const expected = [...SITE_IDS, ...GAME_IDS];
    expect(SITE_ACHIEVEMENTS.map((a) => a.id)).toEqual([...SITE_IDS]);
    expect(GAME_ACHIEVEMENTS.map((a) => a.id)).toEqual([...GAME_IDS]);
    expect(ACHIEVEMENTS.map((a) => a.id).sort()).toEqual([...expected].sort());
  });

  describe("site unlocks on a guest profile", () => {
    it("first_steps: first visit", () => {
      const result = unlockGuestAchievement(guest(), "first_steps");
      expect(result.unlocked).toBe(true);
      expect(result.state.profile.achievements).toContain("first_steps");
    });

    it("road_scholar: three distinct project views", () => {
      expect(shouldUnlockRoadScholar(new Set(["a", "b"]))).toBe(false);
      expect(shouldUnlockRoadScholar(new Set(["a", "b", "c"]))).toBe(true);
      const result = unlockGuestAchievement(guest(), "road_scholar");
      expect(result.unlocked).toBe(true);
    });

    it("mixologist, pixel_perfect, hop_skip, road_warrior, night_owl unlock by id", () => {
      for (const id of [
        "mixologist",
        "pixel_perfect",
        "hop_skip",
        "road_warrior",
        "night_owl",
      ] as const) {
        const result = unlockGuestAchievement(guest(), id);
        expect(result.unlocked, id).toBe(true);
        expect(getAchievement(id)?.xpReward).toBeGreaterThan(0);
      }
    });

    it("pixel_perfect condition is a fully painted 32x32 grid, not a smaller one", () => {
      const small = Array.from({ length: 8 }, () => Array(8).fill(1));
      expect(isCanvasFull(small)).toBe(true);
      expect(isPixelPerfectCanvas(small, 8)).toBe(false);
      const hole = Array.from({ length: 32 }, () => Array(32).fill(1));
      hole[31][31] = 0;
      expect(isPixelPerfectCanvas(hole, 32)).toBe(false);
      const full = Array.from({ length: 32 }, () => Array(32).fill(4));
      expect(isPixelPerfectCanvas(full, 32)).toBe(true);
    });

    it("secret eggs: konami, red_pill, halliday_egg", () => {
      for (const id of ["konami", "red_pill", "halliday_egg"] as const) {
        expect(getAchievement(id)?.secret).toBe(true);
        expect(unlockGuestAchievement(guest(), id).unlocked).toBe(true);
      }
    });

    it("cartographer: all registered eggs recorded as discoveries", () => {
      let state = guest();
      const eggs = getAllEasterEggs();
      expect(eggs).toHaveLength(CARTOGRAPHER_EGG_COUNT);
      expect(shouldUnlockCartographer(state.profile.discoveries)).toBe(false);

      for (const egg of eggs) {
        const recorded = recordGuestDiscovery(state, egg.id);
        expect(recorded.added).toBe(true);
        state = recorded.state;
      }

      expect(shouldUnlockCartographer(state.profile.discoveries)).toBe(true);
      expect(unlockGuestAchievement(state, "cartographer").unlocked).toBe(true);
    });

    it("streak_3 and streak_7 fire after consecutive UTC visits", () => {
      const day0 = new Date("2026-09-21T12:00:00Z");
      let state: GuestState = {
        profile: { ...createEmptyGuestProfile(day0), streak_days: 1, last_visit: "2026-09-21" },
        awardedKeys: [],
      };

      state = refreshGuestVisit(state, new Date("2026-09-22T12:00:00Z"));
      expect(state.profile.streak_days).toBe(2);
      expect(streakAchievementsFor(state.profile.streak_days)).toEqual([]);

      state = refreshGuestVisit(state, new Date("2026-09-23T12:00:00Z"));
      expect(state.profile.streak_days).toBe(3);
      expect(streakAchievementsFor(state.profile.streak_days)).toEqual(["streak_3"]);

      state = refreshGuestVisit(state, new Date("2026-09-24T12:00:00Z"));
      state = refreshGuestVisit(state, new Date("2026-09-25T12:00:00Z"));
      state = refreshGuestVisit(state, new Date("2026-09-26T12:00:00Z"));
      state = refreshGuestVisit(state, new Date("2026-09-27T12:00:00Z"));
      expect(state.profile.streak_days).toBe(7);
      expect(streakAchievementsFor(state.profile.streak_days)).toEqual([
        "streak_3",
        "streak_7",
      ]);
    });
  });

  describe("game tracker unlocks", () => {
    it("first_hop, score_25, score_100, score_200, aquaphobe", () => {
      const tracker = new AchievementTracker();
      expect(tracker.onScoreChange(1).map((u) => u.achievementId)).toContain("first_hop");
      expect(tracker.onScoreChange(25).map((u) => u.achievementId)).toContain("score_25");
      expect(tracker.onScoreChange(50).map((u) => u.achievementId)).toContain("score_no_water");
      expect(tracker.onScoreChange(100).map((u) => u.achievementId)).toContain("score_100");
      expect(tracker.onScoreChange(200).map((u) => u.achievementId)).toContain("score_200");
    });

    it("log_rider, levels, coins, deaths, comeback", () => {
      const tracker = new AchievementTracker();
      expect(tracker.onLogRide(4).map((u) => u.achievementId)).toContain("log_rider");
      expect(tracker.onLevelUp(3, 30).map((u) => u.achievementId)).toContain("level_3");
      expect(tracker.onLevelUp(6, 80).map((u) => u.achievementId)).toContain("level_6");
      expect(tracker.onCoinCollect("gold", 1, 10).map((u) => u.achievementId)).toContain("first_coin");
      expect(tracker.onCoinCollect("diamond", 2, 12).map((u) => u.achievementId)).toContain(
        "diamond_hunter",
      );
      const hoard = new AchievementTracker();
      hoard.onCoinCollect("gold", 20, 40);
      expect(hoard.isUnlocked("coin_hoarder")).toBe(true);
      expect(tracker.onDeath("water", 8).map((u) => u.achievementId)).toContain("death_water");
      expect(tracker.onDeath("train", 8).map((u) => u.achievementId)).toContain("death_train");

      const deaths = new AchievementTracker();
      for (const cause of ALL_DEATH_CAUSES) deaths.onDeath(cause, 5);
      expect(deaths.isUnlocked("death_all")).toBe(true);

      const comeback = new AchievementTracker();
      comeback.resetForNewGame(40);
      expect(comeback.onDeath("vehicle", 60).map((u) => u.achievementId)).toContain("comeback");
    });

    it("every game achievement id is reachable from the tracker", () => {
      const tracker = new AchievementTracker();
      tracker.onScoreChange(1);
      tracker.onScoreChange(25);
      tracker.onScoreChange(50);
      tracker.onScoreChange(100);
      tracker.onScoreChange(200);
      tracker.onLogRide(10);
      tracker.onLevelUp(6, 80);
      tracker.onCoinCollect("gold", 1, 10);
      tracker.onCoinCollect("diamond", 2, 12);
      tracker.onCoinCollect("gold", 20, 40);
      tracker.resetForNewGame(10);
      tracker.onDeath("vehicle", 80);
      tracker.onDeath("train", 8);
      tracker.onDeath("water", 8);
      tracker.onDeath("idle_timeout", 8);
      tracker.onDeath("off_screen", 8);

      for (const id of GAME_IDS) {
        expect(tracker.isUnlocked(id), `${id} should be reachable`).toBe(true);
      }
    });
  });

  it("guest XP awards exist for the site actions that feed achievements", () => {
    const session = new Set<string>();
    let state = guest();
    state = awardGuestXP(state, "first_visit", undefined, session).state;
    state = awardGuestXP(state, "toggle_theme", undefined, session).state;
    state = awardGuestXP(state, "view_project", { key: "one" }, session).state;
    expect(state.profile.xp).toBeGreaterThan(0);
  });
});

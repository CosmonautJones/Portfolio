import { describe, it, expect, beforeEach } from "vitest";
import { AchievementTracker } from "../achievement-tracker";

describe("AchievementTracker", () => {
  let tracker: AchievementTracker;

  beforeEach(() => {
    tracker = new AchievementTracker();
  });

  describe("onScoreChange", () => {
    it("unlocks first_hop at score 1", () => {
      const unlocks = tracker.onScoreChange(1);
      expect(unlocks).toHaveLength(1);
      expect(unlocks[0].achievementId).toBe("first_hop");
    });

    it("unlocks score_25 at score 25", () => {
      tracker.onScoreChange(1); // first_hop
      const unlocks = tracker.onScoreChange(25);
      expect(unlocks.some((u) => u.achievementId === "score_25")).toBe(true);
    });

    it("unlocks score_100 at score 100", () => {
      tracker.onScoreChange(1);
      tracker.onScoreChange(25);
      const unlocks = tracker.onScoreChange(100);
      expect(unlocks.some((u) => u.achievementId === "score_100")).toBe(true);
    });

    it("unlocks score_200 at score 200", () => {
      tracker.onScoreChange(1);
      tracker.onScoreChange(25);
      tracker.onScoreChange(100);
      const unlocks = tracker.onScoreChange(200);
      expect(unlocks.some((u) => u.achievementId === "score_200")).toBe(true);
    });

    it("does NOT re-unlock already-unlocked achievements", () => {
      tracker.onScoreChange(1);
      const unlocks = tracker.onScoreChange(2);
      expect(unlocks.some((u) => u.achievementId === "first_hop")).toBe(false);
    });

    it("does not re-unlock pre-loaded achievements", () => {
      const t = new AchievementTracker(["first_hop", "score_25"]);
      const unlocks = t.onScoreChange(30);
      expect(unlocks).toHaveLength(0);
    });
  });

  describe("onLogRide", () => {
    it("unlocks log_rider on first log ride", () => {
      const unlocks = tracker.onLogRide(5);
      expect(unlocks).toHaveLength(1);
      expect(unlocks[0].achievementId).toBe("log_rider");
    });

    it("does not re-unlock log_rider", () => {
      tracker.onLogRide(5);
      const unlocks = tracker.onLogRide(10);
      expect(unlocks).toHaveLength(0);
    });
  });

  describe("score_no_water (Aquaphobe)", () => {
    it("unlocks at score 50 if no water touched", () => {
      tracker.onScoreChange(1);
      tracker.onScoreChange(25);
      const unlocks = tracker.onScoreChange(50);
      expect(unlocks.some((u) => u.achievementId === "score_no_water")).toBe(
        true,
      );
    });

    it("blocks score_no_water if water was touched via log ride", () => {
      tracker.onLogRide(5);
      tracker.onScoreChange(1);
      tracker.onScoreChange(25);
      const unlocks = tracker.onScoreChange(50);
      expect(unlocks.some((u) => u.achievementId === "score_no_water")).toBe(
        false,
      );
    });
  });

  describe("onLevelUp", () => {
    it("unlocks level_3 at level 3", () => {
      const unlocks = tracker.onLevelUp(3, 30);
      expect(unlocks).toHaveLength(1);
      expect(unlocks[0].achievementId).toBe("level_3");
    });

    it("unlocks level_6 at level 6", () => {
      tracker.onLevelUp(3, 30);
      const unlocks = tracker.onLevelUp(6, 80);
      expect(unlocks).toHaveLength(1);
      expect(unlocks[0].achievementId).toBe("level_6");
    });

    it("unlocks both at once if jumping from 1 to 6", () => {
      const unlocks = tracker.onLevelUp(6, 80);
      expect(unlocks).toHaveLength(2);
      expect(unlocks.map((u) => u.achievementId).sort()).toEqual([
        "level_3",
        "level_6",
      ]);
    });
  });

  describe("onDeath", () => {
    it("unlocks death_water on water death", () => {
      const unlocks = tracker.onDeath("water", 10);
      expect(unlocks.some((u) => u.achievementId === "death_water")).toBe(true);
    });

    it("unlocks death_train on train death", () => {
      const unlocks = tracker.onDeath("train", 10);
      expect(unlocks.some((u) => u.achievementId === "death_train")).toBe(true);
    });

    it("unlocks death_all only when all 5 causes seen", () => {
      tracker.onDeath("vehicle", 5);
      tracker.onDeath("train", 5);
      tracker.onDeath("water", 5);
      tracker.onDeath("idle_timeout", 5);
      expect(tracker.isUnlocked("death_all")).toBe(false);

      tracker.onDeath("off_screen", 5);
      expect(tracker.isUnlocked("death_all")).toBe(true);
    });

    it("considers pre-loaded death history for death_all", () => {
      const t = new AchievementTracker(
        [],
        ["vehicle", "train", "water", "idle_timeout"],
      );
      t.onDeath("off_screen", 5);
      expect(t.isUnlocked("death_all")).toBe(true);
    });
  });

  describe("comeback", () => {
    it("unlocks comeback when beating previous high score", () => {
      tracker.resetForNewGame(50);
      const unlocks = tracker.onDeath("vehicle", 60);
      expect(unlocks.some((u) => u.achievementId === "comeback")).toBe(true);
    });

    it("does NOT unlock comeback when previous high score is 0", () => {
      tracker.resetForNewGame(0);
      const unlocks = tracker.onDeath("vehicle", 10);
      expect(unlocks.some((u) => u.achievementId === "comeback")).toBe(false);
    });

    it("does NOT unlock comeback when not beating high score", () => {
      tracker.resetForNewGame(50);
      const unlocks = tracker.onDeath("vehicle", 30);
      expect(unlocks.some((u) => u.achievementId === "comeback")).toBe(false);
    });
  });

  describe("resetForNewGame", () => {
    it("clears per-run state but keeps unlocked set", () => {
      tracker.onScoreChange(1); // unlock first_hop
      tracker.onLogRide(5); // sets waterTouched
      tracker.flushPendingUnlocks();

      tracker.resetForNewGame(20);

      // first_hop still unlocked — won't re-trigger
      const unlocks = tracker.onScoreChange(1);
      expect(unlocks).toHaveLength(0);

      // waterTouched reset — score_no_water should work
      const unlocks2 = tracker.onScoreChange(50);
      expect(unlocks2.some((u) => u.achievementId === "score_no_water")).toBe(
        true,
      );
    });
  });

  describe("flushPendingUnlocks", () => {
    it("returns and clears pending list", () => {
      tracker.onScoreChange(1);
      tracker.onLogRide(5);

      const flushed = tracker.flushPendingUnlocks();
      expect(flushed).toHaveLength(2);

      const flushed2 = tracker.flushPendingUnlocks();
      expect(flushed2).toHaveLength(0);
    });
  });

  describe("getDeathCausesSeen", () => {
    it("returns accumulated death causes", () => {
      tracker.onDeath("water", 5);
      tracker.onDeath("vehicle", 10);
      const seen = tracker.getDeathCausesSeen();
      expect(seen.sort()).toEqual(["vehicle", "water"]);
    });
  });
});

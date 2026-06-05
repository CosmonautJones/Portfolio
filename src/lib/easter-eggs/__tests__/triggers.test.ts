import { describe, it, expect } from "vitest";
import {
  CARTOGRAPHER_EGG_COUNT,
  ROAD_SCHOLAR_PROJECT_COUNT,
  shouldUnlockCartographer,
  shouldUnlockRoadScholar,
  isCanvasFull,
} from "../triggers";
import { getAllEasterEggs } from "../registry";

describe("easter-egg / progression triggers", () => {
  describe("shouldUnlockCartographer", () => {
    it("does not unlock below the threshold", () => {
      expect(shouldUnlockCartographer(["a", "b", "c"])).toBe(false);
    });

    it("unlocks once distinct discoveries reach the threshold", () => {
      const eggs = Array.from(
        { length: CARTOGRAPHER_EGG_COUNT },
        (_, i) => `egg_${i}`,
      );
      expect(shouldUnlockCartographer(eggs)).toBe(true);
    });

    it("counts distinct discoveries only (ignores duplicates)", () => {
      const dupes = Array.from(
        { length: CARTOGRAPHER_EGG_COUNT + 2 },
        () => "same_egg",
      );
      expect(shouldUnlockCartographer(dupes)).toBe(false);
    });

    it("threshold equals the number of registered eggs", () => {
      expect(CARTOGRAPHER_EGG_COUNT).toBe(getAllEasterEggs().length);
    });
  });

  describe("shouldUnlockRoadScholar", () => {
    it("does not unlock below the project threshold", () => {
      const viewed = new Set<string>(["a", "b"]);
      expect(shouldUnlockRoadScholar(viewed)).toBe(false);
    });

    it("unlocks at the project threshold", () => {
      const viewed = new Set<string>(["a", "b", "c"]);
      expect(shouldUnlockRoadScholar(viewed)).toBe(true);
    });

    it("counts distinct slugs only", () => {
      const viewed = new Set<string>(["a", "a", "b"]);
      expect(viewed.size).toBe(2);
      expect(shouldUnlockRoadScholar(viewed)).toBe(false);
    });

    it("road scholar threshold matches achievement definition", () => {
      expect(ROAD_SCHOLAR_PROJECT_COUNT).toBe(3);
    });
  });

  describe("isCanvasFull", () => {
    it("returns false when any cell is empty (index 0)", () => {
      const grid = [
        [1, 1],
        [1, 0],
      ];
      expect(isCanvasFull(grid)).toBe(false);
    });

    it("returns true when every cell is painted (non-zero)", () => {
      const grid = [
        [1, 2],
        [3, 4],
      ];
      expect(isCanvasFull(grid)).toBe(true);
    });

    it("returns false for an empty grid", () => {
      expect(isCanvasFull([])).toBe(false);
    });
  });
});

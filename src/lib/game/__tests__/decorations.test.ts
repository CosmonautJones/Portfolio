import { describe, it, expect } from "vitest";
import { spawnDecorationsForLane } from "../engine";
import { DEFAULT_CONFIG, DECORATIONS_PER_LANE } from "../constants";
import type { Lane, Decoration } from "../types";
import { DECORATION_SPRITES } from "../sprites/decorations";

function createLane(type: Lane["type"], y = -5): Lane {
  return {
    y,
    type,
    variant: 0,
    obstacles: [],
    decorations: [],
    flowDirection: 1,
    speedMultiplier: 1,
  };
}

describe("Decoration spawning", () => {
  it("only spawns decorations on grass lanes", () => {
    const roadLane = createLane("road");
    spawnDecorationsForLane(roadLane, DEFAULT_CONFIG);
    expect(roadLane.decorations).toHaveLength(0);

    const waterLane = createLane("water");
    spawnDecorationsForLane(waterLane, DEFAULT_CONFIG);
    expect(waterLane.decorations).toHaveLength(0);

    const railLane = createLane("railroad");
    spawnDecorationsForLane(railLane, DEFAULT_CONFIG);
    expect(railLane.decorations).toHaveLength(0);
  });

  it("spawns decorations on grass lanes (probabilistic — run multiple times)", () => {
    let anySpawned = false;
    for (let i = 0; i < 50; i++) {
      const lane = createLane("grass");
      spawnDecorationsForLane(lane, DEFAULT_CONFIG);
      if (lane.decorations.length > 0) {
        anySpawned = true;
        break;
      }
    }
    expect(anySpawned).toBe(true);
  });

  it("decoration columns don't overlap within a lane", () => {
    for (let i = 0; i < 30; i++) {
      const lane = createLane("grass");
      spawnDecorationsForLane(lane, DEFAULT_CONFIG);

      const cols = lane.decorations.map((d: Decoration) => d.gridX);
      const uniqueCols = new Set(cols);
      expect(uniqueCols.size).toBe(cols.length);
    }
  });

  it("decoration count is within configured range", () => {
    for (let i = 0; i < 30; i++) {
      const lane = createLane("grass");
      spawnDecorationsForLane(lane, DEFAULT_CONFIG);

      if (lane.decorations.length > 0) {
        expect(lane.decorations.length).toBeGreaterThanOrEqual(
          DECORATIONS_PER_LANE.min,
        );
        expect(lane.decorations.length).toBeLessThanOrEqual(
          DECORATIONS_PER_LANE.max,
        );
      }
    }
  });

  it("decorations have valid types", () => {
    const validTypes = new Set(["tree", "bush", "rock", "stump"]);
    for (let i = 0; i < 20; i++) {
      const lane = createLane("grass");
      spawnDecorationsForLane(lane, DEFAULT_CONFIG);
      for (const deco of lane.decorations) {
        expect(validTypes.has(deco.type)).toBe(true);
      }
    }
  });

  it("decoration gridX values are within column bounds", () => {
    for (let i = 0; i < 20; i++) {
      const lane = createLane("grass");
      spawnDecorationsForLane(lane, DEFAULT_CONFIG);
      for (const deco of lane.decorations) {
        expect(deco.gridX).toBeGreaterThanOrEqual(0);
        expect(deco.gridX).toBeLessThan(DEFAULT_CONFIG.gridColumns);
      }
    }
  });

  it("Lane interface includes decorations field", () => {
    const lane = createLane("grass");
    expect(lane).toHaveProperty("decorations");
    expect(Array.isArray(lane.decorations)).toBe(true);
  });
});

describe("Decoration sprite data", () => {
  const expectedDimensions: Record<string, { width: number; height: number }> = {
    tree_0: { width: 16, height: 24 },
    tree_1: { width: 16, height: 24 },
    bush_0: { width: 14, height: 12 },
    bush_1: { width: 14, height: 12 },
    rock_0: { width: 12, height: 10 },
    rock_1: { width: 12, height: 10 },
    stump_0: { width: 10, height: 8 },
  };

  it("exports all expected sprite keys", () => {
    const expectedKeys = [
      "tree_0",
      "tree_1",
      "bush_0",
      "bush_1",
      "rock_0",
      "rock_1",
      "stump_0",
    ];
    for (const key of expectedKeys) {
      expect(DECORATION_SPRITES).toHaveProperty(key);
    }
  });

  for (const [name, dims] of Object.entries(expectedDimensions)) {
    describe(`${name}`, () => {
      it(`has correct dimensions (${dims.width}x${dims.height})`, () => {
        const sprite = DECORATION_SPRITES[name];
        expect(sprite).toBeDefined();
        expect(sprite.length).toBe(dims.height);
        for (let row = 0; row < sprite.length; row++) {
          expect(sprite[row].length).toBe(dims.width);
        }
      });

      it("uses at most 4 unique non-zero palette indices", () => {
        const sprite = DECORATION_SPRITES[name];
        const nonZeroIndices = new Set<number>();
        for (const row of sprite) {
          for (const idx of row) {
            if (idx !== 0) nonZeroIndices.add(idx);
          }
        }
        expect(nonZeroIndices.size).toBeLessThanOrEqual(4);
      });

      it("follows the 2x2 block convention", () => {
        const sprite = DECORATION_SPRITES[name];
        for (let y = 0; y < sprite.length; y += 2) {
          for (let x = 0; x < sprite[y].length; x += 2) {
            const topLeft = sprite[y][x];
            const topRight = sprite[y][x + 1];
            const bottomLeft = sprite[y + 1]?.[x];
            const bottomRight = sprite[y + 1]?.[x + 1];
            expect(topLeft).toBe(topRight);
            expect(topLeft).toBe(bottomLeft);
            expect(topLeft).toBe(bottomRight);
          }
        }
      });
    });
  }
});

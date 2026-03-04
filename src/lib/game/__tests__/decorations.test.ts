import { describe, it, expect } from "vitest";
import { spawnDecorationsForLane } from "../engine";
import { DEFAULT_CONFIG, DECORATIONS_PER_LANE } from "../constants";
import type { Lane, Decoration } from "../types";

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

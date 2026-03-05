import { describe, it, expect } from "vitest";
import { hexToRgb } from "../renderer";
import { COIN_GLOW_COLORS, COIN_PARTICLE_COLORS } from "../sprites/coins";
import { OBSTACLE_SPRITES } from "../sprites/obstacles";

describe("hexToRgb", () => {
  it("converts hex to RGB tuple", () => {
    expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
    expect(hexToRgb("#00ff00")).toEqual([0, 255, 0]);
    expect(hexToRgb("#1a1c2c")).toEqual([26, 28, 44]);
  });

  it("converts black", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  });

  it("converts white", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
  });
});

describe("Ruby coin variant", () => {
  it("COIN_GLOW_COLORS includes ruby", () => {
    expect(COIN_GLOW_COLORS).toHaveProperty("ruby");
    expect(typeof COIN_GLOW_COLORS.ruby).toBe("string");
    expect(COIN_GLOW_COLORS.ruby).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("COIN_PARTICLE_COLORS includes ruby", () => {
    expect(COIN_PARTICLE_COLORS).toHaveProperty("ruby");
    expect(Array.isArray(COIN_PARTICLE_COLORS.ruby)).toBe(true);
    expect(COIN_PARTICLE_COLORS.ruby.length).toBeGreaterThan(0);
  });
});

describe("Car yellow obstacle variant", () => {
  it("car_yellow sprite is registered in OBSTACLE_SPRITES", () => {
    expect(OBSTACLE_SPRITES).toHaveProperty("car_yellow");
  });

  it("car_yellow sprite is 32x64 (2 cells wide, 1 tall)", () => {
    const sprite = OBSTACLE_SPRITES.car_yellow;
    expect(sprite.length).toBe(32); // 32 rows
    expect(sprite[0].length).toBe(64); // 64 cols = 2 * 32
  });
});

describe("Cell-shaded obstacle sprites", () => {
  it("obstacle sprites have correct dimensions", () => {
    expect(OBSTACLE_SPRITES.car.length).toBe(32);
    expect(OBSTACLE_SPRITES.car[0].length).toBe(64);
    expect(OBSTACLE_SPRITES.truck.length).toBe(32);
    expect(OBSTACLE_SPRITES.truck[0].length).toBe(96);
    expect(OBSTACLE_SPRITES.train.length).toBe(32);
    expect(OBSTACLE_SPRITES.train[0].length).toBe(128);
    expect(OBSTACLE_SPRITES.log.length).toBe(32);
    expect(OBSTACLE_SPRITES.log[0].length).toBe(96);
  });

  it("each obstacle uses at most 5 unique non-zero indices", () => {
    for (const key of ["car", "truck", "train", "log"]) {
      const indices = new Set(OBSTACLE_SPRITES[key].flat().filter((i: number) => i !== 0));
      expect(indices.size, key).toBeLessThanOrEqual(5);
    }
  });

  it("recolor variants still exist", () => {
    expect(OBSTACLE_SPRITES.car_blue).toBeDefined();
    expect(OBSTACLE_SPRITES.car_yellow).toBeDefined();
    expect(OBSTACLE_SPRITES.car_blue.length).toBe(32);
    expect(OBSTACLE_SPRITES.car_yellow.length).toBe(32);
  });
});

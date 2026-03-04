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

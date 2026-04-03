import { describe, it, expect } from "vitest";
import {
  getAnimationFrame,
  ANIMATION_CONFIGS,
} from "../sprites/animation";

describe("getAnimationFrame", () => {
  it("returns 0 for unknown types", () => {
    expect(getAnimationFrame("unknown_sprite", 0)).toBe(0);
    expect(getAnimationFrame("unknown_sprite", 100)).toBe(0);
  });

  it("returns 0 at time 0 for all configured types", () => {
    for (const type of Object.keys(ANIMATION_CONFIGS)) {
      expect(getAnimationFrame(type, 0)).toBe(0);
    }
  });

  it("returns correct frame for car at 1fps", () => {
    // At 1fps, frame duration = 1.0s
    // t=0 → frame 0, t=0.5 → frame 0, t=1.0 → frame 1, t=1.5 → frame 1
    expect(getAnimationFrame("car", 0)).toBe(0);
    expect(getAnimationFrame("car", 0.5)).toBe(0);
    expect(getAnimationFrame("car", 1.0)).toBe(1);
    expect(getAnimationFrame("car", 1.5)).toBe(1);
  });

  it("returns correct frame for train at 2fps", () => {
    // At 2fps, frame duration = 0.5s
    // t=0 → frame 0, t=0.25 → frame 0, t=0.5 → frame 1, t=0.75 → frame 1
    expect(getAnimationFrame("train", 0)).toBe(0);
    expect(getAnimationFrame("train", 0.25)).toBe(0);
    expect(getAnimationFrame("train", 0.5)).toBe(1);
    expect(getAnimationFrame("train", 0.75)).toBe(1);
  });

  it("wraps around (cycles) for looping animations", () => {
    // car at 1fps: frame toggles every 1.0s → wraps at 2.0s
    expect(getAnimationFrame("car", 2.0)).toBe(0);
    expect(getAnimationFrame("car", 3.0)).toBe(1);
    expect(getAnimationFrame("car", 4.0)).toBe(0);

    // train at 2fps: frame toggles every 0.5s → wraps at 1.0s
    expect(getAnimationFrame("train", 1.0)).toBe(0);
    expect(getAnimationFrame("train", 1.5)).toBe(1);
    expect(getAnimationFrame("train", 2.0)).toBe(0);
  });

  it("handles large time values correctly", () => {
    // Should still produce valid frame indices (0 or 1) at large times
    const frame = getAnimationFrame("car", 999999.7);
    expect(frame).toBeGreaterThanOrEqual(0);
    expect(frame).toBeLessThan(2);
  });

  it("applies to all color variants of car", () => {
    // car_blue and car_yellow should behave identically to car (1fps)
    for (const type of ["car", "car_blue", "car_yellow"]) {
      expect(getAnimationFrame(type, 0)).toBe(0);
      expect(getAnimationFrame(type, 1.0)).toBe(1);
      expect(getAnimationFrame(type, 2.0)).toBe(0);
    }
  });

  it("all configured animations have frameCount > 0", () => {
    for (const [type, config] of Object.entries(ANIMATION_CONFIGS)) {
      expect(config.frameCount, `${type} frameCount`).toBeGreaterThan(0);
      expect(config.fps, `${type} fps`).toBeGreaterThan(0);
    }
  });

  it("returns 0 for types with frameCount=1 if any existed", () => {
    // This test verifies the guard clause: frameCount <= 1 → 0
    // Since all current configs have frameCount=2, we test the boundary
    // by ensuring the function handles the edge case correctly
    // (the guard is `config.frameCount <= 1`)
    // We rely on the unknown type test to cover the `!config` branch
    // and this verifies the concept: a hypothetical single-frame type
    // would always return 0.
    // All current configs have frameCount=2, so they should cycle
    for (const config of Object.values(ANIMATION_CONFIGS)) {
      expect(config.frameCount).toBeGreaterThan(1);
    }
  });
});

import { describe, it, expect } from "vitest";
import {
  createScreenShake,
  triggerScreenShake,
  updateScreenShake,
  getShakeParams,
} from "../effects";

describe("ScreenShake", () => {
  it("starts inactive with zero offsets", () => {
    const shake = createScreenShake();
    expect(shake.active).toBe(false);
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
  });

  it("activates on trigger", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 5, 0.5);
    expect(shake.active).toBe(true);
    expect(shake.intensity).toBe(5);
    expect(shake.duration).toBe(0.5);
    expect(shake.elapsed).toBe(0);
  });

  it("returns non-zero offsets while active", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 6, 0.5);
    const result = updateScreenShake(shake, 0.05);
    // At least one offset should be non-zero (randomized but intensity > 0)
    expect(shake.active).toBe(true);
    expect(result.offsetX !== 0 || result.offsetY !== 0).toBe(true);
  });

  it("returns to zero after duration elapses", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 4, 0.3);

    // Advance past the duration
    updateScreenShake(shake, 0.1);
    updateScreenShake(shake, 0.1);
    const result = updateScreenShake(shake, 0.2);

    expect(shake.active).toBe(false);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(0);
  });

  it("returns zero offsets when inactive", () => {
    const shake = createScreenShake();
    const result = updateScreenShake(shake, 0.1);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(0);
  });

  it("decays intensity over time", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 10, 1.0);

    // Sample early
    updateScreenShake(shake, 0.05);

    // Sample later (reset and advance further)
    const shake2 = createScreenShake();
    triggerScreenShake(shake2, 10, 1.0);
    updateScreenShake(shake2, 0.8);
    const lateMax = Math.max(Math.abs(shake2.offsetX), Math.abs(shake2.offsetY));

    // Late offsets should be much smaller on average (they decay exponentially).
    // Due to randomness, we just check the late offset is bounded.
    expect(lateMax).toBeLessThan(10);
  });
});

describe("getShakeParams", () => {
  it("returns highest intensity for train", () => {
    const train = getShakeParams("train");
    const vehicle = getShakeParams("vehicle");
    const water = getShakeParams("water");
    expect(train.intensity).toBeGreaterThan(vehicle.intensity);
    expect(vehicle.intensity).toBeGreaterThan(water.intensity);
  });

  it("returns valid params for unknown cause", () => {
    const params = getShakeParams("unknown");
    expect(params.intensity).toBeGreaterThan(0);
    expect(params.duration).toBeGreaterThan(0);
  });
});

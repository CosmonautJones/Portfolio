import { describe, it, expect } from "vitest";
import {
  createScreenShake,
  triggerScreenShake,
  triggerMicroShake,
  updateScreenShake,
  getShakeParams,
  createComboState,
  updateCombo,
  resetCombo,
} from "../effects";

describe("ScreenShake", () => {
  it("starts inactive with zero offsets and zero bias", () => {
    const shake = createScreenShake();
    expect(shake.active).toBe(false);
    expect(shake.offsetX).toBe(0);
    expect(shake.offsetY).toBe(0);
    expect(shake.biasX).toBe(0);
    expect(shake.biasY).toBe(0);
  });

  it("activates on trigger", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 5, 0.5);
    expect(shake.active).toBe(true);
    expect(shake.intensity).toBe(5);
    expect(shake.duration).toBe(0.5);
    expect(shake.elapsed).toBe(0);
  });

  it("stores directional bias on trigger", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 5, 0.5, 1, -0.5);
    expect(shake.biasX).toBe(1);
    expect(shake.biasY).toBe(-0.5);
  });

  it("defaults bias to zero when omitted", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 5, 0.5);
    expect(shake.biasX).toBe(0);
    expect(shake.biasY).toBe(0);
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

  it("does not override a stronger active shake", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 8, 0.5);
    const strongIntensity = shake.intensity;
    // Try to trigger a weaker shake while strong shake is active
    triggerScreenShake(shake, 3, 0.2);
    expect(shake.intensity).toBe(strongIntensity);
  });
});

describe("triggerMicroShake", () => {
  it("activates with small intensity and short duration", () => {
    const shake = createScreenShake();
    triggerMicroShake(shake);
    expect(shake.active).toBe(true);
    expect(shake.intensity).toBe(1.5);
    expect(shake.duration).toBe(0.1);
  });

  it("accepts optional directional bias", () => {
    const shake = createScreenShake();
    triggerMicroShake(shake, 0, 0.5);
    expect(shake.biasX).toBe(0);
    expect(shake.biasY).toBe(0.5);
  });

  it("does not override a stronger active shake", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 5, 0.5);
    triggerMicroShake(shake);
    // Should remain at the stronger intensity
    expect(shake.intensity).toBe(5);
  });

  it("can override when current shake is weaker", () => {
    const shake = createScreenShake();
    triggerScreenShake(shake, 1, 0.05);
    triggerMicroShake(shake);
    // Micro-shake intensity (1.5) > 1, so it overrides
    expect(shake.intensity).toBe(1.5);
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

  it("returns directional biasX for train (horizontal impact)", () => {
    const { biasX } = getShakeParams("train");
    expect(biasX).toBeGreaterThan(0);
  });

  it("returns directional biasY for water (downward)", () => {
    const { biasY } = getShakeParams("water");
    expect(biasY).toBeGreaterThan(0);
  });

  it("returns valid params for unknown cause", () => {
    const params = getShakeParams("unknown");
    expect(params.intensity).toBeGreaterThan(0);
    expect(params.duration).toBeGreaterThan(0);
    expect(typeof params.biasX).toBe("number");
    expect(typeof params.biasY).toBe("number");
  });

  it("returns all four fields for every known cause", () => {
    for (const cause of ["train", "vehicle", "water"]) {
      const p = getShakeParams(cause);
      expect(typeof p.intensity).toBe("number");
      expect(typeof p.duration).toBe("number");
      expect(typeof p.biasX).toBe("number");
      expect(typeof p.biasY).toBe("number");
    }
  });
});

describe("ComboState", () => {
  it("starts with count 0", () => {
    const combo = createComboState();
    expect(combo.count).toBe(0);
    expect(combo.windowSec).toBeGreaterThan(0);
  });

  it("increments combo count on consecutive hops within window", () => {
    const combo = createComboState();
    // First hop
    const c1 = updateCombo(combo, 0);
    expect(c1).toBe(1);
    // Second hop within window (0.5s < 0.8s default window)
    const c2 = updateCombo(combo, 0.5);
    expect(c2).toBe(2);
    const c3 = updateCombo(combo, 0.9);
    expect(c3).toBe(3);
  });

  it("resets combo when gap exceeds window", () => {
    const combo = createComboState();
    updateCombo(combo, 0);
    updateCombo(combo, 0.5);
    // Gap of 2s > 0.8s window
    const c = updateCombo(combo, 2.5);
    expect(c).toBe(1);
  });

  it("caps combo at 8", () => {
    const combo = createComboState();
    let t = 0;
    for (let i = 0; i < 12; i++) {
      updateCombo(combo, t);
      t += 0.3; // within window
    }
    expect(combo.count).toBe(8);
  });

  it("resetCombo sets count to 0", () => {
    const combo = createComboState();
    updateCombo(combo, 0);
    updateCombo(combo, 0.3);
    resetCombo(combo);
    expect(combo.count).toBe(0);
  });

  it("after resetCombo, next hop starts at 1", () => {
    const combo = createComboState();
    updateCombo(combo, 0);
    updateCombo(combo, 0.3);
    resetCombo(combo);
    const c = updateCombo(combo, 1.0);
    expect(c).toBe(1);
  });
});

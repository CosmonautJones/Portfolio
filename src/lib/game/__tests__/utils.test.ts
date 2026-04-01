import { describe, it, expect } from "vitest";
import { lerp, clamp, randomRange, pickRandom } from "../utils";

describe("lerp", () => {
  it("returns a at t=0", () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it("returns b at t=1", () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it("returns midpoint at t=0.5", () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it("handles negative values", () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});

describe("clamp", () => {
  it("clamps below minimum", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps above maximum", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns lo when value equals lo", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns hi when value equals hi", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("randomRange", () => {
  it("returns values within the specified range", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomRange(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(10);
    }
  });

  it("returns exact min when range is zero-width", () => {
    expect(randomRange(5, 5)).toBe(5);
  });
});

describe("pickRandom", () => {
  it("returns an element from the array", () => {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 50; i++) {
      const picked = pickRandom(arr);
      expect(arr).toContain(picked);
    }
  });

  it("returns the only element from a single-element array", () => {
    expect(pickRandom([42])).toBe(42);
  });
});

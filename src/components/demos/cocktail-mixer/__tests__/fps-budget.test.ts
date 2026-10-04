/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import { FpsBudget } from "../pixi/fps-budget";

describe("FpsBudget", () => {
  it("trips after 30 frames under 50fps", () => {
    const b = new FpsBudget(50, 30);
    for (let i = 0; i < 29; i++) expect(b.sample(40)).toBe(false);
    expect(b.sample(40)).toBe(true);
  });
  it("resets when fps recovers", () => {
    const b = new FpsBudget(50, 30);
    for (let i = 0; i < 10; i++) b.sample(40);
    expect(b.sample(60)).toBe(false);
  });
});

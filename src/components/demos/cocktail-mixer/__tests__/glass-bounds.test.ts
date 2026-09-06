/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  GLASS_BOUNDS,
  ICE_LAYOUT,
  CONDENSATION_LAYOUT,
  STAGE,
  GLASS_RECT,
} from "../glass-bounds";
import type { GlassType } from "../types";

const TYPES: GlassType[] = ["rocks", "highball", "coupe", "margarita"];

describe("glass-bounds", () => {
  it("defines a 280×420 stage and a 200×300 glass rect", () => {
    expect(STAGE).toEqual({ width: 280, height: 420 });
    expect(GLASS_RECT).toEqual({ x: 40, y: 48, width: 200, height: 300 });
  });

  it.each(TYPES)("%s has liquidTop < liquidBottom and rimY ≤ liquidTop", (type) => {
    const b = GLASS_BOUNDS[type];
    expect(b.liquidTop).toBeLessThan(b.liquidBottom);
    expect(b.rimY).toBeLessThanOrEqual(b.liquidTop);
    expect(b.bowlWidth).toBeGreaterThan(0);
  });

  it("gives ice only to rocks and highball", () => {
    expect(GLASS_BOUNDS.rocks.hasIce).toBe(true);
    expect(GLASS_BOUNDS.highball.hasIce).toBe(true);
    expect(GLASS_BOUNDS.coupe.hasIce).toBe(false);
    expect(GLASS_BOUNDS.margarita.hasIce).toBe(false);
    expect(ICE_LAYOUT.rocks).toHaveLength(2);
    expect(ICE_LAYOUT.highball).toHaveLength(3);
  });

  it("places bottle neck in local sprite space, not stage 100,40", () => {
    for (const type of TYPES) {
      expect(GLASS_BOUNDS[type].bottle.neckX).toBeLessThan(48);
      expect(GLASS_BOUNDS[type].bottle.neckY).toBeLessThan(48);
    }
  });

  it("has condensation dots for every glass", () => {
    for (const type of TYPES) {
      expect(CONDENSATION_LAYOUT[type].length).toBeGreaterThan(0);
    }
  });
});

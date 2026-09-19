/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  GLASS_BOUNDS,
  ICE_LAYOUT,
  CONDENSATION_LAYOUT,
  STAGE,
  GLASS_RECT,
  bowlWidthAt,
  condensationPoints,
  foamOffsetsForWidth,
  pourContactX,
  rimGarnishPoint,
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

  it("keeps liquid out of the margarita and coupe stems", () => {
    expect(GLASS_BOUNDS.margarita.liquidBottom).toBeLessThanOrEqual(152);
    expect(GLASS_BOUNDS.coupe.liquidBottom).toBeLessThanOrEqual(172);
  });

  it("gives ice only to rocks and highball, stacked from the bowl floor", () => {
    expect(GLASS_BOUNDS.rocks.hasIce).toBe(true);
    expect(GLASS_BOUNDS.highball.hasIce).toBe(true);
    expect(GLASS_BOUNDS.coupe.hasIce).toBe(false);
    expect(GLASS_BOUNDS.margarita.hasIce).toBe(false);
    expect(ICE_LAYOUT.rocks).toHaveLength(2);
    expect(ICE_LAYOUT.highball).toHaveLength(3);
    for (const cube of [...ICE_LAYOUT.rocks, ...ICE_LAYOUT.highball]) {
      expect(cube.dy).toBeLessThan(0);
    }
    expect(ICE_LAYOUT.highball[2].dy).toBeLessThan(-120);
  });

  it("docks the bottle neck above the rim in glass space", () => {
    for (const type of TYPES) {
      const bounds = GLASS_BOUNDS[type];
      expect(bounds.bottle.neckX).toBeLessThan(48);
      expect(bounds.bottle.neckY).toBeLessThan(48);
      expect(bounds.bottle.y).toBeLessThan(bounds.rimY);
      expect(bounds.bottle.x).toBeGreaterThan(bounds.bowlCenterX);
    }
  });

  it("perches garnish on the right rim", () => {
    for (const type of TYPES) {
      const point = rimGarnishPoint(type);
      const bounds = GLASS_BOUNDS[type];
      expect(point.x).toBeGreaterThan(bounds.bowlCenterX + 20);
      expect(point.y).toBeGreaterThanOrEqual(bounds.rimY);
      expect(point.y).toBeLessThan(bounds.liquidTop + 12);
    }
  });

  it("narrows margarita width toward the bowl floor", () => {
    expect(bowlWidthAt("margarita", 60)).toBeGreaterThan(
      bowlWidthAt("margarita", 140),
    );
    expect(bowlWidthAt("margarita", 140)).toBeLessThan(50);
  });

  it("keeps the pour contact inside the live bowl", () => {
    const contact = pourContactX("highball", 120);
    const half = bowlWidthAt("highball", 120) / 2;
    expect(contact).toBeGreaterThan(100);
    expect(contact).toBeLessThan(100 + half);
  });

  it("keeps foam dots inside the highball bowl", () => {
    const width = bowlWidthAt("highball", GLASS_BOUNDS.highball.liquidTop);
    for (const offset of foamOffsetsForWidth(width)) {
      expect(Math.abs(offset)).toBeLessThan(width / 2);
    }
  });

  it("has condensation dots for every glass", () => {
    for (const type of TYPES) {
      expect(CONDENSATION_LAYOUT[type].length).toBeGreaterThan(0);
    }
  });

  it("keeps condensation inside the live bowl", () => {
    for (const type of TYPES) {
      for (const drop of condensationPoints(type)) {
        const half = bowlWidthAt(type, drop.y) / 2;
        expect(Math.abs(drop.x - GLASS_BOUNDS[type].bowlCenterX)).toBeLessThan(
          half,
        );
      }
    }
  });
});

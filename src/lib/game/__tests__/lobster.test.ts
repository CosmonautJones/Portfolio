import { describe, it, expect } from "vitest";
import {
  LOBSTER_UP_IDLE,
  LOBSTER_UP_HOP,
  LOBSTER_DOWN_IDLE,
  LOBSTER_RIGHT_IDLE,
  LOBSTER_RIGHT_HOP,
  LOBSTER_DEATH,
  LOBSTER_SPRITES,
  LOBSTER_FLIP_KEYS,
} from "../sprites/lobster";
import { PALETTE } from "../sprites/palette";

describe("lobster sprites", () => {
  const allSprites = [
    { name: "UP_IDLE", sprite: LOBSTER_UP_IDLE },
    { name: "UP_HOP", sprite: LOBSTER_UP_HOP },
    { name: "DOWN_IDLE", sprite: LOBSTER_DOWN_IDLE },
    { name: "RIGHT_IDLE", sprite: LOBSTER_RIGHT_IDLE },
    { name: "RIGHT_HOP", sprite: LOBSTER_RIGHT_HOP },
    { name: "DEATH", sprite: LOBSTER_DEATH },
  ];

  it.each(allSprites)("$name is 16x16", ({ sprite }) => {
    expect(sprite.length).toBe(16);
    for (const row of sprite) {
      expect(row.length).toBe(16);
    }
  });

  it.each(allSprites)(
    "$name uses only valid palette indices",
    ({ sprite }) => {
      for (const row of sprite) {
        for (const idx of row) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(PALETTE.length);
        }
      }
    },
  );

  it("LOBSTER_SPRITES has all expected keys", () => {
    expect(Object.keys(LOBSTER_SPRITES)).toContain("lobster_up_idle");
    expect(Object.keys(LOBSTER_SPRITES)).toContain("lobster_down_idle");
    expect(Object.keys(LOBSTER_SPRITES)).toContain("lobster_right_idle");
    expect(Object.keys(LOBSTER_SPRITES)).toContain("lobster_death");
  });

  it("LOBSTER_FLIP_KEYS references valid source sprites", () => {
    for (const { src } of LOBSTER_FLIP_KEYS) {
      expect(LOBSTER_SPRITES[src]).toBeDefined();
    }
  });
});

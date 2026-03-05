import { describe, it, expect } from "vitest";
import {
  LOBSTER_UP_IDLE,
  LOBSTER_UP_HOP,
  LOBSTER_DOWN_IDLE,
  LOBSTER_RIGHT_IDLE,
  LOBSTER_RIGHT_HOP,
  LOBSTER_DEATH,
  LOBSTER_UP_LAND,
  LOBSTER_DOWN_BLINK,
  LOBSTER_DOWN_HOP,
  LOBSTER_SPRITES,
  LOBSTER_FLIP_KEYS,
} from "../sprites/lobster";
import { PALETTE } from "../sprites/palette";

describe("lobster sprites", () => {
  const allSprites = [
    { name: "UP_IDLE", sprite: LOBSTER_UP_IDLE },
    { name: "UP_HOP", sprite: LOBSTER_UP_HOP },
    { name: "DOWN_IDLE", sprite: LOBSTER_DOWN_IDLE },
    { name: "DOWN_HOP", sprite: LOBSTER_DOWN_HOP },
    { name: "RIGHT_IDLE", sprite: LOBSTER_RIGHT_IDLE },
    { name: "RIGHT_HOP", sprite: LOBSTER_RIGHT_HOP },
    { name: "DEATH", sprite: LOBSTER_DEATH },
    { name: "UP_LAND", sprite: LOBSTER_UP_LAND },
    { name: "DOWN_BLINK", sprite: LOBSTER_DOWN_BLINK },
  ];

  it.each(allSprites)("$name is 32x32", ({ sprite }) => {
    expect(sprite.length).toBe(32);
    for (const row of sprite) {
      expect(row.length).toBe(32);
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

  it.each(allSprites)(
    "$name has max 5 unique non-zero indices (cell-shaded constraint)",
    ({ sprite }) => {
      const nonZero = new Set<number>();
      for (const row of sprite) {
        for (const idx of row) {
          if (idx !== 0) nonZero.add(idx);
        }
      }
      expect(nonZero.size).toBeLessThanOrEqual(5);
    },
  );

  it.each(allSprites)(
    "$name follows 2x2 block convention",
    ({ sprite }) => {
      for (let r = 0; r < 32; r += 2) {
        for (let c = 0; c < 32; c += 2) {
          const topLeft = sprite[r][c];
          const topRight = sprite[r][c + 1];
          const botLeft = sprite[r + 1][c];
          const botRight = sprite[r + 1][c + 1];
          expect(
            topLeft === topRight &&
              topLeft === botLeft &&
              topLeft === botRight,
          ).toBe(true);
        }
      }
    },
  );

  const downAndRightSprites = [
    { name: "DOWN_IDLE", sprite: LOBSTER_DOWN_IDLE },
    { name: "DOWN_HOP", sprite: LOBSTER_DOWN_HOP },
    { name: "RIGHT_IDLE", sprite: LOBSTER_RIGHT_IDLE },
    { name: "RIGHT_HOP", sprite: LOBSTER_RIGHT_HOP },
  ];

  it.each(downAndRightSprites)(
    "$name contains emissive cyan (index 88)",
    ({ sprite }) => {
      let found = false;
      for (const row of sprite) {
        for (const idx of row) {
          if (idx === 88) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      expect(found).toBe(true);
    },
  );

  it("LOBSTER_SPRITES has all expected keys including new frames", () => {
    const keys = Object.keys(LOBSTER_SPRITES);
    expect(keys).toContain("lobster_up_idle");
    expect(keys).toContain("lobster_down_idle");
    expect(keys).toContain("lobster_right_idle");
    expect(keys).toContain("lobster_death");
    expect(keys).toContain("lobster_up_land");
    expect(keys).toContain("lobster_down_blink");
  });

  it("LOBSTER_FLIP_KEYS references valid source sprites", () => {
    for (const { src } of LOBSTER_FLIP_KEYS) {
      expect(LOBSTER_SPRITES[src]).toBeDefined();
    }
  });

  it("LOBSTER_UP_LAND differs from LOBSTER_UP_IDLE (squash frame)", () => {
    let hasDifference = false;
    for (let r = 0; r < LOBSTER_UP_IDLE.length; r++) {
      for (let c = 0; c < LOBSTER_UP_IDLE[r].length; c++) {
        if (LOBSTER_UP_IDLE[r][c] !== LOBSTER_UP_LAND[r][c]) {
          hasDifference = true;
          break;
        }
      }
      if (hasDifference) break;
    }
    expect(hasDifference).toBe(true);
  });

  it("LOBSTER_DOWN_BLINK differs from LOBSTER_DOWN_IDLE (eyes closed)", () => {
    let hasDifference = false;
    for (let r = 0; r < LOBSTER_DOWN_IDLE.length; r++) {
      for (let c = 0; c < LOBSTER_DOWN_IDLE[r].length; c++) {
        if (LOBSTER_DOWN_IDLE[r][c] !== LOBSTER_DOWN_BLINK[r][c]) {
          hasDifference = true;
          break;
        }
      }
      if (hasDifference) break;
    }
    expect(hasDifference).toBe(true);
  });
});

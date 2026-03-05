import { describe, it, expect } from "vitest";
import { TILE_SPRITES } from "../sprites/tiles";

describe("Cell-shaded tile sprites", () => {
  it("all tiles are 32x32", () => {
    for (const [name, sprite] of Object.entries(TILE_SPRITES)) {
      expect(sprite.length, `${name} rows`).toBe(32);
      for (const row of sprite) {
        expect(row.length, `${name} cols`).toBe(32);
      }
    }
  });

  it("grass tiles use at most 3 unique non-zero indices", () => {
    for (const key of ["grass_0", "grass_1"]) {
      const indices = new Set(TILE_SPRITES[key].flat().filter(i => i !== 0));
      expect(indices.size, key).toBeLessThanOrEqual(3);
    }
  });

  it("road tiles use at most 2 unique non-zero indices", () => {
    for (const key of ["road_0", "road_1"]) {
      const indices = new Set(TILE_SPRITES[key].flat().filter(i => i !== 0));
      expect(indices.size, key).toBeLessThanOrEqual(2);
    }
  });

  it("water tiles use at most 3 unique non-zero indices", () => {
    for (const key of ["water_0", "water_1"]) {
      const indices = new Set(TILE_SPRITES[key].flat().filter(i => i !== 0));
      expect(indices.size, key).toBeLessThanOrEqual(3);
    }
  });

  it("railroad uses at most 3 unique non-zero indices", () => {
    const indices = new Set(TILE_SPRITES.railroad_0.flat().filter(i => i !== 0));
    expect(indices.size).toBeLessThanOrEqual(3);
  });

  it("tiles follow 2x2 block convention", () => {
    for (const [name, sprite] of Object.entries(TILE_SPRITES)) {
      for (let r = 0; r < 32; r += 2) {
        for (let c = 0; c < 32; c += 2) {
          const val = sprite[r][c];
          expect(sprite[r][c+1], `${name}[${r}][${c+1}]`).toBe(val);
          expect(sprite[r+1][c], `${name}[${r+1}][${c}]`).toBe(val);
          expect(sprite[r+1][c+1], `${name}[${r+1}][${c+1}]`).toBe(val);
        }
      }
    }
  });

  it("road tiles do not contain yellow dashes (index 29)", () => {
    for (const key of ["road_0", "road_1"]) {
      const hasYellow = TILE_SPRITES[key].flat().includes(29);
      expect(hasYellow, `${key} should not have index 29`).toBe(false);
    }
  });
});

/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { writeMeniscusVertices } from "../pixi/liquid";

const COLS = 12;
const ROWS = 8;
const WIDTH = 130;
const HEIGHT = 154;
const BOWL_CENTER_X = 65;

function vertices(
  amp: number,
  swirl: number,
  vortex: number,
): Float32Array {
  const positions = new Float32Array(COLS * ROWS * 2);
  writeMeniscusVertices(
    positions,
    COLS,
    ROWS,
    WIDTH,
    HEIGHT,
    amp,
    swirl,
    vortex,
    BOWL_CENTER_X,
  );
  return positions;
}

describe("writeMeniscusVertices", () => {
  it("keeps lower rows on the grid and bends only the top row", () => {
    const positions = vertices(2, 0, 0);

    for (let row = 1; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const index = (row * COLS + col) * 2;
        expect(positions[index]).toBeCloseTo(
          (col / (COLS - 1)) * WIDTH,
          5,
        );
        expect(positions[index + 1]).toBeCloseTo(
          (row / (ROWS - 1)) * HEIGHT,
          5,
        );
      }
    }

    const bottomLeft = (ROWS - 1) * COLS * 2;
    expect(positions[bottomLeft + 1]).toBeCloseTo(HEIGHT, 5);
    const topYs = Array.from(
      { length: COLS },
      (_, col) => positions[col * 2 + 1],
    );
    const spread = Math.max(...topYs) - Math.min(...topYs);
    expect(spread).toBeGreaterThan(3.5);
    expect(spread).toBeLessThanOrEqual(4);
  });

  it("shifts the top row by at most eight pixels for a full vortex", () => {
    const rest = vertices(2, 0, 0);
    const vortex = vertices(2, 0, 1);
    const shifts = Array.from(
      { length: COLS },
      (_, col) => Math.abs(vortex[col * 2] - rest[col * 2]),
    );

    expect(Math.max(...shifts)).toBeGreaterThan(7.5);
    expect(Math.max(...shifts)).toBeLessThanOrEqual(8);
  });

  it("caps shaken top-row jitter at three pixels", () => {
    const rest = vertices(2, 0, 0);
    const shaken = vertices(2, 0.4, 0);
    const shifts = Array.from(
      { length: COLS },
      (_, col) => Math.abs(shaken[col * 2] - rest[col * 2]),
    );

    expect(Math.max(...shifts)).toBeGreaterThan(0);
    expect(Math.max(...shifts)).toBeLessThanOrEqual(3);
  });
});

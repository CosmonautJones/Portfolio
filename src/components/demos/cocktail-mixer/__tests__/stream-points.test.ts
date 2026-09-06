/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import {
  writeStreamPoints,
  type StreamPointData,
} from "../pixi/stream-points";

const POINT_COUNT = 20;

function blankPoints(): StreamPointData[] {
  return Array.from({ length: POINT_COUNT }, () => ({ x: 0, y: 0 }));
}

describe("writeStreamPoints", () => {
  it("sags both stream midpoints six pixels below their chords", () => {
    const neck = { x: 274, y: 82 };
    const rim = { x: 240, y: 178 };
    const surface = { x: 240, y: 246 };
    const ropes = [
      { points: blankPoints(), start: neck, end: rim },
      { points: blankPoints(), start: rim, end: surface },
    ];

    for (const rope of ropes) {
      writeStreamPoints(rope.points, rope.start, rope.end);
      const midpointIndex = POINT_COUNT / 2;
      const midpointT = midpointIndex / (POINT_COUNT - 1);
      const chordY =
        rope.start.y + (rope.end.y - rope.start.y) * midpointT;

      expect(rope.points[midpointIndex].y - chordY).toBeCloseTo(6, 1);
    }
  });
});

/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import {
  rimCrossingTime,
  streamSag,
  writeSplitStream,
  writeStreamPoints,
  type StreamPointData,
} from "../pixi/stream-points";

const POINT_COUNT = 20;

function blankPoints(): StreamPointData[] {
  return Array.from({ length: POINT_COUNT }, () => ({ x: 0, y: 0 }));
}

describe("writeStreamPoints", () => {
  it("sags the midpoint toward gravity, scaled to stream length", () => {
    const start = { x: 210, y: 90 };
    const end = { x: 160, y: 180 };
    const points = blankPoints();
    const sag = streamSag(start, end);
    writeStreamPoints(points, start, end, sag);

    const midpointIndex = POINT_COUNT / 2;
    const midpointT = midpointIndex / (POINT_COUNT - 1);
    const chordY = start.y + (end.y - start.y) * midpointT;
    expect(sag).toBeGreaterThan(4);
    expect(sag).toBeLessThanOrEqual(18);
    expect(points[midpointIndex].y - chordY).toBeCloseTo(sag, 1);
  });
});

describe("writeSplitStream", () => {
  it("joins air and inner ropes on one neck-to-surface curve", () => {
    const air = blankPoints();
    const inner = blankPoints();
    const neck = { x: 210, y: 88 };
    const surface = { x: 168, y: 196 };
    const rimY = 102;
    const rim = writeSplitStream(air, inner, neck, surface, rimY);

    expect(rim.y).toBeCloseTo(rimY, 1);
    expect(air[0].x).toBeCloseTo(neck.x, 1);
    expect(air[0].y).toBeCloseTo(neck.y, 1);
    expect(inner.at(-1)?.x).toBeCloseTo(surface.x, 1);
    expect(inner.at(-1)?.y).toBeCloseTo(surface.y, 1);
    expect(air.at(-1)?.x).toBeCloseTo(inner[0].x, 1);
    expect(air.at(-1)?.y).toBeCloseTo(inner[0].y, 1);
    expect(rimCrossingTime(neck, surface, streamSag(neck, surface), rimY)).toBeGreaterThan(0);
    expect(rimCrossingTime(neck, surface, streamSag(neck, surface), rimY)).toBeLessThan(1);
  });
});

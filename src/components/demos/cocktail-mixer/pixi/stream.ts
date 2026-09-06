import { MeshRope, Point } from "pixi.js";
import type { PointData, Texture } from "pixi.js";

const POINT_COUNT = 20;
const SAG_Y = 6;

export type PourStream = {
  air: MeshRope;
  inner: MeshRope;
  rebuild: (
    neck: PointData,
    rimY: number,
    surfaceY: number,
    on: number,
  ) => void;
  setColor: (color: string) => void;
};

function makePoints(): Point[] {
  return Array.from({ length: POINT_COUNT }, () => new Point());
}

function writeQuadraticRope(
  points: Point[],
  start: PointData,
  end: PointData,
): void {
  const controlX = (start.x + end.x) / 2;
  const controlY = (start.y + end.y) / 2 + SAG_Y;

  for (let index = 0; index < points.length; index += 1) {
    const t = index / (points.length - 1);
    const inverse = 1 - t;
    points[index].set(
      inverse * inverse * start.x +
        2 * inverse * t * controlX +
        t * t * end.x,
      inverse * inverse * start.y +
        2 * inverse * t * controlY +
        t * t * end.y,
    );
  }
}

export function createPourStream(
  texture: Texture,
  contactX: number,
): PourStream {
  texture.source.resolution = 2;
  const airPoints = makePoints();
  const innerPoints = makePoints();
  const air = new MeshRope({ texture, points: airPoints });
  const inner = new MeshRope({ texture, points: innerPoints });

  air.alpha = 0;
  inner.alpha = 0;

  return {
    air,
    inner,
    rebuild(neck, rimY, surfaceY, on) {
      const alpha = Math.max(0, Math.min(1, on));
      const rim = { x: contactX, y: rimY };
      const surface = { x: contactX, y: Math.max(rimY, surfaceY) };

      writeQuadraticRope(airPoints, neck, rim);
      writeQuadraticRope(innerPoints, rim, surface);
      air.alpha = alpha;
      inner.alpha = alpha;
    },
    setColor(color) {
      air.tint = color;
      inner.tint = color;
    },
  };
}

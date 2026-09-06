import { MeshRope, Point } from "pixi.js";
import type { PointData, Texture } from "pixi.js";
import { writeStreamPoints } from "./stream-points";

const POINT_COUNT = 20;

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

export function createPourStream(
  texture: Texture,
  contactX: number,
): PourStream {
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

      writeStreamPoints(airPoints, neck, rim);
      writeStreamPoints(innerPoints, rim, surface);
      air.alpha = alpha;
      inner.alpha = alpha;
    },
    setColor(color) {
      air.tint = color;
      inner.tint = color;
    },
  };
}

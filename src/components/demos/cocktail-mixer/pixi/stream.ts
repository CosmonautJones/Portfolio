import { MeshRope, Point } from "pixi.js";
import type { PointData, Texture } from "pixi.js";
import { writeSplitStream } from "./stream-points";

const POINT_COUNT = 20;

export type PourStream = {
  air: MeshRope;
  inner: MeshRope;
  rebuild: (
    neck: PointData,
    rimY: number,
    surfaceY: number,
    contactX: number,
    on: number,
  ) => void;
  setColor: (color: string) => void;
};

function makePoints(): Point[] {
  return Array.from({ length: POINT_COUNT }, () => new Point());
}

export function createPourStream(texture: Texture): PourStream {
  const airPoints = makePoints();
  const innerPoints = makePoints();
  const air = new MeshRope({ texture, points: airPoints });
  const inner = new MeshRope({ texture, points: innerPoints });

  air.alpha = 0;
  inner.alpha = 0;
  air.visible = false;
  inner.visible = false;

  return {
    air,
    inner,
    rebuild(neck, rimY, surfaceY, contactX, on) {
      const alpha = Math.max(0, Math.min(1, on));
      const visible = alpha > 0.02;
      air.visible = visible;
      inner.visible = visible;
      air.alpha = alpha;
      inner.alpha = alpha;
      if (!visible) return;

      const surface = {
        x: contactX,
        y: Math.max(rimY + 1, surfaceY),
      };
      writeSplitStream(airPoints, innerPoints, neck, surface, rimY);
    },
    setColor(color) {
      air.tint = color;
      inner.tint = color;
    },
  };
}

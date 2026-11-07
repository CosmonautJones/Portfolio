import { MeshRope, Point } from "pixi.js";
import type { PointData, Texture } from "pixi.js";
import {
  collapseStreamPoints,
  wobbleStreamPoints,
  writeSplitStream,
} from "./stream-points";

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
    timeSec?: number,
  ) => void;
  setColor: (color: string) => void;
};

function makePoints(): Point[] {
  return Array.from({ length: POINT_COUNT }, () => new Point());
}

export function createPourStream(texture: Texture): PourStream {
  const airPoints = makePoints();
  const innerPoints = makePoints();
  const air = new MeshRope({ texture, points: airPoints, textureScale: 0 });
  const inner = new MeshRope({ texture, points: innerPoints, textureScale: 0 });

  air.alpha = 0;
  inner.alpha = 0;
  air.visible = false;
  inner.visible = false;

  return {
    air,
    inner,
    rebuild(neck, rimY, surfaceY, contactX, on, timeSec = 0) {
      const alpha = Math.max(0, Math.min(1, on));
      const visible = alpha > 0.02;
      air.visible = visible;
      inner.visible = visible;
      air.alpha = alpha;
      inner.alpha = alpha;
      if (!visible) {
        // Coincident points make RopeGeometry thickness 0 — no leftover ribbon.
        collapseStreamPoints(airPoints, neck);
        collapseStreamPoints(innerPoints, neck);
        return;
      }

      const surface = {
        x: contactX,
        y: Math.max(rimY + 1, surfaceY),
      };
      writeSplitStream(airPoints, innerPoints, neck, surface, rimY);
      wobbleStreamPoints(airPoints, timeSec, alpha);
      wobbleStreamPoints(innerPoints, timeSec, alpha);
    },
    setColor(color) {
      air.tint = color;
      inner.tint = color;
    },
  };
}

import type { Application } from "pixi.js";
import { STAGE } from "../glass-bounds";

export async function createMixerApp(
  PIXI: typeof import("pixi.js"),
): Promise<Application> {
  const app = new PIXI.Application();
  await app.init({
    width: STAGE.width,
    height: STAGE.height,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
  });
  return app;
}

export function destroyMixerApp(app: Application): void {
  app.destroy(
    { removeView: true },
    { children: true, texture: false, textureSource: false },
  );
}

// src/lib/game/scene/camera-projection.ts
import type { Camera, WorldPosition } from "../types";

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Orthographic top-down projection (the 2D / WebGL view). */
export function projectTopDown(world: WorldPosition, camera: Camera): ScreenPoint {
  return { x: world.x, y: world.y - camera.y };
}

/**
 * Isometric projection (the 3D / Three view). Shared, deterministic math so the
 * isometric camera is defined in ONE place. Tuned so forward world movement
 * (increasing y, toward the top of the play area after camera subtraction) moves
 * the point up the screen, with a fixed diamond ratio.
 */
const ISO_TILT = 0.5; // vertical compression of the iso diamond

export function projectIsometric(world: WorldPosition, camera: Camera): ScreenPoint {
  const relY = world.y - camera.y; // camera-relative forward axis
  const cx = camera.viewportWidth / 2;
  // X stays centered around the viewport; Y is compressed for the iso look and
  // negated so increasing world-forward moves the point UP the screen.
  return {
    x: cx + (world.x - cx),
    y: -relY * ISO_TILT,
  };
}

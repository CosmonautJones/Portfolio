// ---------------------------------------------------------------------------
// Camera tracking
// ---------------------------------------------------------------------------

import type { GameState, GameConfig } from "./types";
import { CAMERA_DEAD_ZONE } from "./constants";

export function updateCamera(state: GameState, config: GameConfig): void {
  const { camera, player } = state;
  // Snapshot the pre-step y so the renderer can interpolate between the
  // previous and current fixed-step camera positions (smooth motion >60Hz).
  camera.prevY = camera.y;
  camera.targetY = player.worldPos.y - camera.viewportHeight * CAMERA_DEAD_ZONE;
  camera.y += (camera.targetY - camera.y) * config.cameraSmoothing;
}

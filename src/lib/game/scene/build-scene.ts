// src/lib/game/scene/build-scene.ts
import type { GameState } from "../types";
import type { RenderScene } from "./types";

export interface BuildSceneOptions {
  /** Screen-space camera shake offset, in CSS pixels. Defaults to {x:0,y:0}. */
  shake?: { x: number; y: number };
  /**
   * Sub-frame interpolation fraction (0..1) between the previous and current
   * fixed-step camera position. 0 = previous step is fully snapped to the
   * current step's y (default, back-compat); higher values lerp toward the
   * current step's y. Clamped to [0, 1].
   */
  alpha?: number;
}

/** Linear interpolation between a and b by t. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Pure conversion of GameState → RenderScene. No canvas / GL / Three access.
 * This is the single source of presentation data for both renderers.
 */
export function buildScene(
  state: GameState,
  opts: BuildSceneOptions = {},
): RenderScene {
  let deathProgress = 0;
  let deathPosition: { x: number; y: number } | null = null;
  if (state.phase === "game_over" && state.deathCause !== null) {
    deathProgress = state.dyingDuration > 0
      ? Math.min(1, state.dyingTimer / state.dyingDuration)
      : 1;
    deathPosition = { x: state.player.worldPos.x, y: state.player.worldPos.y };
  }

  // Render-only camera interpolation: lerp y between the previous fixed-step
  // position and the current one. Never written back into state.camera.
  const a = Math.min(1, Math.max(0, opts.alpha ?? 0));
  const interpolatedCamera = {
    ...state.camera,
    y: lerp(state.camera.prevY, state.camera.y, a),
  };

  return {
    phase: state.phase,
    player: state.player,
    lanes: state.lanes,
    camera: interpolatedCamera,
    particles: state.particles,
    coins: state.coins,
    powerUps: state.powerUps,
    weather: state.weather,
    animationTime: state.animationTime,
    score: state.score,
    level: state.level,
    deathCause: state.deathCause,
    deathProgress,
    deathPosition,
    shake: opts.shake ?? { x: 0, y: 0 },
  };
}

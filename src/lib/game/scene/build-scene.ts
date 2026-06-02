// src/lib/game/scene/build-scene.ts
import type { GameState } from "../types";
import type { RenderScene } from "./types";

export interface BuildSceneOptions {
  /** Screen-space camera shake offset, in CSS pixels. Defaults to {x:0,y:0}. */
  shake?: { x: number; y: number };
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
    deathProgress = Math.min(1, state.dyingTimer / state.dyingDuration);
    deathPosition = { x: state.player.worldPos.x, y: state.player.worldPos.y };
  }

  return {
    phase: state.phase,
    player: state.player,
    lanes: state.lanes,
    camera: state.camera,
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

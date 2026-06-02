// src/lib/game/scene/types.ts
import type { GameState, Particle } from "../types";

/**
 * Render-agnostic scene description. The single contract both renderers
 * (WebGL2 + Three.js) consume. Pure data — no GL, no canvas, no Three.
 * Supersedes the legacy `RenderState` in renderer/render-pass.ts.
 */
export interface RenderScene {
  phase: GameState["phase"];
  player: GameState["player"];
  lanes: GameState["lanes"];
  camera: GameState["camera"];
  particles: readonly Particle[];
  coins: GameState["coins"];
  powerUps: GameState["powerUps"];
  weather: GameState["weather"];
  animationTime: number;
  score: number;
  level: number;
  deathCause: GameState["deathCause"];
  /** 0→1 progress through death animation (0 = alive, >0 = dying) */
  deathProgress: number;
  /** World position where death occurred */
  deathPosition: { x: number; y: number } | null;
  /** Screen-space camera shake offset, in CSS pixels */
  shake: { x: number; y: number };
}

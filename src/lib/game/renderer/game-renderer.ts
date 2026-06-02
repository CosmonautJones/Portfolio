// src/lib/game/renderer/game-renderer.ts
import type { RenderScene } from "../scene/types";
import type { SpriteStyle } from "../sprites/sprite-style";

/**
 * The single render contract. Both WebGLRenderer and ThreeRenderer implement it.
 * Implementations consume RenderScene only — never raw GameState.
 */
export interface GameRenderer {
  resize(width: number, height: number): void;
  render(scene: RenderScene, alpha: number): void;
  setStyle(style: SpriteStyle): void;
  /** Reset per-run renderer state (called on new game). */
  resetState(): void;
  destroy(): void;
}

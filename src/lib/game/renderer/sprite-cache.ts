// ============================================================================
// SpriteCache — legacy wrapper that builds a SpriteAtlas under the hood
// ============================================================================

import { SpriteAtlas } from "./webgl/sprite-atlas";
import type { SpritePixels } from "../types";

export class SpriteCache {
  private atlas: SpriteAtlas;
  private built = false;

  constructor() {
    this.atlas = new SpriteAtlas();
  }

  prerender(key: string, pixels: SpritePixels, flipH = false): void {
    this.atlas.addSprite(key, pixels, flipH);
  }

  prerenderShadow(key: string, pixels: SpritePixels, flipH = false): void {
    this.atlas.addShadow(key, pixels, flipH);
  }

  prerenderDark(key: string, pixels: SpritePixels, flipH = false): void {
    this.atlas.addDarkSprite(key, pixels, flipH);
  }

  prerenderGlow(key: string, color: string, size: number): void {
    this.atlas.addGlow(key, color, size);
  }

  prerenderRaw(key: string, width: number, height: number, rgba: Uint8Array): void {
    this.atlas.addRawSprite(key, width, height, rgba);
  }

  prerenderRawDark(key: string, width: number, height: number, rgba: Uint8Array): void {
    this.atlas.addRawDarkSprite(key, width, height, rgba);
  }

  prerenderRawShadow(key: string, width: number, height: number, rgba: Uint8Array): void {
    this.atlas.addRawShadow(key, width, height, rgba);
  }

  prerenderAmbientGlow(
    ..._args: [key: string, color: string, width: number, height: number]
  ): void {
    // Ambient glows are now handled by the post-processing pipeline
  }

  has(key: string): boolean {
    return this.atlas.has(key);
  }

  buildAtlas(gl: WebGL2RenderingContext): void {
    if (this.built) return;
    this.atlas.build(gl);
    this.built = true;
  }

  getAtlas(): SpriteAtlas {
    return this.atlas;
  }

  destroy(gl: WebGL2RenderingContext): void {
    this.atlas.destroy(gl);
  }

  // Legacy draw method — not used in WebGL2 path but kept for interface compat
  draw(
    ..._args: [ctx: CanvasRenderingContext2D, key: string, x: number, y: number]
  ): void {
    // No-op in WebGL2 mode
  }
}

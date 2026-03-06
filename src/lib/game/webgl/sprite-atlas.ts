// ============================================================================
// Sprite Atlas Builder — packs palette-indexed sprites into a GPU texture atlas
// ============================================================================

import { PALETTE } from "../sprites/palette";
import type { SpritePixels } from "../types";
import { createTexture } from "./gl-utils";

/** UV region within the atlas for a single sprite */
export interface AtlasRegion {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  width: number;
  height: number;
}

/** A 1x1 white pixel region used for solid color quads */
export const WHITE_REGION_KEY = "__white__";

// Pre-parse palette to RGBA bytes for fast lookup
const PALETTE_RGBA: Array<[number, number, number, number] | null> =
  PALETTE.map((c) => {
    if (c === "transparent") return null;
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  });

// Darkened palette (0.7x brightness) for side faces
const PALETTE_DARK_RGBA: Array<[number, number, number, number] | null> =
  PALETTE.map((c) => {
    if (c === "transparent") return null;
    const n = parseInt(c.slice(1), 16);
    return [
      Math.round(((n >> 16) & 255) * 0.7),
      Math.round(((n >> 8) & 255) * 0.7),
      Math.round((n & 255) * 0.7),
      255,
    ];
  });

// Shadow color (solid dark for silhouettes)
const SHADOW_RGBA: [number, number, number, number] = [26, 28, 44, 255];

interface SpriteEntry {
  key: string;
  width: number;
  height: number;
  rgba: Uint8Array;
}

/** Render palette-indexed pixels to RGBA bytes */
function renderPixelsToRGBA(
  pixels: SpritePixels,
  flipH: boolean,
  palette: Array<[number, number, number, number] | null>,
): Uint8Array {
  const rows = pixels.length;
  const cols = pixels[0].length;
  const data = new Uint8Array(cols * rows * 4);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const srcC = flipH ? cols - 1 - c : c;
      const idx = pixels[r][srcC];
      if (idx === 0) continue;
      const rgba = palette[idx];
      if (!rgba) continue;
      const offset = (r * cols + c) * 4;
      data[offset] = rgba[0];
      data[offset + 1] = rgba[1];
      data[offset + 2] = rgba[2];
      data[offset + 3] = rgba[3];
    }
  }
  return data;
}

/** Render shadow silhouette (all non-transparent pixels as solid dark) */
function renderShadowToRGBA(
  pixels: SpritePixels,
  flipH: boolean,
): Uint8Array {
  const rows = pixels.length;
  const cols = pixels[0].length;
  const data = new Uint8Array(cols * rows * 4);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const srcC = flipH ? cols - 1 - c : c;
      if (pixels[r][srcC] === 0) continue;
      const offset = (r * cols + c) * 4;
      data[offset] = SHADOW_RGBA[0];
      data[offset + 1] = SHADOW_RGBA[1];
      data[offset + 2] = SHADOW_RGBA[2];
      data[offset + 3] = SHADOW_RGBA[3];
    }
  }
  return data;
}

/** Render glow circle as RGBA */
function renderGlowToRGBA(
  color: string,
  size: number,
): Uint8Array {
  const n = parseInt(color.slice(1), 16);
  const cr = (n >> 16) & 255;
  const cg = (n >> 8) & 255;
  const cb = n & 255;
  const data = new Uint8Array(size * size * 4);
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - half + 0.5;
      const dy = y - half + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy) / half;
      if (dist > 1) continue;
      const alpha = Math.max(0, 1 - dist);
      const offset = (y * size + x) * 4;
      data[offset] = cr;
      data[offset + 1] = cg;
      data[offset + 2] = cb;
      data[offset + 3] = Math.round(alpha * 255);
    }
  }
  return data;
}

/** Packs sprites into a power-of-two atlas using a simple shelf packer */
export class SpriteAtlas {
  private entries: SpriteEntry[] = [];
  private regions = new Map<string, AtlasRegion>();
  private atlasWidth = 0;
  private atlasHeight = 0;
  private texture: WebGLTexture | null = null;

  /** Register a normal sprite */
  addSprite(key: string, pixels: SpritePixels, flipH = false): void {
    const rows = pixels.length;
    const cols = pixels[0].length;
    this.entries.push({
      key,
      width: cols,
      height: rows,
      rgba: renderPixelsToRGBA(pixels, flipH, PALETTE_RGBA),
    });
  }

  /** Register a darkened (side face) sprite */
  addDarkSprite(key: string, pixels: SpritePixels, flipH = false): void {
    const rows = pixels.length;
    const cols = pixels[0].length;
    this.entries.push({
      key,
      width: cols,
      height: rows,
      rgba: renderPixelsToRGBA(pixels, flipH, PALETTE_DARK_RGBA),
    });
  }

  /** Register a shadow silhouette */
  addShadow(key: string, pixels: SpritePixels, flipH = false): void {
    const rows = pixels.length;
    const cols = pixels[0].length;
    this.entries.push({
      key,
      width: cols,
      height: rows,
      rgba: renderShadowToRGBA(pixels, flipH),
    });
  }

  /** Register a glow circle */
  addGlow(key: string, color: string, size: number): void {
    this.entries.push({
      key,
      width: size,
      height: size,
      rgba: renderGlowToRGBA(color, size),
    });
  }

  /** Look up a region by key */
  getRegion(key: string): AtlasRegion | undefined {
    return this.regions.get(key);
  }

  /** Check if a region exists */
  has(key: string): boolean {
    return this.regions.has(key);
  }

  /** Get the underlying WebGL texture */
  getTexture(): WebGLTexture | null {
    return this.texture;
  }

  /**
   * Build the atlas texture. Call after all sprites are registered.
   * Uses a simple shelf-based packing algorithm.
   */
  build(gl: WebGL2RenderingContext): void {
    // Add a 1x1 white pixel for solid color quads
    this.entries.push({
      key: WHITE_REGION_KEY,
      width: 1,
      height: 1,
      rgba: new Uint8Array([255, 255, 255, 255]),
    });

    // Sort by height descending for better shelf packing
    this.entries.sort((a, b) => b.height - a.height);

    // Calculate atlas size — try to fit in a square, power of two
    // Use 2x safety margin for shelf packing inefficiency
    const totalPixels = this.entries.reduce(
      (sum, e) => sum + (e.width + 1) * (e.height + 1),
      0,
    );
    let size = 256;
    while (size * size < totalPixels * 2) {
      size *= 2;
    }
    // Cap at max texture size
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    size = Math.min(size, maxSize);

    this.atlasWidth = size;
    this.atlasHeight = size;

    // Shelf-pack
    const atlasData = new Uint8Array(size * size * 4);
    let shelfX = 0;
    let shelfY = 0;
    let shelfHeight = 0;

    for (const entry of this.entries) {
      // Check if entry fits on current shelf
      if (shelfX + entry.width > size) {
        // Move to next shelf
        shelfY += shelfHeight + 1; // 1px padding
        shelfX = 0;
        shelfHeight = 0;
      }

      if (shelfY + entry.height > size) {
        throw new Error(
          `Sprite atlas overflow: "${entry.key}" (${entry.width}x${entry.height}) ` +
          `doesn't fit in ${size}x${size} atlas. Total sprites: ${this.entries.length}`,
        );
      }

      // Copy sprite data into atlas
      for (let row = 0; row < entry.height; row++) {
        const srcOffset = row * entry.width * 4;
        const dstOffset = ((shelfY + row) * size + shelfX) * 4;
        atlasData.set(
          entry.rgba.subarray(srcOffset, srcOffset + entry.width * 4),
          dstOffset,
        );
      }

      // Record UV region (normalized 0..1)
      this.regions.set(entry.key, {
        u0: shelfX / size,
        v0: shelfY / size,
        u1: (shelfX + entry.width) / size,
        v1: (shelfY + entry.height) / size,
        width: entry.width,
        height: entry.height,
      });

      shelfX += entry.width + 1; // 1px padding
      shelfHeight = Math.max(shelfHeight, entry.height);
    }

    // Upload to GPU
    this.texture = createTexture(gl, size, size, atlasData, {
      filter: gl.NEAREST, // Pixel art needs nearest-neighbor filtering
    });

    // Free CPU-side data
    this.entries = [];
  }

  destroy(gl: WebGL2RenderingContext): void {
    if (this.texture) {
      gl.deleteTexture(this.texture);
      this.texture = null;
    }
  }
}

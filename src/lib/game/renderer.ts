import { PALETTE } from "./sprites/palette";
import type { SpritePixels, Lane, GameState } from "./types";
import { DEFAULT_CONFIG } from "./constants";

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Pre-parse palette to RGB for performance
const PALETTE_RGB = PALETTE.map((c) =>
  c === "transparent" ? null : hexToRgb(c),
);

export class SpriteCache {
  private cache = new Map<string, OffscreenCanvas>();

  prerender(key: string, pixels: SpritePixels, flipH = false): void {
    const rows = pixels.length;
    const cols = pixels[0].length;
    const canvas = new OffscreenCanvas(cols, rows);
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(cols, rows);
    const data = imageData.data;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const srcC = flipH ? cols - 1 - c : c;
        const idx = pixels[r][srcC];
        if (idx === 0) continue;
        const rgb = PALETTE_RGB[idx];
        if (!rgb) continue;
        const offset = (r * cols + c) * 4;
        data[offset] = rgb[0];
        data[offset + 1] = rgb[1];
        data[offset + 2] = rgb[2];
        data[offset + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.cache.set(key, canvas);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    key: string,
    x: number,
    y: number,
  ): void {
    const canvas = this.cache.get(key);
    if (canvas) ctx.drawImage(canvas, Math.round(x), Math.round(y));
  }
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteCache;

  constructor(canvas: HTMLCanvasElement, sprites: SpriteCache) {
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    this.sprites = sprites;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  renderLanes(state: GameState): void {
    const { camera, lanes } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;

    for (const lane of lanes) {
      const screenY = lane.y * cellSize - camera.y;
      if (screenY < -cellSize * 2 || screenY > camera.viewportHeight + cellSize)
        continue;

      this.renderLaneBackground(lane, screenY);

      for (const obs of lane.obstacles) {
        const spriteKey = obs.speed < 0 ? `${obs.type}_flip` : obs.type;
        this.sprites.draw(this.ctx, spriteKey, obs.worldX, screenY);
      }
    }
  }

  private renderLaneBackground(lane: Lane, screenY: number): void {
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    for (let x = 0; x < cols; x++) {
      const key = `${lane.type}_${lane.variant}`;
      this.sprites.draw(this.ctx, key, x * cellSize, screenY);
    }
  }

  renderPlayer(state: GameState): void {
    const { player, camera } = state;
    const screenX = player.worldPos.x;
    const screenY = player.worldPos.y - camera.y;
    const spriteKey = `lobster_${player.facing}_${player.animation}`;
    this.sprites.draw(this.ctx, spriteKey, screenX, screenY);
  }

  renderParticles(
    particles: readonly {
      x: number;
      y: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }[],
  ): void {
    for (const p of particles) {
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    this.ctx.globalAlpha = 1;
  }
}

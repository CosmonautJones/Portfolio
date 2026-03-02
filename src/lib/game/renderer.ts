import { PALETTE } from "./sprites/palette";
import type { SpritePixels, Lane, GameState, Particle } from "./types";
import { DEFAULT_CONFIG, WATER_FLOW_SPEED, GRASS_SHIMMER_SPEED } from "./constants";

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

// Star field for background atmosphere
interface Star {
  x: number;
  y: number;
  speed: number;
  opacity: number;
}

function createStarField(count: number, width: number, height: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.3, // top 30% only
      speed: 0.1 + Math.random() * 0.3,
      opacity: 0.15 + Math.random() * 0.25,
    });
  }
  return stars;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteCache;
  private stars: Star[];
  private laneFirstVisible = new Map<number, number>();

  constructor(canvas: HTMLCanvasElement, sprites: SpriteCache) {
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    this.sprites = sprites;
    this.stars = createStarField(5, canvas.width, canvas.height);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  renderBackground(): void {
    const { width, height } = this.ctx.canvas;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0e071b");
    gradient.addColorStop(0.4, "#1a1c2c");
    gradient.addColorStop(1, "#1a1c2c");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  renderStarField(animationTime: number): void {
    for (const star of this.stars) {
      const drift = (animationTime * star.speed) % this.ctx.canvas.width;
      const x = (star.x + drift) % this.ctx.canvas.width;
      this.ctx.globalAlpha = star.opacity;
      this.ctx.fillStyle = "#f4f4f4";
      this.ctx.fillRect(Math.round(x), Math.round(star.y), 1, 1);
    }
    this.ctx.globalAlpha = 1;
  }

  renderLanes(state: GameState): void {
    const { camera, lanes } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    for (const lane of lanes) {
      const screenY = lane.y * cellSize - camera.y;
      if (screenY < -cellSize * 2 || screenY > camera.viewportHeight + cellSize)
        continue;

      // Lane fade-in tracking
      if (!this.laneFirstVisible.has(lane.y)) {
        this.laneFirstVisible.set(lane.y, state.animationTime);
      }
      const firstSeen = this.laneFirstVisible.get(lane.y)!;
      const fadeAge = state.animationTime - firstSeen;
      const laneAlpha = Math.min(1, fadeAge / 0.3);
      if (laneAlpha < 1) {
        this.ctx.globalAlpha = laneAlpha;
      }

      this.renderLaneBackground(lane, screenY, state);

      // Lane transitions
      const nextLane = lanes.find(l => l.y === lane.y - 1);
      if (nextLane && nextLane.type !== lane.type) {
        const transitionColors: Record<string, string> = {
          'grass_road': '#265c42',
          'road_water': '#94b0c2',
          'water_grass': '#c4a35a',
        };
        const key = `${lane.type}_${nextLane.type}`;
        const color = nextLane.type === 'railroad' ? '#ffff00' : transitionColors[key];
        if (color) {
          this.ctx.fillStyle = color;
          this.ctx.fillRect(0, screenY, cols * cellSize, 2);
        }
      }

      for (const obs of lane.obstacles) {
        let spriteKey = obs.speed < 0 ? `${obs.type}_flip` : obs.type;
        // Car color variety — every 3rd car is blue
        if (obs.type === "car" && obs.id % 3 === 0) {
          spriteKey = obs.speed < 0 ? "car_blue_flip" : "car_blue";
        }
        this.sprites.draw(this.ctx, spriteKey, obs.worldX, screenY);
      }

      // Restore alpha after lane fade-in
      if (laneAlpha < 1) {
        this.ctx.globalAlpha = 1;
      }
    }
  }

  private renderLaneBackground(lane: Lane, screenY: number, state: GameState): void {
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    if (lane.type === "water") {
      const offset = Math.floor(state.animationTime * WATER_FLOW_SPEED) % cellSize;
      const flowOffset = offset * lane.flowDirection;
      for (let x = -1; x <= cols; x++) {
        const key = `${lane.type}_${lane.variant}`;
        this.sprites.draw(this.ctx, key, x * cellSize + flowOffset, screenY);
      }
      return;
    }

    if (lane.type === "grass") {
      const shimmerVariant = (lane.variant + Math.floor(state.animationTime * GRASS_SHIMMER_SPEED)) % 2;
      for (let x = 0; x < cols; x++) {
        const key = `grass_${shimmerVariant}`;
        this.sprites.draw(this.ctx, key, x * cellSize, screenY);
      }
      return;
    }

    for (let x = 0; x < cols; x++) {
      const key = `${lane.type}_${lane.variant}`;
      this.sprites.draw(this.ctx, key, x * cellSize, screenY);
    }
  }

  renderPlayer(state: GameState): void {
    const { player, camera } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const screenX = player.worldPos.x;
    let screenY = player.worldPos.y - camera.y;

    // Hop arc — bob upward during hop for bouncy feel
    let arcOffset = 0;
    if (player.animation === "hop" && player.hopTarget !== null) {
      arcOffset = Math.sin(player.hopProgress * Math.PI) * 4;
    }

    // Shadow — dark ellipse at feet, stays grounded even during hop arc
    const shadowY = player.worldPos.y - camera.y + cellSize - 3;
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = "#1a1c2c";
    this.ctx.beginPath();
    this.ctx.ellipse(
      Math.round(screenX + cellSize / 2),
      Math.round(shadowY + 1),
      5, 2, 0, 0, Math.PI * 2,
    );
    this.ctx.fill();
    this.ctx.globalAlpha = 1;

    // Apply hop arc to sprite position
    screenY -= arcOffset;

    const spriteKey = `lobster_${player.facing}_${player.animation}`;
    this.sprites.draw(this.ctx, spriteKey, screenX, screenY);
  }

  renderParticles(particles: readonly Particle[], cameraY: number): void {
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      const px = Math.round(p.x);
      const py = Math.round(p.y - cameraY);

      // Trail rendering — faded duplicate at previous position
      if (p.trail && p.prevX !== undefined && p.prevY !== undefined) {
        this.ctx.globalAlpha = alpha * 0.3;
        this.ctx.fillRect(Math.round(p.prevX), Math.round(p.prevY - cameraY), p.size, p.size);
        this.ctx.globalAlpha = alpha;
      }

      const shape = p.shape ?? "square";
      if (shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(px + p.size / 2, py + p.size / 2, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (shape === "line" && p.rotation !== undefined) {
        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size / 2, -0.5, p.size, 1);
        this.ctx.restore();
      } else {
        this.ctx.fillRect(px, py, p.size, p.size);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  renderVignette(): void {
    const { width, height } = this.ctx.canvas;
    const gradient = this.ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.35,
      width / 2, height / 2, Math.min(width, height) * 0.75,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.25)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }
}

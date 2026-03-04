import { PALETTE } from "./sprites/palette";
import type { SpritePixels, Lane, GameState, Particle } from "./types";
import {
  DEFAULT_CONFIG,
  WATER_FLOW_SPEED,
  GRASS_SHIMMER_SPEED,
  OBJECT_HEIGHT,
  OBJECT_TOP_FACE,
  TILE_DEPTH,
  GROUND_COLORS,
  TOP_FACE_COLORS,
  SHADOW_OFFSET,
  SHADOW_ALPHA,
} from "./constants";
import { DECORATION_HEIGHTS } from "./sprites/decorations";

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Pre-parse palette to RGB for performance
const PALETTE_RGB = PALETTE.map((c) =>
  c === "transparent" ? null : hexToRgb(c),
);

// Darkened palette for side faces (multiply by 0.7)
const PALETTE_DARK = PALETTE.map((c) => {
  if (c === "transparent") return null;
  const rgb = hexToRgb(c);
  return [Math.round(rgb[0] * 0.7), Math.round(rgb[1] * 0.7), Math.round(rgb[2] * 0.7)] as [number, number, number];
});

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

  /** Pre-render a shadow silhouette — all non-transparent pixels as solid dark */
  prerenderShadow(key: string, pixels: SpritePixels, flipH = false): void {
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
        const offset = (r * cols + c) * 4;
        data[offset] = 26;   // #1a
        data[offset + 1] = 28; // #1c
        data[offset + 2] = 44; // #2c
        data[offset + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.cache.set(key, canvas);
  }

  /** Pre-render a darkened version for side faces */
  prerenderDark(key: string, pixels: SpritePixels, flipH = false): void {
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
        const rgb = PALETTE_DARK[idx];
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

  /** Pre-render a glow circle for coins */
  prerenderGlow(key: string, color: string, size: number): void {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2,
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    this.cache.set(key, canvas);
  }

  /** Pre-render a soft radial ambient glow (used for lane overlays) */
  prerenderAmbientGlow(key: string, color: string, width: number, height: number): void {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
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

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// Star field for background atmosphere
interface Star {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  size: number;
}

function createStarField(count: number, width: number, height: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.35, // top 35% only
      speed: 0.05 + Math.random() * 0.2,
      opacity: 0.12 + Math.random() * 0.3,
      size: Math.random() < 0.15 ? 4 : 2, // occasional 4x4 star
    });
  }
  return stars;
}

// Ambient dust mote for grass lanes
interface DustMote {
  x: number;  // 0-1 normalized lane x
  y: number;  // 0-1 normalized lane y
  speed: number;
  phase: number;
}

function createDustMotes(count: number): DustMote[] {
  const motes: DustMote[] = [];
  for (let i = 0; i < count; i++) {
    motes.push({
      x: Math.random(),
      y: Math.random(),
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return motes;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteCache;
  private stars: Star[];
  private dustMotes: DustMote[];
  private laneFirstVisible = new Map<number, number>();

  constructor(canvas: HTMLCanvasElement, sprites: SpriteCache) {
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    this.sprites = sprites;
    this.stars = createStarField(8, canvas.width, canvas.height);
    this.dustMotes = createDustMotes(6);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  /** Enhanced background with dynamic sky gradient and subtle aurora shimmer */
  renderBackground(animationTime: number = 0): void {
    const { width, height } = this.ctx.canvas;

    // Deep sky gradient — shifts slightly over time for aurora feel
    const pulse = Math.sin(animationTime * 0.15) * 0.03;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height * 0.45);
    gradient.addColorStop(0, `rgba(8, 5, 22, 1)`);          // near-black purple
    gradient.addColorStop(0.3 + pulse, `rgba(15, 12, 38, 1)`); // dark navy
    gradient.addColorStop(1, "#1a1c2c");                       // base navy
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height * 0.45);

    // Lower half — solid dark to avoid gradient over gameplay area
    this.ctx.fillStyle = "#1a1c2c";
    this.ctx.fillRect(0, height * 0.45, width, height * 0.55);

    // Subtle aurora band — horizontal shimmer near top
    const auroraY = height * 0.08;
    const auroraH = height * 0.06;
    const auroraPhase = animationTime * 0.08;
    this.ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(auroraPhase + i * 1.2) * width * 0.15;
      const cx = width * (0.3 + i * 0.2) + offset;
      const aGrad = this.ctx.createRadialGradient(cx, auroraY, 0, cx, auroraY, width * 0.25);
      const alpha = (0.015 + 0.01 * Math.sin(auroraPhase * 1.3 + i)) * 255;
      const a = Math.round(alpha).toString(16).padStart(2, "0");
      aGrad.addColorStop(0, `#73eff7${a}`);
      aGrad.addColorStop(0.5, `#3b5dc9${a}`);
      aGrad.addColorStop(1, "transparent");
      this.ctx.fillStyle = aGrad;
      this.ctx.fillRect(0, auroraY - auroraH, width, auroraH * 3);
    }
    this.ctx.globalCompositeOperation = "source-over";
  }

  renderStarField(animationTime: number): void {
    for (const star of this.stars) {
      const drift = (animationTime * star.speed) % this.ctx.canvas.width;
      const x = (star.x + drift) % this.ctx.canvas.width;
      // Twinkle
      const twinkle = star.opacity * (0.8 + 0.2 * Math.sin(animationTime * 2.5 + star.x));
      this.ctx.globalAlpha = twinkle;
      this.ctx.fillStyle = "#f4f4f4";
      this.ctx.fillRect(Math.round(x), Math.round(star.y), star.size, star.size);
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
      this.renderAmbientParticles(lane, screenY, state);

      // Ground depth strip (Crossy Road style) — thick colored ground layers
      const depth = TILE_DEPTH[lane.type];
      if (depth > 0) {
        const gc = GROUND_COLORS[lane.type];

        // 2px bright top edge highlight
        this.ctx.fillStyle = gc.top;
        this.ctx.fillRect(0, screenY + cellSize, cols * cellSize, 2);

        // Front face gradient (depth - 2)px
        if (depth > 2) {
          const depthGrad = this.ctx.createLinearGradient(
            0, screenY + cellSize + 2,
            0, screenY + cellSize + depth,
          );
          depthGrad.addColorStop(0, gc.front);
          depthGrad.addColorStop(1, gc.frontDark);
          this.ctx.fillStyle = depthGrad;
          this.ctx.fillRect(0, screenY + cellSize + 2, cols * cellSize, depth - 2);
        }
      }

      // Lane transitions — wider and softened
      const nextLane = lanes.find(l => l.y === lane.y - 1);
      if (nextLane && nextLane.type !== lane.type) {
        const transitionColors: Record<string, string> = {
          grass_road: "#2d6e42",
          road_grass: "#2d6e42",
          grass_water: "#c4a35a",
          water_grass: "#c4a35a",
          road_water: "#6080a0",
          water_road: "#6080a0",
          grass_railroad: "#ffff00",
          railroad_grass: "#ffff00",
          road_railroad: "#ffff00",
          railroad_road: "#ffff00",
        };
        const key = `${lane.type}_${nextLane.type}`;
        const color = transitionColors[key];
        if (color) {
          // 6-pixel gradient transition strip
          const tGrad = this.ctx.createLinearGradient(0, screenY, 0, screenY + 6);
          tGrad.addColorStop(0, color + "00");
          tGrad.addColorStop(0.5, color + "80");
          tGrad.addColorStop(1, color + "00");
          this.ctx.fillStyle = tGrad;
          this.ctx.fillRect(0, screenY, cols * cellSize, 6);
        }
      }

      // Render decorations (behind obstacles)
      this.renderDecorations(lane, screenY, laneAlpha);

      // Render obstacles with 2.5D depth
      for (const obs of lane.obstacles) {
        let spriteKey = obs.speed < 0 ? `${obs.type}_flip` : obs.type;
        let colorKey: string = obs.type;
        if (obs.type === "car") {
          const variant = obs.id % 3;
          if (variant === 0) {
            spriteKey = obs.speed < 0 ? "car_blue_flip" : "car_blue";
            colorKey = "car_blue";
          } else if (variant === 1) {
            spriteKey = obs.speed < 0 ? "car_yellow_flip" : "car_yellow";
            colorKey = "car_yellow";
          }
        }

        const height = OBJECT_HEIGHT[obs.type] ?? OBJECT_HEIGHT[spriteKey] ?? 0;

        // 1. Shadow silhouette — lane-tinted
        const shadowKey = spriteKey + "_shadow";
        if (this.sprites.has(shadowKey)) {
          this.ctx.globalAlpha = (laneAlpha < 1 ? laneAlpha : 1) * SHADOW_ALPHA;
          this.sprites.draw(
            this.ctx,
            shadowKey,
            obs.worldX + SHADOW_OFFSET.x,
            screenY + SHADOW_OFFSET.y,
          );
          this.ctx.globalAlpha = laneAlpha < 1 ? laneAlpha : 1;
        }

        // 2. Side face (dark variant)
        if (height > 0) {
          const sideKey = spriteKey + "_side";
          if (this.sprites.has(sideKey)) {
            this.sprites.draw(this.ctx, sideKey, obs.worldX, screenY);
          }
        }

        // 3. Main sprite shifted up by height
        this.sprites.draw(this.ctx, spriteKey, obs.worldX, screenY - height);

        // 4. Top face (roof) — colored rectangle with highlight
        const topFace = OBJECT_TOP_FACE[colorKey] ?? 0;
        const topColor = TOP_FACE_COLORS[colorKey];
        if (topFace > 0 && topColor) {
          const obsWidth = obs.widthCells * cellSize;
          const inset = 4;
          const topY = screenY - height - topFace;

          this.ctx.fillStyle = topColor;
          this.ctx.fillRect(
            Math.round(obs.worldX + inset),
            Math.round(topY),
            obsWidth - inset * 2,
            topFace,
          );

          // 1px white highlight on top edge
          this.ctx.globalAlpha = (laneAlpha < 1 ? laneAlpha : 1) * 0.3;
          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillRect(
            Math.round(obs.worldX + inset),
            Math.round(topY),
            obsWidth - inset * 2,
            1,
          );
          this.ctx.globalAlpha = laneAlpha < 1 ? laneAlpha : 1;
        }
      }

      // Restore alpha after lane fade-in
      if (laneAlpha < 1) {
        this.ctx.globalAlpha = 1;
      }
    }
  }

  /** Render ambient particles per lane type — dust motes on grass, shimmer on road */
  private renderAmbientParticles(lane: Lane, screenY: number, state: GameState): void {
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;
    const laneWidth = cols * cellSize;
    const t = state.animationTime;

    if (lane.type === "grass") {
      // Drifting dust motes
      for (let i = 0; i < this.dustMotes.length; i++) {
        const mote = this.dustMotes[i];
        const x = ((mote.x * laneWidth + t * mote.speed * 8 + lane.y * 31) % laneWidth + laneWidth) % laneWidth;
        const y = screenY + mote.y * cellSize + Math.sin(t * mote.speed + mote.phase) * 4;
        const alpha = 0.06 + 0.04 * Math.sin(t * 1.5 + mote.phase);
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = "#a7f070";
        this.ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
      }
      this.ctx.globalAlpha = 1;
    } else if (lane.type === "road") {
      // Subtle heat shimmer — horizontal streak flickers
      const shimmerX = ((t * 25 + lane.y * 47) % (laneWidth + cellSize * 4)) - cellSize * 2;
      const shimmerAlpha = 0.04 + 0.02 * Math.sin(t * 4 + lane.y);
      this.ctx.globalAlpha = shimmerAlpha;
      this.ctx.fillStyle = "#566c86";
      this.ctx.fillRect(Math.round(shimmerX), screenY + 14, cellSize * 3, 2);
      this.ctx.globalAlpha = 1;
    } else if (lane.type === "water") {
      // Bubble particles — small rising dots
      for (let i = 0; i < 3; i++) {
        const bx = (laneWidth * ((i * 0.37 + lane.y * 0.13) % 1) + (t * 3 + i * 13)) % laneWidth;
        const phase = t * 1.5 + i * 2.1;
        const by = screenY + cellSize - ((phase * 4) % cellSize);
        const alpha = 0.12 * (1 - ((phase * 4) % cellSize) / cellSize);
        this.ctx.globalAlpha = Math.max(0, alpha);
        this.ctx.fillStyle = "#73eff7";
        this.ctx.fillRect(Math.round(bx), Math.round(by), 2, 2);
      }
      this.ctx.globalAlpha = 1;
    } else if (lane.type === "railroad") {
      // Occasional spark — brief bright pixel near track center
      const sparkPhase = (t * 0.7 + lane.y * 0.41) % 1;
      if (sparkPhase < 0.04) {
        const sparkX = Math.round(laneWidth * ((lane.y * 37 % 11) / 13));
        const sparkAlpha = (0.04 - sparkPhase) / 0.04;
        this.ctx.globalAlpha = sparkAlpha * 0.5;
        this.ctx.fillStyle = "#ffff00";
        this.ctx.fillRect(sparkX, screenY + cellSize / 2, 4, 2);
        this.ctx.globalAlpha = 1;
      }
    }
  }

  /** Render decorations (trees, bushes, rocks, stumps) on grass lanes */
  private renderDecorations(lane: Lane, screenY: number, laneAlpha: number): void {
    if (!lane.decorations || lane.decorations.length === 0) return;

    const cellSize = DEFAULT_CONFIG.cellSize;

    for (const deco of lane.decorations) {
      const spriteKey = `${deco.type}_${deco.variant}`;
      const shadowKey = `${spriteKey}_shadow`;
      const decoHeight = DECORATION_HEIGHTS[deco.type] ?? 0;
      const x = deco.gridX * cellSize;

      // Shadow silhouette at ground level
      if (this.sprites.has(shadowKey)) {
        this.ctx.globalAlpha = (laneAlpha < 1 ? laneAlpha : 1) * SHADOW_ALPHA * 0.7;
        this.sprites.draw(
          this.ctx,
          shadowKey,
          x + SHADOW_OFFSET.x,
          screenY + SHADOW_OFFSET.y,
        );
        this.ctx.globalAlpha = laneAlpha < 1 ? laneAlpha : 1;
      }

      // Main decoration sprite lifted by decoration height
      if (this.sprites.has(spriteKey)) {
        this.sprites.draw(this.ctx, spriteKey, x, screenY - decoHeight);
      }
    }
  }

  renderCoins(state: GameState): void {
    const { camera, coins } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;

    for (const coin of coins) {
      if (coin.collected) continue;

      const screenY = coin.laneY * cellSize - camera.y;
      if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize) continue;

      // Bob animation — gentle vertical oscillation
      const bobOffset = Math.sin(state.animationTime * 2.5 + coin.id * 0.7) * 3;

      // Animation frame (toggle every 0.3s)
      const frame = Math.floor(state.animationTime / 0.3) % 2;
      const spriteKey = `coin_${coin.type}_${frame}`;

      // Glow effect — pulsing alpha
      const glowKey = `glow_${coin.type}`;
      if (this.sprites.has(glowKey)) {
        const pulse = 0.22 + 0.12 * Math.sin(state.animationTime * 3.5 + coin.id);
        this.ctx.globalAlpha = pulse;
        this.sprites.draw(this.ctx, glowKey, coin.worldX, screenY + bobOffset);
        this.ctx.globalAlpha = 1;
      }

      // Draw coin sprite centered (16x16 in 32x32 cell → offset by 8)
      this.sprites.draw(this.ctx, spriteKey, coin.worldX + 8, screenY + 8 + bobOffset);
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

      // Water reflection shimmer strips — lighter, uses screen blending
      this.ctx.globalCompositeOperation = "lighter";
      const waveOffset = (state.animationTime * 14 * lane.flowDirection) % (cols * cellSize);
      for (let i = 0; i < 4; i++) {
        const stripX = ((waveOffset + i * cellSize * 4.2) % (cols * cellSize + cellSize * 2)) - cellSize;
        const alpha = 0.035 + 0.02 * Math.sin(state.animationTime * 2.2 + i * 1.1);
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = "#73eff7";
        this.ctx.fillRect(Math.round(stripX), screenY + 4 + i * 6, cellSize * 2 + 8, 2);
      }
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.globalAlpha = 1;
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
    const elevation = 10; // 2.5D elevation offset (Crossy Road style)

    // Hop arc — bob upward during hop
    let arcOffset = 0;
    if (player.animation === "hop" && player.hopTarget !== null) {
      arcOffset = Math.sin(player.hopProgress * Math.PI) * 8;
    }

    // Shadow — ellipse at feet, stays grounded, squishes during landing
    const shadowScale = 1 + arcOffset * 0.02;
    const shadowAlpha = Math.max(0.12, 0.28 - arcOffset * 0.015);
    const shadowY = player.worldPos.y - camera.y + cellSize - 6;
    this.ctx.globalAlpha = shadowAlpha;
    this.ctx.fillStyle = "#1a1c2c";
    this.ctx.beginPath();
    this.ctx.ellipse(
      Math.round(screenX + cellSize / 2) + SHADOW_OFFSET.x,
      Math.round(shadowY + 1) + SHADOW_OFFSET.y,
      12 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2,
    );
    this.ctx.fill();
    this.ctx.globalAlpha = 1;

    // Apply hop arc + elevation to sprite position
    screenY -= arcOffset + elevation;

    // Squash & stretch transform applied to player sprite
    // During hop: stretch vertically at peak (arcOffset max), squash at takeoff/landing
    let scaleX = 1;
    let scaleY = 1;
    if (player.animation === "hop" && player.hopTarget !== null) {
      const p = player.hopProgress;
      if (p < 0.15) {
        // Anticipation squash — brief flatten before launch
        const t = p / 0.15;
        scaleX = 1 + 0.2 * t;
        scaleY = 1 - 0.15 * t;
      } else if (p < 0.7) {
        // Stretch upward at peak
        const t = (p - 0.15) / 0.55;
        const peak = Math.sin(t * Math.PI);
        scaleX = 1 - 0.12 * peak;
        scaleY = 1 + 0.18 * peak;
      } else {
        // Landing squash
        const t = (p - 0.7) / 0.3;
        scaleX = 1 + 0.15 * t;
        scaleY = 1 - 0.12 * t;
      }
    } else if (player.animation === "idle") {
      // Subtle idle breathing — gentle vertical pulse
      const breathe = Math.sin(state.animationTime * 1.8) * 0.025;
      scaleY = 1 + breathe;
      scaleX = 1 - breathe * 0.5;
    }

    // Choose blink frame occasionally for idle animation
    let spriteKey = `lobster_${player.facing}_${player.animation}`;
    if (player.animation === "idle" && player.facing === "down") {
      // Blink cycle: open for ~3s, closed for 0.1s
      const blinkCycle = state.animationTime % 3.5;
      if (blinkCycle > 3.4) {
        const blinkKey = "lobster_down_blink";
        if (this.sprites.has(blinkKey)) {
          spriteKey = blinkKey;
        }
      }
    }

    // Draw with squash/stretch if needed
    if (scaleX !== 1 || scaleY !== 1) {
      const cx = Math.round(screenX + cellSize / 2);
      const cy = Math.round(screenY + cellSize / 2);
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(scaleX, scaleY);
      this.ctx.translate(-cx, -cy);
      this.sprites.draw(this.ctx, spriteKey, screenX, screenY);
      this.ctx.restore();
    } else {
      this.sprites.draw(this.ctx, spriteKey, screenX, screenY);
    }
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

  /** Enhanced vignette with warm inner glow at center and cool outer shadow */
  renderVignette(animationTime: number = 0): void {
    const { width, height } = this.ctx.canvas;

    // Warm inner glow — subtle amber bloom at center
    const innerGlow = this.ctx.createRadialGradient(
      width / 2, height * 0.55, 0,
      width / 2, height * 0.55, Math.min(width, height) * 0.28,
    );
    const glowAlpha = 0.04 + 0.015 * Math.sin(animationTime * 0.4);
    innerGlow.addColorStop(0, `rgba(239, 125, 87, ${glowAlpha})`);
    innerGlow.addColorStop(1, "rgba(239, 125, 87, 0)");
    this.ctx.fillStyle = innerGlow;
    this.ctx.fillRect(0, 0, width, height);

    // Outer vignette — darkens edges
    const outerVig = this.ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.min(width, height) * 0.8,
    );
    outerVig.addColorStop(0, "rgba(0,0,0,0)");
    outerVig.addColorStop(0.7, "rgba(0,0,0,0.08)");
    outerVig.addColorStop(1, "rgba(0,0,0,0.32)");
    this.ctx.fillStyle = outerVig;
    this.ctx.fillRect(0, 0, width, height);
  }
}

// ============================================================================
// WebGL2 Game Renderer — GPU-accelerated rendering pipeline
// ============================================================================
//
// Replaces the Canvas 2D renderer with a full WebGL2 pipeline:
// - Sprite atlas texture (all sprites packed into a single GPU texture)
// - Instanced sprite batch rendering (thousands of sprites per draw call)
// - GPU particle system (instanced point/quad particles)
// - Post-processing pipeline (bloom, vignette, chromatic aberration)
// - Procedural background shader (sky gradient, aurora, star field)
//
// The renderer is decoupled from the game engine. It reads GameState and
// produces frames — no mutation of game state occurs here.
// ============================================================================

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
import {
  SpriteAtlas,
  WHITE_REGION_KEY,
  SpriteBatch,
  GPUParticleRenderer,
  PostProcessor,
} from "./webgl";
import type { AtlasRegion } from "./webgl";

// ---------------------------------------------------------------------------
// Legacy re-exports for backward compatibility with GameCanvas.tsx
// ---------------------------------------------------------------------------

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Parse hex color to normalized floats */
function hexToFloats(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

// ---------------------------------------------------------------------------
// SpriteCache — legacy wrapper that builds a SpriteAtlas under the hood
// ---------------------------------------------------------------------------

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

  prerenderAmbientGlow(
    ..._args: [key: string, color: string, width: number, height: number]
  ): void {
    // Ambient glows are now handled by the post-processing pipeline
  }

  has(key: string): boolean {
    return this.atlas.has(key);
  }

  /** Build the atlas texture on the GPU. Must be called after all prerenders. */
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

// ---------------------------------------------------------------------------
// WebGL2 GameRenderer
// ---------------------------------------------------------------------------

export class GameRenderer {
  private gl: WebGL2RenderingContext;
  private sprites: SpriteCache;
  private batch: SpriteBatch;
  private particleRenderer: GPUParticleRenderer;
  private postProcessor: PostProcessor;
  private atlas: SpriteAtlas;
  private whiteRegion: AtlasRegion;
  private laneFirstVisible = new Map<number, number>();
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, sprites: SpriteCache) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL2 not supported");

    this.gl = gl;
    this.sprites = sprites;
    this.width = canvas.width;
    this.height = canvas.height;

    // Build the sprite atlas on the GPU
    sprites.buildAtlas(gl);
    this.atlas = sprites.getAtlas();

    const white = this.atlas.getRegion(WHITE_REGION_KEY);
    if (!white) throw new Error("White region not found in atlas");
    this.whiteRegion = white;

    // Initialize rendering subsystems
    this.batch = new SpriteBatch(gl);
    this.particleRenderer = new GPUParticleRenderer(gl);
    this.postProcessor = new PostProcessor(gl, canvas.width, canvas.height);

    // Set up projection matrices
    this.batch.setProjection(canvas.width, canvas.height);
    this.particleRenderer.setProjection(canvas.width, canvas.height);

    // Bind atlas texture
    const atlasTex = this.atlas.getTexture();
    if (atlasTex) this.batch.bindAtlas(atlasTex);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  clear(): void {
    // Handled by post-processor beginScene
  }

  /** Begin a new frame — sets up the offscreen framebuffer */
  beginFrame(): void {
    this.postProcessor.beginScene();
  }

  /** End the frame — applies post-processing and presents to screen */
  endFrame(animationTime: number): void {
    this.postProcessor.endScene();
    this.postProcessor.composite(animationTime);
  }

  renderBackground(animationTime: number): void {
    this.postProcessor.renderBackground(animationTime);
  }

  renderStarField(): void {
    // Stars are now rendered by the procedural background shader
  }

  /** Apply screen shake offset to all rendering subsystems */
  setShakeOffset(offsetX: number, offsetY: number): void {
    this.batch.setShakeOffset(offsetX, offsetY);
    this.particleRenderer.setShakeOffset(offsetX, offsetY);
  }

  /** Clear shake offset — restore normal projection */
  clearShakeOffset(): void {
    this.batch.clearShakeOffset();
    this.particleRenderer.clearShakeOffset();
  }

  /** Clear per-session render state (call on game reset) */
  resetState(): void {
    this.laneFirstVisible.clear();
  }

  renderLanes(state: GameState): void {
    const { camera, lanes } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    // Re-bind atlas before sprite batch
    const atlasTex = this.atlas.getTexture();
    if (atlasTex) this.batch.bindAtlas(atlasTex);

    this.batch.begin();

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

      // --- Lane Background Tiles ---
      this.renderLaneBackground(lane, screenY, state, laneAlpha);

      // --- Ground depth strip (2.5D) ---
      const depth = TILE_DEPTH[lane.type];
      if (depth > 0) {
        const gc = GROUND_COLORS[lane.type];

        // Top edge highlight (2px)
        const [topR, topG, topB] = hexToFloats(gc.top);
        this.batch.drawQuad(
          this.whiteRegion,
          0,
          screenY + cellSize,
          cols * cellSize,
          2,
          topR,
          topG,
          topB,
          laneAlpha,
        );

        // Front face gradient — use front color (we simplify the gradient to a solid)
        if (depth > 2) {
          const [fR, fG, fB] = hexToFloats(gc.front);
          this.batch.drawQuad(
            this.whiteRegion,
            0,
            screenY + cellSize + 2,
            cols * cellSize,
            depth - 2,
            fR,
            fG,
            fB,
            laneAlpha,
          );
        }
      }

      // --- Lane transitions ---
      const nextLane = lanes.find((l) => l.y === lane.y - 1);
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
          const [tR, tG, tB] = hexToFloats(color);
          this.batch.drawQuad(
            this.whiteRegion,
            0,
            screenY,
            cols * cellSize,
            6,
            tR,
            tG,
            tB,
            0.3 * laneAlpha,
          );
        }
      }

      // --- Decorations (behind obstacles) ---
      this.renderDecorations(lane, screenY, laneAlpha);

      // --- Obstacles with 2.5D depth ---
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
        const obsRegion = this.atlas.getRegion(spriteKey);
        if (!obsRegion) continue;

        // 1. Shadow silhouette
        const shadowKey = spriteKey + "_shadow";
        const shadowRegion = this.atlas.getRegion(shadowKey);
        if (shadowRegion) {
          this.batch.draw(
            shadowRegion,
            obs.worldX + SHADOW_OFFSET.x,
            screenY + SHADOW_OFFSET.y,
            undefined,
            undefined,
            1,
            1,
            1,
            SHADOW_ALPHA * laneAlpha,
          );
        }

        // 2. Side face (dark variant)
        if (height > 0) {
          const sideKey = spriteKey + "_side";
          const sideRegion = this.atlas.getRegion(sideKey);
          if (sideRegion) {
            this.batch.draw(
              sideRegion,
              obs.worldX,
              screenY,
              undefined,
              undefined,
              1,
              1,
              1,
              laneAlpha,
            );
          }
        }

        // 3. Main sprite shifted up by height
        this.batch.draw(
          obsRegion,
          obs.worldX,
          screenY - height,
          undefined,
          undefined,
          1,
          1,
          1,
          laneAlpha,
        );

        // 4. Top face (roof)
        const topFace = OBJECT_TOP_FACE[colorKey] ?? 0;
        const topColor = TOP_FACE_COLORS[colorKey];
        if (topFace > 0 && topColor) {
          const obsWidth = obs.widthCells * cellSize;
          const inset = 4;
          const topY = screenY - height - topFace;
          const [tcR, tcG, tcB] = hexToFloats(topColor);

          this.batch.drawQuad(
            this.whiteRegion,
            obs.worldX + inset,
            topY,
            obsWidth - inset * 2,
            topFace,
            tcR,
            tcG,
            tcB,
            laneAlpha,
          );

          // 1px white highlight on top edge
          this.batch.drawQuad(
            this.whiteRegion,
            obs.worldX + inset,
            topY,
            obsWidth - inset * 2,
            1,
            1,
            1,
            1,
            0.3 * laneAlpha,
          );
        }
      }
    }

    // Flush all lane sprites
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.batch.flush();
  }

  renderCoins(state: GameState): void {
    const { camera, coins } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;

    this.batch.begin();

    for (const coin of coins) {
      if (coin.collected) continue;

      const screenY = coin.laneY * cellSize - camera.y;
      if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize)
        continue;

      // Bob animation
      const bobOffset =
        Math.sin(state.animationTime * 2.5 + coin.id * 0.7) * 3;

      // Animation frame
      const frame = Math.floor(state.animationTime / 0.3) % 2;
      const spriteKey = `coin_${coin.type}_${frame}`;

      // Glow effect
      const glowKey = `glow_${coin.type}`;
      const glowRegion = this.atlas.getRegion(glowKey);
      if (glowRegion) {
        const pulse =
          0.22 + 0.12 * Math.sin(state.animationTime * 3.5 + coin.id);
        this.batch.draw(
          glowRegion,
          coin.worldX,
          screenY + bobOffset,
          undefined,
          undefined,
          1,
          1,
          1,
          pulse,
        );
      }

      // Coin sprite (16x16 centered in 32x32 cell)
      const coinRegion = this.atlas.getRegion(spriteKey);
      if (coinRegion) {
        this.batch.draw(
          coinRegion,
          coin.worldX + 8,
          screenY + 8 + bobOffset,
        );
      }
    }

    this.batch.flush();
  }

  renderPlayer(state: GameState): void {
    const { player, camera } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const elevation = 10;

    const screenX = player.worldPos.x;
    let screenY = player.worldPos.y - camera.y;

    // Hop arc
    let arcOffset = 0;
    if (player.animation === "hop" && player.hopTarget !== null) {
      arcOffset = Math.sin(player.hopProgress * Math.PI) * 8;
    }

    // Shadow ellipse — rendered as a tinted white quad
    const shadowScale = 1 + arcOffset * 0.02;
    const shadowAlpha = Math.max(0.12, 0.28 - arcOffset * 0.015);
    const shadowY = player.worldPos.y - camera.y + cellSize - 6;

    // Shadow as a small quad (approximating ellipse)
    this.batch.begin();
    this.batch.drawQuad(
      this.whiteRegion,
      Math.round(screenX + cellSize / 2 - 12 * shadowScale) + SHADOW_OFFSET.x,
      Math.round(shadowY - 3 * shadowScale) + SHADOW_OFFSET.y,
      24 * shadowScale,
      6 * shadowScale,
      26 / 255,
      28 / 255,
      44 / 255,
      shadowAlpha,
    );

    // Apply hop arc + elevation
    screenY -= arcOffset + elevation;

    // Squash & stretch
    let scaleX = 1;
    let scaleY = 1;
    if (player.animation === "hop" && player.hopTarget !== null) {
      const p = player.hopProgress;
      if (p < 0.15) {
        const t = p / 0.15;
        scaleX = 1 + 0.2 * t;
        scaleY = 1 - 0.15 * t;
      } else if (p < 0.7) {
        const t = (p - 0.15) / 0.55;
        const peak = Math.sin(t * Math.PI);
        scaleX = 1 - 0.12 * peak;
        scaleY = 1 + 0.18 * peak;
      } else {
        const t = (p - 0.7) / 0.3;
        scaleX = 1 + 0.15 * t;
        scaleY = 1 - 0.12 * t;
      }
    } else if (player.animation === "idle") {
      const breathe = Math.sin(state.animationTime * 1.8) * 0.025;
      scaleY = 1 + breathe;
      scaleX = 1 - breathe * 0.5;
    }

    // Choose blink frame for idle
    let spriteKey = `lobster_${player.facing}_${player.animation}`;
    if (player.animation === "idle" && player.facing === "down") {
      const blinkCycle = state.animationTime % 3.5;
      if (blinkCycle > 3.4) {
        const blinkKey = "lobster_down_blink";
        if (this.atlas.has(blinkKey)) {
          spriteKey = blinkKey;
        }
      }
    }

    const region = this.atlas.getRegion(spriteKey);
    if (region) {
      // Apply squash/stretch by adjusting draw size and position
      const w = region.width * scaleX;
      const h = region.height * scaleY;
      const offsetX = (region.width - w) / 2;
      const offsetY = (region.height - h) / 2;

      this.batch.draw(
        region,
        screenX + offsetX,
        screenY + offsetY,
        w,
        h,
      );
    }

    this.batch.flush();
  }

  renderParticles(particles: readonly Particle[], cameraY: number): void {
    if (particles.length === 0) return;
    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.particleRenderer.render(particles, cameraY);
  }

  renderVignette(): void {
    // Vignette is now handled by the post-processing composite shader
  }

  /** Render ambient particles per lane type (dust, shimmer, bubbles, sparks) */
  renderAmbientEffects(state: GameState): void {
    const { camera, lanes } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;
    const laneWidth = cols * cellSize;
    const t = state.animationTime;

    this.batch.begin();

    for (const lane of lanes) {
      const screenY = lane.y * cellSize - camera.y;
      if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize)
        continue;

      if (lane.type === "grass") {
        // Drifting dust motes
        for (let i = 0; i < 6; i++) {
          const phase = (i * 1.7 + lane.y * 0.3) % (Math.PI * 2);
          const x =
            ((i * 0.17 * laneWidth + t * (0.2 + i * 0.05) * 8 + lane.y * 31) %
              laneWidth +
              laneWidth) %
            laneWidth;
          const y =
            screenY +
            (i * 0.16) * cellSize +
            Math.sin(t * (0.2 + i * 0.05) + phase) * 4;
          const alpha = 0.06 + 0.04 * Math.sin(t * 1.5 + phase);
          this.batch.drawQuad(
            this.whiteRegion,
            Math.round(x),
            Math.round(y),
            2,
            2,
            0.65,
            0.94,
            0.44,
            alpha,
          );
        }
      } else if (lane.type === "road") {
        // Heat shimmer
        const shimmerX =
          ((t * 25 + lane.y * 47) % (laneWidth + cellSize * 4)) - cellSize * 2;
        const shimmerAlpha = 0.04 + 0.02 * Math.sin(t * 4 + lane.y);
        this.batch.drawQuad(
          this.whiteRegion,
          Math.round(shimmerX),
          screenY + 14,
          cellSize * 3,
          2,
          0.34,
          0.42,
          0.53,
          shimmerAlpha,
        );
      } else if (lane.type === "water") {
        // Bubble particles
        for (let i = 0; i < 3; i++) {
          const bx =
            (laneWidth * (((i * 0.37 + lane.y * 0.13) % 1) + 0) +
              (t * 3 + i * 13)) %
            laneWidth;
          const phase = t * 1.5 + i * 2.1;
          const by = screenY + cellSize - ((phase * 4) % cellSize);
          const alpha = 0.12 * (1 - ((phase * 4) % cellSize) / cellSize);
          if (alpha > 0) {
            this.batch.drawQuad(
              this.whiteRegion,
              Math.round(bx),
              Math.round(by),
              2,
              2,
              0.45,
              0.94,
              0.97,
              Math.max(0, alpha),
            );
          }
        }
      } else if (lane.type === "railroad") {
        // Occasional spark
        const sparkPhase = (t * 0.7 + lane.y * 0.41) % 1;
        if (sparkPhase < 0.04) {
          const sparkX = Math.round(
            laneWidth * (((lane.y * 37) % 11) / 13),
          );
          const sparkAlpha = ((0.04 - sparkPhase) / 0.04) * 0.5;
          this.batch.drawQuad(
            this.whiteRegion,
            sparkX,
            screenY + cellSize / 2,
            4,
            2,
            1,
            1,
            0,
            sparkAlpha,
          );
        }
      }
    }

    this.batch.flush();
  }

  // --- Private helpers ---

  private renderLaneBackground(
    lane: Lane,
    screenY: number,
    state: GameState,
    laneAlpha: number,
  ): void {
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    if (lane.type === "water") {
      const offset =
        Math.floor(state.animationTime * WATER_FLOW_SPEED) % cellSize;
      const flowOffset = offset * lane.flowDirection;
      for (let x = -1; x <= cols; x++) {
        const key = `${lane.type}_${lane.variant}`;
        const region = this.atlas.getRegion(key);
        if (region) {
          this.batch.draw(
            region,
            x * cellSize + flowOffset,
            screenY,
            undefined,
            undefined,
            1,
            1,
            1,
            laneAlpha,
          );
        }
      }

      // Water reflection shimmer strips
      const waveOffset =
        (state.animationTime * 14 * lane.flowDirection) % (cols * cellSize);
      for (let i = 0; i < 4; i++) {
        const stripX =
          ((waveOffset + i * cellSize * 4.2) %
            (cols * cellSize + cellSize * 2)) -
          cellSize;
        const alpha =
          (0.035 + 0.02 * Math.sin(state.animationTime * 2.2 + i * 1.1)) *
          laneAlpha;
        this.batch.drawQuad(
          this.whiteRegion,
          Math.round(stripX),
          screenY + 4 + i * 6,
          cellSize * 2 + 8,
          2,
          0.45,
          0.94,
          0.97,
          alpha,
        );
      }
      return;
    }

    if (lane.type === "grass") {
      const shimmerVariant =
        (lane.variant +
          Math.floor(state.animationTime * GRASS_SHIMMER_SPEED)) %
        2;
      for (let x = 0; x < cols; x++) {
        const key = `grass_${shimmerVariant}`;
        const region = this.atlas.getRegion(key);
        if (region) {
          this.batch.draw(
            region,
            x * cellSize,
            screenY,
            undefined,
            undefined,
            1,
            1,
            1,
            laneAlpha,
          );
        }
      }
      return;
    }

    // Road / Railroad
    for (let x = 0; x < cols; x++) {
      const key = `${lane.type}_${lane.variant}`;
      const region = this.atlas.getRegion(key);
      if (region) {
        this.batch.draw(
          region,
          x * cellSize,
          screenY,
          undefined,
          undefined,
          1,
          1,
          1,
          laneAlpha,
        );
      }
    }
  }

  private renderDecorations(
    lane: Lane,
    screenY: number,
    laneAlpha: number,
  ): void {
    if (!lane.decorations || lane.decorations.length === 0) return;

    const cellSize = DEFAULT_CONFIG.cellSize;

    for (const deco of lane.decorations) {
      const spriteKey = `${deco.type}_${deco.variant}`;
      const shadowKey = `${spriteKey}_shadow`;
      const decoHeight = DECORATION_HEIGHTS[deco.type] ?? 0;
      const x = deco.gridX * cellSize;

      // Shadow
      const shadowRegion = this.atlas.getRegion(shadowKey);
      if (shadowRegion) {
        this.batch.draw(
          shadowRegion,
          x + SHADOW_OFFSET.x,
          screenY + SHADOW_OFFSET.y,
          undefined,
          undefined,
          1,
          1,
          1,
          SHADOW_ALPHA * 0.7 * laneAlpha,
        );
      }

      // Main decoration sprite
      const region = this.atlas.getRegion(spriteKey);
      if (region) {
        this.batch.draw(
          region,
          x,
          screenY - decoHeight,
          undefined,
          undefined,
          1,
          1,
          1,
          laneAlpha,
        );
      }
    }
  }

  destroy(): void {
    this.batch.destroy();
    this.particleRenderer.destroy();
    this.postProcessor.destroy();
    this.sprites.destroy(this.gl);
  }
}

// ============================================================================
// SpritesPass — lanes, decorations, obstacles, coins, player, ambient effects
// ============================================================================

import type { RenderPass, RenderResources, RenderState } from "../render-pass";
import type { Lane } from "../../types";
import type { AtlasRegion } from "../webgl/sprite-atlas";
import type { SpriteBatch } from "../webgl/sprite-batch";
import type { SpriteAtlas } from "../webgl/sprite-atlas";
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
  POWERUP_PARTICLE_COLORS,
} from "../../constants";
import { resolveSprite, type SpriteStyle } from "../../sprites/sprite-style";
import { DECORATION_HEIGHTS } from "../../sprites/decorations";
import { getAnimationFrame } from "../../sprites/animation";

/** Parse hex color to normalized floats */
function hexToFloats(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8) & 255) / 255,
    (n & 255) / 255,
  ];
}

export class SpritesPass implements RenderPass {
  readonly name = "sprites";
  enabled = true;

  private laneFirstVisible = new Map<number, number>();
  private spriteStyle: SpriteStyle = "pixel";

  setSpriteStyle(style: SpriteStyle): void {
    this.spriteStyle = style;
  }

  resetState(): void {
    this.laneFirstVisible.clear();
  }

  setup(_gl: WebGL2RenderingContext, _resources: RenderResources): void {
    // No additional setup needed — uses shared sprite batch
  }

  execute(gl: WebGL2RenderingContext, state: RenderState, resources: RenderResources): void {
    const { batch, atlas, whiteRegion } = resources;

    // Ensure blending is set up for sprites
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Re-bind atlas before sprite batch
    const atlasTex = atlas.getTexture();
    if (atlasTex) batch.bindAtlas(atlasTex);

    // --- Render lanes ---
    this.renderLanes(state, batch, atlas, whiteRegion);

    // --- Render ambient effects ---
    this.renderAmbientEffects(state, batch, whiteRegion);

    // --- Render coins ---
    this.renderCoins(state, batch, atlas);

    // --- Render ground power-ups ---
    this.renderPowerUps(state, batch, whiteRegion);

    // --- Render player ---
    this.renderPlayer(state, batch, atlas, whiteRegion);
  }

  destroy(_gl: WebGL2RenderingContext): void {
    this.laneFirstVisible.clear();
  }

  // --- Private helpers ---

  private resolveRegion(gameKey: string, atlas: SpriteAtlas): AtlasRegion | undefined {
    const resolved = resolveSprite(gameKey, this.spriteStyle, (k) => atlas.has(k));
    return atlas.getRegion(resolved);
  }

  private renderLanes(
    state: RenderState,
    batch: SpriteBatch,
    atlas: SpriteAtlas,
    whiteRegion: AtlasRegion,
  ): void {
    const { camera, lanes } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    batch.begin();

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

      // Lane background tiles
      this.renderLaneBackground(lane, screenY, state, laneAlpha, batch, atlas);

      // Ground depth strip (2.5D)
      const depth = TILE_DEPTH[lane.type];
      if (depth > 0) {
        const gc = GROUND_COLORS[lane.type];

        // Top edge highlight (2px)
        const [topR, topG, topB] = hexToFloats(gc.top);
        batch.drawQuad(whiteRegion, 0, screenY + cellSize, cols * cellSize, 2, topR, topG, topB, laneAlpha);

        // Front face
        if (depth > 2) {
          const [fR, fG, fB] = hexToFloats(gc.front);
          batch.drawQuad(whiteRegion, 0, screenY + cellSize + 2, cols * cellSize, depth - 2, fR, fG, fB, laneAlpha);
        }
      }

      // Road dashed center line
      if (lane.type === "road") {
        const dashWidth = 6;
        const dashLength = 10;
        const gapLength = 10;
        const centerY = screenY + cellSize / 2 - 1;
        const [dlR, dlG, dlB] = hexToFloats("#ffdd44");
        for (let dx = 0; dx < cols * cellSize; dx += dashLength + gapLength) {
          const dw = Math.min(dashLength, cols * cellSize - dx);
          batch.drawQuad(whiteRegion, dx, centerY, dw, dashWidth, dlR, dlG, dlB, 0.6 * laneAlpha);
        }
      }

      // Lane transitions
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
          batch.drawQuad(whiteRegion, 0, screenY, cols * cellSize, 6, tR, tG, tB, 0.3 * laneAlpha);
        }
      }

      // Decorations (behind obstacles) with breathing animation
      this.renderDecorations(lane, screenY, laneAlpha, state.animationTime, batch, atlas);

      // Obstacles with 2.5D depth + animation frames + subtle deformation
      for (let obsIdx = 0; obsIdx < lane.obstacles.length; obsIdx++) {
        const obs = lane.obstacles[obsIdx];

        // Resolve base sprite type (including car color variants)
        let baseType = obs.type as string;
        let colorKey: string = obs.type;
        if (obs.type === "car") {
          const variant = obs.id % 3;
          if (variant === 0) {
            baseType = "car_blue";
            colorKey = "car_blue";
          } else if (variant === 1) {
            baseType = "car_yellow";
            colorKey = "car_yellow";
          }
        }

        const isVoxel = this.spriteStyle === "voxel";

        // Animation frame lookup (pixel mode only — voxels have no _1 variants)
        const frame = isVoxel ? 0 : getAnimationFrame(baseType, state.animationTime);
        const animatedType = frame > 0 ? `${baseType}_${frame}` : baseType;
        const spriteKey = obs.speed < 0 ? `${animatedType}_flip` : animatedType;
        // Voxel sprites have 3D baked in — no elevation or layering needed
        const height = isVoxel ? 0 : (OBJECT_HEIGHT[obs.type] ?? OBJECT_HEIGHT[baseType] ?? 0);
        const obsRegion = this.resolveRegion(spriteKey, atlas);
        if (!obsRegion) continue;

        // Subtle deformation for moving vehicles (pixel mode only)
        let scaleY = 1;
        if (!isVoxel) {
          if (obs.type === "train") {
            scaleY = 1 + Math.sin(state.animationTime * 8) * 0.03;
          } else if (obs.type === "car" || obs.type === "truck") {
            scaleY = 1 + Math.sin(state.animationTime * 4 + obsIdx * 0.5) * 0.02;
          }
        }

        const spriteW = obsRegion.width;
        const spriteH = obsRegion.height;
        const scaledH = spriteH * scaleY;
        const yOffset = (spriteH - scaledH) / 2;

        // 1. Shadow silhouette (pixel mode only — voxels have baked shadows)
        if (!isVoxel) {
          const shadowKey = spriteKey + "_shadow";
          const shadowRegion = this.resolveRegion(shadowKey, atlas);
          if (shadowRegion) {
            batch.draw(shadowRegion, obs.worldX + SHADOW_OFFSET.x, screenY + SHADOW_OFFSET.y, undefined, undefined, 1, 1, 1, SHADOW_ALPHA * laneAlpha);
          }
        }

        // 2. Side face disabled — sprites have built-in isometric shading

        // 3. Main sprite (shifted up by height in pixel mode, flat in voxel)
        batch.draw(obsRegion, obs.worldX, screenY - height + yOffset, spriteW, scaledH, 1, 1, 1, laneAlpha);

        // 4. Top face (pixel mode only)
        if (!isVoxel) {
          const topFace = OBJECT_TOP_FACE[colorKey] ?? 0;
          const topColor = TOP_FACE_COLORS[colorKey];
          if (topFace > 0 && topColor) {
            const obsWidth = obs.widthCells * cellSize;
            const inset = 4;
            const topY = screenY - height - topFace + yOffset;
            const [tcR, tcG, tcB] = hexToFloats(topColor);
            batch.drawQuad(whiteRegion, obs.worldX + inset, topY, obsWidth - inset * 2, topFace, tcR, tcG, tcB, laneAlpha);
            batch.drawQuad(whiteRegion, obs.worldX + inset, topY, obsWidth - inset * 2, 1, 1, 1, 1, 0.3 * laneAlpha);
          }
        }
      }
    }

    // Flush all lane sprites
    batch.flush();
  }

  private renderLaneBackground(
    lane: Lane,
    screenY: number,
    state: RenderState,
    laneAlpha: number,
    batch: SpriteBatch,
    atlas: SpriteAtlas,
  ): void {
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;

    if (lane.type === "water") {
      const offset = Math.floor(state.animationTime * WATER_FLOW_SPEED) % cellSize;
      const flowOffset = offset * lane.flowDirection;
      for (let x = -1; x <= cols; x++) {
        const key = `${lane.type}_${lane.variant}`;
        const region = this.resolveRegion(key, atlas);
        if (region) {
          batch.draw(region, x * cellSize + flowOffset, screenY, undefined, undefined, 1, 1, 1, laneAlpha);
        }
      }

      // Water reflection shimmer strips
      const waveOffset = (state.animationTime * 14 * lane.flowDirection) % (cols * cellSize);
      for (let i = 0; i < 4; i++) {
        const stripX = ((waveOffset + i * cellSize * 4.2) % (cols * cellSize + cellSize * 2)) - cellSize;
        const alpha = (0.035 + 0.02 * Math.sin(state.animationTime * 2.2 + i * 1.1)) * laneAlpha;
        const wr = atlas.getRegion("__white__");
        if (wr) {
          batch.drawQuad(wr, Math.round(stripX), screenY + 4 + i * 6, cellSize * 2 + 8, 2, 0.45, 0.94, 0.97, alpha);
        }
      }
      return;
    }

    if (lane.type === "grass") {
      const shimmerVariant = (lane.variant + Math.floor(state.animationTime * GRASS_SHIMMER_SPEED)) % 2;
      for (let x = 0; x < cols; x++) {
        const key = `grass_${shimmerVariant}`;
        const region = this.resolveRegion(key, atlas);
        if (region) {
          batch.draw(region, x * cellSize, screenY, undefined, undefined, 1, 1, 1, laneAlpha);
        }
      }
      return;
    }

    // Road / Railroad
    for (let x = 0; x < cols; x++) {
      const key = `${lane.type}_${lane.variant}`;
      const region = this.resolveRegion(key, atlas);
      if (region) {
        batch.draw(region, x * cellSize, screenY, undefined, undefined, 1, 1, 1, laneAlpha);
      }
    }
  }

  private renderDecorations(
    lane: Lane,
    screenY: number,
    laneAlpha: number,
    animationTime: number,
    batch: SpriteBatch,
    atlas: SpriteAtlas,
  ): void {
    if (!lane.decorations || lane.decorations.length === 0) return;

    const cellSize = DEFAULT_CONFIG.cellSize;

    for (const deco of lane.decorations) {
      const spriteKey = `${deco.type}_${deco.variant}`;
      const shadowKey = `${spriteKey}_shadow`;
      const decoHeight = DECORATION_HEIGHTS[deco.type] ?? 0;
      const baseX = deco.gridX * cellSize;

      // Breathing / sway offsets per decoration type
      let offsetX = 0;
      let scale = 1;

      if (deco.type === "tree") {
        // Trees sway gently in the wind
        offsetX = Math.sin(animationTime * 0.8 + baseX * 0.01) * 0.5;
      } else if (deco.type === "bush") {
        // Bushes breathe subtly (scale pulse)
        scale = 1 + Math.sin(animationTime * 1.2 + baseX * 0.02) * 0.01;
      }

      const drawX = baseX + offsetX;

      // Shadow (pixel mode only — voxels have baked shadows)
      if (this.spriteStyle !== "voxel") {
        const shadowRegion = atlas.getRegion(shadowKey);
        if (shadowRegion) {
          batch.draw(shadowRegion, drawX + SHADOW_OFFSET.x, screenY + SHADOW_OFFSET.y, undefined, undefined, 1, 1, 1, SHADOW_ALPHA * 0.7 * laneAlpha);
        }
      }

      // Main decoration sprite (with optional scale for bushes)
      const region = atlas.getRegion(spriteKey);
      if (region) {
        if (scale !== 1) {
          const w = region.width * scale;
          const h = region.height * scale;
          const scaleOffsetX = (region.width - w) / 2;
          const scaleOffsetY = (region.height - h) / 2;
          batch.draw(region, drawX + scaleOffsetX, screenY - decoHeight + scaleOffsetY, w, h, 1, 1, 1, laneAlpha);
        } else {
          batch.draw(region, drawX, screenY - decoHeight, undefined, undefined, 1, 1, 1, laneAlpha);
        }
      }
    }
  }

  private renderAmbientEffects(
    state: RenderState,
    batch: SpriteBatch,
    whiteRegion: AtlasRegion,
  ): void {
    const { camera, lanes } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;
    const cols = DEFAULT_CONFIG.gridColumns;
    const laneWidth = cols * cellSize;
    const t = state.animationTime;

    batch.begin();

    for (const lane of lanes) {
      const screenY = lane.y * cellSize - camera.y;
      if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize)
        continue;

      if (lane.type === "grass") {
        for (let i = 0; i < 6; i++) {
          const phase = (i * 1.7 + lane.y * 0.3) % (Math.PI * 2);
          const x = ((i * 0.17 * laneWidth + t * (0.2 + i * 0.05) * 8 + lane.y * 31) % laneWidth + laneWidth) % laneWidth;
          const y = screenY + (i * 0.16) * cellSize + Math.sin(t * (0.2 + i * 0.05) + phase) * 4;
          const alpha = 0.06 + 0.04 * Math.sin(t * 1.5 + phase);
          batch.drawQuad(whiteRegion, Math.round(x), Math.round(y), 2, 2, 0.65, 0.94, 0.44, alpha);
        }
      } else if (lane.type === "road") {
        const shimmerX = ((t * 25 + lane.y * 47) % (laneWidth + cellSize * 4)) - cellSize * 2;
        const shimmerAlpha = 0.04 + 0.02 * Math.sin(t * 4 + lane.y);
        batch.drawQuad(whiteRegion, Math.round(shimmerX), screenY + 14, cellSize * 3, 2, 0.34, 0.42, 0.53, shimmerAlpha);
      } else if (lane.type === "water") {
        for (let i = 0; i < 3; i++) {
          const bx = (laneWidth * (((i * 0.37 + lane.y * 0.13) % 1) + 0) + (t * 3 + i * 13)) % laneWidth;
          const phase = t * 1.5 + i * 2.1;
          const by = screenY + cellSize - ((phase * 4) % cellSize);
          const alpha = 0.12 * (1 - ((phase * 4) % cellSize) / cellSize);
          if (alpha > 0) {
            batch.drawQuad(whiteRegion, Math.round(bx), Math.round(by), 2, 2, 0.45, 0.94, 0.97, Math.max(0, alpha));
          }
        }
      } else if (lane.type === "railroad") {
        const sparkPhase = (t * 0.7 + lane.y * 0.41) % 1;
        if (sparkPhase < 0.04) {
          const sparkX = Math.round(laneWidth * (((lane.y * 37) % 11) / 13));
          const sparkAlpha = ((0.04 - sparkPhase) / 0.04) * 0.5;
          batch.drawQuad(whiteRegion, sparkX, screenY + cellSize / 2, 4, 2, 1, 1, 0, sparkAlpha);
        }
      }
    }

    batch.flush();
  }

  private renderCoins(
    state: RenderState,
    batch: SpriteBatch,
    atlas: SpriteAtlas,
  ): void {
    const { camera, coins } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;

    batch.begin();

    for (const coin of coins) {
      if (coin.collected) continue;

      const screenY = coin.laneY * cellSize - camera.y;
      if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize)
        continue;

      // Bob animation
      const bobOffset = Math.sin(state.animationTime * 2.5 + coin.id * 0.7) * 3;

      // Animation frame
      const frame = Math.floor(state.animationTime / 0.3) % 2;
      const spriteKey = `coin_${coin.type}_${frame}`;

      // Glow effect
      const glowKey = `glow_${coin.type}`;
      const glowRegion = atlas.getRegion(glowKey);
      if (glowRegion) {
        const pulse = 0.22 + 0.12 * Math.sin(state.animationTime * 3.5 + coin.id);
        batch.draw(glowRegion, coin.worldX, screenY + bobOffset, undefined, undefined, 1, 1, 1, pulse);
      }

      // Coin sprite
      const coinRegion = atlas.getRegion(spriteKey);
      if (coinRegion) {
        batch.draw(coinRegion, coin.worldX + 8, screenY + 8 + bobOffset);
      }
    }

    batch.flush();
  }

  private renderPowerUps(
    state: RenderState,
    batch: SpriteBatch,
    whiteRegion: AtlasRegion,
  ): void {
    const { camera, powerUps } = state;
    const cellSize = DEFAULT_CONFIG.cellSize;

    batch.begin();

    for (const pu of powerUps) {
      if (pu.collected) continue;

      const screenY = pu.laneY * cellSize - camera.y;
      if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize)
        continue;

      // Bob + pulse, mirroring the coin animation cadence.
      const bobOffset = Math.sin(state.animationTime * 2.5 + pu.id * 0.7) * 3;
      const pulse = 0.5 + 0.5 * Math.sin(state.animationTime * 3.5 + pu.id);

      const palette = POWERUP_PARTICLE_COLORS[pu.type];
      const [gR, gG, gB] = hexToFloats(palette[0]);
      const [cR, cG, cB] = hexToFloats(palette[palette.length - 1]);

      const cx = pu.worldX + cellSize / 2;
      const cyTop = screenY + bobOffset;
      const cy = cyTop + cellSize / 2;

      // Soft glow halo (low-alpha expanding square)
      const glowSize = 22 + pulse * 6;
      batch.drawQuad(
        whiteRegion,
        cx - glowSize / 2,
        cy - glowSize / 2,
        glowSize,
        glowSize,
        gR,
        gG,
        gB,
        0.18 + 0.12 * pulse,
      );

      // Core diamond — two stacked quads approximating a gem facet
      const coreSize = 12;
      batch.drawQuad(
        whiteRegion,
        cx - coreSize / 2,
        cy - coreSize / 2,
        coreSize,
        coreSize,
        gR,
        gG,
        gB,
        0.9,
      );
      // Bright inner highlight
      const innerSize = 6;
      batch.drawQuad(
        whiteRegion,
        cx - innerSize / 2,
        cy - innerSize / 2 - 1,
        innerSize,
        innerSize,
        cR,
        cG,
        cB,
        0.95,
      );
    }

    batch.flush();
  }

  private renderPlayer(
    state: RenderState,
    batch: SpriteBatch,
    atlas: SpriteAtlas,
    whiteRegion: AtlasRegion,
  ): void {
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

    // Shadow
    const shadowScale = 1 + arcOffset * 0.02;
    const shadowAlpha = Math.max(0.12, 0.28 - arcOffset * 0.015);
    const shadowY = player.worldPos.y - camera.y + cellSize - 6;

    batch.begin();
    batch.drawQuad(
      whiteRegion,
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
        if (atlas.has(blinkKey)) {
          spriteKey = blinkKey;
        }
      }
    }

    const resolved = resolveSprite(spriteKey, this.spriteStyle, (k) => atlas.has(k));
    const region = atlas.getRegion(resolved);
    if (region) {
      const w = region.width * scaleX;
      const h = region.height * scaleY;
      const offsetX = (region.width - w) / 2;
      const offsetY = (region.height - h) / 2;
      batch.draw(region, screenX + offsetX, screenY + offsetY, w, h);
    }

    batch.flush();
  }
}

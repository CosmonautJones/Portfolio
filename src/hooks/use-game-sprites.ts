import { useEffect, useRef, useState } from "react";
import { SpriteCache, GameRenderer } from "@/lib/game/renderer";
import { LOBSTER_SPRITES, LOBSTER_FLIP_KEYS } from "@/lib/game/sprites/lobster";
import { TILE_SPRITES } from "@/lib/game/sprites/tiles";
import { OBSTACLE_SPRITES } from "@/lib/game/sprites/obstacles";
import { COIN_SPRITES, COIN_GLOW_COLORS } from "@/lib/game/sprites/coins";
import { DECORATION_SPRITES } from "@/lib/game/sprites/decorations";
import { loadVoxelSprites, type VoxelSpriteData } from "@/lib/game/sprites/voxel-loader";
import { loadSpriteStyle, type SpriteStyle } from "@/lib/game/sprites/sprite-style";

interface UseGameSpritesResult {
  rendererRef: React.RefObject<GameRenderer | null>;
  voxelReady: boolean;
  initialSpriteStyle: SpriteStyle;
}

/**
 * Prerender all pixel sprites, load voxel sprites asynchronously,
 * and create the GameRenderer once the atlas is ready.
 *
 * Returns a ref to the renderer (populated once async init completes),
 * a boolean indicating voxel readiness, and the initial sprite style.
 */
export function useGameSprites(
  canvas: HTMLCanvasElement | null,
): UseGameSpritesResult {
  const rendererRef = useRef<GameRenderer | null>(null);
  const [voxelReady, setVoxelReady] = useState(false);
  const [initialSpriteStyle, setInitialSpriteStyle] = useState<SpriteStyle>("pixel");

  useEffect(() => {
    if (!canvas) return;

    let cancelled = false;

    // Create and prerender all sprites
    const spriteCache = new SpriteCache();

    for (const [key, pixels] of Object.entries(LOBSTER_SPRITES)) {
      spriteCache.prerender(key, pixels);
    }
    for (const { src, dest } of LOBSTER_FLIP_KEYS) {
      spriteCache.prerender(dest, LOBSTER_SPRITES[src], true);
    }
    for (const [key, pixels] of Object.entries(TILE_SPRITES)) {
      spriteCache.prerender(key, pixels);
    }
    for (const [key, pixels] of Object.entries(OBSTACLE_SPRITES)) {
      spriteCache.prerender(key, pixels);
      spriteCache.prerender(key + "_flip", pixels, true);
      // 2.5D shadow and side-face variants
      spriteCache.prerenderShadow(key + "_shadow", pixels);
      spriteCache.prerenderShadow(key + "_flip_shadow", pixels, true);
      spriteCache.prerenderDark(key + "_side", pixels);
      spriteCache.prerenderDark(key + "_flip_side", pixels, true);
    }
    // Decoration sprites
    for (const [key, pixels] of Object.entries(DECORATION_SPRITES)) {
      spriteCache.prerender(key, pixels);
      spriteCache.prerenderShadow(key + "_shadow", pixels);
    }
    // Coin sprites
    for (const [key, pixels] of Object.entries(COIN_SPRITES)) {
      spriteCache.prerender(key, pixels);
    }
    // Coin glow circles
    for (const [type, color] of Object.entries(COIN_GLOW_COLORS)) {
      spriteCache.prerenderGlow(`glow_${type}`, color, 32);
    }

    // Register voxel sprite helper
    function registerVoxelSprites(sprites: Map<string, VoxelSpriteData>) {
      for (const [, sprite] of sprites) {
        spriteCache.prerenderRaw(sprite.key, sprite.width, sprite.height, sprite.rgba);
        // Obstacle sprites get shadow + dark (side face) variants
        if (
          sprite.key.includes("car") ||
          sprite.key.includes("truck") ||
          sprite.key.includes("log")
        ) {
          spriteCache.prerenderRawShadow(
            `${sprite.key}_shadow`,
            sprite.width,
            sprite.height,
            sprite.rgba,
          );
          spriteCache.prerenderRawDark(
            `${sprite.key}_side`,
            sprite.width,
            sprite.height,
            sprite.rgba,
          );
        }
      }
    }

    const initAsync = async () => {
      // Try to load voxel sprites (non-blocking)
      try {
        const voxelSprites = await loadVoxelSprites();
        if (!cancelled) {
          registerVoxelSprites(voxelSprites);
          setVoxelReady(true);
        }
      } catch {
        // Voxel sprites failed to load -- pixel art only
      }

      if (cancelled) return;

      // Create renderer (builds atlas with all registered sprites)
      const renderer = new GameRenderer(canvas, spriteCache);
      rendererRef.current = renderer;

      // Load sprite style preference and apply
      const savedStyle = loadSpriteStyle();
      setInitialSpriteStyle(savedStyle);
      renderer.setSpriteStyle(savedStyle);
    };

    initAsync();

    return () => {
      cancelled = true;
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [canvas]);

  return { rendererRef, voxelReady, initialSpriteStyle };
}

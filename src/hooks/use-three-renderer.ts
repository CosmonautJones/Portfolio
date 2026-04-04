"use client";

import { useEffect, useRef } from "react";
import { ThreeRenderer } from "@/lib/game/renderer/three-renderer";

const VIEWPORT_WIDTH = 416; // 13 * 32
const VIEWPORT_HEIGHT = 640; // 20 * 32

/**
 * Manages ThreeRenderer lifecycle for voxel (3D isometric) mode.
 *
 * - Creates the renderer lazily on first activation.
 * - Exposes `threeRendererRef.current` when active (game loop renders 3D).
 * - Sets `threeRendererRef.current = null` when inactive (game loop falls through to WebGL2).
 * - Keeps the internal instance alive for reuse on re-activation.
 * - Destroys on unmount only.
 */
export function useThreeRenderer(
  active: boolean,
  canvasWidth: number,
  canvasHeight: number,
) {
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRendererRef = useRef<ThreeRenderer | null>(null);
  // Internal instance kept alive across toggle cycles
  const instanceRef = useRef<ThreeRenderer | null>(null);

  // Create lazily on first activation; expose/hide via threeRendererRef
  useEffect(() => {
    if (active) {
      const canvas = threeCanvasRef.current;
      if (canvas && !instanceRef.current) {
        canvas.width = VIEWPORT_WIDTH;
        canvas.height = VIEWPORT_HEIGHT;
        instanceRef.current = new ThreeRenderer(canvas);
        // Ensure correct initial size (resize effect may have fired before creation)
        if (canvasWidth > 0 && canvasHeight > 0) {
          instanceRef.current.resize(canvasWidth, canvasHeight);
        }
      }
      threeRendererRef.current = instanceRef.current;
      if (!instanceRef.current) {
        console.warn("useThreeRenderer: canvas ref not ready on activation");
      }
    } else {
      // Null the ref so the game loop falls through to WebGL2
      threeRendererRef.current = null;
    }
  }, [active, canvasWidth, canvasHeight]);

  // Forward resize to the Three.js renderer when dimensions change
  useEffect(() => {
    if (instanceRef.current && canvasWidth > 0 && canvasHeight > 0) {
      instanceRef.current.resize(canvasWidth, canvasHeight);
    }
  }, [canvasWidth, canvasHeight]);

  // Destroy on unmount only — preserve across toggle cycles
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
        threeRendererRef.current = null;
      }
    };
  }, []);

  return { threeRendererRef, threeCanvasRef };
}

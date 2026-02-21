"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createInitialState, tick } from "@/lib/game/engine";
import { DEFAULT_CONFIG } from "@/lib/game/constants";
import type {
  GameState,
  GamePhase,
  DeathCause,
  GameCallbacks,
} from "@/lib/game/types";
import { SpriteCache, GameRenderer } from "@/lib/game/renderer";
import { createInputHandler } from "@/lib/game/input";
import { LOBSTER_SPRITES, LOBSTER_FLIP_KEYS } from "@/lib/game/sprites/lobster";
import { TILE_SPRITES } from "@/lib/game/sprites/tiles";
import { OBSTACLE_SPRITES } from "@/lib/game/sprites/obstacles";

const VIEWPORT_WIDTH = 208; // 13 * 16
const VIEWPORT_HEIGHT = 320; // 20 * 16

function getDeathMessage(cause: DeathCause | null): string {
  switch (cause) {
    case "vehicle":
      return "Squished by traffic!";
    case "train":
      return "Hit by a train!";
    case "water":
      return "Fell in the water!";
    case "idle_timeout":
      return "Too slow!";
    case "off_screen":
      return "Left behind!";
    default:
      return "";
  }
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState | null>(null);

  const [phase, setPhase] = useState<GamePhase>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deathCause, setDeathCause] = useState<DeathCause | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(VIEWPORT_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(VIEWPORT_HEIGHT);

  const callbacksRef = useRef<GameCallbacks | null>(null);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = Math.max(
      1,
      Math.floor(
        Math.min(rect.width / VIEWPORT_WIDTH, rect.height / VIEWPORT_HEIGHT)
      )
    );
    setCanvasWidth(VIEWPORT_WIDTH * scale);
    setCanvasHeight(VIEWPORT_HEIGHT * scale);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    }

    // Create renderer and initial state
    const renderer = new GameRenderer(canvas, spriteCache);
    const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    gameStateRef.current = state;

    // Load high score from localStorage
    try {
      const saved = localStorage.getItem("adventure_high_score");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) {
          state.highScore = parsed;
          setHighScore(parsed);
        }
      }
    } catch {
      // localStorage unavailable
    }

    // Callbacks
    const callbacks: GameCallbacks = {
      onScoreChange: (newScore) => {
        setScore(newScore);
      },
      onPhaseChange: (newPhase) => {
        setPhase(newPhase);
      },
      onDeath: (cause) => {
        setDeathCause(cause);
        const current = gameStateRef.current;
        if (current && current.highScore > 0) {
          try {
            localStorage.setItem(
              "adventure_high_score",
              String(current.highScore)
            );
          } catch {
            // localStorage unavailable
          }
          setHighScore(current.highScore);
        }
      },
    };
    callbacksRef.current = callbacks;

    // Input handler
    const inputHandler = createInputHandler((action) => {
      if (gameStateRef.current) {
        gameStateRef.current.actionQueue.push(action);
      }
    });

    // Attach keyboard listener to window
    window.addEventListener("keydown", inputHandler.handleKeyDown);

    // Attach touch listeners to canvas
    canvas.addEventListener("touchstart", inputHandler.handleTouchStart, {
      passive: false,
    });
    canvas.addEventListener("touchend", inputHandler.handleTouchEnd);

    // Visibility change listener
    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        gameStateRef.current &&
        gameStateRef.current.phase === "playing"
      ) {
        gameStateRef.current.actionQueue.push("pause");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ResizeObserver for scaling
    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(container);
      updateScale();
    }

    // Game loop
    let rafId = 0;
    let lastTime = 0;

    const loop = (time: number) => {
      const dt = lastTime === 0 ? 0 : (time - lastTime) / 1000;
      lastTime = time;

      const cappedDt = Math.min(dt, 0.1);

      if (gameStateRef.current) {
        tick(gameStateRef.current, cappedDt, DEFAULT_CONFIG, callbacks);

        renderer.clear();
        renderer.renderLanes(gameStateRef.current);
        renderer.renderPlayer(gameStateRef.current);
        renderer.renderParticles(gameStateRef.current.particles);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", inputHandler.handleKeyDown);
      canvas.removeEventListener("touchstart", inputHandler.handleTouchStart);
      canvas.removeEventListener("touchend", inputHandler.handleTouchEnd);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      inputHandler.destroy();
    };
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full"
    >
      <div className="relative" style={{ width: canvasWidth, height: canvasHeight }}>
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="block"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            imageRendering: "pixelated",
            touchAction: "none",
          }}
          tabIndex={0}
        />

        {/* Menu overlay */}
        {phase === "menu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h1
              className="font-bold text-white mb-4"
              style={{
                fontSize: canvasWidth * 0.08,
                textShadow: "2px 2px 0 #000, -1px -1px 0 #000",
              }}
            >
              ClaudeBot&apos;s Adventure
            </h1>
            <p
              className="text-white mb-2"
              style={{
                fontSize: canvasWidth * 0.05,
                textShadow: "1px 1px 0 #000",
              }}
            >
              Press any key or tap to start
            </p>
            <p
              className="text-gray-300"
              style={{
                fontSize: canvasWidth * 0.04,
                textShadow: "1px 1px 0 #000",
              }}
            >
              WASD or Arrow Keys to move
            </p>
          </div>
        )}

        {/* Playing HUD */}
        {phase === "playing" && (
          <div className="absolute top-0 left-0 pointer-events-none p-2">
            <span
              className="text-white font-bold"
              style={{
                fontSize: canvasWidth * 0.06,
                textShadow: "1px 1px 0 #000",
              }}
            >
              Score: {score}
            </span>
          </div>
        )}

        {/* Game Over overlay */}
        {phase === "game_over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40">
            <h2
              className="font-bold text-red-400 mb-2"
              style={{
                fontSize: canvasWidth * 0.09,
                textShadow: "2px 2px 0 #000",
              }}
            >
              Game Over
            </h2>
            <p
              className="text-white mb-3"
              style={{
                fontSize: canvasWidth * 0.05,
                textShadow: "1px 1px 0 #000",
              }}
            >
              {getDeathMessage(deathCause)}
            </p>
            <p
              className="text-white mb-1"
              style={{
                fontSize: canvasWidth * 0.05,
                textShadow: "1px 1px 0 #000",
              }}
            >
              Score: {score}
            </p>
            <p
              className="text-yellow-300 mb-4"
              style={{
                fontSize: canvasWidth * 0.05,
                textShadow: "1px 1px 0 #000",
              }}
            >
              High Score: {highScore}
            </p>
            <p
              className="text-gray-300"
              style={{
                fontSize: canvasWidth * 0.04,
                textShadow: "1px 1px 0 #000",
              }}
            >
              Press any key to restart
            </p>
          </div>
        )}

        {/* Paused overlay */}
        {phase === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/60">
            <h2
              className="font-bold text-white"
              style={{
                fontSize: canvasWidth * 0.1,
                textShadow: "2px 2px 0 #000",
              }}
            >
              PAUSED
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

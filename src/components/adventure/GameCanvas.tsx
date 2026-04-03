"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { GamePhase, DeathCause } from "@/lib/game/types";
import { saveSpriteStyle, type SpriteStyle } from "@/lib/game/sprites/sprite-style";
import { useGameEngine } from "@/hooks/use-game-engine";
import { useGameSprites } from "@/hooks/use-game-sprites";
import { useVisitor } from "@/hooks/use-visitor";
import { ThreeRenderer } from "@/lib/game/renderer/three-renderer";
import { CRTOverlay } from "./CRTOverlay";
import { MenuOverlay } from "./MenuOverlay";
import { GameHUD } from "./GameHUD";
import { GameOverOverlay } from "./GameOverOverlay";
import { ScorePopups } from "./ScorePopups";
const VIEWPORT_WIDTH = 416; // 13 * 32
const VIEWPORT_HEIGHT = 640; // 20 * 32

interface GameCanvasProps {
  onScoreUpdate?: (score: number, level: number) => void;
  onPhaseChange?: (phase: GamePhase) => void;
  onDeath?: (score: number, deathCause: DeathCause) => void;
  onCoinUpdate?: (coinsCollected: number, coinBonus: number) => void;
  hasSidebars?: boolean;
}

export default function GameCanvas({
  onScoreUpdate,
  onPhaseChange: onPhaseChangeExternal,
  onDeath: onDeathExternal,
  onCoinUpdate: onCoinUpdateExternal,
  hasSidebars = false,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeRendererRef = useRef<ThreeRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Progression bridge: wire game events to site XP/achievements
  const { awardXP, unlockAchievement } = useVisitor();
  const awardXPRef = useRef(awardXP);
  awardXPRef.current = awardXP;
  const unlockAchievementRef = useRef(unlockAchievement);
  unlockAchievementRef.current = unlockAchievement;
  const [canvasWidth, setCanvasWidth] = useState(VIEWPORT_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(VIEWPORT_HEIGHT);
  const [spriteStyle, setSpriteStyle] = useState<SpriteStyle>("pixel");

  // Sprite loading and renderer creation
  const canvasEl = canvasRef.current;
  const { rendererRef, voxelReady, initialSpriteStyle } = useGameSprites(canvasEl);

  // Sync sprite style from loaded preference
  if (initialSpriteStyle !== "pixel" && spriteStyle === "pixel") {
    setSpriteStyle(initialSpriteStyle);
  }

  // Initialize ThreeRenderer when voxel mode is active
  useEffect(() => {
    if (spriteStyle === "voxel") {
      const threeCanvas = threeCanvasRef.current;
      if (threeCanvas && !threeRendererRef.current) {
        threeCanvas.width = VIEWPORT_WIDTH;
        threeCanvas.height = VIEWPORT_HEIGHT;
        threeRendererRef.current = new ThreeRenderer(threeCanvas);
      }
    }
    return () => {
      if (threeRendererRef.current) {
        threeRendererRef.current.destroy();
        threeRendererRef.current = null;
      }
    };
  }, [spriteStyle]);

  // Engine state management, game loop, callbacks
  const [engineState, controls] = useGameEngine({
    canvasRef,
    rendererRef,
    threeRendererRef,
    onScoreUpdate,
    onPhaseChange: onPhaseChangeExternal,
    onDeath: onDeathExternal,
    onCoinUpdate: onCoinUpdateExternal,
  });

  // Award XP when game starts
  const prevPhaseRef = useRef<GamePhase>("menu");
  useEffect(() => {
    if (engineState.phase === "playing" && prevPhaseRef.current !== "playing") {
      awardXPRef.current("play_game");
    }
    prevPhaseRef.current = engineState.phase;
  }, [engineState.phase]);

  // Award XP for score milestones on death
  useEffect(() => {
    if (engineState.phase === "game_over" && engineState.score > 0) {
      if (engineState.score >= 50) awardXPRef.current("score_50");
      if (engineState.score >= 100) awardXPRef.current("score_100");
      if (engineState.score >= 200) awardXPRef.current("score_200");
    }
  }, [engineState.phase, engineState.score]);

  // Fractional scaling -- allow non-integer scales, cap at 6x
  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const rawScale = Math.min(
      rect.width / VIEWPORT_WIDTH,
      rect.height / VIEWPORT_HEIGHT,
    );
    const scale = Math.max(1, Math.min(rawScale, 6));
    const w = Math.round(VIEWPORT_WIDTH * scale);
    const h = Math.round(VIEWPORT_HEIGHT * scale);
    setCanvasWidth(w);
    setCanvasHeight(h);
    // Resize the Three.js renderer if active
    if (threeRendererRef.current) {
      threeRendererRef.current.resize(w, h);
    }
  }, []);

  const toggleSpriteStyle = useCallback(() => {
    setSpriteStyle((prev) => {
      const next = prev === "pixel" ? "voxel" : "pixel";
      saveSpriteStyle(next);

      if (next === "voxel") {
        // Activate Three.js 3D renderer
        const threeCanvas = threeCanvasRef.current;
        if (threeCanvas && !threeRendererRef.current) {
          threeCanvas.width = VIEWPORT_WIDTH;
          threeCanvas.height = VIEWPORT_HEIGHT;
          threeRendererRef.current = new ThreeRenderer(threeCanvas);
        }
      } else {
        // Deactivate Three.js renderer, return to WebGL2 pixel renderer
        if (threeRendererRef.current) {
          threeRendererRef.current.destroy();
          threeRendererRef.current = null;
        }
        // Restore pixel mode on the WebGL renderer
        if (rendererRef.current) {
          rendererRef.current.setSpriteStyle("pixel");
        }
      }

      return next;
    });
  }, [rendererRef]);

  // ResizeObserver setup
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  if (containerRef.current && !resizeObserverRef.current) {
    resizeObserverRef.current = new ResizeObserver(() => updateScale());
    resizeObserverRef.current.observe(containerRef.current);
    updateScale();
  }

  const {
    phase,
    score,
    highScore,
    level,
    deathCause,
    muted,
    coinsCollected,
    coinBonus,
    combo,
    levelUpText,
    leaderboard,
    isNewHighScore,
    scorePopups,
    coinPopups,
    achievementPopup,
    unlockedAchievements,
  } = engineState;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full"
    >
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          70% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes titleFlicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.7; }
          97% { opacity: 1; }
        }
        @keyframes scoreCountUp {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes rowPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes newHighFlash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes scorePopup {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(1.1); }
        }
        @keyframes hudScorePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes achievementSlideIn {
          0% { opacity: 0; transform: translateY(-100%); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-100%); }
        }
        @keyframes coinPopup {
          0% { opacity: 1; transform: translateY(0) scale(1.2); }
          30% { opacity: 1; transform: translateY(-8px) scale(1); }
          100% { opacity: 0; transform: translateY(-25px) scale(0.9); }
        }
        @keyframes comboPop {
          0% { transform: scale(1.4); opacity: 1; }
          60% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes comboFade {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div
        className="relative"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        {/* WebGL2 pixel renderer canvas — always in DOM for input events */}
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="block"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            imageRendering: "auto",
            touchAction: "none",
            backgroundColor: "#1a1c2c",
            // In voxel mode: invisible but still captures touch events
            opacity: spriteStyle === "voxel" ? 0 : 1,
            position: "relative",
            zIndex: spriteStyle === "voxel" ? 2 : 1,
          }}
          tabIndex={0}
        />
        {/* Three.js 3D renderer canvas — overlaid when voxel mode is active */}
        <canvas
          ref={threeCanvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="block"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            touchAction: "none",
            backgroundColor: "#1a1c2c",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: "none",
            display: spriteStyle === "voxel" ? "block" : "none",
          }}
        />

        <CRTOverlay />

        {/* Achievement popup (during gameplay) */}
        {achievementPopup && phase === "playing" && (
          <div
            key={achievementPopup.key}
            className="absolute left-1/2 pointer-events-none flex items-center gap-1 px-2 py-1"
            style={{
              top: "12%",
              transform: "translateX(-50%)",
              background: "rgba(26, 28, 44, 0.9)",
              border: "1px solid #ffcd75",
              borderRadius: 4,
              animation: "achievementSlideIn 2.5s ease-out forwards",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: canvasWidth * 0.05 }}>
              {achievementPopup.emoji}
            </span>
            <span
              className="font-bold"
              style={{
                fontSize: canvasWidth * 0.032,
                color: "#ffcd75",
                textShadow: "1px 1px 0 #000",
                whiteSpace: "nowrap",
              }}
            >
              {achievementPopup.name}
            </span>
          </div>
        )}

        {phase === "menu" && (
          <MenuOverlay
            canvasWidth={canvasWidth}
            muted={muted}
            spriteStyle={spriteStyle}
            voxelReady={voxelReady}
            onToggleMute={controls.toggleMute}
            onToggleSpriteStyle={toggleSpriteStyle}
          />
        )}

        {phase === "playing" && (
          <GameHUD
            canvasWidth={canvasWidth}
            score={score}
            level={level}
            coinsCollected={coinsCollected}
            muted={muted}
            onToggleMute={controls.toggleMute}
          />
        )}

        {phase === "playing" && (
          <ScorePopups
            canvasWidth={canvasWidth}
            scorePopups={scorePopups}
            coinPopups={coinPopups}
            combo={combo}
          />
        )}

        {/* Level up flash text */}
        {levelUpText !== null && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ animation: "fadeOut 1.5s forwards" }}
          >
            <span
              className="font-bold text-yellow-300"
              style={{
                fontSize: canvasWidth * 0.12,
                textShadow: "2px 2px 0 #000, -1px -1px 0 #000",
              }}
            >
              LEVEL {levelUpText}!
            </span>
          </div>
        )}

        {phase === "game_over" && (
          <GameOverOverlay
            canvasWidth={canvasWidth}
            score={score}
            highScore={highScore}
            level={level}
            deathCause={deathCause}
            coinsCollected={coinsCollected}
            coinBonus={coinBonus}
            isNewHighScore={isNewHighScore}
            hasSidebars={hasSidebars}
            leaderboard={leaderboard}
            unlockedAchievements={unlockedAchievements}
          />
        )}

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

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
import type { LeaderboardEntry } from "@/lib/types";
import { SpriteCache, GameRenderer } from "@/lib/game/renderer";
import { createInputHandler } from "@/lib/game/input";
import { LOBSTER_SPRITES, LOBSTER_FLIP_KEYS } from "@/lib/game/sprites/lobster";
import { TILE_SPRITES } from "@/lib/game/sprites/tiles";
import { OBSTACLE_SPRITES } from "@/lib/game/sprites/obstacles";
import { COIN_SPRITES, COIN_GLOW_COLORS } from "@/lib/game/sprites/coins";
import { DECORATION_SPRITES } from "@/lib/game/sprites/decorations";
import type { Coin, CoinType } from "@/lib/game/types";
import { GameAudio } from "@/lib/game/audio";
import {
  createScreenShake,
  triggerScreenShake,
  triggerMicroShake,
  updateScreenShake,
  getShakeParams,
  createComboState,
  updateCombo,
  resetCombo,
} from "@/lib/game/effects";
import {
  submitScore,
  getLeaderboard,
  submitAchievements,
  getUserAchievements,
} from "@/actions/game-scores";
import { AchievementTracker } from "@/lib/game/achievement-tracker";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_MAP,
  TOTAL_ACHIEVEMENTS,
} from "@/lib/game/achievements";
import { CRTOverlay } from "./CRTOverlay";
import { Volume2, VolumeX } from "lucide-react";

const VIEWPORT_WIDTH = 416; // 13 * 32
const VIEWPORT_HEIGHT = 640; // 20 * 32

function getDeathIcon(cause: DeathCause | null): string {
  switch (cause) {
    case "vehicle":
      return "\u{1F697}";
    case "train":
      return "\u{1F682}";
    case "water":
      return "\u{1F30A}";
    case "idle_timeout":
      return "\u{23F0}";
    case "off_screen":
      return "\u{2B05}";
    default:
      return "";
  }
}

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

function getDeathColor(cause: string): string {
  switch (cause) {
    case "vehicle":
      return "#ef7d57";
    case "train":
      return "#ffff00";
    case "water":
      return "#41a6f6";
    case "idle_timeout":
      return "#ffcd75";
    case "off_screen":
      return "#94b0c2";
    default:
      return "#f4f4f4";
  }
}

function getRankColor(rank: number): string {
  if (rank === 1) return "#ffcd75";
  if (rank === 2) return "#94b0c2";
  if (rank === 3) return "#c4a35a";
  return "#f4f4f4";
}

function padScore(score: number): string {
  return String(score).padStart(4, "0");
}

interface AchievementPopup {
  id: string;
  name: string;
  emoji: string;
  key: number;
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState | null>(null);

  const [phase, setPhase] = useState<GamePhase>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deathCause, setDeathCause] = useState<DeathCause | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(VIEWPORT_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(VIEWPORT_HEIGHT);
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(1);
  const [levelUpText, setLevelUpText] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [scorePopups, setScorePopups] = useState<number[]>([]);
  const [coinPopups, setCoinPopups] = useState<{ id: number; value: number; type: CoinType }[]>([]);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [coinBonus, setCoinBonus] = useState(0);
  const [combo, setCombo] = useState(0);
  const popupIdRef = useRef(0);
  const audioRef = useRef<GameAudio | null>(null);
  const screenShakeRef = useRef(createScreenShake());
  const comboRef = useRef(createComboState());
  const achievementTrackerRef = useRef<AchievementTracker | null>(null);
  const [achievementPopup, setAchievementPopup] =
    useState<AchievementPopup | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(
    new Set(),
  );
  const achievementPopupKeyRef = useRef(0);

  // Stable refs for external callbacks so the effect doesn't re-run
  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;
  const onPhaseChangeExternalRef = useRef(onPhaseChangeExternal);
  onPhaseChangeExternalRef.current = onPhaseChangeExternal;
  const onDeathExternalRef = useRef(onDeathExternal);
  onDeathExternalRef.current = onDeathExternal;
  const onCoinUpdateExternalRef = useRef(onCoinUpdateExternal);
  onCoinUpdateExternalRef.current = onCoinUpdateExternal;

  const callbacksRef = useRef<GameCallbacks | null>(null);

  // Fractional scaling — allow non-integer scales, cap at 6x
  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const rawScale = Math.min(
      rect.width / VIEWPORT_WIDTH,
      rect.height / VIEWPORT_HEIGHT,
    );
    const scale = Math.max(1, Math.min(rawScale, 6));
    setCanvasWidth(Math.round(VIEWPORT_WIDTH * scale));
    setCanvasHeight(Math.round(VIEWPORT_HEIGHT * scale));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newMuted = !audio.isMuted();
      audio.setMuted(newMuted);
      setMuted(newMuted);
    }
  }, []);

  const showAchievementPopup = useCallback(
    (achievementId: string) => {
      const def = ACHIEVEMENT_MAP.get(achievementId);
      if (!def) return;
      const key = achievementPopupKeyRef.current++;
      setAchievementPopup({ id: def.id, name: def.name, emoji: def.emoji, key });
      setUnlockedAchievements((prev) => new Set([...prev, achievementId]));
      audioRef.current?.playAchievement();
      setTimeout(() => {
        setAchievementPopup((current) =>
          current?.key === key ? null : current,
        );
      }, 2500);
    },
    [],
  );

  const processUnlocks = useCallback(
    (unlocks: Array<{ achievementId: string; score: number }>) => {
      if (unlocks.length === 0) return;
      unlocks.forEach((u, i) => {
        setTimeout(() => showAchievementPopup(u.achievementId), i * 800);
      });
    },
    [showAchievementPopup],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create audio manager
    const audio = new GameAudio();
    audioRef.current = audio;

    // Initialize achievement tracker
    const deathHistory = AchievementTracker.loadDeathHistory();
    const tracker = new AchievementTracker([], deathHistory);
    achievementTrackerRef.current = tracker;

    // Fetch unlocked achievements from server
    getUserAchievements()
      .then((result) => {
        if (result.achievementIds.length > 0) {
          const serverTracker = new AchievementTracker(
            result.achievementIds,
            deathHistory,
          );
          achievementTrackerRef.current = serverTracker;
          setUnlockedAchievements(new Set(result.achievementIds));
        }
      })
      .catch(() => {});

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

    // Load mute state
    try {
      setMuted(localStorage.getItem("adventure_muted") === "true");
    } catch {
      // localStorage unavailable
    }

    // Fetch initial leaderboard
    getLeaderboard()
      .then((result) => {
        if (result.scores) setLeaderboard(result.scores);
      })
      .catch(() => {});

    // Callbacks
    const callbacks: GameCallbacks = {
      onScoreChange: (newScore) => {
        setScore(newScore);
        audio.playScore();

        // Track combo — update on each forward hop that increments score
        const now = performance.now() / 1000;
        const currentCombo = updateCombo(comboRef.current, now);
        setCombo(currentCombo);
        // Clear combo display after 1.5s of inactivity
        setTimeout(() => {
          setCombo((prev) => (prev === currentCombo ? 0 : prev));
        }, 1500);

        const id = popupIdRef.current++;
        setScorePopups((prev) => [...prev, id]);
        setTimeout(() => {
          setScorePopups((prev) => prev.filter((p) => p !== id));
        }, 600);
        // Notify parent
        const gs = gameStateRef.current;
        if (gs) onScoreUpdateRef.current?.(newScore, gs.level);

        // Achievement tracking
        const t = achievementTrackerRef.current;
        if (t) {
          const unlocks = t.onScoreChange(newScore);
          if (unlocks.length > 0) processUnlocks(unlocks);
        }
      },
      onPhaseChange: (newPhase) => {
        setPhase(newPhase);
        onPhaseChangeExternalRef.current?.(newPhase);
        if (newPhase === "playing") {
          audio.init();
          audio.playStart();
          setLevel(1);
          setIsNewHighScore(false);
          setCoinsCollected(0);
          setCoinBonus(0);
          setCombo(0);
          resetCombo(comboRef.current);

          // Reset tracker and renderer state for new game
          const t = achievementTrackerRef.current;
          const current = gameStateRef.current;
          if (t && current) {
            t.resetForNewGame(current.highScore);
          }
          renderer.resetState();
        }
      },
      onDeath: (cause, finalScore) => {
        setDeathCause(cause);
        if (cause === "water") {
          audio.playSplash();
        } else {
          audio.playDeath();
        }

        // Screen shake with directional bias
        const { intensity, duration, biasX, biasY } = getShakeParams(cause);
        triggerScreenShake(screenShakeRef.current, intensity, duration, biasX, biasY);
        // Reset combo on death
        setCombo(0);
        resetCombo(comboRef.current);

        const current = gameStateRef.current;
        setIsNewHighScore(
          finalScore > 0 && current !== null && finalScore >= current.highScore,
        );
        if (current && current.highScore > 0) {
          try {
            localStorage.setItem(
              "adventure_high_score",
              String(current.highScore),
            );
          } catch {
            // localStorage unavailable
          }
          setHighScore(current.highScore);
        }

        // Achievement tracking — death achievements
        const t = achievementTrackerRef.current;
        if (t) {
          const deathUnlocks = t.onDeath(cause, finalScore);
          if (deathUnlocks.length > 0) processUnlocks(deathUnlocks);

          // Flush all pending and persist to server
          const allUnlocks = t.flushPendingUnlocks();
          if (allUnlocks.length > 0) {
            submitAchievements(allUnlocks).catch(() => {});
          }

          // Save death history to localStorage
          AchievementTracker.saveDeathHistory(t.getDeathCausesSeen());
        }

        // Submit score to leaderboard (fire-and-forget)
        const gs = gameStateRef.current;
        submitScore(
          finalScore,
          cause,
          "adventure",
          gs?.coinsCollected ?? 0,
          gs?.coinBonusScore ?? 0,
        ).catch(() => {});
        // Refresh leaderboard
        getLeaderboard()
          .then((result) => {
            if (result.scores) setLeaderboard(result.scores);
          })
          .catch(() => {});
        // Notify parent
        onDeathExternalRef.current?.(finalScore, cause);
      },
      onHop: () => {
        audio.playHop();
      },
      onCoinCollect: (coin: Coin, bonusPoints: number) => {
        setCoinsCollected((prev) => {
          const next = prev + 1;
          const gs = gameStateRef.current;
          onCoinUpdateExternalRef.current?.(next, (gs?.coinBonusScore ?? 0));

          // Achievement tracking for coins
          const t = achievementTrackerRef.current;
          if (t) {
            const unlocks = t.onCoinCollect(coin.type, next, gs?.score ?? 0);
            if (unlocks.length > 0) processUnlocks(unlocks);
          }

          return next;
        });
        setCoinBonus((prev) => prev + bonusPoints);
        audio.playCoinCollect(coin.type);
        triggerMicroShake(screenShakeRef.current);

        // Coin score popup
        const id = popupIdRef.current++;
        setCoinPopups((prev) => [...prev, { id, value: bonusPoints, type: coin.type }]);
        setTimeout(() => {
          setCoinPopups((prev) => prev.filter((p) => p.id !== id));
        }, 800);
      },
      onLevelUp: (newLevel) => {
        setLevel(newLevel);
        audio.playLevelUp();
        setLevelUpText(newLevel);
        setTimeout(() => setLevelUpText(null), 1500);
        // Notify parent
        const gs = gameStateRef.current;
        if (gs) onScoreUpdateRef.current?.(gs.score, newLevel);

        // Achievement tracking
        const t = achievementTrackerRef.current;
        if (t) {
          const unlocks = t.onLevelUp(newLevel, gameStateRef.current?.score ?? 0);
          if (unlocks.length > 0) processUnlocks(unlocks);
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
        const prevRiding = gameStateRef.current.player.ridingLogId;
        tick(gameStateRef.current, cappedDt, DEFAULT_CONFIG, callbacks);

        // Detect log landing — play thud when player starts riding a log
        const nowRiding = gameStateRef.current.player.ridingLogId;
        if (nowRiding !== null && prevRiding === null) {
          audio.playLogLand();
          triggerMicroShake(screenShakeRef.current, 0, 0.5);

          // Achievement tracking — log ride
          const t = achievementTrackerRef.current;
          if (t) {
            const unlocks = t.onLogRide(gameStateRef.current.score);
            if (unlocks.length > 0) processUnlocks(unlocks);
          }
        }

        // Update screen shake
        const shake = updateScreenShake(screenShakeRef.current, cappedDt);

        // WebGL2 rendering pipeline
        renderer.beginFrame();
        renderer.renderBackground(gameStateRef.current.animationTime);

        // Apply screen shake via projection matrix offset (both axes)
        if (shake.offsetX !== 0 || shake.offsetY !== 0) {
          renderer.setShakeOffset(
            Math.round(shake.offsetX),
            Math.round(shake.offsetY),
          );
        }

        renderer.renderLanes(gameStateRef.current);
        renderer.renderAmbientEffects(gameStateRef.current);
        renderer.renderCoins(gameStateRef.current);
        renderer.renderPlayer(gameStateRef.current);
        renderer.renderParticles(
          gameStateRef.current.particles,
          gameStateRef.current.camera.y,
        );

        // Clear shake offset after rendering
        if (shake.offsetX !== 0 || shake.offsetY !== 0) {
          renderer.clearShakeOffset();
        }

        // Post-processing: bloom, vignette, chromatic aberration
        renderer.endFrame(gameStateRef.current.animationTime);
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
      audio.destroy();
      renderer.destroy();
    };
  }, [updateScale, processUnlocks]);

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
          }}
          tabIndex={0}
        />

        {/* CRT scanline overlay */}
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
            <button
              onClick={toggleMute}
              className="pointer-events-auto mt-4 p-1.5 rounded hover:bg-white/20 transition-colors"
            >
              {muted ? (
                <VolumeX
                  className="text-white/50"
                  style={{
                    width: canvasWidth * 0.06,
                    height: canvasWidth * 0.06,
                  }}
                />
              ) : (
                <Volume2
                  className="text-white/50"
                  style={{
                    width: canvasWidth * 0.06,
                    height: canvasWidth * 0.06,
                  }}
                />
              )}
            </button>
          </div>
        )}

        {/* Playing HUD */}
        {phase === "playing" && (
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none p-2 flex justify-between items-start"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
            }}
          >
            <div className="flex gap-3">
              <span
                className="font-bold font-mono"
                style={{
                  fontSize: canvasWidth * 0.07,
                  color: "#f4f4f4",
                  textShadow:
                    "2px 2px 0 #1a1c2c, -1px -1px 0 #1a1c2c, 1px -1px 0 #1a1c2c, -1px 1px 0 #1a1c2c",
                }}
              >
                {padScore(score)}
              </span>
              <span
                className="font-bold"
                style={{
                  fontSize: canvasWidth * 0.055,
                  color: "#ffcd75",
                  textShadow: "1px 1px 0 #1a1c2c, -1px -1px 0 #1a1c2c",
                }}
              >
                LVL {level}
              </span>
              {coinsCollected > 0 && (
                <span
                  className="font-bold font-mono"
                  style={{
                    fontSize: canvasWidth * 0.05,
                    color: "#ffcd75",
                    textShadow: "1px 1px 0 #1a1c2c, -1px -1px 0 #1a1c2c",
                  }}
                >
                  {coinsCollected}
                </span>
              )}
            </div>
            <button
              onClick={toggleMute}
              className="pointer-events-auto p-1 rounded hover:bg-white/20 transition-colors"
            >
              {muted ? (
                <VolumeX
                  className="text-white/70"
                  style={{
                    width: canvasWidth * 0.06,
                    height: canvasWidth * 0.06,
                  }}
                />
              ) : (
                <Volume2
                  className="text-white/70"
                  style={{
                    width: canvasWidth * 0.06,
                    height: canvasWidth * 0.06,
                  }}
                />
              )}
            </button>
          </div>
        )}

        {/* Score popups — positioned near center of canvas */}
        {phase === "playing" &&
          scorePopups.map((id) => (
            <div
              key={id}
              className="absolute pointer-events-none font-bold font-mono"
              style={{
                top: "40%",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: canvasWidth * 0.06,
                color: "#a7f070",
                textShadow: "1px 1px 0 #1a1c2c, 0 0 4px rgba(167, 240, 112, 0.5)",
                animation: "scorePopup 0.6s ease-out forwards",
              }}
            >
              +1
            </div>
          ))}

        {/* Combo indicator — shows when combo >= 2 */}
        {phase === "playing" && combo >= 2 && (
          <div
            key={combo}
            className="absolute pointer-events-none font-bold"
            style={{
              top: "48%",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: canvasWidth * 0.048,
              color: combo >= 6 ? "#ef7d57" : combo >= 4 ? "#ffcd75" : "#a7f070",
              textShadow: `1px 1px 0 #1a1c2c, 0 0 8px ${combo >= 6 ? "#ef7d57" : combo >= 4 ? "#ffcd75" : "#a7f070"}80`,
              animation: "comboPop 0.3s ease-out forwards, comboFade 1.5s ease-in 0s forwards",
              whiteSpace: "nowrap",
            }}
          >
            x{combo} COMBO
          </div>
        )}

        {/* Coin collection popups */}
        {phase === "playing" &&
          coinPopups.map((popup) => {
            const colors: Record<CoinType, string> = {
              gold: "#ffcd75",
              silver: "#94b0c2",
              diamond: "#73eff7",
              ruby: "#b13e53",
            };
            return (
              <div
                key={popup.id}
                className="absolute pointer-events-none font-bold font-mono"
                style={{
                  top: "35%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: canvasWidth * 0.055,
                  color: colors[popup.type],
                  textShadow: `1px 1px 0 #1a1c2c, 0 0 6px ${colors[popup.type]}80`,
                  animation: "coinPopup 0.8s ease-out forwards",
                }}
              >
                +{popup.value}
              </div>
            );
          })}

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

        {/* Game Over overlay */}
        {phase === "game_over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/70">
            {/* Retro frame */}
            <div
              className="flex flex-col items-center px-3 py-3"
              style={{
                width: "90%",
                maxHeight: "88%",
                background: "#1a1c2c",
                border: "2px solid #ffcd75",
                boxShadow:
                  "inset 0 0 0 1px #1a1c2c, inset 0 0 0 3px #c4a35a",
                overflow: "hidden",
              }}
            >
              {/* GAME OVER title */}
              <h2
                className="font-bold mb-1"
                style={{
                  fontSize: canvasWidth * 0.1,
                  color: "#d4513b",
                  textShadow:
                    "0 0 8px #d4513b, 0 0 16px #b13e53, 0 0 24px #9e2835, 2px 2px 0 #000",
                  animation: "titleFlicker 3s infinite",
                }}
              >
                GAME OVER
              </h2>

              {/* Death cause with icon */}
              <p
                className="mb-2"
                style={{
                  fontSize: canvasWidth * 0.045,
                  color: deathCause
                    ? getDeathColor(deathCause)
                    : "#f4f4f4",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                {getDeathIcon(deathCause)} {getDeathMessage(deathCause)}
              </p>

              {/* Score display */}
              <div
                className="font-mono font-bold mb-1"
                style={{
                  fontSize: canvasWidth * 0.08,
                  color: "#f4f4f4",
                  textShadow: "2px 2px 0 #000",
                  animation: "scoreCountUp 0.5s ease-out",
                }}
              >
                SCORE: {padScore(score)}
              </div>

              {/* Coin breakdown */}
              {coinsCollected > 0 && (
                <div
                  className="font-mono mb-1"
                  style={{
                    fontSize: canvasWidth * 0.04,
                    color: "#ffcd75",
                    textShadow: "1px 1px 0 #000",
                  }}
                >
                  COINS: {coinsCollected} (+{coinBonus})
                </div>
              )}

              <div
                className="font-mono mb-1"
                style={{
                  fontSize: canvasWidth * 0.04,
                  color: "#94b0c2",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                LVL {level} | BEST: {padScore(highScore)}
              </div>

              {/* New high score flash */}
              {isNewHighScore && (
                <div
                  className="font-bold mb-1"
                  style={{
                    fontSize: canvasWidth * 0.05,
                    color: "#ffcd75",
                    textShadow: "0 0 8px #ffcd75, 0 0 16px #ef7d57",
                    animation: "newHighFlash 0.8s infinite",
                  }}
                >
                  NEW HIGH SCORE!
                </div>
              )}

              {/* Leaderboard — only show inline on mobile (no sidebars) */}
              {!hasSidebars && leaderboard.length > 0 && (
                <div
                  className="w-full mt-1 overflow-y-auto"
                  style={{
                    maxHeight: "35%",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#566c86 #1a1c2c",
                  }}
                >
                  {/* Header */}
                  <div
                    className="text-center font-bold mb-1"
                    style={{
                      fontSize: canvasWidth * 0.05,
                      color: "#ffcd75",
                      textShadow: "1px 1px 0 #000",
                    }}
                  >
                    HIGH SCORES
                  </div>
                  <div
                    className="mx-auto mb-1"
                    style={{
                      width: "60%",
                      height: 1,
                      background:
                        "linear-gradient(to right, transparent, #ffcd75, transparent)",
                    }}
                  />

                  {/* Score rows */}
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center px-1 py-0.5 font-mono"
                      style={{
                        fontSize: canvasWidth * 0.032,
                        color: entry.isCurrentUser
                          ? "#ffcd75"
                          : entry.rank <= 3
                            ? getRankColor(entry.rank)
                            : "#94b0c2",
                        textShadow: "1px 1px 0 #000",
                        ...(entry.isCurrentUser
                          ? {
                              background: "rgba(255, 205, 117, 0.1)",
                              animation: "rowPulse 2s infinite",
                            }
                          : {}),
                      }}
                    >
                      {/* Rank */}
                      <span
                        className="font-bold shrink-0"
                        style={{
                          width: canvasWidth * 0.08,
                          color: getRankColor(entry.rank),
                        }}
                      >
                        {entry.isCurrentUser ? ">>>" : `#${entry.rank}`}
                      </span>
                      {/* Display name */}
                      <span
                        className="truncate shrink-1 mx-0.5"
                        style={{
                          maxWidth: canvasWidth * 0.25,
                          fontSize: canvasWidth * 0.028,
                          color: entry.isCurrentUser ? "#ffcd75" : "#73869c",
                        }}
                      >
                        {entry.displayName ?? "???"}
                      </span>
                      {/* Dot leader */}
                      <span
                        className="flex-1 overflow-hidden mx-1"
                        style={{
                          borderBottom:
                            "1px dotted rgba(148, 176, 194, 0.3)",
                        }}
                      />
                      {/* Death cause badge */}
                      <span
                        className="mx-0.5 shrink-0"
                        style={{
                          fontSize: canvasWidth * 0.025,
                          color: getDeathColor(entry.deathCause),
                          opacity: 0.8,
                        }}
                      >
                        {getDeathIcon(entry.deathCause as DeathCause)}
                      </span>
                      {/* Score */}
                      <span className="font-bold shrink-0">
                        {padScore(entry.score)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievement grid */}
              <div className="w-full mt-2">
                <div
                  className="text-center font-bold mb-1"
                  style={{
                    fontSize: canvasWidth * 0.035,
                    color: "#94b0c2",
                    textShadow: "1px 1px 0 #000",
                  }}
                >
                  ACHIEVEMENTS ({unlockedAchievements.size}/{TOTAL_ACHIEVEMENTS})
                </div>
                <div
                  className="flex flex-wrap justify-center gap-1 px-1"
                >
                  {ACHIEVEMENTS.map((a) => {
                    const isUnlocked = unlockedAchievements.has(a.id);
                    return (
                      <div
                        key={a.id}
                        title={
                          isUnlocked
                            ? `${a.name}: ${a.description}`
                            : "???"
                        }
                        className="pointer-events-auto cursor-default"
                        style={{
                          fontSize: canvasWidth * 0.045,
                          opacity: isUnlocked ? 1 : 0.25,
                          filter: isUnlocked ? "none" : "grayscale(1)",
                          transition: "opacity 0.3s, filter 0.3s",
                        }}
                      >
                        {a.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Restart prompt */}
              <p
                className="mt-2"
                style={{
                  fontSize: canvasWidth * 0.035,
                  color: "#566c86",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                Press any key to restart
              </p>
            </div>
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

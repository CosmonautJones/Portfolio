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
import { GameAudio } from "@/lib/game/audio";
import { submitScore, getLeaderboard } from "@/actions/game-scores";
import { Volume2, VolumeX } from "lucide-react";

const VIEWPORT_WIDTH = 208; // 13 * 16
const VIEWPORT_HEIGHT = 320; // 20 * 16

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
  const [muted, setMuted] = useState(false);
  const [level, setLevel] = useState(1);
  const [levelUpText, setLevelUpText] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      id: string;
      rank: number;
      score: number;
      deathCause: string;
      isCurrentUser: boolean;
    }>
  >([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const audioRef = useRef<GameAudio | null>(null);

  const callbacksRef = useRef<GameCallbacks | null>(null);

  const updateScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = Math.max(
      1,
      Math.floor(
        Math.min(rect.width / VIEWPORT_WIDTH, rect.height / VIEWPORT_HEIGHT),
      ),
    );
    setCanvasWidth(VIEWPORT_WIDTH * scale);
    setCanvasHeight(VIEWPORT_HEIGHT * scale);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      const newMuted = !audio.isMuted();
      audio.setMuted(newMuted);
      setMuted(newMuted);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create audio manager
    const audio = new GameAudio();
    audioRef.current = audio;

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
      },
      onPhaseChange: (newPhase) => {
        setPhase(newPhase);
        if (newPhase === "playing") {
          audio.init();
          audio.playStart();
          setLevel(1);
          setIsNewHighScore(false);
        }
      },
      onDeath: (cause, finalScore) => {
        setDeathCause(cause);
        if (cause === "water") {
          audio.playSplash();
        } else {
          audio.playDeath();
        }
        const current = gameStateRef.current;
        // highScore state holds the *previous* high; engine already updated state.highScore
        setIsNewHighScore(finalScore > 0 && current !== null && finalScore >= current.highScore);
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
        // Submit score to leaderboard (fire-and-forget)
        submitScore(finalScore, cause).catch(() => {});
        // Refresh leaderboard
        getLeaderboard()
          .then((result) => {
            if (result.scores) setLeaderboard(result.scores);
          })
          .catch(() => {});
      },
      onHop: () => {
        audio.playHop();
      },
      onLevelUp: (newLevel) => {
        setLevel(newLevel);
        audio.playLevelUp();
        setLevelUpText(newLevel);
        setTimeout(() => setLevelUpText(null), 1500);
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
        }

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
                  textShadow:
                    "1px 1px 0 #1a1c2c, -1px -1px 0 #1a1c2c",
                }}
              >
                LVL {level}
              </span>
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
                boxShadow: "inset 0 0 0 1px #1a1c2c, inset 0 0 0 3px #c4a35a",
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
                  color: deathCause ? getDeathColor(deathCause) : "#f4f4f4",
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

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div
                  className="w-full mt-1 overflow-y-auto"
                  style={{
                    maxHeight: "45%",
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
                        fontSize: canvasWidth * 0.035,
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
                        className="font-bold"
                        style={{
                          width: canvasWidth * 0.08,
                          color: getRankColor(entry.rank),
                        }}
                      >
                        {entry.isCurrentUser ? ">>>" : `#${entry.rank}`}
                      </span>
                      {/* Dot leader */}
                      <span
                        className="flex-1 overflow-hidden mx-1"
                        style={{
                          borderBottom: "1px dotted rgba(148, 176, 194, 0.3)",
                        }}
                      />
                      {/* Death cause badge */}
                      <span
                        className="mx-1"
                        style={{
                          fontSize: canvasWidth * 0.025,
                          color: getDeathColor(entry.deathCause),
                          opacity: 0.8,
                        }}
                      >
                        {getDeathIcon(entry.deathCause as DeathCause)}
                      </span>
                      {/* Score */}
                      <span className="font-bold">
                        {padScore(entry.score)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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

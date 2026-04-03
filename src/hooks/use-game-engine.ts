import { useEffect, useRef, useState, useCallback } from "react";
import { createInitialState, tick } from "@/lib/game/engine";
import { DEFAULT_CONFIG } from "@/lib/game/constants";
import type {
  GameState,
  GamePhase,
  DeathCause,
  GameCallbacks,
  Coin,
  CoinType,
} from "@/lib/game/types";
import type { LeaderboardEntry } from "@/lib/types";
import type { GameRenderer } from "@/lib/game/renderer";
import type { RenderState } from "@/lib/game/renderer/render-pass";
import type { ThreeRenderer } from "@/lib/game/renderer/three-renderer";
import { createInputHandler } from "@/lib/game/input";
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
import { ACHIEVEMENT_MAP } from "@/lib/game/achievements";
import type { AchievementPopup } from "@/components/adventure/game-helpers";

const VIEWPORT_HEIGHT = 640;

export interface GameEngineState {
  phase: GamePhase;
  score: number;
  highScore: number;
  level: number;
  deathCause: DeathCause | null;
  muted: boolean;
  coinsCollected: number;
  coinBonus: number;
  combo: number;
  levelUpText: number | null;
  leaderboard: LeaderboardEntry[];
  isNewHighScore: boolean;
  scorePopups: number[];
  coinPopups: { id: number; value: number; type: CoinType }[];
  achievementPopup: AchievementPopup | null;
  unlockedAchievements: Set<string>;
}

export interface GameEngineControls {
  toggleMute: () => void;
  gameStateRef: React.RefObject<GameState | null>;
  audioRef: React.RefObject<GameAudio | null>;
  rendererRef: React.RefObject<GameRenderer | null>;
}

interface UseGameEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rendererRef: React.RefObject<GameRenderer | null>;
  threeRendererRef?: React.RefObject<ThreeRenderer | null>;
  onScoreUpdate?: (score: number, level: number) => void;
  onPhaseChange?: (phase: GamePhase) => void;
  onDeath?: (score: number, deathCause: DeathCause) => void;
  onCoinUpdate?: (coinsCollected: number, coinBonus: number) => void;
}

export function useGameEngine({
  canvasRef,
  rendererRef,
  threeRendererRef,
  onScoreUpdate,
  onPhaseChange: onPhaseChangeExternal,
  onDeath: onDeathExternal,
  onCoinUpdate: onCoinUpdateExternal,
}: UseGameEngineProps): [GameEngineState, GameEngineControls] {
  const gameStateRef = useRef<GameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deathCause, setDeathCause] = useState<DeathCause | null>(null);
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
  const [achievementPopup, setAchievementPopup] = useState<AchievementPopup | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());

  const popupIdRef = useRef(0);
  const audioRef = useRef<GameAudio | null>(null);
  const screenShakeRef = useRef(createScreenShake());
  const comboRef = useRef(createComboState());
  const achievementTrackerRef = useRef<AchievementTracker | null>(null);
  const achievementPopupKeyRef = useRef(0);

  // Stable refs for external callbacks
  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;
  const onPhaseChangeExternalRef = useRef(onPhaseChangeExternal);
  onPhaseChangeExternalRef.current = onPhaseChangeExternal;
  const onDeathExternalRef = useRef(onDeathExternal);
  onDeathExternalRef.current = onDeathExternal;
  const onCoinUpdateExternalRef = useRef(onCoinUpdateExternal);
  onCoinUpdateExternalRef.current = onCoinUpdateExternal;

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

    // Create initial state
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

        const now = performance.now() / 1000;
        const currentCombo = updateCombo(comboRef.current, now);
        setCombo(currentCombo);
        setTimeout(() => {
          setCombo((prev) => (prev === currentCombo ? 0 : prev));
        }, 1500);

        const id = popupIdRef.current++;
        setScorePopups((prev) => [...prev, id]);
        setTimeout(() => {
          setScorePopups((prev) => prev.filter((p) => p !== id));
        }, 600);
        const gs = gameStateRef.current;
        if (gs) onScoreUpdateRef.current?.(newScore, gs.level);

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

          const t = achievementTrackerRef.current;
          const current = gameStateRef.current;
          if (t && current) {
            t.resetForNewGame(current.highScore);
          }
          rendererRef.current?.resetState();
        }
      },
      onDeath: (cause, finalScore) => {
        setDeathCause(cause);
        if (cause === "water") {
          audio.playSplash();
        } else {
          audio.playDeath();
        }

        const { intensity, duration, biasX, biasY } = getShakeParams(cause);
        triggerScreenShake(screenShakeRef.current, intensity, duration, biasX, biasY);
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

        const t = achievementTrackerRef.current;
        if (t) {
          const deathUnlocks = t.onDeath(cause, finalScore);
          if (deathUnlocks.length > 0) processUnlocks(deathUnlocks);
          const allUnlocks = t.flushPendingUnlocks();
          if (allUnlocks.length > 0) {
            submitAchievements(allUnlocks).catch(() => {});
          }
          AchievementTracker.saveDeathHistory(t.getDeathCausesSeen());
        }

        const gs = gameStateRef.current;
        submitScore(
          finalScore,
          cause,
          "adventure",
          gs?.coinsCollected ?? 0,
          gs?.coinBonusScore ?? 0,
        ).catch(() => {});
        getLeaderboard()
          .then((result) => {
            if (result.scores) setLeaderboard(result.scores);
          })
          .catch(() => {});
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
        const gs = gameStateRef.current;
        if (gs) onScoreUpdateRef.current?.(gs.score, newLevel);

        const t = achievementTrackerRef.current;
        if (t) {
          const unlocks = t.onLevelUp(newLevel, gameStateRef.current?.score ?? 0);
          if (unlocks.length > 0) processUnlocks(unlocks);
        }
      },
    };

    // Input handler
    const inputHandler = createInputHandler((action) => {
      if (gameStateRef.current) {
        gameStateRef.current.actionQueue.push(action);
      }
    });

    window.addEventListener("keydown", inputHandler.handleKeyDown);
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

    // Game loop
    let rafId = 0;
    let lastTime = 0;

    const loop = (time: number) => {
      const dt = lastTime === 0 ? 0 : (time - lastTime) / 1000;
      lastTime = time;

      const cappedDt = Math.min(dt, 0.1);
      const r = rendererRef.current;

      if (gameStateRef.current && (r || threeRendererRef?.current)) {
        const prevRiding = gameStateRef.current.player.ridingLogId;
        tick(gameStateRef.current, cappedDt, DEFAULT_CONFIG, callbacks);

        const nowRiding = gameStateRef.current.player.ridingLogId;
        if (nowRiding !== null && prevRiding === null) {
          audio.playLogLand();
          triggerMicroShake(screenShakeRef.current, 0, 0.5);

          const t = achievementTrackerRef.current;
          if (t) {
            const unlocks = t.onLogRide(gameStateRef.current.score);
            if (unlocks.length > 0) processUnlocks(unlocks);
          }
        }

        const shake = updateScreenShake(screenShakeRef.current, cappedDt);

        // Three.js 3D renderer path — single render() call with RenderState
        const tr = threeRendererRef?.current;
        if (tr) {
          const gs = gameStateRef.current;
          let deathProgress = 0;
          let deathPosition: { x: number; y: number } | null = null;
          if (gs.phase === "game_over" && gs.deathCause !== null) {
            deathProgress = Math.min(1, gs.dyingTimer / gs.dyingDuration);
            deathPosition = { x: gs.player.worldPos.x, y: gs.player.worldPos.y };
          }
          const renderState: RenderState = {
            phase: gs.phase,
            player: gs.player,
            lanes: gs.lanes,
            camera: gs.camera,
            particles: gs.particles,
            coins: gs.coins,
            animationTime: gs.animationTime,
            score: gs.score,
            level: gs.level,
            deathCause: gs.deathCause,
            deathProgress,
            deathPosition,
          };
          tr.render(renderState);
        }

        // WebGL2 pixel renderer path
        if (r && !tr) {
          r.beginFrame();
          r.renderBackground(gameStateRef.current.animationTime);

          if (shake.offsetX !== 0 || shake.offsetY !== 0) {
            r.setShakeOffset(
              Math.round(shake.offsetX),
              Math.round(shake.offsetY),
            );
          }

          r.renderLanes(gameStateRef.current);
          r.renderAmbientEffects(gameStateRef.current);
          r.renderCoins(gameStateRef.current);
          r.renderPlayer(gameStateRef.current);
          r.renderParticles(
            gameStateRef.current.particles,
            gameStateRef.current.camera.y,
          );

          if (shake.offsetX !== 0 || shake.offsetY !== 0) {
            r.clearShakeOffset();
          }

          r.endFrame(gameStateRef.current.animationTime);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", inputHandler.handleKeyDown);
      canvas.removeEventListener("touchstart", inputHandler.handleTouchStart);
      canvas.removeEventListener("touchend", inputHandler.handleTouchEnd);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      inputHandler.destroy();
      audio.destroy();
    };
  }, [canvasRef, rendererRef, threeRendererRef, processUnlocks]);

  const engineState: GameEngineState = {
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
  };

  const controls: GameEngineControls = {
    toggleMute,
    gameStateRef,
    audioRef,
    rendererRef,
  };

  return [engineState, controls];
}

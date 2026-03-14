// ============================================================================
// Engine Worker — runs game logic in a dedicated Web Worker thread
// ============================================================================

import { createInitialState, tick, resetForNewGame } from "./engine";
import type { GameState, GameConfig, GameCallbacks, GamePhase, DeathCause, Coin } from "./types";
import type { WorkerMessage, WorkerResponse } from "./engine-bridge";
import type { RenderState } from "./renderer/render-pass";

let state: GameState | null = null;
let config: GameConfig | null = null;
let callbacks: GameCallbacks | null = null;
let paused = false;
let loopId: ReturnType<typeof setInterval> | null = null;
let lastTime = 0;

function postResponse(msg: WorkerResponse): void {
  self.postMessage(msg);
}

function buildRenderState(s: GameState): RenderState {
  return {
    phase: s.phase,
    player: s.player,
    lanes: s.lanes,
    camera: s.camera,
    particles: s.particles,
    coins: s.coins,
    animationTime: s.animationTime,
    score: s.score,
    level: s.level,
    deathCause: s.deathCause,
    deathProgress: 0,
    deathPosition: null,
  };
}

function createCallbacks(): GameCallbacks {
  return {
    onScoreChange(score: number) {
      postResponse({ type: "callback", name: "onScoreChange", args: [score] });
    },
    onPhaseChange(phase: GamePhase) {
      postResponse({ type: "callback", name: "onPhaseChange", args: [phase] });
    },
    onDeath(cause: DeathCause, finalScore: number) {
      postResponse({ type: "callback", name: "onDeath", args: [cause, finalScore] });
    },
    onHop() {
      postResponse({ type: "callback", name: "onHop", args: [] });
    },
    onLevelUp(level: number) {
      postResponse({ type: "callback", name: "onLevelUp", args: [level] });
    },
    onCoinCollect(coin: Coin, bonusPoints: number) {
      postResponse({ type: "callback", name: "onCoinCollect", args: [coin, bonusPoints] });
    },
  };
}

function startLoop(): void {
  if (loopId !== null) return;

  lastTime = performance.now();
  loopId = setInterval(() => {
    if (paused || !state || !config || !callbacks) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    tick(state, dt, config, callbacks);

    // Post render state to main thread
    postResponse({ type: "state", renderState: buildRenderState(state) });
  }, 1000 / 60);
}

function stopLoop(): void {
  if (loopId !== null) {
    clearInterval(loopId);
    loopId = null;
  }
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  switch (msg.type) {
    case "init":
      config = msg.config;
      state = createInitialState(msg.config, msg.viewportHeight);
      callbacks = createCallbacks();
      paused = false;
      startLoop();
      break;

    case "input":
      if (state) {
        state.actionQueue.push(msg.action);
      }
      break;

    case "resize":
      if (state) {
        state.camera.viewportHeight = msg.viewportHeight;
      }
      break;

    case "reset":
      if (state && config) {
        resetForNewGame(state, config, callbacks ?? undefined);
      }
      break;

    case "pause":
      paused = true;
      break;

    case "resume":
      paused = false;
      lastTime = performance.now();
      break;

    case "setHighScore":
      if (state) {
        state.highScore = msg.highScore;
      }
      break;
  }
};

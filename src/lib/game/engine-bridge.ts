// ============================================================================
// Engine Bridge — Main thread ↔ Web Worker protocol for game engine
// ============================================================================

import type {
  GamePhase,
  DeathCause,
  InputAction,
  GameConfig,
  Coin,
} from "./types";
import type { RenderState } from "./renderer/render-pass";

// ---------------------------------------------------------------------------
// Worker message types
// ---------------------------------------------------------------------------

export type WorkerMessage =
  | { type: "init"; config: GameConfig; viewportHeight: number }
  | { type: "input"; action: InputAction }
  | { type: "resize"; viewportHeight: number }
  | { type: "reset" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "setHighScore"; highScore: number };

export type WorkerResponse =
  | { type: "state"; renderState: RenderState }
  | { type: "callback"; name: "onScoreChange"; args: [number] }
  | { type: "callback"; name: "onPhaseChange"; args: [GamePhase] }
  | { type: "callback"; name: "onDeath"; args: [DeathCause, number] }
  | { type: "callback"; name: "onHop"; args: [] }
  | { type: "callback"; name: "onLevelUp"; args: [number] }
  | { type: "callback"; name: "onCoinCollect"; args: [Coin, number] };

// ---------------------------------------------------------------------------
// Engine Bridge
// ---------------------------------------------------------------------------

export type RenderStateCallback = (state: RenderState) => void;
export type GameEventCallback = (name: string, args: unknown[]) => void;

export class EngineBridge {
  private worker: Worker | null = null;
  private renderStateListeners: RenderStateCallback[] = [];
  private eventListeners: GameEventCallback[] = [];
  private fallbackMode = false;

  // Fallback (main-thread) mode imports
  private fallbackState: import("./types").GameState | null = null;
  private fallbackConfig: GameConfig | null = null;
  private fallbackCallbacks: import("./types").GameCallbacks | null = null;
  private fallbackInterval: ReturnType<typeof setInterval> | null = null;
  private fallbackTick: typeof import("./engine").tick | null = null;

  constructor() {
    try {
      this.worker = new Worker(
        new URL("./engine.worker.ts", import.meta.url),
        { type: "module" },
      );
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = () => {
        // Worker failed to start — switch to fallback
        this.worker = null;
        this.fallbackMode = true;
      };
    } catch {
      // Worker not supported — use fallback
      this.fallbackMode = true;
    }
  }

  /** Initialize the engine with config and viewport height */
  async init(config: GameConfig, viewportHeight: number): Promise<void> {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({
        type: "init",
        config,
        viewportHeight,
      } satisfies WorkerMessage);
    } else {
      // Fallback: run engine on main thread
      this.fallbackMode = true;
      this.fallbackConfig = config;
      const { createInitialState, tick } = await import("./engine");
      this.fallbackTick = tick;
      this.fallbackState = createInitialState(config, viewportHeight);
      this.fallbackCallbacks = this.createFallbackCallbacks();
      this.startFallbackLoop();
    }
  }

  /** Send an input action to the engine */
  sendInput(action: InputAction): void {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({ type: "input", action } satisfies WorkerMessage);
    } else if (this.fallbackState) {
      this.fallbackState.actionQueue.push(action);
    }
  }

  /** Notify engine of viewport resize */
  resize(viewportHeight: number): void {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({ type: "resize", viewportHeight } satisfies WorkerMessage);
    } else if (this.fallbackState) {
      this.fallbackState.camera.viewportHeight = viewportHeight;
    }
  }

  /** Reset the game */
  async reset(): Promise<void> {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({ type: "reset" } satisfies WorkerMessage);
    } else if (this.fallbackState && this.fallbackConfig) {
      const { resetForNewGame } = await import("./engine");
      resetForNewGame(this.fallbackState, this.fallbackConfig, this.fallbackCallbacks ?? undefined);
    }
  }

  /** Pause the engine */
  pause(): void {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({ type: "pause" } satisfies WorkerMessage);
    }
    // In fallback mode, pausing is handled by the game state phase
  }

  /** Resume the engine */
  resume(): void {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({ type: "resume" } satisfies WorkerMessage);
    }
  }

  /** Set high score for the engine to track */
  setHighScore(highScore: number): void {
    if (this.worker && !this.fallbackMode) {
      this.worker.postMessage({ type: "setHighScore", highScore } satisfies WorkerMessage);
    } else if (this.fallbackState) {
      this.fallbackState.highScore = highScore;
    }
  }

  /** Register a listener for render state updates */
  onRenderState(callback: RenderStateCallback): () => void {
    this.renderStateListeners.push(callback);
    return () => {
      const idx = this.renderStateListeners.indexOf(callback);
      if (idx >= 0) this.renderStateListeners.splice(idx, 1);
    };
  }

  /** Register a listener for game events (score, death, etc.) */
  onEvent(callback: GameEventCallback): () => void {
    this.eventListeners.push(callback);
    return () => {
      const idx = this.eventListeners.indexOf(callback);
      if (idx >= 0) this.eventListeners.splice(idx, 1);
    };
  }

  /** Get direct access to fallback state (only available in fallback mode) */
  getFallbackState(): import("./types").GameState | null {
    return this.fallbackState;
  }

  /** Check if running in fallback (main-thread) mode */
  isFallback(): boolean {
    return this.fallbackMode;
  }

  /** Terminate the worker and clean up */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    this.renderStateListeners.length = 0;
    this.eventListeners.length = 0;
  }

  // --- Private ---

  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const msg = event.data;
    if (msg.type === "state") {
      for (const listener of this.renderStateListeners) {
        listener(msg.renderState);
      }
    } else if (msg.type === "callback") {
      for (const listener of this.eventListeners) {
        listener(msg.name, msg.args);
      }
    }
  }

  private createFallbackCallbacks(): import("./types").GameCallbacks {
    return {
      onScoreChange: (score: number) => {
        for (const l of this.eventListeners) l("onScoreChange", [score]);
      },
      onPhaseChange: (phase: GamePhase) => {
        for (const l of this.eventListeners) l("onPhaseChange", [phase]);
      },
      onDeath: (cause: DeathCause, finalScore: number) => {
        for (const l of this.eventListeners) l("onDeath", [cause, finalScore]);
      },
      onHop: () => {
        for (const l of this.eventListeners) l("onHop", []);
      },
      onLevelUp: (level: number) => {
        for (const l of this.eventListeners) l("onLevelUp", [level]);
      },
      onCoinCollect: (coin: Coin, bonusPoints: number) => {
        for (const l of this.eventListeners) l("onCoinCollect", [coin, bonusPoints]);
      },
    };
  }

  private startFallbackLoop(): void {
    if (this.fallbackInterval) return;

    let lastTime = performance.now();
    const step = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (this.fallbackState && this.fallbackConfig && this.fallbackTick && this.fallbackCallbacks) {
        this.fallbackTick(this.fallbackState, dt, this.fallbackConfig, this.fallbackCallbacks);

        // Build and emit render state
        const rs: RenderState = {
          phase: this.fallbackState.phase,
          player: this.fallbackState.player,
          lanes: this.fallbackState.lanes,
          camera: this.fallbackState.camera,
          particles: this.fallbackState.particles,
          coins: this.fallbackState.coins,
          animationTime: this.fallbackState.animationTime,
          score: this.fallbackState.score,
          level: this.fallbackState.level,
          deathCause: this.fallbackState.deathCause,
          deathProgress: 0,
          deathPosition: null,
        };

        for (const listener of this.renderStateListeners) {
          listener(rs);
        }
      }
    };

    // Run at ~60fps
    this.fallbackInterval = setInterval(step, 1000 / 60);
  }
}

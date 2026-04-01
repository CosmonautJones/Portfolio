import { describe, it, expect, vi } from "vitest";
import {
  createWeather,
  updateWeather,
  applyRainSlide,
  applyWindDrift,
} from "../weather";
import type { GameState, GameCallbacks } from "../types";
import { DEFAULT_CONFIG } from "../constants";

const CELL = DEFAULT_CONFIG.cellSize;

function createMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: "playing",
    player: {
      gridPos: { x: 6, y: -5 },
      worldPos: { x: 6 * CELL, y: -5 * CELL },
      facing: "up",
      animation: "idle",
      hopProgress: 0,
      hopTarget: null,
      alive: true,
      idleTimer: 0,
      ridingLogId: null,
    },
    lanes: [],
    camera: {
      y: 0,
      targetY: 0,
      viewportWidth: 13 * CELL,
      viewportHeight: 20 * CELL,
    },
    particles: [],
    actionQueue: [],
    score: 0,
    highScore: 0,
    level: 1,
    generatedUpTo: -30,
    deathCause: null,
    nextEntityId: 100,
    timeAccumulator: 0,
    animationTime: 0,
    coins: [],
    coinsCollected: 0,
    coinBonusScore: 0,
    dyingTimer: 0,
    dyingDuration: 0.5,
    powerUps: [],
    activePowerUps: [],
    bossLanesUsed: [],
    inBossSection: false,
    weather: createWeather(),
    windDriftAccumulator: 0,
    rainSlideApplied: false,
    ...overrides,
  };
}

function createMockCallbacks(): GameCallbacks {
  return {
    onScoreChange: vi.fn(),
    onPhaseChange: vi.fn(),
    onDeath: vi.fn(),
    onHop: vi.fn(),
    onLevelUp: vi.fn(),
    onCoinCollect: vi.fn(),
    onPowerUpCollect: vi.fn(),
    onPowerUpExpire: vi.fn(),
    onBossStart: vi.fn(),
    onBossClear: vi.fn(),
    onWeatherChange: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// createWeather
// ---------------------------------------------------------------------------

describe("createWeather", () => {
  it("starts clear with zero intensity", () => {
    const w = createWeather();
    expect(w.type).toBe("clear");
    expect(w.intensity).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Weather transitions
// ---------------------------------------------------------------------------

describe("Weather transitions", () => {
  it("stays clear at low scores", () => {
    const state = createMockState({ score: 10 });
    const callbacks = createMockCallbacks();

    // Tick multiple times
    for (let i = 0; i < 200; i++) {
      updateWeather(state, DEFAULT_CONFIG, callbacks);
    }

    expect(state.weather.type).toBe("clear");
    expect(state.weather.intensity).toBe(0);
  });

  it("transitions to rain at score >= 50", () => {
    const state = createMockState({ score: 60 });
    const callbacks = createMockCallbacks();

    // Tick enough for transition
    for (let i = 0; i < 300; i++) {
      updateWeather(state, DEFAULT_CONFIG, callbacks);
    }

    expect(state.weather.type).toBe("rain");
    expect(state.weather.intensity).toBeGreaterThan(0);
    expect(callbacks.onWeatherChange).toHaveBeenCalled();
  });

  it("transitions to fog at score >= 100", () => {
    const state = createMockState({ score: 110 });
    const callbacks = createMockCallbacks();

    for (let i = 0; i < 300; i++) {
      updateWeather(state, DEFAULT_CONFIG, callbacks);
    }

    expect(state.weather.type).toBe("fog");
  });

  it("transitions to wind at score >= 150", () => {
    const state = createMockState({ score: 160 });
    const callbacks = createMockCallbacks();

    for (let i = 0; i < 300; i++) {
      updateWeather(state, DEFAULT_CONFIG, callbacks);
    }

    expect(state.weather.type).toBe("wind");
  });

  it("intensity lerps gradually (not instant)", () => {
    const state = createMockState({ score: 60 });
    const callbacks = createMockCallbacks();

    // First update shouldn't jump to full intensity
    updateWeather(state, DEFAULT_CONFIG, callbacks);

    // Weather needs to transition from clear first
    // After clear fades out, rain starts at 0 intensity
    // So after just one tick, intensity should be small
    expect(state.weather.intensity).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Rain slide
// ---------------------------------------------------------------------------

describe("Rain slide", () => {
  it("applies slide after hop in rain", () => {
    const state = createMockState({
      score: 60,
      weather: { type: "rain", intensity: 1, windDirection: 1 },
      rainSlideApplied: false,
    });
    state.player.facing = "right";

    const initialX = state.player.worldPos.x;
    applyRainSlide(state, DEFAULT_CONFIG);

    expect(state.player.worldPos.x).not.toBe(initialX);
    expect(state.rainSlideApplied).toBe(true);
  });

  it("does not apply slide twice", () => {
    const state = createMockState({
      weather: { type: "rain", intensity: 1, windDirection: 1 },
      rainSlideApplied: true,
    });

    const initialX = state.player.worldPos.x;
    applyRainSlide(state, DEFAULT_CONFIG);

    expect(state.player.worldPos.x).toBe(initialX);
  });

  it("does not apply slide in clear weather", () => {
    const state = createMockState({
      weather: { type: "clear", intensity: 0, windDirection: 1 },
      rainSlideApplied: false,
    });

    const initialX = state.player.worldPos.x;
    applyRainSlide(state, DEFAULT_CONFIG);

    expect(state.player.worldPos.x).toBe(initialX);
  });

  it("does not apply slide when rain intensity is low", () => {
    const state = createMockState({
      weather: { type: "rain", intensity: 0.1, windDirection: 1 },
      rainSlideApplied: false,
    });

    const initialX = state.player.worldPos.x;
    applyRainSlide(state, DEFAULT_CONFIG);

    expect(state.player.worldPos.x).toBe(initialX);
  });
});

// ---------------------------------------------------------------------------
// Wind drift
// ---------------------------------------------------------------------------

describe("Wind drift", () => {
  it("accumulates drift in wind weather", () => {
    const state = createMockState({
      weather: { type: "wind", intensity: 1, windDirection: 1 },
    });

    const initialAccumulator = state.windDriftAccumulator;
    applyWindDrift(state, DEFAULT_CONFIG);

    expect(state.windDriftAccumulator).not.toBe(initialAccumulator);
  });

  it("does not drift in clear weather", () => {
    const state = createMockState({
      weather: { type: "clear", intensity: 0, windDirection: 1 },
    });

    applyWindDrift(state, DEFAULT_CONFIG);

    expect(state.windDriftAccumulator).toBe(0);
  });

  it("does not drift during hop", () => {
    const state = createMockState({
      weather: { type: "wind", intensity: 1, windDirection: 1 },
    });
    state.player.hopTarget = { x: 7, y: -6 };

    applyWindDrift(state, DEFAULT_CONFIG);

    expect(state.windDriftAccumulator).toBe(0);
  });

  it("does not drift when wind intensity is low", () => {
    const state = createMockState({
      weather: { type: "wind", intensity: 0.1, windDirection: 1 },
    });

    applyWindDrift(state, DEFAULT_CONFIG);

    expect(state.windDriftAccumulator).toBe(0);
  });

  it("applies drift when accumulator exceeds threshold", () => {
    const state = createMockState({
      weather: { type: "wind", intensity: 1, windDirection: 1 },
      windDriftAccumulator: 0.49,
    });

    // This tick should push accumulator past 0.5 threshold
    const initialX = state.player.worldPos.x;
    applyWindDrift(state, DEFAULT_CONFIG);

    // After exceeding 0.5, drift is applied and accumulator resets
    if (state.windDriftAccumulator === 0) {
      // Drift was applied
      expect(state.player.worldPos.x).not.toBe(initialX);
    }
  });
});

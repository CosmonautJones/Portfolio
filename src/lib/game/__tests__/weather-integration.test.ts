// ---------------------------------------------------------------------------
// Tick-level integration tests for the wired weather system.
//
// weather.test.ts covers the pure weather functions in isolation. These tests
// verify the WIRING: that tick() drives weather transitions over a run, that
// wind drift accumulates and nudges the player through the tick pipeline, that
// the rain slide fires on EACH hop during rain (the rainSlideApplied
// once-per-game bug-fix regression guard), and that weather flows into the
// RenderScene built by buildScene.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import { createInitialState, tick } from "../engine";
import { buildScene } from "../scene/build-scene";
import { applyRainSlide } from "../weather";
import { DEFAULT_CONFIG } from "../constants";
import type { GameCallbacks, GameState } from "../types";

const VIEWPORT_HEIGHT = 640;
const CELL = DEFAULT_CONFIG.cellSize;
const DT = DEFAULT_CONFIG.fixedTimestep;
const HOP_TICKS = Math.ceil(DEFAULT_CONFIG.hopDuration / DT);

function makeCallbacks(): GameCallbacks {
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

function startedGame(): { state: GameState; callbacks: GameCallbacks } {
  const callbacks = makeCallbacks();
  const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
  state.actionQueue.push("move_up");
  tick(state, DT, DEFAULT_CONFIG, callbacks);
  return { state, callbacks };
}

const START_Y = 3; // SAFE_START_LANES - 1

/**
 * Keep the player parked on a clean grass lane that matches the (forced) score,
 * alive, and idle so a long tick run stays in the "playing" phase. This isolates
 * the weather wiring from idle/back/hazard deaths. Must be called BEFORE each
 * tick and after setting state.score.
 */
function parkPlayerForScore(state: GameState): void {
  const y = START_Y - state.score; // matches furthestY so no back-death
  // Ensure a clean grass lane (no obstacles) exists at the player's row.
  let lane = state.lanes.find((l) => l.y === y);
  if (!lane) {
    lane = {
      y,
      type: "grass",
      variant: 0,
      obstacles: [],
      decorations: [],
      flowDirection: 1,
      speedMultiplier: 1,
    };
    state.lanes.push(lane);
  } else {
    lane.type = "grass";
    lane.obstacles = [];
  }
  state.player.gridPos.y = y;
  state.player.worldPos.y = y * CELL;
  state.player.idleTimer = 0;
  state.player.hopTarget = null;
  state.player.ridingLogId = null;
  state.player.alive = true;
}

// ---------------------------------------------------------------------------
// Transitions over a run
// ---------------------------------------------------------------------------

describe("weather wiring — transitions via tick()", () => {
  it("stays clear early in the run (low score)", () => {
    const { state, callbacks } = startedGame();
    for (let i = 0; i < 200; i++) tick(state, DT, DEFAULT_CONFIG, callbacks);
    expect(state.weather.type).toBe("clear");
    expect(state.weather.intensity).toBe(0);
  });

  it("transitions to rain once score crosses the rain threshold", () => {
    const { state, callbacks } = startedGame();
    // Force the run past the rain threshold (50) without needing 50 hops.
    state.score = 60;

    // Keep the player parked and force the phase back to "playing" each tick so
    // incidental procedural-lane hazards can't end the run before the 2s
    // intensity ramp completes — this isolates the weather WIRING (does tick()
    // call updateWeather?) from survival, which is covered elsewhere.
    for (let i = 0; i < 300; i++) {
      state.phase = "playing";
      state.player.alive = true;
      parkPlayerForScore(state);
      tick(state, DT, DEFAULT_CONFIG, callbacks);
    }

    expect(state.weather.type).toBe("rain");
    expect(state.weather.intensity).toBeGreaterThan(0);
    expect(callbacks.onWeatherChange).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Wind drift through the pipeline
// ---------------------------------------------------------------------------

describe("weather wiring — wind drift via tick()", () => {
  it("accumulates wind drift and nudges the player laterally while idle", () => {
    const { state, callbacks } = startedGame();
    // Let the player finish its initial hop so it is idle (drift only applies
    // when hopTarget === null).
    for (let i = 0; i < HOP_TICKS + 2; i++) tick(state, DT, DEFAULT_CONFIG, callbacks);

    // Establish fully-developed wind directly (intensity gating requires >=0.3).
    state.weather = { type: "wind", intensity: 1, windDirection: 1 };
    state.windDriftAccumulator = 0;
    const startX = state.player.worldPos.x;

    // Tick long enough to cross the 0.5px accumulator threshold at least once.
    // Keep alive (clear idle timer) and keep wind established each tick — the
    // tick pipeline's updateWeather would otherwise fade wind back toward the
    // score-derived target (clear at score 0).
    for (let i = 0; i < 600; i++) {
      // Force playing/alive and re-establish wind each tick (updateWeather would
      // otherwise fade wind toward the score-derived target). parkPlayerForScore
      // leaves worldPos.x free so wind can drift it laterally; forcing the phase
      // isolates the wiring from incidental procedural-hazard deaths.
      state.phase = "playing";
      state.player.alive = true;
      parkPlayerForScore(state);
      state.weather = { type: "wind", intensity: 1, windDirection: 1 };
      tick(state, DT, DEFAULT_CONFIG, callbacks);
    }

    expect(state.player.worldPos.x).toBeGreaterThan(startX);
  });

  it("does not drift the player during a hop", () => {
    const { state, callbacks } = startedGame();
    state.weather = { type: "wind", intensity: 1, windDirection: 1 };
    state.windDriftAccumulator = 0;
    // Mid-hop: a hop is in progress right after startGame.
    expect(state.player.hopTarget).not.toBeNull();
    const accBefore = state.windDriftAccumulator;
    tick(state, DT, DEFAULT_CONFIG, callbacks);
    // Accumulator stays put while a hop is active.
    expect(state.windDriftAccumulator).toBe(accBefore);
  });
});

// ---------------------------------------------------------------------------
// Rain slide per-hop reset (the once-per-game bug regression guard)
// ---------------------------------------------------------------------------

describe("weather wiring — rain slide fires on EACH hop (bug-fix guard)", () => {
  it("resets rainSlideApplied when a new hop begins so the slide is not once-per-game", () => {
    const { state, callbacks } = startedGame();
    // Finish the initial hop.
    for (let i = 0; i < HOP_TICKS + 2; i++) tick(state, DT, DEFAULT_CONFIG, callbacks);

    // Simulate a previous hop having already applied a slide.
    state.rainSlideApplied = true;

    // Queue a fresh hop and process the action (which initiates the hop).
    state.actionQueue.push("move_up");
    tick(state, DT, DEFAULT_CONFIG, callbacks);

    // The flag must have been cleared at hop start so the next landing can slide.
    expect(state.rainSlideApplied).toBe(false);
  });

  it("applies a rain slide on two consecutive hops (not just the first)", () => {
    const config = DEFAULT_CONFIG;
    // Build a minimal state in established rain and drive applyRainSlide twice,
    // resetting the flag between hops exactly as the tick pipeline does.
    const state = createInitialState(config, VIEWPORT_HEIGHT);
    state.phase = "playing";
    state.weather = { type: "rain", intensity: 1, windDirection: 1 };
    state.player.facing = "right";

    // Hop 1
    state.rainSlideApplied = false;
    const x0 = state.player.worldPos.x;
    applyRainSlide(state, config);
    const x1 = state.player.worldPos.x;
    expect(x1).not.toBe(x0);
    expect(state.rainSlideApplied).toBe(true);

    // Hop 2 — flag reset at hop start (as tick does), slide must fire again.
    state.rainSlideApplied = false;
    applyRainSlide(state, config);
    const x2 = state.player.worldPos.x;
    expect(x2).not.toBe(x1);
  });

  it("rain slide magnitude is conservative (<= half a cell, cannot shove far)", () => {
    const config = DEFAULT_CONFIG;
    const state = createInitialState(config, VIEWPORT_HEIGHT);
    state.weather = { type: "rain", intensity: 1, windDirection: 1 };
    state.player.facing = "right";
    state.rainSlideApplied = false;
    const x0 = state.player.worldPos.x;
    applyRainSlide(state, config);
    const delta = Math.abs(state.player.worldPos.x - x0);
    // RAIN_SLIDE_DISTANCE (0.5 cells) * intensity(1) -> at most half a cell.
    expect(delta).toBeLessThanOrEqual(0.5 * CELL + 0.001);
  });
});

// ---------------------------------------------------------------------------
// Weather flows into the RenderScene
// ---------------------------------------------------------------------------

describe("weather wiring — RenderScene", () => {
  it("buildScene carries the current weather state into the scene", () => {
    const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    state.weather = { type: "fog", intensity: 0.7, windDirection: -1 };
    const scene = buildScene(state, {});
    expect(scene.weather.type).toBe("fog");
    expect(scene.weather.intensity).toBeCloseTo(0.7);
    expect(scene.weather.windDirection).toBe(-1);
  });
});

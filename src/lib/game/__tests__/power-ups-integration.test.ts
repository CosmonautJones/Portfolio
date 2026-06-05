// ---------------------------------------------------------------------------
// Integration tests for the wired power-up system: spawn (lanes), tick-level
// collection, shield absorbing a fatal collision, slow_mo slowing obstacles,
// and speed shortening the hop. These exercise the live engine pipeline, not
// the power-up module in isolation (that is covered by power-ups.test.ts).
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createInitialState, tick, resetForNewGame } from "../engine";
import { updateObstacles } from "../obstacles";
import { updatePlayer } from "../player";
import { checkCollisions } from "../collision";
import { generateLanesIfNeeded } from "../lanes";
import { getSpeedMultiplier, getSlowMoMultiplier } from "../power-ups";
import { DEFAULT_CONFIG, POWERUP_SPEED_MULTIPLIER } from "../constants";
import type {
  GameCallbacks,
  GameState,
  Lane,
  Obstacle,
  PowerUp,
  ActivePowerUp,
} from "../types";

const VIEWPORT_HEIGHT = 640;
const CELL = DEFAULT_CONFIG.cellSize; // 32
const DT = DEFAULT_CONFIG.fixedTimestep; // 1/60

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

function placePlayer(state: GameState, gx: number, gy: number): void {
  state.player.gridPos.x = gx;
  state.player.gridPos.y = gy;
  state.player.worldPos.x = gx * CELL;
  state.player.worldPos.y = gy * CELL;
  state.player.hopTarget = null;
  state.player.hopProgress = 0;
  state.player.animation = "idle";
}

// ---------------------------------------------------------------------------
// 1. Collection through the live tick pipeline
// ---------------------------------------------------------------------------

describe("Power-up collection via tick()", () => {
  let state: GameState;
  let cb: GameCallbacks;

  beforeEach(() => {
    state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    cb = makeCallbacks();
    state.phase = "playing";
  });

  it("collects a power-up the player is standing on and activates the effect", () => {
    const playerCol = 6;
    placePlayer(state, playerCol, 0);

    const pu: PowerUp = {
      id: 5000,
      type: "speed",
      gridX: playerCol,
      laneY: 0,
      worldX: playerCol * CELL,
      collected: false,
    };
    state.powerUps.push(pu);

    tick(state, DT, DEFAULT_CONFIG, cb);

    expect(pu.collected).toBe(true);
    expect(state.activePowerUps.some((a) => a.type === "speed")).toBe(true);
    expect(cb.onPowerUpCollect).toHaveBeenCalledWith("speed");
  });

  it("expires a timed power-up after its duration elapses via repeated ticks", () => {
    const active: ActivePowerUp = {
      type: "speed",
      remainingTime: DT * 2, // expires within ~2 ticks
      startTime: 0,
    };
    state.activePowerUps.push(active);

    // Keep player idle on grass so nothing else mutates state adversely.
    placePlayer(state, 6, 0);

    for (let i = 0; i < 5; i++) {
      tick(state, DT, DEFAULT_CONFIG, cb);
    }

    expect(state.activePowerUps.some((a) => a.type === "speed")).toBe(false);
    expect(cb.onPowerUpExpire).toHaveBeenCalledWith("speed");
  });
});

// ---------------------------------------------------------------------------
// 2. Shield absorbs a fatal collision
// ---------------------------------------------------------------------------

describe("Shield absorbs a fatal collision", () => {
  let state: GameState;
  let cb: GameCallbacks;

  beforeEach(() => {
    state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    cb = makeCallbacks();
    state.phase = "playing";
  });

  function setupCarOnPlayer(): { lane: Lane; car: Obstacle } {
    const playerCol = 6;
    placePlayer(state, playerCol, 0);

    // Replace the lane at y=0 with a road carrying a car directly on the player.
    const idx = state.lanes.findIndex((l) => l.y === 0);
    if (idx !== -1) state.lanes.splice(idx, 1);
    const car: Obstacle = {
      id: 7777,
      type: "car",
      laneY: 0,
      worldX: playerCol * CELL,
      widthCells: 2,
      speed: 50,
    };
    const lane: Lane = {
      y: 0,
      type: "road",
      variant: 0,
      obstacles: [car],
      decorations: [],
      flowDirection: 1,
      speedMultiplier: 1,
    };
    state.lanes.push(lane);
    return { lane, car };
  }

  it("survives one hit and consumes the shield instead of dying", () => {
    setupCarOnPlayer();
    state.activePowerUps.push({
      type: "shield",
      remainingTime: Infinity,
      startTime: 0,
    });

    checkCollisions(state, DEFAULT_CONFIG, cb);

    expect(state.player.alive).toBe(true);
    expect(state.phase).toBe("playing");
    expect(state.activePowerUps.some((a) => a.type === "shield")).toBe(false);
    expect(cb.onDeath).not.toHaveBeenCalled();
    expect(cb.onPowerUpExpire).toHaveBeenCalledWith("shield");
  });

  it("dies on collision with no shield active", () => {
    setupCarOnPlayer();

    checkCollisions(state, DEFAULT_CONFIG, cb);

    expect(state.player.alive).toBe(false);
    expect(state.phase).toBe("game_over");
    expect(cb.onDeath).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 3. slow_mo slows obstacles
// ---------------------------------------------------------------------------

describe("slow_mo reduces obstacle speed", () => {
  function makeRoadState(): GameState {
    const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    state.phase = "playing";
    // A single road lane with a single moving car, no other lanes.
    const car: Obstacle = {
      id: 4242,
      type: "car",
      laneY: 0,
      worldX: 100,
      widthCells: 2,
      speed: 60,
    };
    const lane: Lane = {
      y: 0,
      type: "road",
      variant: 0,
      obstacles: [car],
      decorations: [],
      flowDirection: 1,
      speedMultiplier: 1,
    };
    state.lanes = [lane];
    return state;
  }

  it("an obstacle moves less per tick while slow_mo is active", () => {
    const normal = makeRoadState();
    updateObstacles(normal, DEFAULT_CONFIG);
    const normalDelta = normal.lanes[0].obstacles[0].worldX - 100;

    const slowed = makeRoadState();
    slowed.activePowerUps.push({
      type: "slow_mo",
      remainingTime: 5,
      startTime: 0,
    });
    updateObstacles(slowed, DEFAULT_CONFIG);
    const slowedDelta = slowed.lanes[0].obstacles[0].worldX - 100;

    expect(slowedDelta).toBeGreaterThan(0);
    expect(slowedDelta).toBeLessThan(normalDelta);
    // Should equal the multiplier exactly (deterministic).
    expect(slowedDelta).toBeCloseTo(normalDelta * getSlowMoMultiplier(slowed), 5);
  });
});

// ---------------------------------------------------------------------------
// 4. speed shortens the hop (getSpeedMultiplier wiring)
// ---------------------------------------------------------------------------

describe("speed power-up shortens hop duration", () => {
  it("getSpeedMultiplier returns >1-shortening multiplier only when speed active", () => {
    const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    expect(getSpeedMultiplier(state)).toBe(1);

    state.activePowerUps.push({
      type: "speed",
      remainingTime: 5,
      startTime: 0,
    });
    // multiplier < 1 => shorter hop duration => faster hop
    expect(getSpeedMultiplier(state)).toBe(POWERUP_SPEED_MULTIPLIER);
    expect(POWERUP_SPEED_MULTIPLIER).toBeLessThan(1);
  });

  it("hopProgress advances faster per tick with speed active", () => {
    const base = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    base.phase = "playing";
    placePlayer(base, 6, 0);
    base.player.hopTarget = { x: 6, y: -1 };
    base.player.animation = "hop";
    base.player.hopProgress = 0;
    const cb = makeCallbacks();
    updatePlayer(base, DEFAULT_CONFIG, cb);
    const baseProgress = base.player.hopProgress;

    const fast = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    fast.phase = "playing";
    placePlayer(fast, 6, 0);
    fast.player.hopTarget = { x: 6, y: -1 };
    fast.player.animation = "hop";
    fast.player.hopProgress = 0;
    fast.activePowerUps.push({
      type: "speed",
      remainingTime: 5,
      startTime: 0,
    });
    updatePlayer(fast, DEFAULT_CONFIG, cb);
    const fastProgress = fast.player.hopProgress;

    expect(fastProgress).toBeGreaterThan(baseProgress);
  });
});

// ---------------------------------------------------------------------------
// 4b. magnet pulls a nearby coin via the tick pipeline
// ---------------------------------------------------------------------------

describe("magnet pulls nearby coins via tick()", () => {
  it("moves a nearby loose coin toward the player while magnet is active", () => {
    const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    state.phase = "playing";
    placePlayer(state, 6, 0);
    state.activePowerUps.push({
      type: "magnet",
      remainingTime: 5,
      startTime: 0,
    });

    // A loose coin two cells to the right, on the player's lane. The initial
    // state already contains generated coins, so keep a direct reference rather
    // than indexing.
    const coin = {
      id: 9001,
      type: "gold" as const,
      gridX: 8,
      laneY: 0,
      worldX: 8 * CELL,
      collected: false,
      logId: null,
    };
    state.coins.push(coin);
    const initialX = coin.worldX;

    tick(state, DT, DEFAULT_CONFIG, makeCallbacks());

    // Either pulled closer, or pulled close enough to be collected this tick.
    expect(coin.collected || coin.worldX < initialX).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Lane generation can populate state.powerUps on grass lanes
// ---------------------------------------------------------------------------

describe("power-up spawning during lane generation", () => {
  it("populates state.powerUps over many generated grass lanes", () => {
    // Drive generation forward repeatedly; over enough lanes some grass lane
    // should roll a power-up (total ~15% chance per grass lane).
    let sawPowerUp = false;
    for (let attempt = 0; attempt < 40 && !sawPowerUp; attempt++) {
      const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
      // Advance the player far forward to force many generation passes.
      for (let step = 0; step < 60; step++) {
        state.player.gridPos.y -= 5;
        generateLanesIfNeeded(state, DEFAULT_CONFIG);
      }
      if (state.powerUps.length > 0) sawPowerUp = true;
    }
    expect(sawPowerUp).toBe(true);
  });

  it("populates power-ups on the INITIAL buffer lanes (createInitialState)", () => {
    // Regression: previously createInitialState generated its starting lanes via
    // generateLanes() without a powerUps sink, so the first ~30 lanes of every
    // run were power-up-free. Across many fresh states, at least one initial
    // buffer should now contain a power-up (combined ~15% per grass lane over
    // several grass lanes in the buffer).
    let sawInitialPowerUp = false;
    for (let attempt = 0; attempt < 60 && !sawInitialPowerUp; attempt++) {
      const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
      if (state.powerUps.length > 0) {
        sawInitialPowerUp = true;
        // Every initially-spawned power-up must sit on a grass lane.
        for (const pu of state.powerUps) {
          const lane = state.lanes.find((l) => l.y === pu.laneY);
          expect(lane?.type).toBe("grass");
        }
      }
    }
    expect(sawInitialPowerUp).toBe(true);
  });

  it("repopulates power-ups on reset (resetForNewGame)", () => {
    let sawResetPowerUp = false;
    for (let attempt = 0; attempt < 60 && !sawResetPowerUp; attempt++) {
      const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
      // Simulate a finished run carrying stale power-ups, then reset.
      state.powerUps.push({
        id: 99999,
        type: "shield",
        gridX: 6,
        laneY: 100,
        worldX: 6 * CELL,
        collected: false,
      });
      resetForNewGame(state, DEFAULT_CONFIG);
      // Stale power-up from the old run must be gone.
      expect(state.powerUps.some((p) => p.id === 99999)).toBe(false);
      if (state.powerUps.length > 0) sawResetPowerUp = true;
    }
    expect(sawResetPowerUp).toBe(true);
  });

  it("only spawns power-ups whose laneY corresponds to a grass lane", () => {
    const state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    for (let step = 0; step < 60; step++) {
      state.player.gridPos.y -= 5;
      generateLanesIfNeeded(state, DEFAULT_CONFIG);
    }
    for (const pu of state.powerUps) {
      const lane = state.lanes.find((l) => l.y === pu.laneY);
      // Lane may have been pruned in a longer run, but if present it must be grass.
      if (lane) expect(lane.type).toBe("grass");
    }
  });
});

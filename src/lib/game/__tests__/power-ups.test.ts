import { describe, it, expect, vi } from "vitest";
import {
  spawnPowerUpsForLane,
  checkPowerUpCollection,
  updatePowerUps,
  applyMagnetEffect,
  prunePowerUps,
  consumeShield,
  hasActivePowerUp,
} from "../power-ups";
import type {
  Lane,
  GameState,
  GameCallbacks,
  PowerUp,
  ActivePowerUp,
  Coin,
} from "../types";
import { DEFAULT_CONFIG } from "../constants";

const CELL = DEFAULT_CONFIG.cellSize;

function createMockLane(type: Lane["type"], y = -5): Lane {
  return {
    y,
    type,
    variant: 0,
    obstacles: [],
    decorations: [],
    flowDirection: 1,
    speedMultiplier: 1,
  };
}

function createMockState(
  powerUps: PowerUp[] = [],
  activePowerUps: ActivePowerUp[] = [],
): GameState {
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
    score: 10,
    highScore: 10,
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
    powerUps,
    activePowerUps,
    bossLanesUsed: [],
    inBossSection: false,
    weather: { type: "clear", intensity: 0, windDirection: 1 },
    windDriftAccumulator: 0,
    rainSlideApplied: false,
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
// Spawning
// ---------------------------------------------------------------------------

describe("Power-up spawning", () => {
  it("spawns power-ups only on grass lanes", () => {
    const nextId = { value: 1 };
    let grassPowerUps = 0;
    let roadPowerUps = 0;
    let waterPowerUps = 0;

    for (let i = 0; i < 200; i++) {
      grassPowerUps += spawnPowerUpsForLane(
        createMockLane("grass"),
        DEFAULT_CONFIG,
        nextId,
      ).length;
      roadPowerUps += spawnPowerUpsForLane(
        createMockLane("road"),
        DEFAULT_CONFIG,
        nextId,
      ).length;
      waterPowerUps += spawnPowerUpsForLane(
        createMockLane("water"),
        DEFAULT_CONFIG,
        nextId,
      ).length;
    }

    expect(grassPowerUps).toBeGreaterThan(0);
    expect(roadPowerUps).toBe(0);
    expect(waterPowerUps).toBe(0);
  });

  it("spawns at most one power-up per lane", () => {
    const nextId = { value: 1 };
    for (let i = 0; i < 100; i++) {
      const result = spawnPowerUpsForLane(
        createMockLane("grass"),
        DEFAULT_CONFIG,
        nextId,
      );
      expect(result.length).toBeLessThanOrEqual(1);
    }
  });

  it("spawns power-ups with valid types", () => {
    const validTypes = ["shield", "speed", "magnet", "slow_mo"];
    const nextId = { value: 1 };
    for (let i = 0; i < 200; i++) {
      const result = spawnPowerUpsForLane(
        createMockLane("grass"),
        DEFAULT_CONFIG,
        nextId,
      );
      for (const pu of result) {
        expect(validTypes).toContain(pu.type);
        expect(pu.collected).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

describe("Power-up collection", () => {
  it("collects power-ups within radius", () => {
    const pu: PowerUp = {
      id: 1,
      type: "shield",
      gridX: 6,
      laneY: -5,
      worldX: 6 * CELL,
      collected: false,
    };
    const state = createMockState([pu]);
    const callbacks = createMockCallbacks();

    checkPowerUpCollection(state, DEFAULT_CONFIG, callbacks);

    expect(pu.collected).toBe(true);
    expect(callbacks.onPowerUpCollect).toHaveBeenCalledWith("shield");
    expect(state.activePowerUps.length).toBe(1);
    expect(state.activePowerUps[0].type).toBe("shield");
  });

  it("does not collect power-ups that are far away", () => {
    const pu: PowerUp = {
      id: 1,
      type: "speed",
      gridX: 0,
      laneY: 0,
      worldX: 0,
      collected: false,
    };
    const state = createMockState([pu]);
    const callbacks = createMockCallbacks();

    checkPowerUpCollection(state, DEFAULT_CONFIG, callbacks);

    expect(pu.collected).toBe(false);
    expect(state.activePowerUps.length).toBe(0);
  });

  it("does not collect already collected power-ups", () => {
    const pu: PowerUp = {
      id: 1,
      type: "magnet",
      gridX: 6,
      laneY: -5,
      worldX: 6 * CELL,
      collected: true,
    };
    const state = createMockState([pu]);
    const callbacks = createMockCallbacks();

    checkPowerUpCollection(state, DEFAULT_CONFIG, callbacks);

    expect(state.activePowerUps.length).toBe(0);
  });

  it("spawns particles on collection", () => {
    const pu: PowerUp = {
      id: 1,
      type: "slow_mo",
      gridX: 6,
      laneY: -5,
      worldX: 6 * CELL,
      collected: false,
    };
    const state = createMockState([pu]);
    const callbacks = createMockCallbacks();

    checkPowerUpCollection(state, DEFAULT_CONFIG, callbacks);

    expect(state.particles.length).toBeGreaterThan(0);
  });

  it("replaces existing active power-up of same type", () => {
    const existing: ActivePowerUp = {
      type: "speed",
      remainingTime: 1,
      startTime: 0,
    };
    const pu: PowerUp = {
      id: 1,
      type: "speed",
      gridX: 6,
      laneY: -5,
      worldX: 6 * CELL,
      collected: false,
    };
    const state = createMockState([pu], [existing]);
    const callbacks = createMockCallbacks();

    checkPowerUpCollection(state, DEFAULT_CONFIG, callbacks);

    // Should still be 1 active (replaced, not stacked)
    expect(state.activePowerUps.length).toBe(1);
    expect(state.activePowerUps[0].remainingTime).toBe(5); // fresh duration
  });
});

// ---------------------------------------------------------------------------
// Timer updates
// ---------------------------------------------------------------------------

describe("Power-up timer updates", () => {
  it("decrements timed power-ups", () => {
    const active: ActivePowerUp = {
      type: "speed",
      remainingTime: 2,
      startTime: 0,
    };
    const state = createMockState([], [active]);
    const callbacks = createMockCallbacks();

    updatePowerUps(state, DEFAULT_CONFIG, callbacks);

    expect(active.remainingTime).toBeLessThan(2);
  });

  it("removes expired power-ups and fires callback", () => {
    const active: ActivePowerUp = {
      type: "magnet",
      remainingTime: 0.01,
      startTime: 0,
    };
    const state = createMockState([], [active]);
    const callbacks = createMockCallbacks();

    updatePowerUps(state, DEFAULT_CONFIG, callbacks);

    expect(state.activePowerUps.length).toBe(0);
    expect(callbacks.onPowerUpExpire).toHaveBeenCalledWith("magnet");
  });

  it("does not decrement shield (infinite duration)", () => {
    const active: ActivePowerUp = {
      type: "shield",
      remainingTime: Infinity,
      startTime: 0,
    };
    const state = createMockState([], [active]);
    const callbacks = createMockCallbacks();

    updatePowerUps(state, DEFAULT_CONFIG, callbacks);

    expect(active.remainingTime).toBe(Infinity);
    expect(state.activePowerUps.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Shield effect
// ---------------------------------------------------------------------------

describe("Shield effect", () => {
  it("consumeShield returns true and removes shield", () => {
    const active: ActivePowerUp = {
      type: "shield",
      remainingTime: Infinity,
      startTime: 0,
    };
    const state = createMockState([], [active]);

    const consumed = consumeShield(state);

    expect(consumed).toBe(true);
    expect(state.activePowerUps.length).toBe(0);
  });

  it("consumeShield returns false when no shield", () => {
    const state = createMockState();

    const consumed = consumeShield(state);

    expect(consumed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasActivePowerUp
// ---------------------------------------------------------------------------

describe("hasActivePowerUp", () => {
  it("returns true for active power-up", () => {
    const active: ActivePowerUp = {
      type: "speed",
      remainingTime: 3,
      startTime: 0,
    };
    const state = createMockState([], [active]);

    expect(hasActivePowerUp(state, "speed")).toBe(true);
    expect(hasActivePowerUp(state, "shield")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Magnet effect
// ---------------------------------------------------------------------------

describe("Magnet effect", () => {
  it("pulls nearby coins toward player", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 8,
      laneY: -5,
      worldX: 8 * CELL,
      collected: false,
      logId: null,
    };
    const active: ActivePowerUp = {
      type: "magnet",
      remainingTime: 5,
      startTime: 0,
    };
    const state = createMockState([], [active]);
    state.coins = [coin];

    const initialX = coin.worldX;
    applyMagnetEffect(state, DEFAULT_CONFIG);

    // Coin should have moved toward the player (x=6)
    expect(coin.worldX).toBeLessThan(initialX);
  });

  it("does not pull coins on logs", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 8,
      laneY: -5,
      worldX: 8 * CELL,
      collected: false,
      logId: 10,
    };
    const active: ActivePowerUp = {
      type: "magnet",
      remainingTime: 5,
      startTime: 0,
    };
    const state = createMockState([], [active]);
    state.coins = [coin];

    const initialX = coin.worldX;
    applyMagnetEffect(state, DEFAULT_CONFIG);

    expect(coin.worldX).toBe(initialX);
  });

  it("does nothing without magnet active", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 8,
      laneY: -5,
      worldX: 8 * CELL,
      collected: false,
      logId: null,
    };
    const state = createMockState();
    state.coins = [coin];

    const initialX = coin.worldX;
    applyMagnetEffect(state, DEFAULT_CONFIG);

    expect(coin.worldX).toBe(initialX);
  });
});

// ---------------------------------------------------------------------------
// Pruning
// ---------------------------------------------------------------------------

describe("Power-up pruning", () => {
  it("removes collected power-ups", () => {
    const pus: PowerUp[] = [
      { id: 1, type: "shield", gridX: 5, laneY: -5, worldX: 5 * CELL, collected: true },
      { id: 2, type: "speed", gridX: 6, laneY: -3, worldX: 6 * CELL, collected: false },
    ];
    const state = createMockState(pus);

    prunePowerUps(state, 10);

    expect(state.powerUps.length).toBe(1);
    expect(state.powerUps[0].id).toBe(2);
  });

  it("removes power-ups behind prune boundary", () => {
    const pus: PowerUp[] = [
      { id: 1, type: "shield", gridX: 5, laneY: 15, worldX: 5 * CELL, collected: false },
      { id: 2, type: "speed", gridX: 6, laneY: -3, worldX: 6 * CELL, collected: false },
    ];
    const state = createMockState(pus);

    prunePowerUps(state, 10);

    expect(state.powerUps.length).toBe(1);
    expect(state.powerUps[0].id).toBe(2);
  });
});

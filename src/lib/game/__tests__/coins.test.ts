import { describe, it, expect, vi } from "vitest";
import {
  spawnCoinsForLane,
  updateCoins,
  checkCoinCollection,
  pruneCoins,
} from "../coins";
import type { Lane, GameState, GameCallbacks, Coin } from "../types";
import { DEFAULT_CONFIG } from "../constants";

function createMockLane(type: Lane["type"], y = -5): Lane {
  return {
    y,
    type,
    variant: 0,
    obstacles: [],
    flowDirection: 1,
    speedMultiplier: 1,
  };
}

function createMockState(coins: Coin[] = []): GameState {
  return {
    phase: "playing",
    player: {
      gridPos: { x: 6, y: -5 },
      worldPos: { x: 96, y: -80 },
      facing: "up",
      animation: "idle",
      hopProgress: 0,
      hopTarget: null,
      alive: true,
      idleTimer: 0,
      ridingLogId: null,
    },
    lanes: [],
    camera: { y: 0, targetY: 0, viewportWidth: 208, viewportHeight: 320 },
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
    coins,
    coinsCollected: 0,
    coinBonusScore: 0,
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
  };
}

describe("Coin spawning", () => {
  it("spawns coins on grass lanes", () => {
    const lane = createMockLane("grass");
    const nextId = { value: 1 };
    // Run multiple times to account for randomness
    let totalCoins = 0;
    for (let i = 0; i < 50; i++) {
      totalCoins += spawnCoinsForLane(lane, DEFAULT_CONFIG, nextId).length;
    }
    expect(totalCoins).toBeGreaterThan(0);
  });

  it("never spawns coins on railroad lanes", () => {
    const lane = createMockLane("railroad");
    const nextId = { value: 1 };
    let totalCoins = 0;
    for (let i = 0; i < 50; i++) {
      totalCoins += spawnCoinsForLane(lane, DEFAULT_CONFIG, nextId).length;
    }
    expect(totalCoins).toBe(0);
  });

  it("spawns coins with valid types", () => {
    const lane = createMockLane("grass");
    const nextId = { value: 1 };
    const validTypes = ["gold", "silver", "diamond", "ruby"];
    for (let i = 0; i < 50; i++) {
      const coins = spawnCoinsForLane(lane, DEFAULT_CONFIG, nextId);
      for (const coin of coins) {
        expect(validTypes).toContain(coin.type);
        expect(coin.collected).toBe(false);
        expect(coin.laneY).toBe(lane.y);
      }
    }
  });

  it("spawns water coins with logId", () => {
    const lane = createMockLane("water");
    lane.obstacles = [
      { id: 10, type: "log", laneY: -5, worldX: 48, widthCells: 3, speed: 20 },
      { id: 11, type: "log", laneY: -5, worldX: 128, widthCells: 3, speed: 20 },
    ];
    const nextId = { value: 1 };
    let waterCoinsWithLog = 0;
    for (let i = 0; i < 100; i++) {
      const coins = spawnCoinsForLane(lane, DEFAULT_CONFIG, nextId);
      for (const coin of coins) {
        if (coin.logId !== null) waterCoinsWithLog++;
      }
    }
    expect(waterCoinsWithLog).toBeGreaterThan(0);
  });
});

describe("Coin collection", () => {
  it("collects coins within radius", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 6,
      laneY: -5,
      worldX: 96,
      collected: false,
      logId: null,
    };
    const state = createMockState([coin]);
    state.lanes = [createMockLane("grass", -5)];
    const callbacks = createMockCallbacks();

    checkCoinCollection(state, DEFAULT_CONFIG, callbacks);

    expect(coin.collected).toBe(true);
    expect(state.coinsCollected).toBe(1);
    expect(state.coinBonusScore).toBe(5); // gold = 5
    expect(callbacks.onCoinCollect).toHaveBeenCalledWith(coin, 5);
  });

  it("does not collect coins that are far away", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 0,
      laneY: 0,
      worldX: 0,
      collected: false,
      logId: null,
    };
    const state = createMockState([coin]);
    const callbacks = createMockCallbacks();

    checkCoinCollection(state, DEFAULT_CONFIG, callbacks);

    expect(coin.collected).toBe(false);
    expect(state.coinsCollected).toBe(0);
  });

  it("does not collect already collected coins", () => {
    const coin: Coin = {
      id: 1,
      type: "silver",
      gridX: 6,
      laneY: -5,
      worldX: 96,
      collected: true,
      logId: null,
    };
    const state = createMockState([coin]);
    const callbacks = createMockCallbacks();

    checkCoinCollection(state, DEFAULT_CONFIG, callbacks);

    expect(state.coinsCollected).toBe(0);
    expect(callbacks.onCoinCollect).not.toHaveBeenCalled();
  });

  it("spawns particles on collection", () => {
    const coin: Coin = {
      id: 1,
      type: "diamond",
      gridX: 6,
      laneY: -5,
      worldX: 96,
      collected: false,
      logId: null,
    };
    const state = createMockState([coin]);
    state.lanes = [createMockLane("grass", -5)];
    const callbacks = createMockCallbacks();

    checkCoinCollection(state, DEFAULT_CONFIG, callbacks);

    expect(state.particles.length).toBeGreaterThan(0);
  });
});

describe("Coin update", () => {
  it("moves coins on logs with log speed", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 3,
      laneY: -5,
      worldX: 48,
      collected: false,
      logId: 10,
    };
    const lane = createMockLane("water", -5);
    lane.obstacles = [
      { id: 10, type: "log", laneY: -5, worldX: 32, widthCells: 3, speed: 30 },
    ];
    const state = createMockState([coin]);
    state.lanes = [lane];

    const initialX = coin.worldX;
    updateCoins(state, DEFAULT_CONFIG);

    expect(coin.worldX).toBeGreaterThan(initialX);
  });

  it("marks coin as collected if log disappears", () => {
    const coin: Coin = {
      id: 1,
      type: "gold",
      gridX: 3,
      laneY: -5,
      worldX: 48,
      collected: false,
      logId: 99, // non-existent log
    };
    const lane = createMockLane("water", -5);
    const state = createMockState([coin]);
    state.lanes = [lane];

    updateCoins(state, DEFAULT_CONFIG);

    expect(coin.collected).toBe(true);
  });
});

describe("Coin pruning", () => {
  it("removes collected coins", () => {
    const coins: Coin[] = [
      { id: 1, type: "gold", gridX: 5, laneY: -5, worldX: 80, collected: true, logId: null },
      { id: 2, type: "silver", gridX: 6, laneY: -3, worldX: 96, collected: false, logId: null },
    ];
    const state = createMockState(coins);

    pruneCoins(state, 10);

    expect(state.coins.length).toBe(1);
    expect(state.coins[0].id).toBe(2);
  });

  it("removes coins behind prune boundary", () => {
    const coins: Coin[] = [
      { id: 1, type: "gold", gridX: 5, laneY: 15, worldX: 80, collected: false, logId: null },
      { id: 2, type: "silver", gridX: 6, laneY: -3, worldX: 96, collected: false, logId: null },
    ];
    const state = createMockState(coins);

    pruneCoins(state, 10);

    expect(state.coins.length).toBe(1);
    expect(state.coins[0].id).toBe(2);
  });
});

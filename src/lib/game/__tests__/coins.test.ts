import { describe, it, expect, vi } from "vitest";
import {
  spawnCoinsForLane,
  updateCoins,
  checkCoinCollection,
  pruneCoins,
} from "../coins";
import {
  COIN_SPRITES,
  COIN_GLOW_COLORS,
  COIN_PARTICLE_COLORS,
} from "../sprites/coins";
import type { Lane, GameState, GameCallbacks, Coin } from "../types";
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

function createMockState(coins: Coin[] = []): GameState {
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
    camera: { y: 0, targetY: 0, viewportWidth: 13 * CELL, viewportHeight: 20 * CELL },
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
      { id: 10, type: "log", laneY: -5, worldX: 3 * CELL, widthCells: 3, speed: 20 },
      { id: 11, type: "log", laneY: -5, worldX: 8 * CELL, widthCells: 3, speed: 20 },
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
      worldX: 6 * CELL,
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
      worldX: 6 * CELL,
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
      worldX: 6 * CELL,
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
      worldX: 3 * CELL,
      collected: false,
      logId: 10,
    };
    const lane = createMockLane("water", -5);
    lane.obstacles = [
      { id: 10, type: "log", laneY: -5, worldX: 2 * CELL, widthCells: 3, speed: 30 },
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
      worldX: 3 * CELL,
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
      { id: 1, type: "gold", gridX: 5, laneY: -5, worldX: 5 * CELL, collected: true, logId: null },
      { id: 2, type: "silver", gridX: 6, laneY: -3, worldX: 6 * CELL, collected: false, logId: null },
    ];
    const state = createMockState(coins);

    pruneCoins(state, 10);

    expect(state.coins.length).toBe(1);
    expect(state.coins[0].id).toBe(2);
  });

  it("removes coins behind prune boundary", () => {
    const coins: Coin[] = [
      { id: 1, type: "gold", gridX: 5, laneY: 15, worldX: 5 * CELL, collected: false, logId: null },
      { id: 2, type: "silver", gridX: 6, laneY: -3, worldX: 6 * CELL, collected: false, logId: null },
    ];
    const state = createMockState(coins);

    pruneCoins(state, 10);

    expect(state.coins.length).toBe(1);
    expect(state.coins[0].id).toBe(2);
  });
});

// --- Coin sprite data tests ---

const COIN_TYPES = ["gold", "silver", "diamond", "ruby"] as const;

describe("Coin sprite dimensions", () => {
  it("all coin sprites are 16x16", () => {
    for (const [name, sprite] of Object.entries(COIN_SPRITES)) {
      expect(sprite.length, `${name} row count`).toBe(16);
      for (let r = 0; r < sprite.length; r++) {
        expect(sprite[r].length, `${name} row ${r} col count`).toBe(16);
      }
    }
  });
});

describe("Coin sprite palette constraint", () => {
  it("each coin frame uses at most 4 unique non-zero indices", () => {
    for (const [name, sprite] of Object.entries(COIN_SPRITES)) {
      const nonZero = new Set<number>();
      for (const row of sprite) {
        for (const idx of row) {
          if (idx !== 0) nonZero.add(idx);
        }
      }
      expect(
        nonZero.size,
        `${name} has ${nonZero.size} non-zero indices: ${[...nonZero].join(", ")}`
      ).toBeLessThanOrEqual(4);
    }
  });
});

describe("Coin sprite 2x2 block convention", () => {
  it("every pixel appears in 2x2 blocks", () => {
    for (const [name, sprite] of Object.entries(COIN_SPRITES)) {
      for (let r = 0; r < 16; r += 2) {
        for (let c = 0; c < 16; c += 2) {
          const tl = sprite[r][c];
          const tr = sprite[r][c + 1];
          const bl = sprite[r + 1][c];
          const br = sprite[r + 1][c + 1];
          expect(
            tl === tr && tl === bl && tl === br,
            `${name} block at (${r},${c}): [${tl},${tr},${bl},${br}] not uniform`
          ).toBe(true);
        }
      }
    }
  });
});

describe("Coin sprite completeness", () => {
  it("COIN_SPRITES has all 4 types x 2 frames", () => {
    for (const type of COIN_TYPES) {
      expect(COIN_SPRITES).toHaveProperty(`coin_${type}_0`);
      expect(COIN_SPRITES).toHaveProperty(`coin_${type}_1`);
    }
  });
});

describe("COIN_GLOW_COLORS completeness", () => {
  it("has all 4 types with valid hex colors", () => {
    for (const type of COIN_TYPES) {
      expect(COIN_GLOW_COLORS).toHaveProperty(type);
      expect(COIN_GLOW_COLORS[type]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("COIN_PARTICLE_COLORS completeness", () => {
  it("has all 4 types with non-empty arrays", () => {
    for (const type of COIN_TYPES) {
      expect(COIN_PARTICLE_COLORS).toHaveProperty(type);
      expect(Array.isArray(COIN_PARTICLE_COLORS[type])).toBe(true);
      expect(COIN_PARTICLE_COLORS[type].length).toBeGreaterThan(0);
    }
  });
});

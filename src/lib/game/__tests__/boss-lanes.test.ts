import { describe, it, expect, vi } from "vitest";
import {
  checkBossTrigger,
  generateBossSection,
  checkBossClear,
  getBossSectionSize,
} from "../boss-lanes";
import type { GameState, GameCallbacks } from "../types";
import {
  DEFAULT_CONFIG,
  BOSS_LEVEL_TRIGGERS,
  BOSS_BUFFER_LANES,
  BOSS_CLEAR_BONUS,
  LEVEL_THRESHOLDS,
} from "../constants";

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
    weather: { type: "clear", intensity: 0, windDirection: 1 },
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
// Boss trigger detection
// ---------------------------------------------------------------------------

describe("Boss trigger detection", () => {
  it("triggers gauntlet at level 2 threshold", () => {
    const threshold = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.gauntlet - 1];
    const state = createMockState({ score: threshold });

    const result = checkBossTrigger(state);

    expect(result).toBe("gauntlet");
  });

  it("triggers rapids at level 4 threshold", () => {
    const threshold = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.rapids - 1];
    const state = createMockState({
      score: threshold,
      bossLanesUsed: ["gauntlet"],
    });

    const result = checkBossTrigger(state);

    expect(result).toBe("rapids");
  });

  it("triggers train_yard at level 6 threshold", () => {
    const threshold = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.train_yard - 1];
    const state = createMockState({
      score: threshold,
      bossLanesUsed: ["gauntlet", "rapids"],
    });

    const result = checkBossTrigger(state);

    expect(result).toBe("train_yard");
  });

  it("does not trigger already used patterns", () => {
    const threshold = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.gauntlet - 1];
    const state = createMockState({
      score: threshold,
      bossLanesUsed: ["gauntlet"],
    });

    const result = checkBossTrigger(state);

    // Should not return gauntlet since it's already used
    expect(result).not.toBe("gauntlet");
  });

  it("returns null when no boss should trigger", () => {
    const state = createMockState({ score: 5 });

    const result = checkBossTrigger(state);

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Boss section generation
// ---------------------------------------------------------------------------

describe("Boss section generation", () => {
  it("generates gauntlet with buffer + 3 road lanes", () => {
    const nextId = { value: 1 };
    const lanes = generateBossSection("gauntlet", 0, DEFAULT_CONFIG, nextId, 50);

    expect(lanes.length).toBe(BOSS_BUFFER_LANES + 3);

    // First lanes should be grass (buffer)
    for (let i = 0; i < BOSS_BUFFER_LANES; i++) {
      expect(lanes[i].type).toBe("grass");
    }

    // Boss lanes should be road
    for (let i = BOSS_BUFFER_LANES; i < lanes.length; i++) {
      expect(lanes[i].type).toBe("road");
    }
  });

  it("generates rapids with buffer + 3 water lanes", () => {
    const nextId = { value: 1 };
    const lanes = generateBossSection("rapids", 0, DEFAULT_CONFIG, nextId, 100);

    expect(lanes.length).toBe(BOSS_BUFFER_LANES + 3);

    for (let i = BOSS_BUFFER_LANES; i < lanes.length; i++) {
      expect(lanes[i].type).toBe("water");
    }
  });

  it("generates train_yard with buffer + 2 railroad lanes", () => {
    const nextId = { value: 1 };
    const lanes = generateBossSection("train_yard", 0, DEFAULT_CONFIG, nextId, 200);

    expect(lanes.length).toBe(BOSS_BUFFER_LANES + 2);

    for (let i = BOSS_BUFFER_LANES; i < lanes.length; i++) {
      expect(lanes[i].type).toBe("railroad");
    }
  });

  it("gauntlet lanes have obstacles", () => {
    const nextId = { value: 1 };
    const lanes = generateBossSection("gauntlet", 0, DEFAULT_CONFIG, nextId, 50);

    for (let i = BOSS_BUFFER_LANES; i < lanes.length; i++) {
      expect(lanes[i].obstacles.length).toBeGreaterThan(0);
    }
  });

  it("rapids lanes have log obstacles", () => {
    const nextId = { value: 1 };
    const lanes = generateBossSection("rapids", 0, DEFAULT_CONFIG, nextId, 100);

    for (let i = BOSS_BUFFER_LANES; i < lanes.length; i++) {
      expect(lanes[i].obstacles.length).toBeGreaterThan(0);
      for (const obs of lanes[i].obstacles) {
        expect(obs.type).toBe("log");
      }
    }
  });

  it("train_yard lanes have train obstacles", () => {
    const nextId = { value: 1 };
    const lanes = generateBossSection("train_yard", 0, DEFAULT_CONFIG, nextId, 200);

    for (let i = BOSS_BUFFER_LANES; i < lanes.length; i++) {
      expect(lanes[i].obstacles.length).toBeGreaterThan(0);
      for (const obs of lanes[i].obstacles) {
        expect(obs.type).toBe("train");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Boss section size
// ---------------------------------------------------------------------------

describe("getBossSectionSize", () => {
  it("returns correct sizes for each pattern", () => {
    expect(getBossSectionSize("gauntlet")).toBe(BOSS_BUFFER_LANES + 3);
    expect(getBossSectionSize("rapids")).toBe(BOSS_BUFFER_LANES + 3);
    expect(getBossSectionSize("train_yard")).toBe(BOSS_BUFFER_LANES + 2);
  });
});

// ---------------------------------------------------------------------------
// Boss clear detection
// ---------------------------------------------------------------------------

describe("Boss clear detection", () => {
  it("clears boss section when score advances past it", () => {
    const threshold = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.gauntlet - 1];
    const bossSize = getBossSectionSize("gauntlet");
    const state = createMockState({
      score: threshold + bossSize + BOSS_BUFFER_LANES,
      inBossSection: true,
      bossLanesUsed: ["gauntlet"],
    });
    const callbacks = createMockCallbacks();

    checkBossClear(state, callbacks);

    expect(state.inBossSection).toBe(false);
    expect(state.coinBonusScore).toBe(BOSS_CLEAR_BONUS);
    expect(callbacks.onBossClear).toHaveBeenCalledWith("gauntlet");
  });

  it("does not clear if not in boss section", () => {
    const state = createMockState({ inBossSection: false });
    const callbacks = createMockCallbacks();

    checkBossClear(state, callbacks);

    expect(callbacks.onBossClear).not.toHaveBeenCalled();
  });

  it("does not clear if score has not advanced enough", () => {
    const threshold = LEVEL_THRESHOLDS[BOSS_LEVEL_TRIGGERS.gauntlet - 1];
    const state = createMockState({
      score: threshold + 1,
      inBossSection: true,
      bossLanesUsed: ["gauntlet"],
    });
    const callbacks = createMockCallbacks();

    checkBossClear(state, callbacks);

    expect(state.inBossSection).toBe(true);
  });
});

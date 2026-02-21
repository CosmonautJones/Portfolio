import { describe, it, expect, vi, beforeEach } from "vitest";
import { createInitialState, tick, resetForNewGame } from "../engine";
import { DEFAULT_CONFIG } from "../constants";
import type { GameCallbacks, GameState, Obstacle, Lane } from "../types";

const VIEWPORT_HEIGHT = 320;
const CELL = DEFAULT_CONFIG.cellSize; // 16
const DT = DEFAULT_CONFIG.fixedTimestep; // 1/60
const HOP_TICKS = Math.ceil(DEFAULT_CONFIG.hopDuration / DT); // ~8

function makeCallbacks(): GameCallbacks {
  return {
    onScoreChange: vi.fn(),
    onPhaseChange: vi.fn(),
    onDeath: vi.fn(),
    onHop: vi.fn(),
    onLevelUp: vi.fn(),
  };
}

/** Transition from "menu" to "playing" by queuing a move and ticking once. */
function startGame(state: GameState, callbacks: GameCallbacks): void {
  state.actionQueue.push("move_up");
  tick(state, DT, DEFAULT_CONFIG, callbacks);
}

/** Tick enough times for a hop to fully complete. */
function completeHop(state: GameState, callbacks: GameCallbacks): void {
  for (let i = 0; i < HOP_TICKS + 2; i++) {
    tick(state, DT, DEFAULT_CONFIG, callbacks);
  }
}

/** Place the player directly on a given grid position (no hop). */
function placePlayer(state: GameState, gx: number, gy: number): void {
  state.player.gridPos.x = gx;
  state.player.gridPos.y = gy;
  state.player.worldPos.x = gx * CELL;
  state.player.worldPos.y = gy * CELL;
  state.player.hopTarget = null;
  state.player.hopProgress = 0;
  state.player.animation = "idle";
}

/** Create a deterministic log obstacle for testing. */
function makeLog(
  id: number,
  laneY: number,
  worldX: number,
  speed: number,
): Obstacle {
  return {
    id,
    type: "log",
    laneY,
    worldX,
    widthCells: 3, // matches engine OBSTACLE_WIDTHS.log
    speed,
  };
}

/**
 * Insert a controlled water lane at y=-1 (just beyond safe start lanes)
 * and ensure the adjacent lane at y=0 is clean grass.
 * Returns the water lane.
 */
function insertWaterLaneNearStart(state: GameState): Lane {
  const targetY = -1;

  // Remove any existing lane at targetY
  const idx = state.lanes.findIndex((l) => l.y === targetY);
  if (idx !== -1) state.lanes.splice(idx, 1);

  const waterLane: Lane = {
    y: targetY,
    type: "water",
    variant: 0,
    obstacles: [],
    flowDirection: 1,
    speedMultiplier: 1,
  };
  state.lanes.push(waterLane);

  // Ensure y=0 is clean grass (the lane the player will hop from)
  const grassLane = state.lanes.find((l) => l.y === 0);
  if (grassLane) {
    grassLane.type = "grass";
    grassLane.obstacles = [];
  }

  return waterLane;
}

// ---------------------------------------------------------------------------
describe("Log mechanics", () => {
  let state: GameState;
  let cb: GameCallbacks;

  beforeEach(() => {
    state = createInitialState(DEFAULT_CONFIG, VIEWPORT_HEIGHT);
    cb = makeCallbacks();
  });

  // -----------------------------------------------------------------------
  // 1. Water lanes spawn log obstacles
  // -----------------------------------------------------------------------
  it("water lanes spawn log obstacles", () => {
    const waterLanes = state.lanes.filter((l) => l.type === "water");
    // Initial state generates 30 lanes ahead; at least one water lane expected
    expect(waterLanes.length).toBeGreaterThan(0);

    for (const wl of waterLanes) {
      const logs = wl.obstacles.filter((o) => o.type === "log");
      // Engine spawns 2 + floor(random*2), i.e. 2-3 logs per water lane
      expect(logs.length).toBeGreaterThanOrEqual(2);
      for (const log of logs) {
        expect(log.type).toBe("log");
        expect(log.widthCells).toBe(3);
      }
    }
  });

  // -----------------------------------------------------------------------
  // 2. Player on water with log survives
  // -----------------------------------------------------------------------
  it("player landing on a log survives and rides it", () => {
    // Set phase to playing directly, skipping the menu hop
    state.phase = "playing";

    // Set up a controlled water lane at y=-1 with a stationary log
    const waterLane = insertWaterLaneNearStart(state);
    const playerCol = Math.floor(DEFAULT_CONFIG.gridColumns / 2); // 6
    const testLog = makeLog(
      8888,
      waterLane.y,
      (playerCol - 1) * CELL, // log covers columns 5, 6, 7
      0, // stationary
    );
    waterLane.obstacles = [testLog];

    // Place player at y=0 (grass), column 6 -- one hop away from water
    placePlayer(state, playerCol, 0);

    // Hop forward onto the water lane (move_up = y-1)
    state.actionQueue.push("move_up");
    tick(state, DT, DEFAULT_CONFIG, cb);
    completeHop(state, cb);

    // Player should be alive and riding the log
    expect(state.player.alive).toBe(true);
    expect(state.player.ridingLogId).toBe(testLog.id);
  });

  // -----------------------------------------------------------------------
  // 3. Player on water without log dies
  // -----------------------------------------------------------------------
  it("player landing on water without a log dies", () => {
    state.phase = "playing";

    // Water lane at y=-1 with NO obstacles
    const waterLane = insertWaterLaneNearStart(state);
    waterLane.obstacles = [];

    // Place player at y=0
    placePlayer(state, Math.floor(DEFAULT_CONFIG.gridColumns / 2), 0);

    // Hop forward onto the empty water lane
    state.actionQueue.push("move_up");
    tick(state, DT, DEFAULT_CONFIG, cb);
    completeHop(state, cb);

    expect(state.player.alive).toBe(false);
    expect(state.deathCause).toBe("water");
  });

  // -----------------------------------------------------------------------
  // 4. Player riding log drifts with log speed
  // -----------------------------------------------------------------------
  it("player riding a log drifts at the log speed", () => {
    state.phase = "playing";

    const waterLane = insertWaterLaneNearStart(state);
    const logSpeed = 30; // px/sec
    const testLog = makeLog(9000, waterLane.y, 3 * CELL, logSpeed);
    waterLane.obstacles = [testLog];

    // Place player directly on the log
    const playerCellX = Math.round(
      (testLog.worldX + (testLog.widthCells * CELL) / 2) / CELL,
    );
    placePlayer(state, playerCellX, waterLane.y);
    state.player.ridingLogId = testLog.id;

    const initialX = state.player.worldPos.x;

    // Tick once
    tick(state, DT, DEFAULT_CONFIG, cb);

    const expectedDrift = logSpeed * DT;
    const actualDrift = state.player.worldPos.x - initialX;

    expect(actualDrift).toBeCloseTo(expectedDrift, 2);
  });

  // -----------------------------------------------------------------------
  // 5. Player drifting off log edge dies
  // -----------------------------------------------------------------------
  it("player dies when drifting off the log edge", () => {
    state.phase = "playing";

    const waterLane = insertWaterLaneNearStart(state);

    // Create a log far from the player so center check fails
    const testLog = makeLog(9001, waterLane.y, 100 * CELL, 0);
    waterLane.obstacles = [testLog];

    // Place player at position that is NOT under the log
    placePlayer(state, 2, waterLane.y);
    state.player.ridingLogId = testLog.id; // claim riding despite being off

    // Tick: updateLogRiding will detect player center outside log bounds
    tick(state, DT, DEFAULT_CONFIG, cb);

    expect(state.player.alive).toBe(false);
    expect(state.deathCause).toBe("water");
  });

  // -----------------------------------------------------------------------
  // 6. Player drifting off screen on log dies
  // -----------------------------------------------------------------------
  it("player dies when log carries them off screen", () => {
    state.phase = "playing";

    const waterLane = insertWaterLaneNearStart(state);
    const totalWidth = DEFAULT_CONFIG.gridColumns * CELL;

    // Fast log heading right, player near right edge
    const logSpeed = 500; // very fast
    const testLog = makeLog(
      9002,
      waterLane.y,
      totalWidth - 2 * CELL,
      logSpeed,
    );
    waterLane.obstacles = [testLog];

    // Place player on the log near the right edge
    const logCenterCellX = Math.round(
      (testLog.worldX + (testLog.widthCells * CELL) / 2) / CELL,
    );
    placePlayer(
      state,
      Math.min(logCenterCellX, DEFAULT_CONFIG.gridColumns - 1),
      waterLane.y,
    );
    state.player.ridingLogId = testLog.id;

    // Tick enough times for the log (and player) to leave the screen
    for (let i = 0; i < 60; i++) {
      tick(state, DT, DEFAULT_CONFIG, cb);
      if (!state.player.alive) break;
    }

    expect(state.player.alive).toBe(false);
    expect(state.deathCause).toBe("water");
  });

  // -----------------------------------------------------------------------
  // 7. ridingLogId cleared when initiating hop
  // -----------------------------------------------------------------------
  it("ridingLogId is cleared when the player initiates a hop", () => {
    state.phase = "playing";

    const waterLane = insertWaterLaneNearStart(state);

    // Set up a log and place the player on it
    const testLog = makeLog(9003, waterLane.y, 3 * CELL, 20);
    waterLane.obstacles = [testLog];

    const logCenterCellX = Math.round(
      (testLog.worldX + (testLog.widthCells * CELL) / 2) / CELL,
    );
    placePlayer(state, logCenterCellX, waterLane.y);
    state.player.ridingLogId = testLog.id;

    expect(state.player.ridingLogId).toBe(testLog.id);

    // Queue a hop (left so we stay on screen)
    state.actionQueue.push("move_left");
    tick(state, DT, DEFAULT_CONFIG, cb);

    // After tick processes the action, ridingLogId should be null
    // (initiateHop sets it to null)
    expect(state.player.ridingLogId).toBeNull();
  });

  // -----------------------------------------------------------------------
  // 8. checkCollisions skips log obstacles
  // -----------------------------------------------------------------------
  it("collisions with log obstacles do not kill the player", () => {
    state.phase = "playing";

    // Player starts at y=3 on a grass lane. Place a log directly on top.
    const lane = state.lanes.find((l) => l.y === state.player.gridPos.y)!;
    expect(lane).toBeDefined();

    const testLog = makeLog(
      9004,
      lane.y,
      state.player.worldPos.x, // directly on top of player
      0,
    );
    lane.obstacles.push(testLog);

    // Tick several times -- log should not cause death
    for (let i = 0; i < 10; i++) {
      tick(state, DT, DEFAULT_CONFIG, cb);
    }

    expect(state.player.alive).toBe(true);
  });

  // -----------------------------------------------------------------------
  // 9. animationTime increments
  // -----------------------------------------------------------------------
  it("animationTime increments each tick", () => {
    expect(state.animationTime).toBe(0);

    // Even in menu phase, animationTime should advance
    tick(state, DT, DEFAULT_CONFIG, cb);

    expect(state.animationTime).toBeGreaterThan(0);
    expect(state.animationTime).toBeCloseTo(DT, 6);
  });

  // -----------------------------------------------------------------------
  // 10. resetForNewGame resets ridingLogId and animationTime
  // -----------------------------------------------------------------------
  it("resetForNewGame resets ridingLogId and animationTime", () => {
    startGame(state, cb);

    // Advance time and set riding state
    for (let i = 0; i < 20; i++) {
      tick(state, DT, DEFAULT_CONFIG, cb);
    }
    state.player.ridingLogId = 42;
    state.animationTime = 99.9;

    expect(state.animationTime).toBe(99.9);
    expect(state.player.ridingLogId).toBe(42);

    resetForNewGame(state, DEFAULT_CONFIG, cb);

    expect(state.player.ridingLogId).toBeNull();
    expect(state.animationTime).toBe(0);
  });
});

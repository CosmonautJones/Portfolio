// ---------------------------------------------------------------------------
// Main tick, input processing, state initialization and reset
// ---------------------------------------------------------------------------

import type {
  GameState,
  GameConfig,
  GameCallbacks,
  Player,
  Lane,
  Coin,
  Direction,
  InputAction,
} from "./types";
import {
  SAFE_START_LANES,
  CAMERA_DEAD_ZONE,
} from "./constants";
import { initiateHop, updatePlayer, updateLogRiding } from "./player";
import { updateObstacles } from "./obstacles";
import { checkCollisions, checkIdleTimeout, checkBackDeath } from "./collision";
import { generateLanes, generateLanesIfNeeded, pruneLanesBehindPlayer, spawnDecorationsForLane } from "./lanes";
import { updateCamera } from "./camera";
import { updateCoins, checkCoinCollection } from "./coins";
import {
  updateParticles,
  spawnTrainWarning,
  spawnWaterRipples,
  spawnAmbientParticles,
} from "./particles";
import {
  checkPowerUpCollection,
  applyMagnetEffect,
  updatePowerUps,
} from "./power-ups";

// ---------------------------------------------------------------------------
// Input processing helpers
// ---------------------------------------------------------------------------

function isMovementAction(action: InputAction): boolean {
  return action !== "pause";
}

function actionToDirection(action: InputAction): Direction | null {
  switch (action) {
    case "move_up":
      return "up";
    case "move_down":
      return "down";
    case "move_left":
      return "left";
    case "move_right":
      return "right";
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Action queue processing
// ---------------------------------------------------------------------------

function processActions(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  while (state.actionQueue.length > 0) {
    const action = state.actionQueue.shift()!;

    switch (state.phase) {
      case "menu": {
        if (isMovementAction(action)) {
          state.phase = "playing";
          callbacks.onPhaseChange("playing");
          // Process the movement
          const dir = actionToDirection(action);
          if (dir && state.player.hopTarget === null) {
            initiateHop(state.player, dir, config, callbacks);
          }
        }
        // pause in menu -> ignored
        break;
      }
      case "playing": {
        if (action === "pause") {
          state.phase = "paused";
          callbacks.onPhaseChange("paused");
        } else {
          const dir = actionToDirection(action);
          if (dir && state.player.hopTarget === null) {
            initiateHop(state.player, dir, config, callbacks);
          }
        }
        break;
      }
      case "paused": {
        if (action === "pause") {
          state.phase = "playing";
          callbacks.onPhaseChange("playing");
        }
        break;
      }
      case "game_over": {
        if (isMovementAction(action)) {
          resetForNewGame(state, config, callbacks);
        }
        break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// createInitialState
// ---------------------------------------------------------------------------

export function createInitialState(
  config: GameConfig,
  viewportHeight: number,
): GameState {
  const { cellSize, gridColumns, generateAhead } = config;
  const startY = SAFE_START_LANES - 1; // player starts at y=3

  // Safe starting grass lanes at y=0,1,2,3
  const lanes: Lane[] = [];
  for (let y = 0; y < SAFE_START_LANES; y++) {
    const lane: Lane = {
      y,
      type: "grass",
      variant: Math.floor(Math.random() * 2),
      obstacles: [],
      decorations: [],
      flowDirection: Math.random() < 0.5 ? -1 : 1,
      speedMultiplier: 1,
    };
    spawnDecorationsForLane(lane, config);
    lanes.push(lane);
  }

  const nextId = { value: 1 };
  const coins: Coin[] = [];

  // Generate procedural lanes ahead (negative y direction)
  const targetY = -generateAhead;
  const generated = generateLanes(0, targetY, config, nextId, 0, lanes, coins);
  lanes.push(...generated);

  const player: Player = {
    gridPos: { x: Math.floor(gridColumns / 2), y: startY },
    worldPos: {
      x: Math.floor(gridColumns / 2) * cellSize,
      y: startY * cellSize,
    },
    facing: "up",
    animation: "idle",
    hopProgress: 0,
    hopTarget: null,
    alive: true,
    idleTimer: 0,
    ridingLogId: null,
  };

  const cameraY = startY * cellSize - viewportHeight * CAMERA_DEAD_ZONE;
  const camera = {
    y: cameraY,
    // prevY starts equal to y so the first rendered frame does not interpolate.
    prevY: cameraY,
    targetY: cameraY,
    viewportWidth: gridColumns * cellSize,
    viewportHeight,
  };

  return {
    phase: "menu",
    player,
    lanes,
    camera,
    particles: [],
    actionQueue: [],
    score: 0,
    highScore: 0,
    level: 1,
    generatedUpTo: targetY,
    deathCause: null,
    nextEntityId: nextId.value,
    timeAccumulator: 0,
    animationTime: 0,
    coins,
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
  };
}

// ---------------------------------------------------------------------------
// Main tick
// ---------------------------------------------------------------------------

export function tick(
  state: GameState,
  deltaTime: number,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  state.timeAccumulator += deltaTime;

  while (state.timeAccumulator >= config.fixedTimestep) {
    state.timeAccumulator -= config.fixedTimestep;

    processActions(state, config, callbacks);

    if (state.phase === "playing") {
      updatePlayer(state, config, callbacks);
      updateLogRiding(state, config, callbacks);
      updateObstacles(state, config);
      updateCoins(state, config);
      applyMagnetEffect(state, config);
      checkCoinCollection(state, config, callbacks);
      checkPowerUpCollection(state, config, callbacks);
      updatePowerUps(state, config, callbacks);
      checkCollisions(state, config, callbacks);
      checkIdleTimeout(state, config, callbacks);
      checkBackDeath(state, config, callbacks);
      updateCamera(state, config);
      generateLanesIfNeeded(state, config);
      pruneLanesBehindPlayer(state, config);
      spawnTrainWarning(state, config);
      spawnWaterRipples(state, config);
      spawnAmbientParticles(state, config);
    }

    // Update dying timer (slow-mo: timestep * 0.2 during death animation)
    if (state.phase === "game_over" && state.dyingTimer < state.dyingDuration) {
      state.dyingTimer += config.fixedTimestep;
    }

    // Apply slow-mo multiplier during dying for particle/animation updates
    const effectiveTimestep =
      state.phase === "game_over" && state.dyingTimer < state.dyingDuration
        ? config.fixedTimestep * 0.2
        : config.fixedTimestep;

    // Always update particles and animation time
    updateParticles(state, { ...config, fixedTimestep: effectiveTimestep });
    state.animationTime += effectiveTimestep;
  }
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

export function resetForNewGame(
  state: GameState,
  config: GameConfig,
  callbacks?: GameCallbacks,
): void {
  const { cellSize, gridColumns, generateAhead } = config;
  const startY = SAFE_START_LANES - 1;

  // Clear lanes and coins, regenerate
  state.lanes.length = 0;
  state.coins.length = 0;
  for (let y = 0; y < SAFE_START_LANES; y++) {
    const lane: Lane = {
      y,
      type: "grass",
      variant: Math.floor(Math.random() * 2),
      obstacles: [],
      decorations: [],
      flowDirection: Math.random() < 0.5 ? -1 : 1,
      speedMultiplier: 1,
    };
    spawnDecorationsForLane(lane, config);
    state.lanes.push(lane);
  }

  const nextId = { value: 1 };
  const targetY = -generateAhead;
  const generated = generateLanes(0, targetY, config, nextId, 0, state.lanes, state.coins);
  state.lanes.push(...generated);

  // Reset player
  state.player.gridPos.x = Math.floor(gridColumns / 2);
  state.player.gridPos.y = startY;
  state.player.worldPos.x = Math.floor(gridColumns / 2) * cellSize;
  state.player.worldPos.y = startY * cellSize;
  state.player.facing = "up";
  state.player.animation = "idle";
  state.player.hopProgress = 0;
  state.player.hopTarget = null;
  state.player.alive = true;
  state.player.idleTimer = 0;
  state.player.ridingLogId = null;

  // Reset camera
  state.camera.y =
    startY * cellSize - state.camera.viewportHeight * CAMERA_DEAD_ZONE;
  state.camera.targetY = state.camera.y;
  // Match prevY to the teleported y so the first frame of the new run does not
  // interpolate across the camera reset (no rubber-band on restart).
  state.camera.prevY = state.camera.y;

  // Reset game state (keep highScore)
  state.phase = "playing";
  state.score = 0;
  state.level = 1;
  state.deathCause = null;
  state.particles.length = 0;
  state.actionQueue.length = 0;
  state.generatedUpTo = targetY;
  state.nextEntityId = nextId.value;
  state.timeAccumulator = 0;
  state.animationTime = 0;
  state.coinsCollected = 0;
  state.coinBonusScore = 0;
  state.dyingTimer = 0;
  state.powerUps = [];
  state.activePowerUps = [];
  state.bossLanesUsed = [];
  state.inBossSection = false;
  state.weather = { type: "clear", intensity: 0, windDirection: 1 };
  state.windDriftAccumulator = 0;
  state.rainSlideApplied = false;

  if (callbacks) {
    callbacks.onPhaseChange("playing");
  }
}

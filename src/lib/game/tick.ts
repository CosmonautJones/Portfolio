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
  PowerUp,
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
  spawnRain,
} from "./particles";
import {
  checkPowerUpCollection,
  applyMagnetEffect,
  updatePowerUps,
} from "./power-ups";
import { updateWeather, applyWindDrift } from "./weather";
import { checkBossClear } from "./boss-lanes";

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
            // Re-arm the per-hop rain slide so it can fire on this hop's
            // landing. Without this the slide would fire at most once per game.
            state.rainSlideApplied = false;
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
            // Re-arm the per-hop rain slide so it can fire on this hop's
            // landing. Without this the slide would fire at most once per game.
            state.rainSlideApplied = false;
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
  const powerUps: PowerUp[] = [];

  // Generate procedural lanes ahead (negative y direction)
  const targetY = -generateAhead;
  const generated = generateLanes(0, targetY, config, nextId, 0, lanes, coins, powerUps);
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
    powerUps,
    activePowerUps: [],
    bossLanesUsed: [],
    inBossSection: false,
    bossSectionEndY: null,
    weather: { type: "clear", intensity: 0, windDirection: 1 },
    windDriftAccumulator: 0,
    rainSlideApplied: false,
    ghostTick: 0,
    ghostPos: null,
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
      // Weather: advance transitions (score-driven) then apply lateral wind
      // drift. Both are gated internally (intensity >= 0.3, idle-only drift).
      updateWeather(state, config, callbacks);
      applyWindDrift(state, config);
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
      // Boss sections: inject at the frontier (inside generateLanesIfNeeded) and
      // evaluate the deterministic clear. checkBossClear awards BOSS_CLEAR_BONUS
      // via coinBonusScore and fires onBossClear once the player traverses past
      // the section's end lane.
      generateLanesIfNeeded(state, config, callbacks);
      checkBossClear(state, callbacks);
      pruneLanesBehindPlayer(state, config);
      spawnTrainWarning(state, config);
      spawnWaterRipples(state, config);
      spawnAmbientParticles(state, config);
      spawnRain(state, config);
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

  // Clear lanes, coins, and power-ups, then regenerate. Power-ups are cleared
  // here (not only in the state-reset block below) so generateLanes can
  // repopulate the initial buffer's grass lanes for the new run.
  state.lanes.length = 0;
  state.coins.length = 0;
  state.powerUps.length = 0;
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
  const generated = generateLanes(
    0,
    targetY,
    config,
    nextId,
    0,
    state.lanes,
    state.coins,
    state.powerUps,
  );
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
  // state.powerUps was cleared and repopulated above (before generateLanes).
  state.activePowerUps = [];
  state.bossLanesUsed = [];
  state.inBossSection = false;
  state.bossSectionEndY = null;
  state.weather = { type: "clear", intensity: 0, windDirection: 1 };
  state.windDriftAccumulator = 0;
  state.rainSlideApplied = false;
  // Ghost replay cadence resets with the run; the ghost runtime (held in the
  // React hook) re-arms recorder/replayer on the playing phase transition.
  state.ghostTick = 0;
  state.ghostPos = null;

  if (callbacks) {
    callbacks.onPhaseChange("playing");
  }
}

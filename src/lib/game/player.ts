// ---------------------------------------------------------------------------
// Player movement, hopping, and log riding
// ---------------------------------------------------------------------------

import type {
  GameState,
  GameConfig,
  GameCallbacks,
  Player,
  Obstacle,
  Direction,
} from "./types";
import { SAFE_START_LANES, LOG_LANDING_MARGIN } from "./constants";
import { lerp, clamp } from "./utils";
import { getLevelForScore } from "./difficulty";
import { killPlayer } from "./collision";
import {
  spawnHopDust,
  spawnScoreSparkle,
  spawnSplashParticles,
  spawnLogWakeParticles,
} from "./particles";

// ---------------------------------------------------------------------------
// Hop initiation
// ---------------------------------------------------------------------------

export function initiateHop(
  player: Player,
  direction: Direction,
  config: GameConfig,
  callbacks?: GameCallbacks,
): void {
  let tx = player.gridPos.x;
  let ty = player.gridPos.y;

  switch (direction) {
    case "up":
      ty -= 1;
      break;
    case "down":
      ty += 1;
      break;
    case "left":
      tx -= 1;
      break;
    case "right":
      tx += 1;
      break;
  }

  // Clamp horizontal
  tx = clamp(tx, 0, config.gridColumns - 1);

  // Don't allow hopping to current position (clamped to same spot)
  if (tx === player.gridPos.x && ty === player.gridPos.y) return;

  player.hopTarget = { x: tx, y: ty };
  player.animation = "hop";
  player.facing = direction;
  player.hopProgress = 0;
  player.idleTimer = 0;
  player.ridingLogId = null;
  if (callbacks) {
    callbacks.onHop();
  }
}

// ---------------------------------------------------------------------------
// Log riding helpers
// ---------------------------------------------------------------------------

export function findLogUnderPlayer(
  state: GameState,
  config: GameConfig,
): Obstacle | null {
  const { player } = state;
  const { cellSize } = config;
  const lane = state.lanes.find((l) => l.y === player.gridPos.y);
  if (!lane || lane.type !== "water") return null;

  // Use a forgiving margin so lateral hops (where the log drifts during
  // the hop animation) still register as a landing.
  const margin = cellSize * LOG_LANDING_MARGIN;
  const playerCenterX = player.worldPos.x + cellSize / 2;
  for (const obs of lane.obstacles) {
    if (obs.type !== "log") continue;
    const logLeft = obs.worldX - margin;
    const logRight = obs.worldX + obs.widthCells * cellSize + margin;
    if (playerCenterX >= logLeft && playerCenterX <= logRight) {
      return obs;
    }
  }
  return null;
}

export function updateLogRiding(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  const { player } = state;
  const { cellSize, gridColumns, fixedTimestep } = config;

  // Skip if not riding or mid-hop
  if (player.ridingLogId === null || player.hopTarget !== null) return;

  // Find the log by ID in the current lane
  const lane = state.lanes.find((l) => l.y === player.gridPos.y);
  if (!lane) {
    killPlayer(state, "water", config, callbacks);
    return;
  }

  const log = lane.obstacles.find((o) => o.id === player.ridingLogId);
  if (!log) {
    // Log disappeared -- player falls in water
    killPlayer(state, "water", config, callbacks);
    return;
  }

  // Drift player with the log
  player.worldPos.x += log.speed * fixedTimestep;
  player.gridPos.x = Math.round(player.worldPos.x / cellSize);

  // Check if player drifted off the log edge
  const playerCenterX = player.worldPos.x + cellSize / 2;
  const logLeft = log.worldX;
  const logRight = log.worldX + log.widthCells * cellSize;
  if (playerCenterX < logLeft || playerCenterX > logRight) {
    killPlayer(state, "water", config, callbacks);
    return;
  }

  // Check if player drifted off-screen
  const totalWidth = gridColumns * cellSize;
  if (player.worldPos.x < -cellSize || player.worldPos.x > totalWidth) {
    killPlayer(state, "water", config, callbacks);
  }
}

// ---------------------------------------------------------------------------
// Player update (hop progression + landing logic)
// ---------------------------------------------------------------------------

export function updatePlayer(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  const { player } = state;
  const { cellSize, hopDuration, fixedTimestep } = config;

  if (player.hopTarget !== null) {
    // Advance hop
    player.hopProgress += fixedTimestep / hopDuration;

    const progress = clamp(player.hopProgress, 0, 1);
    player.worldPos.x = lerp(
      player.gridPos.x * cellSize,
      player.hopTarget.x * cellSize,
      progress,
    );
    player.worldPos.y = lerp(
      player.gridPos.y * cellSize,
      player.hopTarget.y * cellSize,
      progress,
    );

    if (player.hopProgress >= 1) {
      // Land
      player.gridPos.x = player.hopTarget.x;
      player.gridPos.y = player.hopTarget.y;
      player.worldPos.x = player.gridPos.x * cellSize;
      player.worldPos.y = player.gridPos.y * cellSize;
      player.hopTarget = null;
      player.hopProgress = 0;
      player.animation = "idle";

      // Hop dust particles on landing
      spawnHopDust(state, config);

      // Check score (lower y = further forward)
      const startY = SAFE_START_LANES - 1;
      const newScore = startY - player.gridPos.y;
      if (newScore > state.score) {
        state.score = newScore;
        callbacks.onScoreChange(state.score);
        spawnScoreSparkle(state, config);

        // Check for level up
        const newLevel = getLevelForScore(state.score);
        if (newLevel > state.level) {
          state.level = newLevel;
          callbacks.onLevelUp(newLevel);
        }
      }

      // Check if landing on water lane -- survive if on a log
      const landingLane = state.lanes.find(
        (l) => l.y === player.gridPos.y,
      );
      if (landingLane && landingLane.type === "water") {
        const log = findLogUnderPlayer(state, config);
        if (log) {
          player.ridingLogId = log.id;
          spawnSplashParticles(state, config);
          spawnLogWakeParticles(state, config);
        } else {
          killPlayer(state, "water", config, callbacks);
        }
      } else {
        // Not on water -- clear riding state
        player.ridingLogId = null;
      }
    }
  } else {
    // Not hopping - increment idle timer
    player.idleTimer += fixedTimestep;
  }
}

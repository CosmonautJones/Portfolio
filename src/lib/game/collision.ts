// ---------------------------------------------------------------------------
// Collision detection, kill logic, idle timeout, and back-death checks
// ---------------------------------------------------------------------------

import type { GameState, GameConfig, GameCallbacks, DeathCause } from "./types";
import { COLLISION_MARGIN, SAFE_START_LANES } from "./constants";
import { spawnDeathParticles } from "./particles";

// ---------------------------------------------------------------------------
// Kill player
// ---------------------------------------------------------------------------

export function killPlayer(
  state: GameState,
  cause: DeathCause,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  const { player } = state;
  player.alive = false;
  player.animation = "death";
  state.deathCause = cause;

  // Enter "dying" sub-phase -- 500ms slow-mo before game_over
  state.dyingTimer = 0;
  state.phase = "game_over";

  const totalScore = state.score + state.coinBonusScore;
  if (totalScore > state.highScore) {
    state.highScore = totalScore;
  }

  // Spawn death particles with per-cause colors and directional bias
  spawnDeathParticles(state, cause, config);

  callbacks.onDeath(cause, totalScore);
  callbacks.onPhaseChange("game_over");
}

// ---------------------------------------------------------------------------
// Collision detection
// ---------------------------------------------------------------------------

export function checkCollisions(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (!state.player.alive || state.phase !== "playing") return;

  const { player } = state;
  const { cellSize } = config;

  // Player hitbox with forgiving margin
  const margin = cellSize * COLLISION_MARGIN;
  const px1 = player.worldPos.x + margin;
  const py1 = player.worldPos.y + margin;
  const px2 = player.worldPos.x + cellSize - margin;
  const py2 = player.worldPos.y + cellSize - margin;

  // Determine which lanes to check
  const lanesToCheck = new Set<number>();
  lanesToCheck.add(player.gridPos.y);
  if (player.hopTarget) {
    lanesToCheck.add(player.hopTarget.y);
  }

  for (const lane of state.lanes) {
    if (!lanesToCheck.has(lane.y)) continue;

    for (const obs of lane.obstacles) {
      // Logs are safe to touch -- they're rideable platforms
      if (obs.type === "log") continue;

      const ox1 = obs.worldX;
      const oy1 = obs.laneY * cellSize;
      const ox2 = obs.worldX + obs.widthCells * cellSize;
      const oy2 = oy1 + cellSize;

      // AABB overlap test
      if (px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1) {
        const cause: DeathCause = obs.type === "train" ? "train" : "vehicle";
        killPlayer(state, cause, config, callbacks);
        return;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Timeout & back-death checks
// ---------------------------------------------------------------------------

export function checkIdleTimeout(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (
    state.phase === "playing" &&
    state.player.idleTimer > config.idleTimeout
  ) {
    killPlayer(state, "idle_timeout", config, callbacks);
  }
}

export function checkBackDeath(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (state.phase !== "playing" || !state.player.alive) return;

  const startY = SAFE_START_LANES - 1;
  const furthestY = startY - state.score;

  if (
    state.player.gridPos.y >
    furthestY + config.backDeathDistance
  ) {
    killPlayer(state, "off_screen", config, callbacks);
  }
}

import type {
  PowerUp,
  PowerUpType,
  GameState,
  GameConfig,
  GameCallbacks,
  Lane,
} from "./types";
import {
  POWERUP_SPAWN_CHANCE,
  POWERUP_DURATION,
  POWERUP_COLLECT_RADIUS,
  POWERUP_MAGNET_RADIUS,
  POWERUP_PARTICLE_COLORS,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const POWERUP_TYPES: PowerUpType[] = ["shield", "speed", "magnet", "slow_mo"];

// ---------------------------------------------------------------------------
// Spawning — called once per new lane (grass only)
// ---------------------------------------------------------------------------

export function spawnPowerUpsForLane(
  lane: Lane,
  config: GameConfig,
  nextId: { value: number },
): PowerUp[] {
  // Only spawn on grass lanes
  if (lane.type !== "grass") return [];

  const newPowerUps: PowerUp[] = [];

  for (const pType of POWERUP_TYPES) {
    const chance = POWERUP_SPAWN_CHANCE[pType];
    if (Math.random() < chance) {
      const gridX = 1 + Math.floor(Math.random() * (config.gridColumns - 2));
      newPowerUps.push({
        id: nextId.value++,
        type: pType,
        gridX,
        laneY: lane.y,
        worldX: gridX * config.cellSize,
        collected: false,
      });
      // At most one power-up per lane
      break;
    }
  }

  return newPowerUps;
}

// ---------------------------------------------------------------------------
// Collection — distance-based pickup
// ---------------------------------------------------------------------------

export function checkPowerUpCollection(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (!state.player.alive || state.phase !== "playing") return;

  const { player } = state;
  const { cellSize } = config;
  const radius = cellSize * POWERUP_COLLECT_RADIUS;

  const playerCenterX = player.worldPos.x + cellSize / 2;
  const playerCenterY = player.worldPos.y + cellSize / 2;

  for (const pu of state.powerUps) {
    if (pu.collected) continue;

    const puCenterX = pu.worldX + cellSize / 2;
    const puCenterY = pu.laneY * cellSize + cellSize / 2;

    const dx = playerCenterX - puCenterX;
    const dy = playerCenterY - puCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius) {
      pu.collected = true;
      activatePowerUp(state, pu.type);
      spawnPowerUpCollectParticles(state, pu, config);
      callbacks.onPowerUpCollect?.(pu.type);
    }
  }
}

// ---------------------------------------------------------------------------
// Activation — one active per type, new pickup replaces existing
// ---------------------------------------------------------------------------

function activatePowerUp(state: GameState, type: PowerUpType): void {
  const duration = POWERUP_DURATION[type];

  // Replace existing of same type
  const existingIdx = state.activePowerUps.findIndex((a) => a.type === type);
  if (existingIdx >= 0) {
    state.activePowerUps.splice(existingIdx, 1);
  }

  state.activePowerUps.push({
    type,
    remainingTime: duration,
    startTime: state.animationTime,
  });
}

// ---------------------------------------------------------------------------
// Update — decrement timers, remove expired
// ---------------------------------------------------------------------------

export function updatePowerUps(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  const dt = config.fixedTimestep;

  for (let i = state.activePowerUps.length - 1; i >= 0; i--) {
    const ap = state.activePowerUps[i];
    if (ap.remainingTime === Infinity) continue; // shield persists until hit

    ap.remainingTime -= dt;
    if (ap.remainingTime <= 0) {
      callbacks.onPowerUpExpire?.(ap.type);
      state.activePowerUps.splice(i, 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Effect queries — used by other modules
// ---------------------------------------------------------------------------

export function hasActivePowerUp(
  state: GameState,
  type: PowerUpType,
): boolean {
  return state.activePowerUps.some((a) => a.type === type);
}

export function consumeShield(state: GameState): boolean {
  const idx = state.activePowerUps.findIndex((a) => a.type === "shield");
  if (idx >= 0) {
    state.activePowerUps.splice(idx, 1);
    return true;
  }
  return false;
}

export function getSpeedMultiplier(state: GameState): number {
  return hasActivePowerUp(state, "speed") ? 1 : 1; // speed modifies hop duration, not speed
}

export function getSlowMoMultiplier(state: GameState): number {
  return hasActivePowerUp(state, "slow_mo") ? 0.6 : 1;
}

// ---------------------------------------------------------------------------
// Magnet effect — move nearby coins toward player
// ---------------------------------------------------------------------------

export function applyMagnetEffect(
  state: GameState,
  config: GameConfig,
): void {
  if (!hasActivePowerUp(state, "magnet")) return;

  const { player } = state;
  const { cellSize, fixedTimestep } = config;
  const magnetRadius = POWERUP_MAGNET_RADIUS * cellSize;

  const playerCenterX = player.worldPos.x + cellSize / 2;
  const playerCenterY = player.worldPos.y + cellSize / 2;

  for (const coin of state.coins) {
    if (coin.collected) continue;
    // Don't pull coins that are riding logs (they're physically attached)
    if (coin.logId !== null) continue;

    const coinCenterX = coin.worldX + 8;
    const coinCenterY = coin.laneY * cellSize + 8;

    const dx = playerCenterX - coinCenterX;
    const dy = playerCenterY - coinCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < magnetRadius && dist > 1) {
      // Pull coin toward player — speed increases as they get closer
      const pullStrength = (1 - dist / magnetRadius) * 120 * fixedTimestep;
      const nx = dx / dist;
      coin.worldX += nx * pullStrength;
      // We only move worldX — laneY is the grid row, not a pixel position
      coin.gridX = Math.round(coin.worldX / cellSize);
    }
  }
}

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

function spawnPowerUpCollectParticles(
  state: GameState,
  pu: PowerUp,
  config: GameConfig,
): void {
  const { cellSize } = config;
  const cx = pu.worldX + cellSize / 2;
  const cy = pu.laneY * cellSize + cellSize / 2;
  const colors = POWERUP_PARTICLE_COLORS[pu.type];

  const count = 8 + Math.floor(Math.random() * 5); // 8-12
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 30 + Math.random() * 40;
    state.particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      color: pickRandom(colors),
      size: 2 + Math.floor(Math.random() * 3),
      shape: "circle",
    });
  }
}

// ---------------------------------------------------------------------------
// Prune collected / off-screen power-ups
// ---------------------------------------------------------------------------

export function prunePowerUps(state: GameState, pruneY: number): void {
  for (let i = state.powerUps.length - 1; i >= 0; i--) {
    if (state.powerUps[i].collected || state.powerUps[i].laneY > pruneY) {
      state.powerUps.splice(i, 1);
    }
  }
}

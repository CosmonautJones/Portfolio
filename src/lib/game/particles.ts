// ---------------------------------------------------------------------------
// Particle spawning and update
// ---------------------------------------------------------------------------

import type { GameState, GameConfig, DeathCause } from "./types";
import {
  PARTICLE_GRAVITY,
  MAX_ATMOSPHERIC_PARTICLES,
} from "./constants";
import { pickRandom } from "./utils";

// Death-particle palettes by cause
const DEATH_COLORS_BY_CAUSE: Record<string, string[]> = {
  water: ["#41a6f6", "#2d6aa5", "#1e6aa0"],
  vehicle: ["#d4513b", "#ef7d57", "#3c3c50"],
  train: ["#d4513b", "#ef7d57", "#ffff00"],
  idle_timeout: ["#d4513b", "#ef7d57", "#e87461"],
  off_screen: ["#d4513b", "#ef7d57", "#e87461"],
};
const DEFAULT_DEATH_COLORS = ["#d4513b", "#ef7d57", "#e87461"];

// ---------------------------------------------------------------------------
// Gameplay particle spawners
// ---------------------------------------------------------------------------

export function spawnSplashParticles(state: GameState, config: GameConfig): void {
  const { player } = state;
  const cellHalf = config.cellSize / 2;
  const count = 6 + Math.floor(Math.random() * 4); // 6-9 -- bigger splash
  for (let i = 0; i < count; i++) {
    // Ring pattern with upward bias
    const angle = (i / count) * Math.PI * 2;
    const speed = 25 + Math.random() * 40;
    const vy = Math.sin(angle) * speed - 20; // upward bias
    state.particles.push({
      x: player.worldPos.x + cellHalf,
      y: player.worldPos.y + cellHalf,
      vx: Math.cos(angle) * speed,
      vy,
      life: 0.2 + Math.random() * 0.15,
      maxLife: 0.35,
      color: pickRandom(["#41a6f6", "#2d6aa5", "#73eff7", "#60c8f0"]),
      size: 2 + Math.floor(Math.random() * 4),
      shape: "square",
    });
  }
  // Central foam burst -- small white droplets
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    state.particles.push({
      x: player.worldPos.x + cellHalf + (Math.random() - 0.5) * 8,
      y: player.worldPos.y + cellHalf,
      vx: Math.cos(angle) * 10,
      vy: Math.sin(angle) * 10 - 15,
      life: 0.12,
      maxLife: 0.12,
      color: "#e0e8ff",
      size: 2,
      shape: "square",
    });
  }
}

/** Spawn dust particles on hop landing. Colors match terrain type. */
export function spawnHopDust(state: GameState, config: GameConfig): void {
  const { player } = state;
  const cellHalf = config.cellSize / 2;
  const lane = state.lanes.find((l) => l.y === player.gridPos.y);
  const terrainColors: Record<string, string[]> = {
    grass: ["#38b764", "#265c42", "#50d090"],
    road: ["#566c86", "#333c57", "#94b0c2"],
    water: ["#41a6f6", "#2d6aa5", "#73eff7"],
    railroad: ["#566c86", "#333c57", "#94b0c2"],
  };
  const colors = terrainColors[lane?.type ?? "grass"] ?? terrainColors.grass;
  const count = 4 + Math.floor(Math.random() * 3); // 4-6 -- stronger landing burst
  for (let i = 0; i < count; i++) {
    // Fan pattern outward from landing point
    const angle = Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 12 + Math.random() * 20;
    state.particles.push({
      x: player.worldPos.x + cellHalf + (Math.random() - 0.5) * 12,
      y: player.worldPos.y + config.cellSize - 4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.6,
      life: 0.18 + Math.random() * 0.12,
      maxLife: 0.3,
      color: pickRandom(colors),
      size: 2,
      shape: "square",
    });
  }
}

/** Spawn log wake particles when player lands on a log */
export function spawnLogWakeParticles(state: GameState, config: GameConfig): void {
  const { player } = state;
  const cellHalf = config.cellSize / 2;
  // Water droplets fanning behind player
  const count = 5 + Math.floor(Math.random() * 3); // 5-7
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const angle = (Math.PI * 0.5 + side * (0.3 + Math.random() * 0.5));
    const speed = 15 + Math.random() * 25;
    state.particles.push({
      x: player.worldPos.x + cellHalf + (Math.random() - 0.5) * 16,
      y: player.worldPos.y + cellHalf,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 16,
      life: 0.18 + Math.random() * 0.12,
      maxLife: 0.3,
      color: pickRandom(["#41a6f6", "#73eff7", "#60c8f0"]),
      size: 2,
      shape: "square",
    });
  }
}

/** Spawn 2-3 gold sparkle particles upward from player on score increment */
export function spawnScoreSparkle(state: GameState, config: GameConfig): void {
  const { player } = state;
  const cellHalf = config.cellSize / 2;
  const count = 2 + Math.floor(Math.random() * 2); // 2-3
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.8; // upward
    const speed = 20 + Math.random() * 25;
    state.particles.push({
      x: player.worldPos.x + cellHalf + (Math.random() - 0.5) * 12,
      y: player.worldPos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.2,
      maxLife: 0.5,
      color: pickRandom(["#ffcd75", "#ef7d57", "#a7f070"]),
      size: 2 + Math.floor(Math.random() * 4),
      shape: "circle",
    });
  }
}

/** Spawn a blue/cyan burst when a shield absorbs an otherwise-fatal hit. */
export function spawnShieldBreakParticles(
  state: GameState,
  config: GameConfig,
): void {
  const { player } = state;
  const cellHalf = config.cellSize / 2;
  const cx = player.worldPos.x + cellHalf;
  const cy = player.worldPos.y + cellHalf;
  const colors = ["#41a6f6", "#73eff7", "#e0e8ff"];

  const count = 12 + Math.floor(Math.random() * 5); // 12-16
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 50 + Math.random() * 50;
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

/** Spawn death particles with per-cause colors and directional bias */
export function spawnDeathParticles(
  state: GameState,
  cause: DeathCause,
  config: GameConfig,
): void {
  const { player } = state;
  const cellHalf = config.cellSize / 2;

  const colors = DEATH_COLORS_BY_CAUSE[cause] ?? DEFAULT_DEATH_COLORS;
  const particleCount = 14 + Math.floor(Math.random() * 6); // 14-19
  const speedMult = cause === "train" ? 1.8 : cause === "vehicle" ? 1.3 : 1;
  for (let i = 0; i < particleCount; i++) {
    // Water deaths use a ring pattern; vehicle/train add directional bias
    let angle: number;
    if (cause === "water") {
      angle = (i / particleCount) * Math.PI * 2;
    } else {
      angle = Math.random() * Math.PI * 2;
    }
    const speed = (35 + Math.random() * 70) * speedMult;
    // Vehicle/train: bias particles to fly upward and in impact direction
    const biasVx = cause === "vehicle" ? 15 : cause === "train" ? 30 : 0;
    const biasVy = (cause === "vehicle" || cause === "train") ? -20 : 0;
    state.particles.push({
      x: player.worldPos.x + cellHalf,
      y: player.worldPos.y + cellHalf,
      vx: Math.cos(angle) * speed + biasVx,
      vy: Math.sin(angle) * speed + biasVy,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1.0,
      color: pickRandom(colors),
      size: 2 + Math.floor(Math.random() * 4),
      shape: "square",
    });
  }
  // Secondary burst -- small fast fragments
  const fragCount = cause === "train" ? 8 : 4;
  for (let i = 0; i < fragCount; i++) {
    const angle = (i / fragCount) * Math.PI * 2;
    const speed = (60 + Math.random() * 40) * speedMult;
    state.particles.push({
      x: player.worldPos.x + cellHalf,
      y: player.worldPos.y + cellHalf,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 15,
      life: 0.25 + Math.random() * 0.15,
      maxLife: 0.4,
      color: pickRandom(colors),
      size: 2,
      shape: "square",
      trail: true,
    });
  }
}

// ---------------------------------------------------------------------------
// Ambient / environmental particle spawners
// ---------------------------------------------------------------------------

/** Spawn train warning spark particles when train is close to player's row */
export function spawnTrainWarning(state: GameState, config: GameConfig): void {
  const { player, lanes } = state;
  const { cellSize, gridColumns } = config;
  const totalWidth = gridColumns * cellSize;

  for (const lane of lanes) {
    if (lane.type !== "railroad") continue;
    // Only care about lane within 3 rows of player
    if (Math.abs(lane.y - player.gridPos.y) > 3) continue;

    for (const obs of lane.obstacles) {
      if (obs.type !== "train") continue;
      // Check if train is within 3 cells of entering viewport
      const trainEdge = obs.speed > 0 ? obs.worldX : obs.worldX + obs.widthCells * cellSize;
      const inRange = trainEdge > -cellSize * 3 && trainEdge < totalWidth + cellSize * 3;
      if (!inRange) continue;

      // Spawn sparks at the leading edge
      if (Math.random() < 0.3) { // Don't spam every tick
        const sparkX = obs.speed > 0 ? obs.worldX + obs.widthCells * cellSize : obs.worldX;
        state.particles.push({
          x: sparkX,
          y: lane.y * cellSize + cellSize * 0.5,
          vx: (Math.random() - 0.5) * 40,
          vy: -(10 + Math.random() * 20),
          life: 0.1 + Math.random() * 0.15,
          maxLife: 0.25,
          color: pickRandom(["#ffff00", "#ef7d57", "#d4513b"]),
          size: 2,
          shape: "circle",
        });
      }
    }
  }
}

/** Spawn ambient dust motes on visible grass lanes */
export function spawnAmbientParticles(state: GameState, config: GameConfig): void {
  const { camera, lanes } = state;
  const { cellSize, gridColumns } = config;

  // Respect atmospheric particle budget
  const atmosphericCount = countAtmosphericParticles(state);
  if (atmosphericCount >= MAX_ATMOSPHERIC_PARTICLES) return;

  for (const lane of lanes) {
    const screenY = lane.y * cellSize - camera.y;
    if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize) continue;

    if (lane.type === "grass") {
      // Light motes -- reduced rate for cleaner visual
      if (Math.random() < 0.006) {
        state.particles.push({
          x: Math.random() * gridColumns * cellSize,
          y: lane.y * cellSize + Math.random() * cellSize,
          vx: (Math.random() - 0.5) * 3,
          vy: -(1 + Math.random() * 2),
          life: 2 + Math.random(),
          maxLife: 3,
          color: pickRandom(["#a7f070", "#38b764"]),
          size: 2,
          shape: "circle",
        });
      }
    }
    // Road lanes: exhaust/ember particles removed for cleaner visual
  }
}

/** Count atmospheric (non-gameplay) particles for budget enforcement. */
export function countAtmosphericParticles(state: GameState): number {
  // Atmospheric particles are long-lived ambient effects (life > 0.5s)
  // with low velocity -- grass motes, water ripples, etc.
  // Gameplay particles (death, hop dust, splash, sparkle, train warning)
  // are short-lived and high-velocity.
  let count = 0;
  for (const p of state.particles) {
    if (p.maxLife >= 0.5 && !p.trail) {
      count++;
    }
  }
  return count;
}

/** Spawn periodic water ripple ring particles on visible water lanes */
export function spawnWaterRipples(state: GameState, config: GameConfig): void {
  const { camera, lanes } = state;
  const { cellSize, gridColumns } = config;

  // Respect atmospheric particle budget
  const atmosphericCount = countAtmosphericParticles(state);
  if (atmosphericCount >= MAX_ATMOSPHERIC_PARTICLES) return;

  for (const lane of lanes) {
    if (lane.type !== "water") continue;
    const screenY = lane.y * cellSize - camera.y;
    if (screenY < -cellSize || screenY > camera.viewportHeight + cellSize) continue;

    // Firefly ripples -- reduced rate for cleaner visual
    if (Math.random() < 0.004) {
      const rx = Math.random() * gridColumns * cellSize;
      const baseSize = 2;
      state.particles.push({
        x: rx,
        y: lane.y * cellSize + cellSize * 0.5,
        vx: 0,
        vy: 0,
        life: 0.6,
        maxLife: 0.6,
        color: "#73eff7",
        size: baseSize,
        shape: "circle",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Particle physics update
// ---------------------------------------------------------------------------

export function updateParticles(state: GameState, config: GameConfig): void {
  const dt = config.fixedTimestep;
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    // Store previous position for trail rendering
    if (p.trail) {
      p.prevX = p.x;
      p.prevY = p.y;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += PARTICLE_GRAVITY * dt;
    if (p.rotation !== undefined && p.rotationSpeed) {
      p.rotation += p.rotationSpeed * dt;
    }
    p.life -= dt;
    if (p.life <= 0) {
      // Swap-and-pop: O(1) removal instead of O(n) splice
      state.particles[i] = state.particles[state.particles.length - 1];
      state.particles.pop();
      i--; // re-check swapped element
    }
  }
}

import type { GameConfig } from "./types";

export const DEFAULT_CONFIG: GameConfig = {
  cellSize: 16,
  gridColumns: 13,
  hopDuration: 0.12,
  idleTimeout: 7,
  backDeathDistance: 5,
  generateAhead: 30,
  cameraSmoothing: 0.1,
  fixedTimestep: 1 / 60,
};

export const LANE_WEIGHTS = {
  grass: 30,
  road: 50,
  water: 15,
  railroad: 5,
} as const;

export const MAX_CONSECUTIVE = {
  road: 4,
  water: 3,
  railroad: 1,
  grass: 3,
} as const;

export const SAFE_START_LANES = 4;

export const SPEED_RANGES = {
  car: { min: 30, max: 70 },
  truck: { min: 20, max: 50 },
  train: { min: 120, max: 180 },
  log: { min: 15, max: 40 },
} as const;

export const DIFFICULTY = {
  maxScoreThreshold: 200,
  minMultiplier: 1.0,
  maxMultiplier: 2.5,
} as const;

export const LEVEL_THRESHOLDS = [0, 25, 50, 100, 150, 200] as const;

// Physics & rendering constants
export const COLLISION_MARGIN = 0.1; // fraction of cellSize for forgiving hitbox
export const LOG_LANDING_MARGIN = 0.4; // fraction of cellSize for log landing tolerance
export const CAMERA_DEAD_ZONE = 0.65; // fraction of viewport height for camera target
export const PARTICLE_GRAVITY = 50; // px/s^2
export const SWIPE_THRESHOLD = 30; // px minimum for swipe detection
export const WATER_FLOW_SPEED = 8; // tile-offsets per second for water animation
export const GRASS_SHIMMER_SPEED = 1.5; // variant flips per second

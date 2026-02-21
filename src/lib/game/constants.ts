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
} as const;

export const DIFFICULTY = {
  maxScoreThreshold: 200,
  minMultiplier: 1.0,
  maxMultiplier: 2.5,
} as const;

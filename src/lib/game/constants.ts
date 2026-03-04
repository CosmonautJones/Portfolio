import type { GameConfig, CoinType, LaneType } from "./types";

export const DEFAULT_CONFIG: GameConfig = {
  cellSize: 32,
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
  car: { min: 60, max: 140 },
  truck: { min: 40, max: 100 },
  train: { min: 240, max: 360 },
  log: { min: 30, max: 80 },
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
export const PARTICLE_GRAVITY = 100; // px/s^2
export const SWIPE_THRESHOLD = 30; // px minimum for swipe detection
export const WATER_FLOW_SPEED = 16; // tile-offsets per second for water animation
export const GRASS_SHIMMER_SPEED = 1.5; // variant flips per second

// Coin system
export const COIN_VALUES: Record<CoinType, number> = {
  gold: 5,
  silver: 15,
  diamond: 50,
  ruby: 25,
};

export const COIN_RARITY: { type: CoinType; weight: number }[] = [
  { type: "gold", weight: 75 },
  { type: "silver", weight: 13 },
  { type: "ruby", weight: 9 },
  { type: "diamond", weight: 3 },
];

export const COIN_SPAWN_CHANCE: Record<LaneType, number> = {
  grass: 0.4,
  road: 0.25,
  water: 0.3,
  railroad: 0,
};

export const COIN_TRAIL_CHANCE = 0.3; // grass only, always gold
export const COIN_TRAIL_LENGTH = { min: 3, max: 5 };
export const COIN_COLLECT_RADIUS = 0.75; // fraction of cellSize

// Isometric 2.5D depth — Crossy Road style thick ground layers
export const OBJECT_HEIGHT: Record<string, number> = {
  car: 14,
  car_blue: 14,
  car_yellow: 14,
  truck: 16,
  train: 18,
  log: 8,
  coin: 0,
};

export const OBJECT_TOP_FACE: Record<string, number> = {
  car: 5,
  car_blue: 5,
  car_yellow: 5,
  truck: 6,
  train: 7,
  log: 4,
};

export const TILE_DEPTH: Record<LaneType, number> = {
  grass: 14,
  road: 10,
  water: 6,
  railroad: 10,
};

export const GROUND_COLORS: Record<LaneType, { top: string; front: string; frontDark: string }> = {
  grass: { top: "#4ebb6a", front: "#2d8a48", frontDark: "#1e6030" },
  road: { top: "#4a4a5e", front: "#353548", frontDark: "#252535" },
  water: { top: "#2288bb", front: "#1a6699", frontDark: "#0e4470" },
  railroad: { top: "#5a4860", front: "#3d2d48", frontDark: "#2a1d35" },
};

export const TOP_FACE_COLORS: Record<string, string> = {
  car: "#e8505a",
  car_blue: "#5577dd",
  car_yellow: "#ffdd88",
  truck: "#4ec86a",
  train: "#b8c0d0",
  log: "#d8b870",
};

export const SHADOW_OFFSET = { x: 8, y: 6 };
export const SHADOW_ALPHA = 0.4;

// Decoration system
export const DECORATION_CHANCE = 0.7;
export const DECORATIONS_PER_LANE = { min: 2, max: 5 };

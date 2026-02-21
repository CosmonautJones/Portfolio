export interface GridPosition {
  x: number;
  y: number;
}

export interface WorldPosition {
  x: number;
  y: number;
}

export type Direction = "up" | "down" | "left" | "right";
export type LaneType = "grass" | "road" | "water" | "railroad";
export type ObstacleType = "car" | "truck" | "train";
export type GamePhase = "menu" | "playing" | "paused" | "game_over";
export type DeathCause =
  | "vehicle"
  | "train"
  | "water"
  | "idle_timeout"
  | "off_screen";
export type PlayerAnimation = "idle" | "hop" | "land" | "death";

export interface Player {
  gridPos: GridPosition;
  worldPos: WorldPosition;
  facing: Direction;
  animation: PlayerAnimation;
  hopProgress: number;
  hopTarget: GridPosition | null;
  alive: boolean;
  idleTimer: number;
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  laneY: number;
  worldX: number;
  widthCells: number;
  speed: number; // px/sec, negative = left
}

export interface Lane {
  y: number;
  type: LaneType;
  variant: number;
  obstacles: Obstacle[];
  flowDirection: -1 | 1;
  speedMultiplier: number;
}

export interface Camera {
  y: number;
  targetY: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export type SpritePixels = number[][];

export interface SpriteData {
  width: number;
  height: number;
  pixels: SpritePixels;
}

export type InputAction =
  | "move_up"
  | "move_down"
  | "move_left"
  | "move_right"
  | "pause";

export interface GameState {
  phase: GamePhase;
  player: Player;
  lanes: Lane[];
  camera: Camera;
  particles: Particle[];
  actionQueue: InputAction[];
  score: number;
  highScore: number;
  generatedUpTo: number;
  deathCause: DeathCause | null;
  nextEntityId: number;
  timeAccumulator: number;
}

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onDeath: (cause: DeathCause, finalScore: number) => void;
}

export interface GameConfig {
  cellSize: number;
  gridColumns: number;
  hopDuration: number;
  idleTimeout: number;
  backDeathDistance: number;
  generateAhead: number;
  cameraSmoothing: number;
  fixedTimestep: number;
}

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
export type ObstacleType = "car" | "truck" | "train" | "log";
export type CoinType = "gold" | "silver" | "diamond" | "ruby";
export type GamePhase = "menu" | "playing" | "paused" | "game_over";
export type DeathCause =
  | "vehicle"
  | "train"
  | "water"
  | "idle_timeout"
  | "off_screen";
export type PlayerAnimation = "idle" | "hop" | "death";
export type DecorationType = "tree" | "bush" | "rock" | "stump";

export interface Decoration {
  type: DecorationType;
  gridX: number;
  variant: number;
}

export interface Player {
  gridPos: GridPosition;
  worldPos: WorldPosition;
  facing: Direction;
  animation: PlayerAnimation;
  hopProgress: number;
  hopTarget: GridPosition | null;
  alive: boolean;
  idleTimer: number;
  ridingLogId: number | null;
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
  decorations: Decoration[];
  flowDirection: -1 | 1;
  speedMultiplier: number;
}

export interface Camera {
  y: number;
  targetY: number;
  viewportWidth: number;
  viewportHeight: number;
}

export type ParticleShape = "square" | "circle" | "line";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation?: number;
  rotationSpeed?: number;
  shape?: ParticleShape;
  trail?: boolean;
  prevX?: number;
  prevY?: number;
}

export interface Coin {
  id: number;
  type: CoinType;
  gridX: number;
  laneY: number;
  worldX: number;
  collected: boolean;
  logId: number | null;
}

export type SpritePixels = number[][];

export interface SpriteData {
  width: number;
  height: number;
  pixels: SpritePixels;
}

// Power-up system
export type PowerUpType = "shield" | "speed" | "magnet" | "slow_mo";

export interface PowerUp {
  id: number;
  type: PowerUpType;
  gridX: number;
  laneY: number;
  worldX: number;
  collected: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number;
  startTime: number;
}

// Boss lanes
export type BossPattern = "gauntlet" | "rapids" | "train_yard";

export interface BossLaneSection {
  pattern: BossPattern;
  startY: number;
  endY: number;
}

// Weather system
export type WeatherType = "clear" | "rain" | "fog" | "wind";

export interface Weather {
  type: WeatherType;
  intensity: number;
  windDirection: -1 | 1;
}

// Skin system
export type SkinId = "default" | "golden" | "ghost" | "diamond" | "rainbow";

export interface Skin {
  id: SkinId;
  name: string;
  paletteOverrides: Record<number, number>;
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
  level: number;
  generatedUpTo: number;
  deathCause: DeathCause | null;
  nextEntityId: number;
  timeAccumulator: number;
  animationTime: number;
  coins: Coin[];
  coinsCollected: number;
  coinBonusScore: number;
  /** Timer for the dying sub-phase (0→500ms slow-mo before game_over) */
  dyingTimer: number;
  /** Duration of the dying animation in seconds */
  dyingDuration: number;
  /** Power-ups on the ground awaiting pickup */
  powerUps: PowerUp[];
  /** Currently active power-up effects */
  activePowerUps: ActivePowerUp[];
  /** Boss lane patterns already used this run */
  bossLanesUsed: BossPattern[];
  /** Whether we are currently inside a boss section */
  inBossSection: boolean;
  /** Current weather state */
  weather: Weather;
  /** Accumulated wind drift since last hop (reset on hop) */
  windDriftAccumulator: number;
  /** Accumulated rain slide offset (applied once after hop) */
  rainSlideApplied: boolean;
}

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onDeath: (cause: DeathCause, finalScore: number) => void;
  onHop: () => void;
  onLevelUp: (level: number) => void;
  onCoinCollect: (coin: Coin, bonusPoints: number) => void;
  onPowerUpCollect?: (type: PowerUpType) => void;
  onPowerUpExpire?: (type: PowerUpType) => void;
  onBossStart?: (pattern: BossPattern) => void;
  onBossClear?: (pattern: BossPattern) => void;
  onWeatherChange?: (weather: Weather) => void;
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

// --- Ghost Run System ---

export interface GhostFrame {
  /** Game tick at which this frame was recorded */
  tick: number;
  /** Grid X position */
  x: number;
  /** Grid Y position */
  y: number;
  /** Facing direction */
  dir: Direction;
}

export interface GhostRun {
  /** Score achieved during this ghost run */
  score: number;
  /** Compressed frames (only position-change frames stored) */
  frames: GhostFrame[];
  /** When the ghost run was recorded */
  recordedAt: string;
}

// --- Challenge System ---

export type ChallengeType = "score_target" | "collection" | "survival" | "restriction";
export type ChallengePeriod = "daily" | "weekly";
export type RestrictionKind = "no_water_death" | "no_coins";

export interface ChallengeParams {
  /** For score_target: the score to reach */
  targetScore?: number;
  /** For collection: number of coins to collect */
  targetCoins?: number;
  /** For collection: specific coin type required */
  coinType?: CoinType;
  /** For survival: seconds to survive */
  targetSeconds?: number;
  /** For survival: level to reach */
  targetLevel?: number;
  /** For restriction: the restriction kind */
  restriction?: RestrictionKind;
  /** For restriction: score to reach under restriction */
  restrictedScore?: number;
}

export interface Challenge {
  /** Deterministic ID based on date + index */
  id: string;
  /** Challenge type */
  type: ChallengeType;
  /** Challenge parameters */
  params: ChallengeParams;
  /** Human-readable description */
  description: string;
  /** XP reward on completion */
  xpReward: number;
  /** Daily or weekly */
  period: ChallengePeriod;
}

export interface ChallengeProgress {
  /** Challenge ID */
  challengeId: string;
  /** Current progress value (e.g., score reached, coins collected) */
  current: number;
  /** Target value to complete */
  target: number;
  /** Whether the challenge is completed */
  completed: boolean;
  /** Whether a restriction was violated */
  violated?: boolean;
}

// --- Personal Bests ---

export interface PersonalBests {
  bestScore: number;
  mostCoins: number;
  longestSurvivalMs: number;
  highestLevel: number;
  highestCombo: number;
}

// --- Run Summary ---

export interface RunSummary {
  score: number;
  level: number;
  coinsCollected: number;
  coinBonus: number;
  deathCause: DeathCause | null;
  survivalTimeMs: number;
  isNewHighScore: boolean;
  personalBestsBeaten: (keyof PersonalBests)[];
  challengesCompleted: string[];
}

import type {
  GameState,
  GameConfig,
  GameCallbacks,
  Player,
  Lane,
  LaneType,
  ObstacleType,
  Direction,
  DeathCause,
  InputAction,
} from "./types";
import {
  SAFE_START_LANES,
  LANE_WEIGHTS,
  MAX_CONSECUTIVE,
  SPEED_RANGES,
  DIFFICULTY,
  LEVEL_THRESHOLDS,
} from "./constants";

// ---------------------------------------------------------------------------
// Obstacle width lookup (cells)
// ---------------------------------------------------------------------------
const OBSTACLE_WIDTHS: Record<ObstacleType, number> = {
  car: 2,
  truck: 3,
  train: 4,
};

// Death-particle palette
const DEATH_COLORS = ["#d4513b", "#ef7d57", "#e87461"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLevelForScore(score: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (score >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return level;
}

function difficultyMultiplier(score: number): number {
  const t = clamp(score / DIFFICULTY.maxScoreThreshold, 0, 1);
  const baseMult = lerp(DIFFICULTY.minMultiplier, DIFFICULTY.maxMultiplier, t);
  // Add small level-based step bonus
  const level = getLevelForScore(score);
  const levelBonus = (level - 1) * 0.1;
  return baseMult + levelBonus;
}

// ---------------------------------------------------------------------------
// Weighted random lane type selection
// ---------------------------------------------------------------------------

const LANE_TYPES = Object.keys(LANE_WEIGHTS) as LaneType[];
function pickLaneType(consecutiveCounts: Record<LaneType, number>): LaneType {
  // Build available list respecting MAX_CONSECUTIVE
  const available: { type: LaneType; weight: number }[] = [];
  let totalAvailable = 0;
  for (const t of LANE_TYPES) {
    const max = MAX_CONSECUTIVE[t];
    if (consecutiveCounts[t] >= max) continue;
    available.push({ type: t, weight: LANE_WEIGHTS[t] });
    totalAvailable += LANE_WEIGHTS[t];
  }

  // Fallback if everything is maxed (shouldn't happen with 4 types)
  if (available.length === 0) {
    return "grass";
  }

  let r = Math.random() * totalAvailable;
  for (const entry of available) {
    r -= entry.weight;
    if (r <= 0) return entry.type;
  }
  return available[available.length - 1].type;
}

// ---------------------------------------------------------------------------
// Obstacle spawning
// ---------------------------------------------------------------------------

function spawnObstaclesForLane(
  lane: Lane,
  config: GameConfig,
  nextId: { value: number },
  score: number,
): void {
  const { cellSize, gridColumns } = config;
  const totalWidth = gridColumns * cellSize;
  const diff = difficultyMultiplier(score);

  if (lane.type === "road") {
    // 1-3 vehicles per road lane
    const count = 1 + Math.floor(Math.random() * 3);
    const obstacleType: ObstacleType = Math.random() < 0.6 ? "car" : "truck";
    const widthCells = OBSTACLE_WIDTHS[obstacleType];
    const range = SPEED_RANGES[obstacleType];
    const baseSpeed = randomRange(range.min, range.max) * diff;
    const speed = baseSpeed * lane.flowDirection;

    // Distribute obstacles evenly with randomness
    const spacing = (totalWidth + widthCells * cellSize) / count;
    for (let i = 0; i < count; i++) {
      const worldX = i * spacing + randomRange(-spacing * 0.2, spacing * 0.2);
      lane.obstacles.push({
        id: nextId.value++,
        type: obstacleType,
        laneY: lane.y,
        worldX,
        widthCells,
        speed,
      });
    }
  } else if (lane.type === "railroad") {
    const widthCells = OBSTACLE_WIDTHS.train;
    const range = SPEED_RANGES.train;
    const baseSpeed = randomRange(range.min, range.max) * diff;
    const speed = baseSpeed * lane.flowDirection;

    lane.obstacles.push({
      id: nextId.value++,
      type: "train",
      laneY: lane.y,
      worldX: lane.flowDirection > 0 ? -widthCells * cellSize : totalWidth,
      widthCells,
      speed,
    });
  }
  // grass and water: no obstacles
}

// ---------------------------------------------------------------------------
// Lane generation
// ---------------------------------------------------------------------------

function generateLanes(
  fromY: number,
  toY: number,
  config: GameConfig,
  nextId: { value: number },
  score: number,
  existingLanes: Lane[],
): Lane[] {
  const newLanes: Lane[] = [];

  // Determine last lane type for consecutive tracking
  const consecutiveCounts: Record<LaneType, number> = {
    grass: 0,
    road: 0,
    water: 0,
    railroad: 0,
  };

  // Look at the last few existing lanes to seed consecutive counts
  const sortedExisting = existingLanes
    .filter((l) => l.y >= toY && l.y < fromY)
    .sort((a, b) => a.y - b.y); // ascending y (most forward first)

  if (sortedExisting.length > 0) {
    // Walk backwards from the closest existing lane to the generation frontier
    const closest = sortedExisting[0]; // smallest y = most forward existing
    const lastType: LaneType = closest.type;
    consecutiveCounts[lastType] = 1;

    for (let i = 1; i < sortedExisting.length; i++) {
      if (sortedExisting[i].type === lastType) {
        consecutiveCounts[lastType]++;
      } else {
        break;
      }
    }
  }

  // Track last flow direction for alternating road lanes
  let lastFlowDir: -1 | 1 = Math.random() < 0.5 ? -1 : 1;
  // Check last existing lane's flow direction if available
  const lastLane = existingLanes.find((l) => l.y === fromY);
  if (lastLane) {
    lastFlowDir = lastLane.flowDirection;
  }

  // Generate from fromY-1 down to toY (decreasing y = forward)
  for (let y = fromY - 1; y >= toY; y--) {
    const type = pickLaneType(consecutiveCounts);

    // Update consecutive counts
    for (const t of LANE_TYPES) {
      consecutiveCounts[t] = t === type ? consecutiveCounts[t] + 1 : 0;
    }

    // Alternate flow direction for adjacent road/railroad lanes
    const flowDirection: -1 | 1 =
      type === "road" || type === "railroad"
        ? ((-lastFlowDir) as -1 | 1)
        : (pickRandom([-1, 1]) as -1 | 1);
    lastFlowDir = flowDirection;

    const variant = type === "railroad" ? 0 : Math.floor(Math.random() * 2);

    const lane: Lane = {
      y,
      type,
      variant,
      obstacles: [],
      flowDirection,
      speedMultiplier: 1,
    };

    spawnObstaclesForLane(lane, config, nextId, score);
    newLanes.push(lane);
  }

  return newLanes;
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
    lanes.push({
      y,
      type: "grass",
      variant: Math.floor(Math.random() * 2),
      obstacles: [],
      flowDirection: Math.random() < 0.5 ? -1 : 1,
      speedMultiplier: 1,
    });
  }

  const nextId = { value: 1 };

  // Generate procedural lanes ahead (negative y direction)
  const targetY = -generateAhead;
  const generated = generateLanes(0, targetY, config, nextId, 0, lanes);
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
  };

  const camera = {
    y: startY * cellSize - viewportHeight * 0.65,
    targetY: startY * cellSize - viewportHeight * 0.65,
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
  };
}

// ---------------------------------------------------------------------------
// Input processing
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
          }
        }
        // pause in menu → ignored
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
// Player movement
// ---------------------------------------------------------------------------

function initiateHop(
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
  if (callbacks) {
    callbacks.onHop();
  }
}

function updatePlayer(
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

      // Check score (lower y = further forward)
      const startY = SAFE_START_LANES - 1;
      const newScore = startY - player.gridPos.y;
      if (newScore > state.score) {
        state.score = newScore;
        callbacks.onScoreChange(state.score);

        // Check for level up
        const newLevel = getLevelForScore(state.score);
        if (newLevel > state.level) {
          state.level = newLevel;
          callbacks.onLevelUp(newLevel);
        }
      }

      // Check if landing on water lane
      const landingLane = state.lanes.find(
        (l) => l.y === player.gridPos.y,
      );
      if (landingLane && landingLane.type === "water") {
        killPlayer(state, "water", callbacks);
      }
    }
  } else {
    // Not hopping - increment idle timer
    player.idleTimer += fixedTimestep;
  }
}

// ---------------------------------------------------------------------------
// Obstacle movement
// ---------------------------------------------------------------------------

function updateObstacles(state: GameState, config: GameConfig): void {
  const { cellSize, gridColumns, fixedTimestep } = config;
  const totalWidth = gridColumns * cellSize;
  const margin = cellSize * 2;

  for (const lane of state.lanes) {
    for (const obs of lane.obstacles) {
      obs.worldX += obs.speed * fixedTimestep;

      const obsPixelWidth = obs.widthCells * cellSize;
      if (obs.speed > 0 && obs.worldX > totalWidth + margin) {
        obs.worldX = -obsPixelWidth;
      } else if (obs.speed < 0 && obs.worldX + obsPixelWidth < -margin) {
        obs.worldX = totalWidth;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Collision detection
// ---------------------------------------------------------------------------

function checkCollisions(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (!state.player.alive || state.phase !== "playing") return;

  const { player } = state;
  const { cellSize } = config;

  // Player hitbox with 10% margin (forgiving)
  const margin = cellSize * 0.1;
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
      const ox1 = obs.worldX;
      const oy1 = obs.laneY * cellSize;
      const ox2 = obs.worldX + obs.widthCells * cellSize;
      const oy2 = oy1 + cellSize;

      // AABB overlap test
      if (px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1) {
        const cause: DeathCause = obs.type === "train" ? "train" : "vehicle";
        killPlayer(state, cause, callbacks);
        return;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Kill player
// ---------------------------------------------------------------------------

function killPlayer(
  state: GameState,
  cause: DeathCause,
  callbacks: GameCallbacks,
): void {
  const { player } = state;
  player.alive = false;
  player.animation = "death";
  state.phase = "game_over";
  state.deathCause = cause;

  if (state.score > state.highScore) {
    state.highScore = state.score;
  }

  // Spawn death particles
  const particleCount = 8 + Math.floor(Math.random() * 5); // 8-12
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 60;
    state.particles.push({
      x: player.worldPos.x + DEFAULT_CONFIG_CELL_HALF,
      y: player.worldPos.y + DEFAULT_CONFIG_CELL_HALF,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.4,
      maxLife: 0.8,
      color: pickRandom(DEATH_COLORS),
      size: 1 + Math.floor(Math.random() * 3),
    });
  }

  callbacks.onDeath(cause, state.score);
  callbacks.onPhaseChange("game_over");
}

// Approximate center offset for particle spawn
const DEFAULT_CONFIG_CELL_HALF = 8; // cellSize / 2 for default 16

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

function updateCamera(state: GameState, config: GameConfig): void {
  const { camera, player } = state;
  camera.targetY = player.worldPos.y - camera.viewportHeight * 0.65;
  camera.y += (camera.targetY - camera.y) * config.cameraSmoothing;
}

// ---------------------------------------------------------------------------
// Timeout & back-death checks
// ---------------------------------------------------------------------------

function checkIdleTimeout(
  state: GameState,
  config: GameConfig,
  callbacks: GameCallbacks,
): void {
  if (
    state.phase === "playing" &&
    state.player.idleTimer > config.idleTimeout
  ) {
    killPlayer(state, "idle_timeout", callbacks);
  }
}

function checkBackDeath(
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
    killPlayer(state, "off_screen", callbacks);
  }
}

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

function updateParticles(state: GameState, config: GameConfig): void {
  const dt = config.fixedTimestep;
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Lane generation (runtime)
// ---------------------------------------------------------------------------

function generateLanesIfNeeded(
  state: GameState,
  config: GameConfig,
): void {
  const targetY = state.player.gridPos.y - config.generateAhead;

  if (targetY >= state.generatedUpTo) return;

  const nextId = { value: state.nextEntityId };
  const newLanes = generateLanes(
    state.generatedUpTo,
    targetY,
    config,
    nextId,
    state.score,
    state.lanes,
  );

  state.lanes.push(...newLanes);
  state.nextEntityId = nextId.value;
  state.generatedUpTo = targetY;
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
      updateObstacles(state, config);
      checkCollisions(state, config, callbacks);
      checkIdleTimeout(state, config, callbacks);
      checkBackDeath(state, config, callbacks);
      updateCamera(state, config);
      generateLanesIfNeeded(state, config);
    }

    // Always update particles (they should animate during game_over too)
    updateParticles(state, config);
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

  // Clear lanes and regenerate
  state.lanes.length = 0;
  for (let y = 0; y < SAFE_START_LANES; y++) {
    state.lanes.push({
      y,
      type: "grass",
      variant: Math.floor(Math.random() * 2),
      obstacles: [],
      flowDirection: Math.random() < 0.5 ? -1 : 1,
      speedMultiplier: 1,
    });
  }

  const nextId = { value: 1 };
  const targetY = -generateAhead;
  const generated = generateLanes(0, targetY, config, nextId, 0, state.lanes);
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

  // Reset camera
  state.camera.y =
    startY * cellSize - state.camera.viewportHeight * 0.65;
  state.camera.targetY = state.camera.y;

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

  if (callbacks) {
    callbacks.onPhaseChange("playing");
  }
}

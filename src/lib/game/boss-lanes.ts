import type {
  BossPattern,
  Lane,
  GameState,
  GameConfig,
  GameCallbacks,
  Obstacle,
} from "./types";
import {
  BOSS_LEVEL_TRIGGERS,
  BOSS_BUFFER_LANES,
  BOSS_CLEAR_BONUS,
  SPEED_RANGES,
  LEVEL_THRESHOLDS,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ---------------------------------------------------------------------------
// Boss pattern detection
// ---------------------------------------------------------------------------

/**
 * Check if a boss pattern should trigger based on the player's current score.
 * Returns the pattern to inject, or null if none.
 */
export function checkBossTrigger(state: GameState): BossPattern | null {
  const patterns: BossPattern[] = ["gauntlet", "rapids", "train_yard"];

  for (const pattern of patterns) {
    if (state.bossLanesUsed.includes(pattern)) continue;

    const triggerLevel = BOSS_LEVEL_TRIGGERS[pattern];
    const threshold = LEVEL_THRESHOLDS[triggerLevel - 1];
    if (threshold === undefined) continue;

    // Trigger when score crosses the threshold (within a small window)
    if (state.score >= threshold && state.score < threshold + 3) {
      return pattern;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Boss lane generation
// ---------------------------------------------------------------------------

/**
 * Generate a boss section: buffer grass lanes + boss lanes.
 * Returns the full set of lanes to inject.
 */
export function generateBossSection(
  pattern: BossPattern,
  startY: number,
  config: GameConfig,
  nextId: { value: number },
  score: number,
): Lane[] {
  const lanes: Lane[] = [];
  let y = startY;

  // Buffer grass lanes with warning
  for (let i = 0; i < BOSS_BUFFER_LANES; i++) {
    y--;
    lanes.push({
      y,
      type: "grass",
      variant: 0,
      obstacles: [],
      decorations: [],
      flowDirection: 1,
      speedMultiplier: 1,
    });
  }

  // Boss-specific lanes
  switch (pattern) {
    case "gauntlet":
      lanes.push(...generateGauntlet(y, config, nextId, score));
      break;
    case "rapids":
      lanes.push(...generateRapids(y, config, nextId, score));
      break;
    case "train_yard":
      lanes.push(...generateTrainYard(y, config, nextId, score));
      break;
  }

  return lanes;
}

/**
 * Returns the total number of lanes in a boss section (buffer + boss lanes).
 */
export function getBossSectionSize(pattern: BossPattern): number {
  switch (pattern) {
    case "gauntlet":
      return BOSS_BUFFER_LANES + 3;
    case "rapids":
      return BOSS_BUFFER_LANES + 3;
    case "train_yard":
      return BOSS_BUFFER_LANES + 2;
  }
}

// ---------------------------------------------------------------------------
// Boss section tracking
// ---------------------------------------------------------------------------

/**
 * Check if the player has cleared a boss section.
 * A boss section is "cleared" when the player's score moves past the
 * boss section's end lane.
 */
export function checkBossClear(
  state: GameState,
  callbacks: GameCallbacks,
): void {
  if (!state.inBossSection) return;

  // Boss is cleared when the player is beyond the boss section
  // Simple heuristic: we entered the boss, and now score has advanced enough
  const pattern = state.bossLanesUsed[state.bossLanesUsed.length - 1];
  if (!pattern) return;

  const triggerLevel = BOSS_LEVEL_TRIGGERS[pattern];
  const threshold = LEVEL_THRESHOLDS[triggerLevel - 1];
  if (threshold === undefined) return;

  const bossSize = getBossSectionSize(pattern);
  // Cleared when we've advanced past the boss section
  if (state.score >= threshold + bossSize + BOSS_BUFFER_LANES) {
    state.inBossSection = false;
    state.coinBonusScore += BOSS_CLEAR_BONUS;
    callbacks.onBossClear?.(pattern);
  }
}

// ---------------------------------------------------------------------------
// Pattern: Gauntlet — 3 dense road lanes
// ---------------------------------------------------------------------------

function generateGauntlet(
  bufferEndY: number,
  config: GameConfig,
  nextId: { value: number },
  _score: number,
): Lane[] {
  const { cellSize, gridColumns } = config;
  const totalWidth = gridColumns * cellSize;
  const lanes: Lane[] = [];

  for (let i = 0; i < 3; i++) {
    const y = bufferEndY - 1 - i;
    const dir: -1 | 1 = i % 2 === 0 ? 1 : -1;

    const lane: Lane = {
      y,
      type: "road",
      variant: 0,
      obstacles: [],
      decorations: [],
      flowDirection: dir,
      speedMultiplier: 1.3,
    };

    // 3-4 vehicles per lane (dense)
    const count = 3 + Math.floor(Math.random() * 2);
    const obstacleType = Math.random() < 0.5 ? "car" : "truck";
    const widthCells = obstacleType === "car" ? 2 : 3;
    const range = SPEED_RANGES[obstacleType];
    const speed = randomRange(range.min, range.max) * 1.5 * dir;

    const spacing = (totalWidth + widthCells * cellSize) / count;
    for (let j = 0; j < count; j++) {
      const worldX =
        j * spacing + randomRange(-spacing * 0.15, spacing * 0.15);
      lane.obstacles.push({
        id: nextId.value++,
        type: obstacleType,
        laneY: y,
        worldX,
        widthCells,
        speed,
      });
    }

    lanes.push(lane);
  }

  return lanes;
}

// ---------------------------------------------------------------------------
// Pattern: Rapids — 3 fast water lanes with short logs
// ---------------------------------------------------------------------------

function generateRapids(
  bufferEndY: number,
  config: GameConfig,
  nextId: { value: number },
  _score: number,
): Lane[] {
  const { cellSize, gridColumns } = config;
  const totalWidth = gridColumns * cellSize;
  const lanes: Lane[] = [];

  for (let i = 0; i < 3; i++) {
    const y = bufferEndY - 1 - i;
    const dir: -1 | 1 = i % 2 === 0 ? 1 : -1;

    const lane: Lane = {
      y,
      type: "water",
      variant: 0,
      obstacles: [],
      decorations: [],
      flowDirection: dir,
      speedMultiplier: 1.5,
    };

    // 2-3 short logs (2 cells wide instead of default 3)
    const count = 2 + Math.floor(Math.random() * 2);
    const widthCells = 2;
    const range = SPEED_RANGES.log;
    const speed = randomRange(range.min, range.max) * 1.8 * dir;

    const spacing = (totalWidth + widthCells * cellSize) / count;
    for (let j = 0; j < count; j++) {
      const worldX =
        j * spacing + randomRange(-spacing * 0.1, spacing * 0.1);
      lane.obstacles.push({
        id: nextId.value++,
        type: "log",
        laneY: y,
        worldX,
        widthCells,
        speed,
      });
    }

    lanes.push(lane);
  }

  return lanes;
}

// ---------------------------------------------------------------------------
// Pattern: Train Yard — 2 railroad lanes with staggered timing
// ---------------------------------------------------------------------------

function generateTrainYard(
  bufferEndY: number,
  config: GameConfig,
  nextId: { value: number },
  _score: number,
): Lane[] {
  const { cellSize, gridColumns } = config;
  const totalWidth = gridColumns * cellSize;
  const lanes: Lane[] = [];

  for (let i = 0; i < 2; i++) {
    const y = bufferEndY - 1 - i;
    const dir: -1 | 1 = i % 2 === 0 ? 1 : -1;

    const lane: Lane = {
      y,
      type: "railroad",
      variant: 0,
      obstacles: [],
      decorations: [],
      flowDirection: dir,
      speedMultiplier: 1,
    };

    const widthCells = 4;
    const range = SPEED_RANGES.train;
    const speed = randomRange(range.min, range.max) * dir;

    // Stagger the second train's starting position
    const startX =
      dir > 0
        ? -widthCells * cellSize - (i * totalWidth * 0.4)
        : totalWidth + (i * totalWidth * 0.4);

    lane.obstacles.push({
      id: nextId.value++,
      type: "train",
      laneY: y,
      worldX: startX,
      widthCells,
      speed,
    } as Obstacle);

    lanes.push(lane);
  }

  return lanes;
}

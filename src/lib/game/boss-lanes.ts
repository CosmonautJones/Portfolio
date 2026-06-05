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
 *
 * Dedup is handled entirely by `state.bossLanesUsed` (a pattern fires at most
 * once per run) plus the `state.inBossSection` guard at the call site, so the
 * trigger only needs a lower bound. The previous `< threshold + 3` upper bound
 * made the trigger fragile: if generation/score timing skipped the 3-unit
 * window the boss would never fire. Patterns are checked in fixed order so the
 * earliest unused boss whose threshold is met fires first (deterministic).
 */
export function checkBossTrigger(state: GameState): BossPattern | null {
  const patterns: BossPattern[] = ["gauntlet", "rapids", "train_yard"];

  for (const pattern of patterns) {
    if (state.bossLanesUsed.includes(pattern)) continue;

    const triggerLevel = BOSS_LEVEL_TRIGGERS[pattern];
    const threshold = LEVEL_THRESHOLDS[triggerLevel - 1];
    if (threshold === undefined) continue;

    if (state.score >= threshold) {
      return pattern;
    }
  }

  return null;
}

/**
 * Trigger + inject a boss section into the live lane stream if conditions are
 * met. Called from generateLanesIfNeeded BEFORE normal lane generation so the
 * boss block lands at the current generation frontier and normal generation
 * then continues ahead of it. No-op while already inside a section.
 *
 * On injection it appends the section lanes, advances generatedUpTo past the
 * block, records the pattern, sets inBossSection, stores the deterministic
 * clear position (bossSectionEndY), and fires onBossStart.
 *
 * Returns true if a section was injected.
 */
export function injectBossSection(
  state: GameState,
  config: GameConfig,
  callbacks?: GameCallbacks,
): boolean {
  if (state.inBossSection) return false;

  const pattern = checkBossTrigger(state);
  if (!pattern) return false;

  const nextId = { value: state.nextEntityId };
  const startY = state.generatedUpTo;
  const bossLanes = generateBossSection(
    pattern,
    startY,
    config,
    nextId,
    state.score,
  );

  state.lanes.push(...bossLanes);
  state.nextEntityId = nextId.value;

  const sectionSize = getBossSectionSize(pattern);
  // Forward-most (lowest) lane y of the section. The player has fully traversed
  // the section once gridPos.y drops below this.
  const endY = startY - sectionSize;
  state.generatedUpTo = endY;

  state.bossLanesUsed.push(pattern);
  state.inBossSection = true;
  state.bossSectionEndY = endY;

  callbacks?.onBossStart?.(pattern);

  return true;
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
 * Check if the player has cleared the active boss section.
 *
 * Deterministic position-based detection: the section is cleared once the
 * player has physically traversed PAST the forward-most lane of the section
 * (player.gridPos.y < bossSectionEndY). This replaces the old score-based
 * heuristic, which could award the bonus without the player ever crossing the
 * hazard lanes. The bonus flows through coinBonusScore (NOT raw distance) to
 * stay consistent with the leaderboard's distance+coins separation.
 */
export function checkBossClear(
  state: GameState,
  callbacks: GameCallbacks,
): void {
  if (!state.inBossSection) return;
  if (state.bossSectionEndY === null) return;

  const pattern = state.bossLanesUsed[state.bossLanesUsed.length - 1];
  if (!pattern) return;

  // Lower y = further forward. Cleared when the player is past the section end.
  if (state.player.gridPos.y < state.bossSectionEndY) {
    state.inBossSection = false;
    state.bossSectionEndY = null;
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

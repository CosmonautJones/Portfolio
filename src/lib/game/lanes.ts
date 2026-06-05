// ---------------------------------------------------------------------------
// Lane generation, decoration spawning, and pruning
// ---------------------------------------------------------------------------

import type {
  GameState,
  GameConfig,
  GameCallbacks,
  Lane,
  LaneType,
  Coin,
  PowerUp,
  Decoration,
  DecorationType,
} from "./types";
import {
  LANE_WEIGHTS,
  MAX_CONSECUTIVE,
  DECORATION_CHANCE,
  DECORATIONS_PER_LANE,
} from "./constants";
import { pickRandom } from "./utils";
import { spawnObstaclesForLane } from "./obstacles";
import { spawnCoinsForLane, pruneCoins } from "./coins";
import { spawnPowerUpsForLane, prunePowerUps } from "./power-ups";
import { injectBossSection } from "./boss-lanes";
import { DECORATION_VARIANTS } from "./sprites/decorations";

// ---------------------------------------------------------------------------
// Weighted random lane type selection
// ---------------------------------------------------------------------------

const LANE_TYPES = Object.keys(LANE_WEIGHTS) as LaneType[];
const _lanePool: { type: LaneType; weight: number }[] = [];

export function pickLaneType(consecutiveCounts: Record<LaneType, number>): LaneType {
  // Build available list respecting MAX_CONSECUTIVE (reuse pool to avoid GC)
  _lanePool.length = 0;
  let totalAvailable = 0;
  for (const t of LANE_TYPES) {
    const max = MAX_CONSECUTIVE[t];
    if (consecutiveCounts[t] >= max) continue;
    _lanePool.push({ type: t, weight: LANE_WEIGHTS[t] });
    totalAvailable += LANE_WEIGHTS[t];
  }

  // Fallback if everything is maxed (shouldn't happen with 4 types)
  if (_lanePool.length === 0) {
    return "grass";
  }

  let r = Math.random() * totalAvailable;
  for (const entry of _lanePool) {
    r -= entry.weight;
    if (r <= 0) return entry.type;
  }
  return _lanePool[_lanePool.length - 1].type;
}

// ---------------------------------------------------------------------------
// Decoration spawning (grass lanes only, non-collidable)
// ---------------------------------------------------------------------------

const DECORATION_WEIGHTS: { type: DecorationType; weight: number }[] = [
  { type: "tree", weight: 35 },
  { type: "bush", weight: 25 },
  { type: "rock", weight: 20 },
  { type: "stump", weight: 20 },
];

function pickDecorationType(): DecorationType {
  const total = DECORATION_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * total;
  for (const entry of DECORATION_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return DECORATION_WEIGHTS[DECORATION_WEIGHTS.length - 1].type;
}

export function spawnDecorationsForLane(
  lane: Lane,
  config: GameConfig,
): void {
  if (lane.type !== "grass") return;
  if (Math.random() > DECORATION_CHANCE) return;

  const { gridColumns } = config;
  const count =
    DECORATIONS_PER_LANE.min +
    Math.floor(
      Math.random() * (DECORATIONS_PER_LANE.max - DECORATIONS_PER_LANE.min + 1),
    );

  // Pick unique columns
  const usedColumns = new Set<number>();
  const decorations: Decoration[] = [];
  let attempts = 0;
  while (decorations.length < count && attempts < count * 3) {
    attempts++;
    const col = Math.floor(Math.random() * gridColumns);
    if (usedColumns.has(col)) continue;
    usedColumns.add(col);

    const type = pickDecorationType();
    const maxVariant = DECORATION_VARIANTS[type] ?? 1;
    decorations.push({
      type,
      gridX: col,
      variant: Math.floor(Math.random() * maxVariant),
    });
  }

  lane.decorations = decorations;
}

// ---------------------------------------------------------------------------
// Lane generation
// ---------------------------------------------------------------------------

export function generateLanes(
  fromY: number,
  toY: number,
  config: GameConfig,
  nextId: { value: number },
  score: number,
  existingLanes: Lane[],
  coins?: Coin[],
  powerUps?: PowerUp[],
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
      decorations: [],
      flowDirection,
      speedMultiplier: 1,
    };

    spawnObstaclesForLane(lane, config, nextId, score);
    spawnDecorationsForLane(lane, config);

    // Spawn coins after obstacles so we know where gaps are
    if (coins) {
      const newCoins = spawnCoinsForLane(lane, config, nextId);
      coins.push(...newCoins);
    }

    // Spawn ground power-ups (self-gates on grass + per-type roll). Done here so
    // initial-state, reset, and runtime generation all populate power-ups
    // uniformly — previously only the runtime path did, leaving the first ~30
    // lanes of every run power-up-free.
    if (powerUps) {
      const newPowerUps = spawnPowerUpsForLane(lane, config, nextId);
      if (newPowerUps.length > 0) powerUps.push(...newPowerUps);
    }

    newLanes.push(lane);
  }

  return newLanes;
}

// ---------------------------------------------------------------------------
// Runtime lane generation and pruning
// ---------------------------------------------------------------------------

export function generateLanesIfNeeded(
  state: GameState,
  config: GameConfig,
  callbacks?: GameCallbacks,
): void {
  // Inject a boss section at the current frontier (if one should trigger and we
  // are not already inside one) BEFORE normal generation, so normal lanes keep
  // being generated AHEAD of the injected block. injectBossSection advances
  // state.generatedUpTo past the section, so the normal pass below fills in from
  // the new frontier. This must precede the early-return so the boss can trigger
  // even on a tick where the frontier already reaches generateAhead.
  injectBossSection(state, config, callbacks);

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
    state.coins,
    state.powerUps,
  );

  state.lanes.push(...newLanes);
  state.nextEntityId = nextId.value;
  state.generatedUpTo = targetY;
}

export function pruneLanesBehindPlayer(state: GameState, config: GameConfig): void {
  const pruneY = state.player.gridPos.y + config.backDeathDistance + 5;
  for (let i = state.lanes.length - 1; i >= 0; i--) {
    if (state.lanes[i].y > pruneY) {
      state.lanes.splice(i, 1);
    }
  }
  pruneCoins(state, pruneY);
  prunePowerUps(state, pruneY);
}

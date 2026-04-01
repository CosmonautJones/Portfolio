// ---------------------------------------------------------------------------
// Obstacle spawning and movement
// ---------------------------------------------------------------------------

import type { GameState, GameConfig, Lane, ObstacleType } from "./types";
import { SPEED_RANGES } from "./constants";
import { randomRange } from "./utils";
import { difficultyMultiplier } from "./difficulty";

// Obstacle width lookup (cells)
const OBSTACLE_WIDTHS: Record<ObstacleType, number> = {
  car: 2,
  truck: 3,
  train: 4,
  log: 3,
};

// ---------------------------------------------------------------------------
// Obstacle spawning
// ---------------------------------------------------------------------------

export function spawnObstaclesForLane(
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
  } else if (lane.type === "water") {
    // 2-3 logs per water lane -- logs are rideable platforms
    const count = 2 + Math.floor(Math.random() * 2);
    const widthCells = OBSTACLE_WIDTHS.log;
    const range = SPEED_RANGES.log;
    const baseSpeed = randomRange(range.min, range.max) * diff;
    const speed = baseSpeed * lane.flowDirection;

    // Distribute evenly with randomized offsets and guaranteed gaps
    const spacing = (totalWidth + widthCells * cellSize) / count;
    for (let i = 0; i < count; i++) {
      const worldX =
        i * spacing + randomRange(-spacing * 0.15, spacing * 0.15);
      lane.obstacles.push({
        id: nextId.value++,
        type: "log",
        laneY: lane.y,
        worldX,
        widthCells,
        speed,
      });
    }
  }
  // grass: no obstacles
}

// ---------------------------------------------------------------------------
// Obstacle movement
// ---------------------------------------------------------------------------

export function updateObstacles(state: GameState, config: GameConfig): void {
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

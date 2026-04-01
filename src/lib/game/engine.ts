// ---------------------------------------------------------------------------
// Barrel re-export — preserves the original engine.ts public API
// ---------------------------------------------------------------------------
// All logic has been extracted into focused modules:
//   tick.ts, player.ts, obstacles.ts, collision.ts, lanes.ts,
//   particles.ts, camera.ts, difficulty.ts, utils.ts
// ---------------------------------------------------------------------------

export { createInitialState, tick, resetForNewGame } from "./tick";
export { spawnDecorationsForLane } from "./lanes";
export { spawnTrainWarning, spawnAmbientParticles, spawnWaterRipples } from "./particles";

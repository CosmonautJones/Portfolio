import { getAllEasterEggs } from "./registry";

/**
 * Number of distinct easter eggs that must be discovered to unlock the
 * "cartographer" achievement. Derived from the registry so the threshold can
 * never drift from the actual number of reachable eggs.
 */
export const CARTOGRAPHER_EGG_COUNT = getAllEasterEggs().length;

/** Distinct projects that must be viewed to unlock the "road_scholar" achievement. */
export const ROAD_SCHOLAR_PROJECT_COUNT = 3;

/**
 * Returns true when the set of distinct discoveries is enough to unlock the
 * "cartographer" achievement. Duplicate entries are ignored.
 */
export function shouldUnlockCartographer(discoveries: string[]): boolean {
  return new Set(discoveries).size >= CARTOGRAPHER_EGG_COUNT;
}

/**
 * Returns true when enough distinct projects have been viewed to unlock the
 * "road_scholar" achievement.
 */
export function shouldUnlockRoadScholar(viewedSlugs: Set<string>): boolean {
  return viewedSlugs.size >= ROAD_SCHOLAR_PROJECT_COUNT;
}

/**
 * Returns true when every cell of a pixel-art grid is painted (no transparent
 * cells, i.e. no index-0 entries). Used to fire the "pixel_perfect" achievement.
 */
export function isCanvasFull(grid: number[][]): boolean {
  if (grid.length === 0) return false;
  return grid.every((row) => row.length > 0 && row.every((cell) => cell !== 0));
}

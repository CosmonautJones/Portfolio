import { LOBSTER_DOWN_IDLE } from "@/lib/game/sprites/lobster";

export const CORE_PALETTE_INDICES = [
  1, 4, 5, 12, 13, 17, 18, 19, 29, 31, 88, 91,
] as const;

export function createEmptyGrid(size: number): number[][] {
  return Array.from({ length: size }, () => Array<number>(size).fill(0));
}

export function cloneGrid(grid: readonly (readonly number[])[]): number[][] {
  return grid.map((row) => [...row]);
}

export function createLobsterStarter(): number[][] {
  return cloneGrid(LOBSTER_DOWN_IDLE);
}

export function identifyStarter(
  grid: readonly (readonly number[])[]
): "lobster" | "blank" | null {
  if (grid.every((row) => row.every((cell) => cell === 0))) return "blank";

  const lobster = LOBSTER_DOWN_IDLE;
  const isLobster =
    grid.length === lobster.length &&
    grid.every(
      (row, y) =>
        row.length === lobster[y].length &&
        row.every((cell, x) => cell === lobster[y][x])
    );

  return isLobster ? "lobster" : null;
}

export function floodFill(
  grid: readonly (readonly number[])[],
  x: number,
  y: number,
  newColor: number
): number[][] {
  const targetColor = grid[y]?.[x];
  if (targetColor === undefined || targetColor === newColor) {
    return cloneGrid(grid);
  }

  const next = cloneGrid(grid);
  const queue: Array<[number, number]> = [[x, y]];
  const height = next.length;
  const width = next[0]?.length ?? 0;

  while (queue.length > 0) {
    const [currentX, currentY] = queue.shift()!;
    if (
      currentX < 0 ||
      currentX >= width ||
      currentY < 0 ||
      currentY >= height ||
      next[currentY][currentX] !== targetColor
    ) {
      continue;
    }

    next[currentY][currentX] = newColor;
    queue.push(
      [currentX - 1, currentY],
      [currentX + 1, currentY],
      [currentX, currentY - 1],
      [currentX, currentY + 1]
    );
  }

  return next;
}

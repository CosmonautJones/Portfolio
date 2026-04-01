import type { Direction, GhostFrame, GhostRun } from "./types";

const GHOST_STORAGE_KEY = "adventure_ghost_run";

// --- Ghost Recorder ---

export class GhostRecorder {
  private frames: GhostFrame[] = [];
  private lastX = -1;
  private lastY = -1;
  private lastDir: Direction = "up";
  private tickCount = 0;

  /** Record the player's position at the current tick. Only stores when position changes. */
  record(x: number, y: number, dir: Direction): void {
    this.tickCount++;

    if (x !== this.lastX || y !== this.lastY || dir !== this.lastDir) {
      this.frames.push({ tick: this.tickCount, x, y, dir });
      this.lastX = x;
      this.lastY = y;
      this.lastDir = dir;
    }
  }

  /** Reset recorder for a new game */
  reset(): void {
    this.frames = [];
    this.lastX = -1;
    this.lastY = -1;
    this.lastDir = "up";
    this.tickCount = 0;
  }

  /** Get a copy of the recorded frames */
  getFrames(): GhostFrame[] {
    return [...this.frames];
  }

  /** Get the current tick count */
  getTick(): number {
    return this.tickCount;
  }
}

// --- Ghost Replayer ---

export class GhostReplayer {
  private frames: GhostFrame[];
  private currentIndex = 0;
  private ghostScore: number;
  private beaten = false;

  constructor(ghostRun: GhostRun) {
    this.frames = ghostRun.frames;
    this.ghostScore = ghostRun.score;
  }

  /** Get the ghost's position at the given tick. Returns null if ghost has no more frames. */
  getPositionAtTick(tick: number): { x: number; y: number; dir: Direction } | null {
    if (this.frames.length === 0 || this.beaten) return null;

    // Advance index to the latest frame at or before the current tick
    while (
      this.currentIndex < this.frames.length - 1 &&
      this.frames[this.currentIndex + 1].tick <= tick
    ) {
      this.currentIndex++;
    }

    const frame = this.frames[this.currentIndex];
    if (!frame || frame.tick > tick) return null;

    return { x: frame.x, y: frame.y, dir: frame.dir };
  }

  /** Mark ghost as beaten (player exceeded ghost's score) */
  markBeaten(): void {
    this.beaten = true;
  }

  /** Check if the current score exceeds the ghost */
  isBeaten(currentScore: number): boolean {
    return currentScore > this.ghostScore;
  }

  /** Get the ghost's score */
  getScore(): number {
    return this.ghostScore;
  }

  /** Check if the ghost has been beaten */
  wasBeaten(): boolean {
    return this.beaten;
  }

  /** Reset for a new game replay */
  reset(): void {
    this.currentIndex = 0;
    this.beaten = false;
  }

  /** Get the total number of frames in this ghost */
  getFrameCount(): number {
    return this.frames.length;
  }

  /** Get the last tick in the ghost recording */
  getLastTick(): number {
    if (this.frames.length === 0) return 0;
    return this.frames[this.frames.length - 1].tick;
  }
}

// --- localStorage Persistence ---

export function saveGhostToStorage(run: GhostRun): void {
  try {
    const json = JSON.stringify(run);
    localStorage.setItem(GHOST_STORAGE_KEY, json);
  } catch {
    // localStorage unavailable or quota exceeded
  }
}

export function loadGhostFromStorage(): GhostRun | null {
  try {
    const json = localStorage.getItem(GHOST_STORAGE_KEY);
    if (!json) return null;

    const parsed: unknown = JSON.parse(json);
    if (!isValidGhostRun(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function clearGhostFromStorage(): void {
  try {
    localStorage.removeItem(GHOST_STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}

/** Type guard for GhostRun from storage */
function isValidGhostRun(data: unknown): data is GhostRun {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.score !== "number" || obj.score < 0) return false;
  if (typeof obj.recordedAt !== "string") return false;
  if (!Array.isArray(obj.frames)) return false;

  // Validate first frame structure (don't check all for perf)
  if (obj.frames.length > 0) {
    const frame = obj.frames[0] as Record<string, unknown>;
    if (
      typeof frame.tick !== "number" ||
      typeof frame.x !== "number" ||
      typeof frame.y !== "number" ||
      typeof frame.dir !== "string"
    ) {
      return false;
    }
  }

  return true;
}

/** Should we update the stored ghost? Only if new score is higher. */
export function shouldUpdateGhost(
  currentScore: number,
  existingGhost: GhostRun | null,
): boolean {
  if (!existingGhost) return currentScore > 0;
  return currentScore > existingGhost.score;
}

// ---------------------------------------------------------------------------
// Integration tests for GhostRuntime — the seam that wires the pure ghost data
// layer (ghost.ts) into a live run from the game-engine RAF loop. Exercises the
// recording cadence, replay position lookup against run progress, persist-only-
// when-better on death, re-arm on restart, and the beaten→hidden behavior.
//
// These complement (do not replace) ghost.test.ts which tests the data layer in
// isolation.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GhostRuntime } from "../ghost-runtime";
import { createInitialState } from "../engine";
import { DEFAULT_CONFIG } from "../constants";
import { saveGhostToStorage, loadGhostFromStorage } from "../ghost";
import type { GameState, GhostRun } from "../types";

// In-memory localStorage so persistence works in node.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

function makePlayingState(): GameState {
  const state = createInitialState(DEFAULT_CONFIG, 640);
  state.phase = "playing";
  return state;
}

function placePlayer(state: GameState, x: number, y: number): void {
  state.player.gridPos.x = x;
  state.player.gridPos.y = y;
}

describe("GhostRuntime recording", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("records a frame per playing tick and advances state.ghostTick", () => {
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.armForNewRun(state);

    expect(state.ghostTick).toBe(0);
    rt.recordAndAdvance(state);
    expect(state.ghostTick).toBe(1);
    rt.recordAndAdvance(state);
    expect(state.ghostTick).toBe(2);
  });

  it("leaves ghostPos null when there is no stored ghost (first-ever play)", () => {
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage(); // nothing stored
    rt.armForNewRun(state);

    rt.recordAndAdvance(state);
    expect(rt.hasGhost()).toBe(false);
    expect(state.ghostPos).toBeNull();
  });
});

describe("GhostRuntime replay against run progress", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  function seedGhost(): GhostRun {
    const run: GhostRun = {
      score: 100,
      frames: [
        { tick: 1, x: 6, y: 0, dir: "up" },
        { tick: 2, x: 6, y: -1, dir: "up" },
        { tick: 3, x: 5, y: -1, dir: "left" },
      ],
      recordedAt: "2026-06-05T00:00:00Z",
    };
    saveGhostToStorage(run);
    return run;
  }

  it("writes the replayed ghost position into state.ghostPos at the matching tick", () => {
    seedGhost();
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);

    // tick 1 → first frame
    placePlayer(state, 6, 3);
    rt.recordAndAdvance(state);
    expect(state.ghostPos).toEqual({ x: 6, y: 0, dir: "up" });

    // tick 2 → second frame
    rt.recordAndAdvance(state);
    expect(state.ghostPos).toEqual({ x: 6, y: -1, dir: "up" });

    // tick 3 → third frame
    rt.recordAndAdvance(state);
    expect(state.ghostPos).toEqual({ x: 5, y: -1, dir: "left" });
  });

  it("holds the last ghost frame for ticks past the recording", () => {
    seedGhost();
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);

    for (let i = 0; i < 6; i++) rt.recordAndAdvance(state);
    // Beyond the last recorded tick (3) the ghost holds its final frame.
    expect(state.ghostPos).toEqual({ x: 5, y: -1, dir: "left" });
  });

  it("hides the ghost (ghostPos null) once the live score beats it", () => {
    seedGhost(); // ghost score = 100
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);

    state.score = 50;
    rt.recordAndAdvance(state);
    expect(state.ghostPos).not.toBeNull();

    // Out-score the ghost → it disappears and stays gone.
    state.score = 101;
    rt.recordAndAdvance(state);
    expect(state.ghostPos).toBeNull();
    rt.recordAndAdvance(state);
    expect(state.ghostPos).toBeNull();
  });
});

describe("GhostRuntime persistence on death", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("persists the run as the new best when no ghost exists and score > 0", () => {
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);

    placePlayer(state, 6, 2);
    rt.recordAndAdvance(state);

    rt.persistIfBest(42);
    const stored = loadGhostFromStorage();
    expect(stored).not.toBeNull();
    expect(stored?.score).toBe(42);
    expect(stored?.frames.length).toBeGreaterThan(0);
  });

  it("does NOT persist when the run does not beat the stored ghost", () => {
    // Seed an existing best of 100.
    saveGhostToStorage({
      score: 100,
      frames: [{ tick: 1, x: 6, y: 0, dir: "up" }],
      recordedAt: "2026-06-05T00:00:00Z",
    });

    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);
    rt.recordAndAdvance(state);

    rt.persistIfBest(80); // worse than 100
    expect(loadGhostFromStorage()?.score).toBe(100);
  });

  it("does NOT persist a zero-score run", () => {
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);
    rt.recordAndAdvance(state);

    rt.persistIfBest(0);
    expect(loadGhostFromStorage()).toBeNull();
  });

  it("arms the freshly saved run so the next round replays the new best", () => {
    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage(); // nothing yet
    rt.armForNewRun(state);

    placePlayer(state, 6, 3);
    rt.recordAndAdvance(state);
    rt.persistIfBest(55);

    // Restart: re-arm and the ghost from this run should now replay.
    const next = makePlayingState();
    rt.armForNewRun(next);
    expect(rt.hasGhost()).toBe(true);
    rt.recordAndAdvance(next);
    expect(next.ghostPos).not.toBeNull();
  });
});

describe("GhostRuntime re-arm on restart", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("resets the recorder and ghostTick so a new run records from tick 0", () => {
    saveGhostToStorage({
      score: 100,
      frames: [
        { tick: 1, x: 6, y: 0, dir: "up" },
        { tick: 2, x: 6, y: -1, dir: "up" },
      ],
      recordedAt: "2026-06-05T00:00:00Z",
    });

    const state = makePlayingState();
    const rt = new GhostRuntime();
    rt.loadFromStorage();
    rt.armForNewRun(state);
    rt.recordAndAdvance(state);
    rt.recordAndAdvance(state);
    expect(state.ghostTick).toBe(2);

    // Restart mid-run.
    rt.armForNewRun(state);
    expect(state.ghostTick).toBe(0);
    expect(state.ghostPos).toBeNull();

    // First record of the new run replays the ghost's first frame again.
    rt.recordAndAdvance(state);
    expect(state.ghostTick).toBe(1);
    expect(state.ghostPos).toEqual({ x: 6, y: 0, dir: "up" });
  });
});

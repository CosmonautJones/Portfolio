import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GhostRecorder,
  GhostReplayer,
  saveGhostToStorage,
  loadGhostFromStorage,
  clearGhostFromStorage,
  shouldUpdateGhost,
} from "../ghost";
import type { GhostRun } from "../types";

// Mock localStorage
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
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("GhostRecorder", () => {
  let recorder: GhostRecorder;

  beforeEach(() => {
    recorder = new GhostRecorder();
  });

  it("records the first frame", () => {
    recorder.record(5, 10, "up");
    const frames = recorder.getFrames();
    expect(frames).toHaveLength(1);
    expect(frames[0]).toEqual({ tick: 1, x: 5, y: 10, dir: "up" });
  });

  it("only stores frames when position changes (delta encoding)", () => {
    recorder.record(5, 10, "up");
    recorder.record(5, 10, "up"); // same position — skip
    recorder.record(5, 10, "up"); // same position — skip
    recorder.record(5, 9, "up"); // position changed

    const frames = recorder.getFrames();
    expect(frames).toHaveLength(2);
    expect(frames[0]).toEqual({ tick: 1, x: 5, y: 10, dir: "up" });
    expect(frames[1]).toEqual({ tick: 4, x: 5, y: 9, dir: "up" });
  });

  it("records direction changes even at same position", () => {
    recorder.record(5, 10, "up");
    recorder.record(5, 10, "left"); // direction changed

    const frames = recorder.getFrames();
    expect(frames).toHaveLength(2);
    expect(frames[1].dir).toBe("left");
  });

  it("tracks tick count correctly", () => {
    recorder.record(5, 10, "up");
    recorder.record(5, 10, "up");
    recorder.record(6, 10, "right");

    expect(recorder.getTick()).toBe(3);
    const frames = recorder.getFrames();
    expect(frames[1].tick).toBe(3);
  });

  it("reset clears all state", () => {
    recorder.record(5, 10, "up");
    recorder.record(5, 9, "up");
    recorder.reset();

    expect(recorder.getFrames()).toHaveLength(0);
    expect(recorder.getTick()).toBe(0);

    // After reset, first record is at tick 1 again
    recorder.record(0, 0, "up");
    expect(recorder.getFrames()[0].tick).toBe(1);
  });

  it("returns a copy of frames (not a reference)", () => {
    recorder.record(5, 10, "up");
    const frames1 = recorder.getFrames();
    const frames2 = recorder.getFrames();
    expect(frames1).not.toBe(frames2);
    expect(frames1).toEqual(frames2);
  });
});

describe("GhostReplayer", () => {
  const ghostRun: GhostRun = {
    score: 50,
    frames: [
      { tick: 1, x: 6, y: 0, dir: "up" },
      { tick: 10, x: 6, y: -1, dir: "up" },
      { tick: 20, x: 6, y: -2, dir: "up" },
      { tick: 30, x: 5, y: -2, dir: "left" },
      { tick: 40, x: 5, y: -3, dir: "up" },
    ],
    recordedAt: "2026-03-31T00:00:00Z",
  };

  let replayer: GhostReplayer;

  beforeEach(() => {
    replayer = new GhostReplayer(ghostRun);
  });

  it("returns null before the first frame", () => {
    expect(replayer.getPositionAtTick(0)).toBeNull();
  });

  it("returns the position at the exact frame tick", () => {
    const pos = replayer.getPositionAtTick(1);
    expect(pos).toEqual({ x: 6, y: 0, dir: "up" });
  });

  it("returns the latest frame at or before the tick", () => {
    const pos = replayer.getPositionAtTick(15);
    expect(pos).toEqual({ x: 6, y: -1, dir: "up" });
  });

  it("returns the last frame for ticks past the recording", () => {
    const pos = replayer.getPositionAtTick(100);
    expect(pos).toEqual({ x: 5, y: -3, dir: "up" });
  });

  it("detects when current score beats the ghost", () => {
    expect(replayer.isBeaten(49)).toBe(false);
    expect(replayer.isBeaten(50)).toBe(false);
    expect(replayer.isBeaten(51)).toBe(true);
  });

  it("returns null when marked as beaten", () => {
    replayer.markBeaten();
    expect(replayer.getPositionAtTick(1)).toBeNull();
    expect(replayer.wasBeaten()).toBe(true);
  });

  it("reset allows replaying from the start", () => {
    replayer.getPositionAtTick(30);
    replayer.markBeaten();
    replayer.reset();

    expect(replayer.wasBeaten()).toBe(false);
    const pos = replayer.getPositionAtTick(1);
    expect(pos).toEqual({ x: 6, y: 0, dir: "up" });
  });

  it("reports correct metadata", () => {
    expect(replayer.getScore()).toBe(50);
    expect(replayer.getFrameCount()).toBe(5);
    expect(replayer.getLastTick()).toBe(40);
  });

  it("handles empty ghost run", () => {
    const empty = new GhostReplayer({
      score: 0,
      frames: [],
      recordedAt: "2026-03-31T00:00:00Z",
    });
    expect(empty.getPositionAtTick(1)).toBeNull();
    expect(empty.getFrameCount()).toBe(0);
    expect(empty.getLastTick()).toBe(0);
  });
});

describe("Ghost localStorage persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("saves and loads a ghost run", () => {
    const run: GhostRun = {
      score: 42,
      frames: [{ tick: 1, x: 6, y: 0, dir: "up" }],
      recordedAt: "2026-03-31T00:00:00Z",
    };

    saveGhostToStorage(run);
    const loaded = loadGhostFromStorage();

    expect(loaded).toEqual(run);
  });

  it("returns null when no ghost is stored", () => {
    expect(loadGhostFromStorage()).toBeNull();
  });

  it("returns null for invalid JSON in storage", () => {
    localStorageMock.getItem.mockReturnValueOnce("not json!!!");
    expect(loadGhostFromStorage()).toBeNull();
  });

  it("returns null for invalid ghost structure", () => {
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify({ score: "not a number", frames: "not an array" }),
    );
    expect(loadGhostFromStorage()).toBeNull();
  });

  it("clears ghost from storage", () => {
    saveGhostToStorage({
      score: 10,
      frames: [],
      recordedAt: "2026-03-31T00:00:00Z",
    });
    clearGhostFromStorage();
    expect(loadGhostFromStorage()).toBeNull();
  });
});

describe("shouldUpdateGhost", () => {
  it("returns true when no existing ghost and score > 0", () => {
    expect(shouldUpdateGhost(10, null)).toBe(true);
  });

  it("returns false when no existing ghost and score is 0", () => {
    expect(shouldUpdateGhost(0, null)).toBe(false);
  });

  it("returns true when new score beats existing ghost", () => {
    const existing: GhostRun = {
      score: 30,
      frames: [],
      recordedAt: "2026-03-31T00:00:00Z",
    };
    expect(shouldUpdateGhost(31, existing)).toBe(true);
  });

  it("returns false when new score ties existing ghost", () => {
    const existing: GhostRun = {
      score: 30,
      frames: [],
      recordedAt: "2026-03-31T00:00:00Z",
    };
    expect(shouldUpdateGhost(30, existing)).toBe(false);
  });

  it("returns false when new score is lower than existing ghost", () => {
    const existing: GhostRun = {
      score: 30,
      frames: [],
      recordedAt: "2026-03-31T00:00:00Z",
    };
    expect(shouldUpdateGhost(29, existing)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  formatClock,
  getBlindClockState,
  type BlindLevel,
} from "../table-stakes-logic";

const levels: BlindLevel[] = [
  { id: "l1", smallBlind: 25, bigBlind: 50, ante: 0, durationSeconds: 600 },
  { id: "l2", smallBlind: 50, bigBlind: 100, ante: 0, durationSeconds: 600 },
  { id: "l3", smallBlind: 100, bigBlind: 200, ante: 25, durationSeconds: 600 },
];

describe("getBlindClockState", () => {
  it("starts at the first level", () => {
    const state = getBlindClockState(levels, 0);

    expect(state.currentLevel).toBe(levels[0]);
    expect(state.currentIndex).toBe(0);
    expect(state.secondsRemaining).toBe(600);
    expect(state.nextLevel).toBe(levels[1]);
  });

  it("moves to the next level at the exact boundary", () => {
    const state = getBlindClockState(levels, 600);

    expect(state.currentLevel).toBe(levels[1]);
    expect(state.secondsIntoLevel).toBe(0);
    expect(state.secondsRemaining).toBe(600);
  });

  it("stays on the final level after the schedule ends", () => {
    const state = getBlindClockState(levels, 2400);

    expect(state.currentLevel).toBe(levels[2]);
    expect(state.nextLevel).toBeNull();
    expect(state.secondsRemaining).toBe(0);
    expect(state.isComplete).toBe(true);
  });

  it("formats clock values", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65)).toBe("1:05");
  });
});

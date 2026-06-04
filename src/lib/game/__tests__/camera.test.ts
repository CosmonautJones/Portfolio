import { describe, it, expect } from "vitest";
import { updateCamera } from "../camera";
import { createInitialState, resetForNewGame } from "../engine";
import { DEFAULT_CONFIG } from "../constants";
import type { GameCallbacks } from "../types";

const noopCallbacks: GameCallbacks = {
  onScoreChange: () => {},
  onPhaseChange: () => {},
  onDeath: () => {},
  onHop: () => {},
  onLevelUp: () => {},
  onCoinCollect: () => {},
};

describe("updateCamera", () => {
  it("snapshots prevY to the pre-step camera.y before applying smoothing", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    // Force a gap between current camera.y and its target so smoothing moves it.
    state.camera.y = 0;
    state.player.worldPos.y = 1000;

    const before = state.camera.y;
    updateCamera(state, DEFAULT_CONFIG);

    // prevY captures where the camera was at the start of this fixed step.
    expect(state.camera.prevY).toBe(before);
    // y has advanced toward the target via smoothing.
    expect(state.camera.y).not.toBe(before);
  });

  it("records prevY each step so it tracks the previous fixed-step position", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.camera.y = 0;
    state.player.worldPos.y = 1000;

    updateCamera(state, DEFAULT_CONFIG);
    const yAfterFirst = state.camera.y;
    updateCamera(state, DEFAULT_CONFIG);

    // After the 2nd step, prevY equals the y produced by the 1st step.
    expect(state.camera.prevY).toBe(yAfterFirst);
  });
});

describe("camera prevY initialization", () => {
  it("createInitialState sets prevY equal to y (no interpolation on first frame)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    expect(state.camera.prevY).toBe(state.camera.y);
  });

  it("resetForNewGame sets prevY equal to y (no cross-teleport rubber-band)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    // Simulate a stale prevY left over from a previous run.
    state.camera.prevY = -99999;
    state.camera.y = -99999;

    resetForNewGame(state, DEFAULT_CONFIG, noopCallbacks);

    // After reset, the camera teleports to its start position and prevY must
    // match y so the next rendered frame does not lerp across the teleport.
    expect(state.camera.prevY).toBe(state.camera.y);
  });
});

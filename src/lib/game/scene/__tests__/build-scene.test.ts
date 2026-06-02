// src/lib/game/scene/__tests__/build-scene.test.ts
import { describe, it, expect } from "vitest";
import { buildScene } from "../build-scene";
import { createInitialState } from "../../engine";
import { DEFAULT_CONFIG } from "../../constants";

describe("buildScene", () => {
  it("copies core fields from game state", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.score = 42;
    state.level = 3;
    const scene = buildScene(state, { shake: { x: 2, y: -1 } });
    expect(scene.score).toBe(42);
    expect(scene.level).toBe(3);
    expect(scene.shake).toEqual({ x: 2, y: -1 });
    expect(scene.camera).toBe(state.camera);
    expect(scene.weather).toBe(state.weather);
  });

  it("computes deathProgress only when dying", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    const alive = buildScene(state, { shake: { x: 0, y: 0 } });
    expect(alive.deathProgress).toBe(0);
    expect(alive.deathPosition).toBeNull();

    state.phase = "game_over";
    state.deathCause = "vehicle";
    state.dyingTimer = 250;
    state.dyingDuration = 500;
    const dying = buildScene(state, { shake: { x: 0, y: 0 } });
    expect(dying.deathProgress).toBeCloseTo(0.5);
    expect(dying.deathPosition).toEqual({
      x: state.player.worldPos.x,
      y: state.player.worldPos.y,
    });
  });

  it("defaults shake to zero when omitted", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    const scene = buildScene(state);
    expect(scene.shake).toEqual({ x: 0, y: 0 });
  });

  it("yields finite deathProgress when dyingDuration is zero", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.phase = "game_over";
    state.deathCause = "vehicle";
    state.dyingTimer = 0;
    state.dyingDuration = 0;
    const scene = buildScene(state, { shake: { x: 0, y: 0 } });
    expect(Number.isFinite(scene.deathProgress)).toBe(true);
    expect(scene.deathProgress).toBe(1);
  });
});

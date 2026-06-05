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
    expect(scene.weather).toBe(state.weather);
  });

  it("returns a fresh camera object with matching field values (no interpolation)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    const scene = buildScene(state, { shake: { x: 0, y: 0 } });
    // No longer reference-identical — buildScene returns a new camera so it can interpolate y.
    expect(scene.camera).not.toBe(state.camera);
    expect(scene.camera).toEqual({
      y: state.camera.y,
      targetY: state.camera.targetY,
      viewportWidth: state.camera.viewportWidth,
      viewportHeight: state.camera.viewportHeight,
      prevY: state.camera.prevY,
    });
  });

  it("returns the previous fixed-step y when alpha is 0 or omitted (standard interpolation convention)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.camera.prevY = 100;
    state.camera.y = 200;
    // alpha=0 => fully at prevY (just ticked). This is the standard
    // fixed-timestep render-interpolation convention; it never overshoots.
    expect(buildScene(state).camera.y).toBe(100);
    expect(buildScene(state, { alpha: 0 }).camera.y).toBe(100);
  });

  it("lerps camera.y between prevY and y by alpha", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.camera.prevY = 100;
    state.camera.y = 200;
    // lerp(100, 200, 0.5) = 150
    expect(buildScene(state, { alpha: 0.5 }).camera.y).toBe(150);
    // lerp(100, 200, 0.25) = 125
    expect(buildScene(state, { alpha: 0.25 }).camera.y).toBe(125);
    // alpha = 1 → fully at current y
    expect(buildScene(state, { alpha: 1 }).camera.y).toBe(200);
  });

  it("clamps alpha to the [0, 1] range", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.camera.prevY = 100;
    state.camera.y = 200;
    // alpha below 0 clamps to 0 → prevY
    expect(buildScene(state, { alpha: -2 }).camera.y).toBe(100);
    // alpha above 1 clamps to 1 → y
    expect(buildScene(state, { alpha: 5 }).camera.y).toBe(200);
  });

  it("does not interpolate when prevY equals y (no rubber-band)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.camera.prevY = state.camera.y;
    expect(buildScene(state, { alpha: 0.5 }).camera.y).toBe(state.camera.y);
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

  it("surfaces state.ghostPos as scene.ghost while playing", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.phase = "playing";
    state.ghostPos = { x: 6, y: -2, dir: "left" };
    const scene = buildScene(state);
    expect(scene.ghost).toEqual({ x: 6, y: -2, dir: "left" });
  });

  it("returns null ghost when there is no stored ghost (ghostPos null)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.phase = "playing";
    state.ghostPos = null;
    expect(buildScene(state).ghost).toBeNull();
  });

  it("returns null ghost when not playing (no demo ghost on menu/game_over)", () => {
    const state = createInitialState(DEFAULT_CONFIG, 640);
    state.ghostPos = { x: 6, y: -2, dir: "up" };
    state.phase = "menu";
    expect(buildScene(state).ghost).toBeNull();
    state.phase = "game_over";
    expect(buildScene(state).ghost).toBeNull();
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

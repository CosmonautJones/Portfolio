// src/lib/game/scene/__tests__/types.test.ts
import { describe, it, expect } from "vitest";
import type { RenderScene } from "../types";

describe("RenderScene", () => {
  it("is structurally assignable from a minimal scene literal", () => {
    const scene: RenderScene = {
      phase: "playing",
      player: {} as RenderScene["player"],
      lanes: [],
      camera: { y: 0, prevY: 0, targetY: 0, viewportWidth: 416, viewportHeight: 640 },
      particles: [],
      coins: [],
      powerUps: [],
      weather: { type: "clear", intensity: 0, windDirection: 1 },
      animationTime: 0,
      score: 0,
      level: 1,
      deathCause: null,
      deathProgress: 0,
      deathPosition: null,
      shake: { x: 0, y: 0 },
    };
    expect(scene.camera.viewportHeight).toBe(640);
    expect(scene.shake.x).toBe(0);
  });
});

// src/lib/game/renderer/__tests__/webgl-render-scene.test.ts
import { describe, it, expect, vi } from "vitest";
import { GameRenderer } from "../renderer";
import type { RenderScene } from "../../scene/types";

function sceneStub(shake = { x: 0, y: 0 }): RenderScene {
  return {
    phase: "playing",
    player: { worldPos: { x: 0, y: 0 } } as RenderScene["player"],
    lanes: [],
    camera: { y: 0, prevY: 0, targetY: 0, viewportWidth: 416, viewportHeight: 640 },
    particles: [],
    coins: [],
    powerUps: [],
    weather: { type: "clear", intensity: 0, windDirection: 1 },
    animationTime: 1.5,
    score: 0,
    level: 1,
    deathCause: null,
    deathProgress: 0,
    deathPosition: null,
    shake,
    ghost: null,
  };
}

describe("GameRenderer.render(scene)", () => {
  it("invokes the granular pipeline in order", () => {
    const r = Object.create(GameRenderer.prototype) as GameRenderer & Record<string, unknown>;
    const order: string[] = [];
    for (const m of [
      "beginFrame", "renderBackground", "renderLanes", "renderAmbientEffects",
      "renderCoins", "renderPlayer", "renderParticles", "endFrame",
      "setShakeOffset", "clearShakeOffset",
    ]) {
      (r as Record<string, unknown>)[m] = vi.fn(() => order.push(m));
    }
    (r as unknown as { render: (s: RenderScene, a: number) => void }).render(sceneStub(), 0);
    expect(order.indexOf("beginFrame")).toBeLessThan(order.indexOf("renderPlayer"));
    expect(order.indexOf("renderPlayer")).toBeLessThan(order.indexOf("endFrame"));
  });

  it("applies and clears shake when non-zero", () => {
    const r = Object.create(GameRenderer.prototype) as Record<string, unknown>;
    for (const m of [
      "beginFrame", "renderBackground", "renderLanes", "renderAmbientEffects",
      "renderCoins", "renderPlayer", "renderParticles", "endFrame",
      "setShakeOffset", "clearShakeOffset",
    ]) {
      r[m] = vi.fn();
    }
    (r as unknown as { render: (s: RenderScene, a: number) => void }).render(sceneStub({ x: 3, y: -2 }), 0);
    expect(r.setShakeOffset).toHaveBeenCalledWith(3, -2);
    expect(r.clearShakeOffset).toHaveBeenCalled();
  });
});

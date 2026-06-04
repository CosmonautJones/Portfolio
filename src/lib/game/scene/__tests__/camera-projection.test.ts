// src/lib/game/scene/__tests__/camera-projection.test.ts
import { describe, it, expect } from "vitest";
import { projectTopDown, projectIsometric } from "../camera-projection";
import type { Camera } from "../../types";

const cam: Camera = { y: 100, prevY: 100, targetY: 100, viewportWidth: 416, viewportHeight: 640 };

describe("projectTopDown", () => {
  it("maps world to screen by subtracting camera.y", () => {
    expect(projectTopDown({ x: 50, y: 300 }, cam)).toEqual({ x: 50, y: 200 });
  });
});

describe("projectIsometric", () => {
  it("is deterministic and centers X around the viewport", () => {
    const a = projectIsometric({ x: 208, y: 300 }, cam);
    const b = projectIsometric({ x: 208, y: 300 }, cam);
    expect(a).toEqual(b);
    // player column at viewport center maps near horizontal center
    expect(Math.abs(a.x - cam.viewportWidth / 2)).toBeLessThan(cam.viewportWidth / 2);
  });

  it("moves screen-up as world-forward increases", () => {
    const near = projectIsometric({ x: 208, y: 200 }, cam);
    const far = projectIsometric({ x: 208, y: 400 }, cam);
    expect(far.y).toBeLessThan(near.y);
  });
});

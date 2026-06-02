// src/lib/game/renderer/__tests__/game-renderer.test.ts
import { describe, it, expect } from "vitest";
import type { GameRenderer } from "../game-renderer";
import type { RenderScene } from "../../scene/types";

describe("GameRenderer interface", () => {
  it("can be implemented by a stub conforming to the contract", () => {
    const calls: string[] = [];
    const stub: GameRenderer = {
      resize: () => calls.push("resize"),
      render: (_scene: RenderScene, _alpha: number) => calls.push("render"),
      setStyle: () => calls.push("setStyle"),
      resetState: () => calls.push("resetState"),
      destroy: () => calls.push("destroy"),
    };
    stub.resize(416, 640);
    stub.render({} as RenderScene, 0);
    stub.setStyle("pixel");
    stub.resetState();
    stub.destroy();
    expect(calls).toEqual(["resize", "render", "setStyle", "resetState", "destroy"]);
  });
});

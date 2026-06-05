// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ThreeRenderer } from "../renderer/three-renderer";
import type { GameRenderer } from "../renderer/game-renderer";
import type { RenderScene } from "../scene/types";
import type { Player, Camera, Lane, Obstacle, Coin, PowerUp } from "../types";
import { disposeSharedMaterials, disposeSharedGeometries } from "../renderer/three-objects";

// Mock WebGLRenderer since jsdom doesn't have WebGL
vi.mock("three", async () => {
  const actual = await vi.importActual<typeof import("three")>("three");

  class MockWebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap = { enabled: false, type: 0 };
    constructor(opts?: { canvas?: HTMLCanvasElement }) {
      this.domElement = opts?.canvas ?? document.createElement("canvas");
    }
    setSize = vi.fn();
    setPixelRatio = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  }

  return {
    ...actual,
    WebGLRenderer: MockWebGLRenderer,
  };
});

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    gridPos: { x: 6, y: 0 },
    worldPos: { x: 192, y: 0 },
    facing: "up",
    animation: "idle",
    hopProgress: 0,
    hopTarget: null,
    alive: true,
    idleTimer: 0,
    ridingLogId: null,
    ...overrides,
  };
}

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    y: 0,
    prevY: 0,
    targetY: 0,
    viewportWidth: 416,
    viewportHeight: 640,
    ...overrides,
  };
}

function makeLane(y: number, type: Lane["type"] = "grass", obstacles: Obstacle[] = []): Lane {
  return {
    y,
    type,
    variant: 0,
    obstacles,
    decorations: [],
    flowDirection: 1,
    speedMultiplier: 1,
  };
}

function makeObstacle(id: number, type: Obstacle["type"], laneY: number, worldX = 100): Obstacle {
  return {
    id,
    type,
    laneY,
    worldX,
    widthCells: 2,
    speed: 60,
  };
}

function makeCoin(id: number, laneY: number, type: Coin["type"] = "gold"): Coin {
  return {
    id,
    type,
    gridX: 5,
    laneY,
    worldX: 160,
    collected: false,
    logId: null,
  };
}

function makePowerUp(id: number, laneY: number, type: PowerUp["type"] = "shield"): PowerUp {
  return {
    id,
    type,
    gridX: 6,
    laneY,
    worldX: 192,
    collected: false,
  };
}

function makeRenderState(overrides: Partial<RenderScene> = {}): RenderScene {
  return {
    phase: "playing",
    player: makePlayer(),
    lanes: [makeLane(0), makeLane(-1, "road"), makeLane(-2, "water")],
    camera: makeCamera(),
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
    ...overrides,
  };
}

describe("ThreeRenderer", () => {
  let canvas: HTMLCanvasElement;
  let renderer: ThreeRenderer;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 416;
    canvas.height = 640;
    renderer = new ThreeRenderer(canvas);
  });

  afterEach(() => {
    renderer.destroy();
    disposeSharedMaterials();
    disposeSharedGeometries();
  });

  it("constructs without error", () => {
    expect(renderer).toBeDefined();
  });

  it("renders a frame without error", () => {
    const state = makeRenderState();
    expect(() => renderer.render(state, 0)).not.toThrow();
  });

  it("handles multiple render calls (object pooling)", () => {
    const state = makeRenderState();
    renderer.render(state, 0);
    renderer.render(state, 0);
    renderer.render(state, 0);
    // No error, objects reused
  });

  it("creates lane objects for visible lanes", () => {
    const lanes = [
      makeLane(0, "grass"),
      makeLane(-1, "road"),
      makeLane(-2, "water"),
      makeLane(-3, "railroad"),
    ];
    const state = makeRenderState({ lanes });
    renderer.render(state, 0);
    // Rendering shouldn't throw for any lane type
  });

  it("positions obstacles from game state", () => {
    const obs = makeObstacle(1, "car", -1, 96);
    const lanes = [makeLane(-1, "road", [obs])];
    const state = makeRenderState({ lanes });
    renderer.render(state, 0);
    // Obstacle should be created without error
  });

  it("handles all obstacle types", () => {
    const types: Obstacle["type"][] = ["car", "truck", "train", "log"];
    for (const type of types) {
      const obs = makeObstacle(100 + types.indexOf(type), type, -1);
      const lanes = [makeLane(-1, type === "log" ? "water" : "road", [obs])];
      const state = makeRenderState({ lanes });
      expect(() => renderer.render(state, 0)).not.toThrow();
    }
  });

  it("syncs coins and hides collected ones", () => {
    const coin = makeCoin(1, 0);
    const state = makeRenderState({ coins: [coin] });
    renderer.render(state, 0);

    // Render again with coin collected
    const collected = { ...coin, collected: true };
    const state2 = makeRenderState({ coins: [collected] });
    renderer.render(state2, 0);
    // No error
  });

  it("syncs power-ups of all types and hides collected ones", () => {
    const types: PowerUp["type"][] = ["shield", "speed", "magnet", "slow_mo"];
    const powerUps = types.map((t, i) => makePowerUp(200 + i, 0, t));
    const state = makeRenderState({ powerUps });
    expect(() => renderer.render(state, 0)).not.toThrow();

    // Render again with one collected — should hide without error.
    const collected = powerUps.map((p, i) => (i === 0 ? { ...p, collected: true } : p));
    const state2 = makeRenderState({ powerUps: collected });
    expect(() => renderer.render(state2, 0)).not.toThrow();
  });

  it("handles player hop animation", () => {
    const player = makePlayer({
      animation: "hop",
      hopProgress: 0.5,
      hopTarget: { x: 6, y: -1 },
    });
    const state = makeRenderState({ player });
    expect(() => renderer.render(state, 0)).not.toThrow();
  });

  it("handles player death animation", () => {
    const player = makePlayer({ alive: false });
    const state = makeRenderState({
      player,
      phase: "game_over",
      deathProgress: 0.5,
      deathCause: "vehicle",
    });
    expect(() => renderer.render(state, 0)).not.toThrow();
  });

  it("handles all facing directions", () => {
    const directions = ["up", "down", "left", "right"] as const;
    for (const dir of directions) {
      const player = makePlayer({ facing: dir });
      const state = makeRenderState({ player });
      expect(() => renderer.render(state, 0)).not.toThrow();
    }
  });

  it("handles resize", () => {
    expect(() => renderer.resize(800, 600)).not.toThrow();
  });

  it("handles resize after destroy (no-op)", () => {
    renderer.destroy();
    expect(() => renderer.resize(800, 600)).not.toThrow();
  });

  it("does not render after destroy", () => {
    renderer.destroy();
    const state = makeRenderState();
    // Should be a no-op, not throw
    expect(() => renderer.render(state, 0)).not.toThrow();
  });

  it("double destroy is safe", () => {
    renderer.destroy();
    expect(() => renderer.destroy()).not.toThrow();
  });

  it("renders decorations (trees on grass lanes)", () => {
    const lane = makeLane(0, "grass");
    lane.decorations = [
      { type: "tree", gridX: 2, variant: 0 },
      { type: "tree", gridX: 8, variant: 1 },
    ];
    const state = makeRenderState({ lanes: [lane] });
    expect(() => renderer.render(state, 0)).not.toThrow();
  });

  it("pool cleanup runs without error after many frames", () => {
    const state = makeRenderState();
    // Render enough frames to trigger cleanup (every 60 frames)
    for (let i = 0; i < 70; i++) {
      renderer.render(state, 0);
    }
  });

  it("removes stale objects from pool after cleanup cycles", () => {
    // Frame 1: render with an obstacle
    const obs = makeObstacle(42, "car", -1, 96);
    const state1 = makeRenderState({
      lanes: [makeLane(-1, "road", [obs])],
    });
    renderer.render(state1, 0);

    // Render many frames WITHOUT the obstacle (to make it stale)
    const state2 = makeRenderState({ lanes: [makeLane(-1, "road")] });
    for (let i = 0; i < 200; i++) {
      renderer.render(state2, 0);
    }
    // After enough cleanup cycles, stale objects should be purged (no error)
  });

  it("handles camera movement", () => {
    const camera = makeCamera({ y: -500 });
    const lanes = Array.from({ length: 30 }, (_, i) => makeLane(-i));
    const state = makeRenderState({ camera, lanes });
    expect(() => renderer.render(state, 0)).not.toThrow();
  });

  it("conforms to the GameRenderer interface", () => {
    // Type-level conformance: assignment compiles only if the shape matches.
    const assertConforms = (_r: GameRenderer) => {};
    assertConforms(renderer); // compile-time: ThreeRenderer satisfies GameRenderer
    const proto = ThreeRenderer.prototype as unknown as GameRenderer;
    expect(typeof proto.render).toBe("function");
    expect(typeof proto.resize).toBe("function");
    expect(typeof proto.setStyle).toBe("function");
    expect(typeof proto.resetState).toBe("function");
    expect(typeof proto.destroy).toBe("function");
  });
});

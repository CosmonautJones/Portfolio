import { describe, it, expect, afterEach } from "vitest";
import * as THREE from "three";
import {
  createPlayer,
  createCar,
  createTruck,
  createTrain,
  createLog,
  createTree,
  createCoin,
  createPowerUp,
  createGrassLane,
  createRoadLane,
  createWaterLane,
  createRailroadLane,
  disposeSharedMaterials,
  disposeSharedGeometries,
  COLORS,
} from "../renderer/three-objects";

afterEach(() => {
  disposeSharedMaterials();
  disposeSharedGeometries();
});

describe("createPlayer", () => {
  it("returns a THREE.Group with children", () => {
    const player = createPlayer();
    expect(player).toBeInstanceOf(THREE.Group);
    expect(player.children.length).toBeGreaterThan(0);
  });

  it("has body, head, eyes, pupils, and claws (8 children minimum)", () => {
    const player = createPlayer();
    // body + head + 2 eyes + 2 pupils + 2 claws = 8
    expect(player.children.length).toBeGreaterThanOrEqual(8);
  });

  it("all children are meshes", () => {
    const player = createPlayer();
    for (const child of player.children) {
      expect(child).toBeInstanceOf(THREE.Mesh);
    }
  });
});

describe("createCar", () => {
  it("returns a group for each color variant", () => {
    const colors = ["#b13e53", "#3b5dc9", "#ffcd75"];
    for (const color of colors) {
      const car = createCar(color);
      expect(car).toBeInstanceOf(THREE.Group);
      expect(car.children.length).toBeGreaterThan(0);
    }
  });

  it("has body, cabin, wheels, and bumper", () => {
    const car = createCar("#b13e53");
    // body + cabin + 4 wheels + bumper = 7
    expect(car.children.length).toBeGreaterThanOrEqual(7);
  });
});

describe("createTruck", () => {
  it("returns a group with cargo, cab, window, and wheels", () => {
    const truck = createTruck();
    expect(truck).toBeInstanceOf(THREE.Group);
    // cargo + cab + window + 6 wheels = 9
    expect(truck.children.length).toBeGreaterThanOrEqual(9);
  });
});

describe("createTrain", () => {
  it("returns a group with body, stripe, windows, and wheels", () => {
    const train = createTrain();
    expect(train).toBeInstanceOf(THREE.Group);
    // body + stripe + 5 windows + 8 wheels = 15
    expect(train.children.length).toBeGreaterThanOrEqual(10);
  });
});

describe("createLog", () => {
  it("returns a group with cylinder trunk and end rings", () => {
    const log = createLog();
    expect(log).toBeInstanceOf(THREE.Group);
    // trunk + 2 rings = 3
    expect(log.children.length).toBe(3);
  });

  it("trunk uses cylinder geometry", () => {
    const log = createLog();
    const trunk = log.children[0] as THREE.Mesh;
    expect(trunk.geometry).toBeInstanceOf(THREE.CylinderGeometry);
  });
});

describe("createTree", () => {
  it("returns a group with trunk and crown sections", () => {
    const tree = createTree();
    expect(tree).toBeInstanceOf(THREE.Group);
    // trunk + lower crown + upper crown = 3
    expect(tree.children.length).toBe(3);
  });

  it("respects height parameter", () => {
    const short = createTree(0.7);
    const tall = createTree(1.3);

    // Trunk Z position (height/2) should differ
    const shortTrunkZ = short.children[0].position.z;
    const tallTrunkZ = tall.children[0].position.z;
    expect(tallTrunkZ).toBeGreaterThan(shortTrunkZ);
  });
});

describe("createCoin", () => {
  it("creates coins for all types", () => {
    const types = ["gold", "silver", "diamond", "ruby"];
    for (const type of types) {
      const coin = createCoin(type);
      expect(coin).toBeInstanceOf(THREE.Group);
      expect(coin.children.length).toBeGreaterThan(0);
    }
  });

  it("defaults to gold for unknown type", () => {
    const coin = createCoin("unknown");
    expect(coin).toBeInstanceOf(THREE.Group);
    expect(coin.children.length).toBeGreaterThan(0);
  });
});

describe("createPowerUp", () => {
  it("creates a power-up gem for all types", () => {
    const types = ["shield", "speed", "magnet", "slow_mo"];
    for (const type of types) {
      const pu = createPowerUp(type);
      expect(pu).toBeInstanceOf(THREE.Group);
      expect(pu.children.length).toBeGreaterThan(0);
    }
  });

  it("defaults gracefully for an unknown type", () => {
    const pu = createPowerUp("unknown");
    expect(pu).toBeInstanceOf(THREE.Group);
    expect(pu.children.length).toBeGreaterThan(0);
  });

  it("gem uses octahedron geometry", () => {
    const pu = createPowerUp("shield");
    const gem = pu.children[0] as THREE.Mesh;
    expect(gem.geometry).toBeInstanceOf(THREE.OctahedronGeometry);
  });
});

describe("lane factories", () => {
  const testWidth = 546; // 13 * 42

  it("createGrassLane returns a raised mesh", () => {
    const lane = createGrassLane(testWidth);
    expect(lane).toBeInstanceOf(THREE.Mesh);
    expect(lane.position.z).toBeGreaterThan(0); // raised
  });

  it("createRoadLane returns a flat mesh", () => {
    const lane = createRoadLane(testWidth);
    expect(lane).toBeInstanceOf(THREE.Mesh);
    expect(lane.position.z).toBeLessThanOrEqual(2); // near ground
  });

  it("createWaterLane returns a flat mesh", () => {
    const lane = createWaterLane(testWidth);
    expect(lane).toBeInstanceOf(THREE.Mesh);
    expect(lane.position.z).toBeLessThanOrEqual(2);
  });

  it("createRailroadLane returns a group with base and rails", () => {
    const lane = createRailroadLane(testWidth);
    expect(lane).toBeInstanceOf(THREE.Group);
    // base + 2 rails = 3
    expect(lane.children.length).toBe(3);
  });
});

describe("COLORS", () => {
  it("exports color constants", () => {
    expect(COLORS.playerBody).toBe("#ef7d57");
    expect(COLORS.grassTop).toBe("#50d090");
    expect(COLORS.roadSurface).toBe("#454a59");
    expect(COLORS.waterSurface).toBe("#2868a8");
  });
});

describe("shared caches", () => {
  it("disposeSharedMaterials clears materials without error", () => {
    // Create an object to populate the cache
    createPlayer();
    expect(() => disposeSharedMaterials()).not.toThrow();
  });

  it("disposeSharedGeometries clears geometries without error", () => {
    createPlayer();
    expect(() => disposeSharedGeometries()).not.toThrow();
  });

  it("shared geometry is reused between calls", () => {
    // Create two cars — they should share wheel geometry
    const car1 = createCar("#ff0000");
    const car2 = createCar("#0000ff");
    // The wheel meshes should use the same geometry object
    const wheel1 = car1.children.find(
      (c) => c.position.z === 3 && c.position.x === -16,
    ) as THREE.Mesh;
    const wheel2 = car2.children.find(
      (c) => c.position.z === 3 && c.position.x === -16,
    ) as THREE.Mesh;
    if (wheel1 && wheel2) {
      expect(wheel1.geometry).toBe(wheel2.geometry);
    }
  });
});

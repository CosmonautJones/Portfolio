// ============================================================================
// Three.js 3D Object Factories — Crossy Road style voxel models
// ============================================================================

import * as THREE from "three";
import { PALETTE } from "../sprites/palette";
import type { Skin } from "../types";

// Shared materials — reused across all instances for performance
const materialCache = new Map<string, THREE.MeshLambertMaterial>();

function getMaterial(color: string): THREE.MeshLambertMaterial {
  let mat = materialCache.get(color);
  if (!mat) {
    mat = new THREE.MeshLambertMaterial({ color });
    materialCache.set(color, mat);
  }
  return mat;
}

/** Dispose all cached shared materials (call on full teardown) */
export function disposeSharedMaterials(): void {
  for (const mat of materialCache.values()) {
    mat.dispose();
  }
  materialCache.clear();
}

// Shared geometries — reused across all instances
const geoCache = new Map<string, THREE.BufferGeometry>();

function getBoxGeo(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `box_${w}_${h}_${d}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new THREE.BoxGeometry(w, h, d);
    geoCache.set(key, geo);
  }
  return geo as THREE.BoxGeometry;
}

function getCylinderGeo(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number,
): THREE.CylinderGeometry {
  const key = `cyl_${radiusTop}_${radiusBottom}_${height}_${segments}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
    geoCache.set(key, geo);
  }
  return geo as THREE.CylinderGeometry;
}


function getOctahedronGeo(radius: number): THREE.OctahedronGeometry {
  const key = `octa_${radius}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = new THREE.OctahedronGeometry(radius);
    geoCache.set(key, geo);
  }
  return geo as THREE.OctahedronGeometry;
}

/** Dispose all cached shared geometries (call on full teardown) */
export function disposeSharedGeometries(): void {
  for (const geo of geoCache.values()) {
    geo.dispose();
  }
  geoCache.clear();
}

// ---- Colors ----
const COLORS = {
  playerBody: "#ef7d57",
  playerBodyDark: "#c45a3a",
  playerEye: "#f4f4f4",
  playerPupil: "#1a1c2c",
  playerClaw: "#b13e53",

  carRed: "#b13e53",
  carBlue: "#3b5dc9",
  carYellow: "#ffcd75",
  carWindow: "#73eff7",
  carWheel: "#333333",
  carBumper: "#888888",

  truckBody: "#38b764",
  truckCab: "#2d9350",
  truckWheel: "#333333",

  trainBody: "#94b0c2",
  trainStripe: "#ffff00",
  trainWheel: "#555555",
  trainWindow: "#3b5dc9",

  logBark: "#8b6914",
  logBarkDark: "#6a5010",
  logRing: "#d8b870",

  treeLeaves: "#38b764",
  treeLeavesAlt: "#50d090",
  treeTrunk: "#8b6914",

  coinGold: "#ffcd75",
  coinSilver: "#c0c0c0",
  coinDiamond: "#73eff7",
  coinRuby: "#b13e53",

  powerupShield: "#41a6f6",
  powerupSpeed: "#ffcd75",
  powerupMagnet: "#b13e53",
  powerupSlowMo: "#3b5dc9",

  grassTop: "#50d090",
  grassSide: "#3a7d4a",
  roadSurface: "#454a59",
  roadSide: "#303848",
  waterSurface: "#2868a8",
  waterDeep: "#1a5090",
  railroadSurface: "#484058",
  railroadRail: "#888888",
} as const;

// ---- Object Factory Functions ----

/**
 * Player lobster — a cute blocky character.
 * Body + head + eyes + claws, all made of boxes.
 */
export function createPlayer(): THREE.Group {
  const group = new THREE.Group();

  // Body (main block)
  const body = new THREE.Mesh(
    getBoxGeo(14, 14, 16),
    getMaterial(COLORS.playerBody),
  );
  body.position.set(0, 0, 8);
  group.add(body);

  // Head (slightly smaller on top)
  const head = new THREE.Mesh(
    getBoxGeo(12, 12, 10),
    getMaterial(COLORS.playerBody),
  );
  head.position.set(0, 0, 21);
  group.add(head);

  // Eyes
  const eyeGeo = getBoxGeo(4, 3, 4);
  const eyeMat = getMaterial(COLORS.playerEye);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-4, -7, 23);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(4, -7, 23);
  group.add(rightEye);

  // Pupils
  const pupilGeo = getBoxGeo(2, 1, 2);
  const pupilMat = getMaterial(COLORS.playerPupil);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(-4, -8.5, 23);
  group.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(4, -8.5, 23);
  group.add(rightPupil);

  // Claws
  const clawGeo = getBoxGeo(6, 5, 4);
  const clawMat = getMaterial(COLORS.playerClaw);
  const leftClaw = new THREE.Mesh(clawGeo, clawMat);
  leftClaw.position.set(-11, -3, 8);
  group.add(leftClaw);

  const rightClaw = new THREE.Mesh(clawGeo, clawMat);
  rightClaw.position.set(11, -3, 8);
  group.add(rightClaw);

  return group;
}

/**
 * Skinned lobster — the player model recolored per a cosmetic Skin. Reuses
 * createPlayer()'s geometry/layout, then swaps each mesh's SHARED material for a
 * recolored clone so the shared material cache is never mutated (same approach
 * the ghost uses, so other objects and the ghost are unaffected). Cosmetic only.
 *
 * Skin overrides remap palette indices: 17 = body, 18 = highlight (head),
 * 19 = claws/shadow, 88 = eyes. Each is resolved to a hex via PALETTE. Children
 * built by createPlayer() are ordered:
 *   0 body, 1 head, 2/3 eyes, 4/5 pupils, 6/7 claws.
 *
 * The returned group OWNS its (non-cached) materials; the renderer disposes them
 * via disposeSkinnedPlayer() when the skin changes or on teardown.
 */
export function createSkinnedPlayer(skin: Skin): THREE.Group {
  const group = createPlayer();
  const overrides = skin.paletteOverrides;
  if (Object.keys(overrides).length === 0) return group;

  const hexFor = (index: number): string | null => {
    const mapped = overrides[index];
    if (mapped === undefined) return null;
    const hex = PALETTE[mapped];
    return hex && hex !== "transparent" ? hex : null;
  };

  const bodyHex = hexFor(17); // body + head
  const headHex = hexFor(18) ?? bodyHex; // highlight → head (fall back to body)
  const clawHex = hexFor(19); // claws
  const eyeHex = hexFor(88); // eyes

  // child index → target color (null = leave as base)
  const colorByChild: Array<string | null> = [
    bodyHex, // 0 body
    headHex, // 1 head
    eyeHex, // 2 left eye
    eyeHex, // 3 right eye
    null, // 4 left pupil
    null, // 5 right pupil
    clawHex, // 6 left claw
    clawHex, // 7 right claw
  ];

  group.children.forEach((child, i) => {
    const mesh = child as THREE.Mesh;
    const base = mesh.material as THREE.MeshLambertMaterial;
    const cloned = base.clone();
    const target = colorByChild[i];
    if (target) cloned.color.set(target);
    mesh.material = cloned;
  });

  return group;
}

/** Dispose the per-instance (non-cached) materials owned by a skinned player. */
export function disposeSkinnedPlayer(group: THREE.Group): void {
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      for (const m of mat) m.dispose();
    } else if (mat) {
      mat.dispose();
    }
  }
}

/**
 * Ghost lobster — the player model rendered translucent for the best-run
 * replay. Reuses createPlayer()'s geometry/layout, then swaps each mesh's
 * shared material for a transparent, blue-tinted clone so the shared material
 * cache is never mutated. Cosmetic only.
 *
 * The returned group OWNS its (non-cached) materials; ThreeRenderer disposes
 * them via disposeGhost() on teardown.
 */
export function createGhost(): THREE.Group {
  const group = createPlayer();
  const ghostTint = new THREE.Color(0x7fc6ff);
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const base = mesh.material as THREE.MeshLambertMaterial;
    const ghostMat = base.clone();
    ghostMat.transparent = true;
    ghostMat.opacity = 0.35;
    ghostMat.depthWrite = false;
    // Lerp the body/claw colors toward a cyan "past self" tint.
    ghostMat.color.lerp(ghostTint, 0.6);
    mesh.material = ghostMat;
  }
  return group;
}

/** Dispose the per-instance (non-cached) materials owned by a ghost group. */
export function disposeGhost(group: THREE.Group): void {
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      for (const m of mat) m.dispose();
    } else if (mat) {
      mat.dispose();
    }
  }
}

/**
 * Car — body + cabin + wheels + bumpers.
 * @param color - Body color hex string
 */
export function createCar(color: string): THREE.Group {
  const group = new THREE.Group();

  // Main body
  const body = new THREE.Mesh(
    getBoxGeo(50, 24, 12),
    getMaterial(color),
  );
  body.position.set(0, 0, 8);
  group.add(body);

  // Cabin (window area)
  const cabin = new THREE.Mesh(
    getBoxGeo(22, 20, 10),
    getMaterial(COLORS.carWindow),
  );
  cabin.position.set(4, 0, 19);
  group.add(cabin);

  // Wheels (4 small dark boxes)
  const wheelGeo = getBoxGeo(6, 4, 6);
  const wheelMat = getMaterial(COLORS.carWheel);
  const wheelPositions = [
    [-16, -13, 3],
    [-16, 13, 3],
    [16, -13, 3],
    [16, 13, 3],
  ];
  for (const [x, y, z] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(x, y, z);
    group.add(wheel);
  }

  // Front bumper
  const bumper = new THREE.Mesh(
    getBoxGeo(4, 20, 6),
    getMaterial(COLORS.carBumper),
  );
  bumper.position.set(-27, 0, 5);
  group.add(bumper);

  return group;
}

/**
 * Truck — longer body, cab in front, cargo area.
 */
export function createTruck(): THREE.Group {
  const group = new THREE.Group();

  // Cargo body
  const cargo = new THREE.Mesh(
    getBoxGeo(50, 26, 22),
    getMaterial(COLORS.truckBody),
  );
  cargo.position.set(8, 0, 13);
  group.add(cargo);

  // Cab
  const cab = new THREE.Mesh(
    getBoxGeo(22, 26, 18),
    getMaterial(COLORS.truckCab),
  );
  cab.position.set(-25, 0, 11);
  group.add(cab);

  // Cab window
  const window_ = new THREE.Mesh(
    getBoxGeo(4, 18, 8),
    getMaterial(COLORS.carWindow),
  );
  window_.position.set(-30, 0, 17);
  group.add(window_);

  // Wheels (6 wheels for truck)
  const wheelGeo = getBoxGeo(8, 4, 8);
  const wheelMat = getMaterial(COLORS.truckWheel);
  const wheelPositions = [
    [-28, -14, 4],
    [-28, 14, 4],
    [10, -14, 4],
    [10, 14, 4],
    [24, -14, 4],
    [24, 14, 4],
  ];
  for (const [x, y, z] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(x, y, z);
    group.add(wheel);
  }

  return group;
}

/**
 * Train — long body with stripe and many wheels.
 */
export function createTrain(): THREE.Group {
  const group = new THREE.Group();

  // Main body (long)
  const body = new THREE.Mesh(
    getBoxGeo(100, 26, 24),
    getMaterial(COLORS.trainBody),
  );
  body.position.set(0, 0, 14);
  group.add(body);

  // Yellow warning stripe
  const stripe = new THREE.Mesh(
    getBoxGeo(100, 28, 3),
    getMaterial(COLORS.trainStripe),
  );
  stripe.position.set(0, 0, 9);
  group.add(stripe);

  // Windows (front section)
  const windowGeo = getBoxGeo(8, 4, 8);
  const windowMat = getMaterial(COLORS.trainWindow);
  for (let i = 0; i < 5; i++) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(-36 + i * 18, -14, 20);
    group.add(win);
  }

  // Wheels
  const wheelGeo = getBoxGeo(10, 4, 10);
  const wheelMat = getMaterial(COLORS.trainWheel);
  for (let i = 0; i < 4; i++) {
    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
    leftWheel.position.set(-36 + i * 24, -14, 4);
    group.add(leftWheel);

    const rightWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rightWheel.position.set(-36 + i * 24, 14, 4);
    group.add(rightWheel);
  }

  return group;
}

/**
 * Log — cylindrical shape lying on its side.
 */
export function createLog(): THREE.Group {
  const group = new THREE.Group();

  // Main trunk (cylinder rotated to lie horizontally along X)
  const trunk = new THREE.Mesh(
    getCylinderGeo(10, 10, 70, 8),
    getMaterial(COLORS.logBark),
  );
  // CylinderGeometry's axis is Y by default; rotate so it lies along X
  trunk.rotation.z = Math.PI / 2;
  trunk.position.set(0, 0, 10);
  group.add(trunk);

  // End rings (cross-section visible)
  const ringGeo = getCylinderGeo(10.5, 10.5, 2, 8);
  const ringMat = getMaterial(COLORS.logRing);
  const leftRing = new THREE.Mesh(ringGeo, ringMat);
  leftRing.rotation.z = Math.PI / 2;
  leftRing.position.set(-35, 0, 10);
  group.add(leftRing);

  const rightRing = new THREE.Mesh(ringGeo, ringMat);
  rightRing.rotation.z = Math.PI / 2;
  rightRing.position.set(35, 0, 10);
  group.add(rightRing);

  return group;
}

/**
 * Tree — trunk box + leafy crown (box or stacked boxes).
 * @param height - Relative tree height multiplier (0.7-1.3 range)
 */
export function createTree(height = 1): THREE.Group {
  const group = new THREE.Group();

  const trunkH = 12 * height;
  const crownH = 18 * height;
  const crownW = 16 * height;

  // Trunk
  const trunk = new THREE.Mesh(
    getBoxGeo(6, 6, trunkH),
    getMaterial(COLORS.treeTrunk),
  );
  trunk.position.set(0, 0, trunkH / 2);
  group.add(trunk);

  // Crown (lower wider section)
  const lowerCrown = new THREE.Mesh(
    getBoxGeo(crownW, crownW, crownH * 0.6),
    getMaterial(COLORS.treeLeaves),
  );
  lowerCrown.position.set(0, 0, trunkH + crownH * 0.3);
  group.add(lowerCrown);

  // Crown (upper narrower section)
  const upperCrown = new THREE.Mesh(
    getBoxGeo(crownW * 0.7, crownW * 0.7, crownH * 0.5),
    getMaterial(COLORS.treeLeavesAlt),
  );
  upperCrown.position.set(0, 0, trunkH + crownH * 0.75);
  group.add(upperCrown);

  return group;
}

/**
 * Coin — small glowing sphere.
 * @param type - Coin type for color selection
 */
export function createCoin(type: string): THREE.Group {
  const group = new THREE.Group();

  const colorMap: Record<string, string> = {
    gold: COLORS.coinGold,
    silver: COLORS.coinSilver,
    diamond: COLORS.coinDiamond,
    ruby: COLORS.coinRuby,
  };
  const color = colorMap[type] ?? COLORS.coinGold;

  const coin = new THREE.Mesh(
    getCylinderGeo(5, 5, 3, 12),
    getMaterial(color),
  );
  coin.position.set(0, 0, 16);
  group.add(coin);

  return group;
}

/**
 * Power-up — a floating, spinning gem (octahedron) colored per type.
 * Procedural (no voxel asset), mirroring the coin factory.
 * @param type - Power-up type for color selection
 */
export function createPowerUp(type: string): THREE.Group {
  const group = new THREE.Group();

  const colorMap: Record<string, string> = {
    shield: COLORS.powerupShield,
    speed: COLORS.powerupSpeed,
    magnet: COLORS.powerupMagnet,
    slow_mo: COLORS.powerupSlowMo,
  };
  const color = colorMap[type] ?? COLORS.powerupShield;

  const gem = new THREE.Mesh(getOctahedronGeo(8), getMaterial(color));
  gem.position.set(0, 0, 18);
  group.add(gem);

  return group;
}

/**
 * Grass lane — a raised green platform.
 * @param width - Lane width in Three.js units
 */
export function createGrassLane(width: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, 42, 6);
  const mesh = new THREE.Mesh(geo, getMaterial(COLORS.grassTop));
  mesh.position.set(width / 2, 0, 3);
  return mesh;
}

/**
 * Road lane — flat dark surface.
 * @param width - Lane width in Three.js units
 */
export function createRoadLane(width: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, 42, 3);
  const mesh = new THREE.Mesh(geo, getMaterial(COLORS.roadSurface));
  mesh.position.set(width / 2, 0, 1.5);
  return mesh;
}

/**
 * Water lane — flat blue surface.
 * @param width - Lane width in Three.js units
 */
export function createWaterLane(width: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, 42, 2);
  const mesh = new THREE.Mesh(geo, getMaterial(COLORS.waterSurface));
  mesh.position.set(width / 2, 0, 1);
  return mesh;
}

/**
 * Railroad lane — dark surface with rail lines.
 * @param width - Lane width in Three.js units
 */
export function createRailroadLane(width: number): THREE.Group {
  const group = new THREE.Group();

  // Base surface
  const base = new THREE.BoxGeometry(width, 42, 3);
  const baseMesh = new THREE.Mesh(base, getMaterial(COLORS.railroadSurface));
  baseMesh.position.set(width / 2, 0, 1.5);
  group.add(baseMesh);

  // Rails (two shiny metal strips)
  const railGeo = new THREE.BoxGeometry(width, 2, 2);
  const railMat = getMaterial(COLORS.railroadRail);
  const leftRail = new THREE.Mesh(railGeo, railMat);
  leftRail.position.set(width / 2, -10, 4);
  group.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, railMat);
  rightRail.position.set(width / 2, 10, 4);
  group.add(rightRail);

  return group;
}

// Re-export colors for testing
export { COLORS };

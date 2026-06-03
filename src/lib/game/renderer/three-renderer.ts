// ============================================================================
// ThreeRenderer — Three.js isometric 3D renderer for ClaudeBot's Adventure
//
// Reads RenderScene from the game engine and positions 3D objects accordingly.
// No game logic changes — pure rendering layer.
// ============================================================================

import * as THREE from "three";
import type { RenderScene } from "../scene/types";
import type { SpriteStyle } from "../sprites/sprite-style";
import type { LaneType, ObstacleType } from "../types";
import { DEFAULT_CONFIG } from "../constants";
import { ISO_TILT } from "../scene/camera-projection";
import {
  createPlayer,
  createCar,
  createTruck,
  createTrain,
  createLog,
  createTree,
  createCoin,
  createGrassLane,
  createRoadLane,
  createWaterLane,
  createRailroadLane,
  disposeSharedMaterials,
  disposeSharedGeometries,
} from "./three-objects";

/** Tile size in Three.js world units — matches Crossy Road tutorial convention */
const TILE_SIZE = 42;
/** Game cell size in pixels */
const CELL_SIZE = DEFAULT_CONFIG.cellSize; // 32
/** Scale factor from game pixels to Three.js world units */
const PX_TO_WORLD = TILE_SIZE / CELL_SIZE;
/** Lane width in Three.js world units */
const LANE_WIDTH = DEFAULT_CONFIG.gridColumns * TILE_SIZE;

// ---------------------------------------------------------------------------
// Isometric camera geometry — derived from ONE shared constant: ISO_TILT.
//
// `projectIsometric` (camera-projection.ts) compresses world-forward (Y) onto
// the screen by ISO_TILT. For an orthographic camera that pitch corresponds to
// the camera looking DOWN at the ground plane such that the ground's vertical
// foreshortening equals ISO_TILT, i.e. sin(pitch) === ISO_TILT. With
// ISO_TILT = 0.5 that is a 30° downward pitch — a classic Crossy-Road dimetric
// angle. Tune the look in ONE place (ISO_TILT) — never with ad-hoc frustum/offset
// numbers in render().
//
// CAMERA_PITCH  : angle below horizontal the camera looks down (from ISO_TILT).
//                 This pitch alone produces the isometric depth look — the
//                 ground plane recedes into the distance, foreshortened by
//                 ISO_TILT, exactly like the classic Crossy-Road camera.
// CAMERA_YAW    : horizontal turn of the camera. MUST be 0 for a portrait lane
//                 field: any yaw shears the deep field diagonally across screen-X
//                 (a far lane row shifts sideways by depth·sin(yaw)), so the field
//                 can no longer be horizontally centered in an orthographic
//                 frustum and a large empty triangle appears. With yaw = 0 each
//                 lane row projects to the full lane width centered on the lane
//                 midpoint at every depth, so the field fills the viewport.
// CAMERA_DISTANCE: how far back along the view ray the camera sits. Orthographic,
//                 so this only affects the near/far clip framing, not scale.
// ---------------------------------------------------------------------------
const CAMERA_PITCH = Math.asin(ISO_TILT); // radians; sin(pitch) === ISO_TILT
const CAMERA_YAW = 0; // no yaw — keeps the portrait field centered (see above)
const CAMERA_DISTANCE = 900; // world units back along the view ray

// Number of lanes that fit in the play viewport (gameplay viewport is 20 cells
// tall: 640px / 32px cell). The ortho frustum vertical extent is the
// on-screen-foreshortened depth of that many lanes (lanes * TILE_SIZE world
// depth, foreshortened by ISO_TILT), with a little headroom for object height.
// Horizontal extent covers the full lane width. Both are expressed in world
// units; aspect handling stays in resize().
const VISIBLE_LANES = 20; // gameplay viewport height in cells (640 / 32)
const FRUSTUM_DEPTH = VISIBLE_LANES * TILE_SIZE * ISO_TILT + TILE_SIZE * 3;

// The play field is portrait, so the full lane width is the binding horizontal
// constraint. Make the horizontal half-extent cover the whole lane width plus a
// one-tile margin; the vertical extent then follows from aspect (see resize()),
// and must remain at least FRUSTUM_DEPTH so the foreshortened lane depth fits.
const FRUSTUM_HALF_WIDTH = LANE_WIDTH / 2 + TILE_SIZE;

// How far FORWARD (toward more-negative world Y) the camera focus sits ahead of
// the player. Pushing the focus forward drops the player toward the lower third
// of the frame so the empty headroom (upcoming, not-yet-generated lanes) lands
// at the TOP of the viewport rather than below the player. Derived from the
// foreshortened lane depth (FRUSTUM_DEPTH), not a per-frame magic number.
const CAMERA_LOOK_AHEAD = FRUSTUM_DEPTH * 0.2;

/** Car color variants keyed by obstacle id % 3 */
const CAR_COLORS = ["#b13e53", "#3b5dc9", "#ffcd75"] as const;

interface PooledObject {
  object: THREE.Object3D;
  lastUsedFrame: number;
}

export class ThreeRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private disposed = false;
  /** Unit*distance vector from the look-at focus toward the camera (iso angle). */
  private viewOffset: THREE.Vector3;
  /**
   * How far AHEAD of the 2D viewport top (in game px) the 3D frustum can see.
   * The 3D ortho frustum is taller than the 2D viewport, so it reveals lanes
   * further ahead; culling against only the 2D viewport would leave the top of
   * the 3D view empty. Recomputed from the frustum half-height in applyFrustum().
   */
  private cullAheadPx = CELL_SIZE * 3;

  // Object pools — reuse meshes instead of recreating
  private lanePool = new Map<number, PooledObject>();
  private obstaclePool = new Map<number, PooledObject>();
  private playerMesh: THREE.Group;
  private coinPool = new Map<number, PooledObject>();
  private treePool = new Map<string, PooledObject>();

  // Frame counter for pool cleanup
  private frame = 0;
  private cleanupInterval = 60; // purge unused objects every N frames

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(canvas.width, canvas.height, false);
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1c2c);

    // Isometric orthographic camera — Crossy-Road style dimetric view.
    // Frustum extents are derived from FRUSTUM_HALF_WIDTH / FRUSTUM_DEPTH /
    // aspect (all rooted in ISO_TILT) — see applyFrustum(). Z is up.
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
    this.camera.up.set(0, 0, 1);
    this.applyFrustum(canvas.width / canvas.height);

    // Unit vector pointing FROM the look-at focus TOWARD the camera: pitched
    // CAMERA_PITCH above the ground (sin === ISO_TILT) and yawed CAMERA_YAW so
    // lanes recede diagonally. The camera sits on the +Y (already-traversed)
    // side so forward lanes (more negative Y) recede away from the viewer.
    const cosPitch = Math.cos(CAMERA_PITCH);
    this.viewOffset = new THREE.Vector3(
      Math.sin(CAMERA_YAW) * cosPitch,
      Math.cos(CAMERA_YAW) * cosPitch,
      Math.sin(CAMERA_PITCH),
    ).multiplyScalar(CAMERA_DISTANCE);

    // Initial placement looking at the field origin; render() updates this to
    // follow the player every frame.
    const centerX = LANE_WIDTH / 2;
    this.camera.position.set(
      centerX + this.viewOffset.x,
      this.viewOffset.y,
      this.viewOffset.z,
    );
    this.camera.lookAt(centerX, 0, 0);

    // Lighting — warm ambient + directional sun
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(-100, -100, 200);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 600;
    sun.shadow.camera.left = -500;
    sun.shadow.camera.right = 500;
    sun.shadow.camera.top = 500;
    sun.shadow.camera.bottom = -500;
    this.scene.add(sun);

    // Slight fill light from the other side
    const fill = new THREE.DirectionalLight(0x8899bb, 0.3);
    fill.position.set(80, 120, 100);
    this.scene.add(fill);

    // Player mesh (always present)
    this.playerMesh = createPlayer();
    this.scene.add(this.playerMesh);
  }

  /**
   * Render one frame from the game's RenderScene (GameRenderer interface).
   * Synchronizes 3D objects with game positions, then renders.
   */
  render(scene: RenderScene, _alpha: number): void {
    const state = scene;
    if (this.disposed) return;
    this.frame++;

    // ---- Camera tracking ----
    // Follow the player vertically, mirroring how camera.y drives the 2D view.
    // The focus point rides the lane grid centerline at the camera's world Y;
    // we look FORWARD (toward more-negative Y) by a fraction of the frustum
    // height so the player sits in the lower third of the frame and the empty
    // headroom (upcoming lanes) is at the TOP, Crossy-Road style — never split
    // below the player. The camera position is the focus plus the fixed iso
    // view offset — angle/framing never change, only the focus translates, so
    // there are NO per-frame magic offsets.
    const centerX = LANE_WIDTH / 2;
    const cameraY = -state.camera.y * PX_TO_WORLD;
    const focusY = cameraY - CAMERA_LOOK_AHEAD; // nudge focus ahead of player

    this.camera.position.set(
      centerX + this.viewOffset.x,
      focusY + this.viewOffset.y,
      this.viewOffset.z,
    );
    this.camera.lookAt(centerX, focusY, 0);

    // ---- Player ----
    this.syncPlayer(state);

    // ---- Lanes ----
    this.syncLanes(state);

    // ---- Obstacles ----
    this.syncObstacles(state);

    // ---- Coins ----
    this.syncCoins(state);

    // ---- Decorations ----
    this.syncDecorations(state);

    // Periodic pool cleanup
    if (this.frame % this.cleanupInterval === 0) {
      this.purgeUnused(this.lanePool);
      this.purgeUnused(this.obstaclePool);
      this.purgeUnused(this.coinPool);
      this.purgeUnused(this.treePool);
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * GameRenderer interface conformance. The Three path is voxel-only —
   * sprite-style switching (pixel↔voxel) is handled by toggling between the
   * WebGL2 and Three canvases, not within this renderer, so this is a no-op.
   */
  setStyle(_style: SpriteStyle): void {}

  /**
   * GameRenderer interface conformance. There is no per-run GPU state to
   * reset for the Three path yet; object pools are keyed by lane/obstacle id
   * and self-purge, so a new game reuses them safely.
   */
  resetState(): void {}

  /** Resize the renderer when canvas dimensions change */
  resize(width: number, height: number): void {
    if (this.disposed) return;
    this.renderer.setSize(width, height, false);
    this.applyFrustum(width / height);
  }

  /**
   * Set the orthographic frustum extents for a given aspect ratio.
   *
   * Horizontal is the binding constraint for this portrait field: the half-width
   * covers the full lane width (FRUSTUM_HALF_WIDTH). The vertical half-extent
   * follows from aspect, but is floored at FRUSTUM_DEPTH/2 so the foreshortened
   * lane depth (rooted in ISO_TILT via FRUSTUM_DEPTH) always fits. All framing
   * therefore derives from FRUSTUM_HALF_WIDTH / FRUSTUM_DEPTH — change the look
   * by editing ISO_TILT, not numbers here.
   */
  private applyFrustum(aspect: number): void {
    const halfWidth = FRUSTUM_HALF_WIDTH;
    const halfHeight = Math.max(halfWidth / aspect, FRUSTUM_DEPTH / 2);
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();

    // Derive how far AHEAD (in game px) lanes must be drawn so they fill the
    // 3D frustum's top. The frustum's vertical screen extent (halfHeight world)
    // maps to world-forward depth via ISO_TILT, then to game px via PX_TO_WORLD.
    // Add the forward focus nudge and a few cells of object-height headroom.
    const forwardWorld = halfHeight / ISO_TILT; // world-forward units to frustum top
    this.cullAheadPx = forwardWorld / PX_TO_WORLD + CAMERA_LOOK_AHEAD / PX_TO_WORLD + CELL_SIZE * 3;
  }

  /** True if a lane at game-y `laneY` is within the 3D view (forward-extended cull). */
  private isLaneVisible(laneY: number, camera: RenderScene["camera"]): boolean {
    const screenY = laneY * CELL_SIZE - camera.y;
    return screenY >= -this.cullAheadPx && screenY <= camera.viewportHeight + CELL_SIZE * 3;
  }

  /** Clean up all Three.js resources */
  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Remove all objects from scene
    this.playerMesh.removeFromParent();
    for (const entry of this.lanePool.values()) {
      entry.object.removeFromParent();
    }
    for (const entry of this.obstaclePool.values()) {
      entry.object.removeFromParent();
    }
    for (const entry of this.coinPool.values()) {
      entry.object.removeFromParent();
    }
    for (const entry of this.treePool.values()) {
      entry.object.removeFromParent();
    }

    this.lanePool.clear();
    this.obstaclePool.clear();
    this.coinPool.clear();
    this.treePool.clear();

    // Dispose renderer
    this.renderer.dispose();

    // Dispose shared caches
    disposeSharedMaterials();
    disposeSharedGeometries();
  }

  // ---- Sync helpers ----

  private syncPlayer(state: RenderScene): void {
    const { player } = state;

    // Convert game pixel coordinates to Three.js world coordinates
    const worldX = player.worldPos.x * PX_TO_WORLD;
    const worldY = -player.worldPos.y * PX_TO_WORLD;

    // Hop arc (jump height in Z)
    let hopZ = 0;
    if (player.animation === "hop" && player.hopTarget !== null) {
      hopZ = Math.sin(player.hopProgress * Math.PI) * 15;
    }

    this.playerMesh.position.set(worldX + TILE_SIZE / 2, worldY, hopZ);

    // Rotate based on facing direction
    const rotationMap: Record<string, number> = {
      up: 0,
      down: Math.PI,
      left: Math.PI / 2,
      right: -Math.PI / 2,
    };
    this.playerMesh.rotation.z = rotationMap[player.facing] ?? 0;

    // Death animation — sink below ground
    if (!player.alive && state.deathProgress > 0) {
      this.playerMesh.position.z = -state.deathProgress * 20;
      this.playerMesh.rotation.x = state.deathProgress * Math.PI * 0.5;
    }

    this.playerMesh.visible = true;
  }

  private syncLanes(state: RenderScene): void {
    const { lanes, camera } = state;

    // Mark all lane objects as unused this frame
    const visibleKeys = new Set<number>();

    for (const lane of lanes) {
      // Frustum cull: skip lanes outside the (forward-extended) 3D view
      if (!this.isLaneVisible(lane.y, camera)) {
        continue;
      }

      const key = lane.y;
      visibleKeys.add(key);

      let entry = this.lanePool.get(key);
      if (!entry) {
        const obj = this.createLaneObject(lane.type);
        this.scene.add(obj);
        entry = { object: obj, lastUsedFrame: this.frame };
        this.lanePool.set(key, entry);
      }
      entry.lastUsedFrame = this.frame;

      // Position: lane.y is a lane index, convert to Three.js Y
      entry.object.position.set(0, -lane.y * TILE_SIZE, 0);
    }
  }

  private syncObstacles(state: RenderScene): void {
    const { lanes, camera } = state;
    const visibleIds = new Set<number>();

    for (const lane of lanes) {
      if (!this.isLaneVisible(lane.y, camera)) {
        continue;
      }

      for (const obs of lane.obstacles) {
        visibleIds.add(obs.id);

        let entry = this.obstaclePool.get(obs.id);
        if (!entry) {
          const obj = this.createObstacleObject(obs.type, obs.id);
          this.scene.add(obj);
          entry = { object: obj, lastUsedFrame: this.frame };
          this.obstaclePool.set(obs.id, entry);
        }
        entry.lastUsedFrame = this.frame;

        // Position obstacle
        const worldX = obs.worldX * PX_TO_WORLD;
        const worldY = -lane.y * TILE_SIZE;
        entry.object.position.set(worldX, worldY, 0);

        // Flip direction: if speed < 0, face left (rotate 180 around Z)
        if (obs.speed < 0) {
          entry.object.rotation.z = Math.PI;
        } else {
          entry.object.rotation.z = 0;
        }
      }
    }
  }

  private syncCoins(state: RenderScene): void {
    const { coins, camera, animationTime } = state;

    for (const coin of coins) {
      if (coin.collected) {
        // Hide collected coins
        const entry = this.coinPool.get(coin.id);
        if (entry) {
          entry.object.visible = false;
        }
        continue;
      }

      if (!this.isLaneVisible(coin.laneY, camera)) {
        continue;
      }

      let entry = this.coinPool.get(coin.id);
      if (!entry) {
        const obj = createCoin(coin.type);
        this.scene.add(obj);
        entry = { object: obj, lastUsedFrame: this.frame };
        this.coinPool.set(coin.id, entry);
      }
      entry.lastUsedFrame = this.frame;
      entry.object.visible = true;

      // Position coin with bob animation
      const bobZ = Math.sin(animationTime * 2.5 + coin.id * 0.7) * 4;
      const worldX = coin.worldX * PX_TO_WORLD;
      const worldY = -coin.laneY * TILE_SIZE;
      entry.object.position.set(worldX + TILE_SIZE / 2, worldY, bobZ);

      // Spin the coin
      entry.object.rotation.z = animationTime * 2;
    }
  }

  private syncDecorations(state: RenderScene): void {
    const { lanes, camera } = state;

    for (const lane of lanes) {
      if (lane.type !== "grass") continue;

      if (!this.isLaneVisible(lane.y, camera)) {
        continue;
      }

      for (const deco of lane.decorations) {
        if (deco.type !== "tree") continue;

        const key = `${lane.y}_${deco.gridX}`;
        let entry = this.treePool.get(key);
        if (!entry) {
          const heightVariant = 0.8 + (deco.variant % 3) * 0.2;
          const obj = createTree(heightVariant);
          this.scene.add(obj);
          entry = { object: obj, lastUsedFrame: this.frame };
          this.treePool.set(key, entry);
        }
        entry.lastUsedFrame = this.frame;

        const worldX = deco.gridX * TILE_SIZE;
        const worldY = -lane.y * TILE_SIZE;
        entry.object.position.set(worldX + TILE_SIZE / 2, worldY, 0);
      }
    }
  }

  // ---- Factory helpers ----

  private createLaneObject(type: LaneType): THREE.Object3D {
    switch (type) {
      case "grass":
        return createGrassLane(LANE_WIDTH);
      case "road":
        return createRoadLane(LANE_WIDTH);
      case "water":
        return createWaterLane(LANE_WIDTH);
      case "railroad":
        return createRailroadLane(LANE_WIDTH);
      default:
        return createGrassLane(LANE_WIDTH);
    }
  }

  private createObstacleObject(type: ObstacleType, id: number): THREE.Object3D {
    switch (type) {
      case "car":
        return createCar(CAR_COLORS[id % 3]);
      case "truck":
        return createTruck();
      case "train":
        return createTrain();
      case "log":
        return createLog();
      default:
        return createCar(CAR_COLORS[0]);
    }
  }

  // ---- Pool management ----

  private purgeUnused(pool: Map<number | string, PooledObject>): void {
    const staleThreshold = this.frame - this.cleanupInterval * 2;
    const toRemove: (number | string)[] = [];

    for (const [key, entry] of pool) {
      if (entry.lastUsedFrame < staleThreshold) {
        entry.object.removeFromParent();
        toRemove.push(key);
      }
    }

    for (const key of toRemove) {
      pool.delete(key);
    }
  }
}

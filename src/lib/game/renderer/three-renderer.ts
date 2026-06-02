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
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1c2c);

    // Isometric orthographic camera — Crossy Road style
    // Lanes are 546 world units wide; at isometric angle the projected width
    // is ~437 units. Frustum horizontal range = size * aspect / 2, so size
    // must be ~900+ for full coverage at aspect 0.65.
    const aspect = canvas.width / canvas.height;
    const size = 900;
    this.camera = new THREE.OrthographicCamera(
      (-size * aspect) / 2,
      (size * aspect) / 2,
      size / 2,
      -size / 2,
      1,
      2000,
    );
    // Z is up, looking from isometric angle
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(300, -300, 300);
    this.camera.lookAt(0, 0, 0);

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
    // Center on the lane grid, follow player Y with isometric offset
    const centerX = (DEFAULT_CONFIG.gridColumns * TILE_SIZE) / 2;
    const cameraY = -state.camera.y * PX_TO_WORLD;

    // Moderate isometric angle: behind (+Y), slightly right (+X), above (+Z)
    // Reduced X offset (150 vs 300) keeps full lane width in frustum
    this.camera.position.set(centerX + 150, cameraY - 300, 300);
    this.camera.lookAt(centerX, cameraY + 50, 0);

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

    const aspect = width / height;
    const size = 900;
    this.camera.left = (-size * aspect) / 2;
    this.camera.right = (size * aspect) / 2;
    this.camera.top = size / 2;
    this.camera.bottom = -size / 2;
    this.camera.updateProjectionMatrix();
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
      // Frustum cull: skip lanes far off-screen
      const screenY = lane.y * CELL_SIZE - camera.y;
      if (screenY < -CELL_SIZE * 3 || screenY > camera.viewportHeight + CELL_SIZE * 3) {
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
      const screenY = lane.y * CELL_SIZE - camera.y;
      if (screenY < -CELL_SIZE * 3 || screenY > camera.viewportHeight + CELL_SIZE * 3) {
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

      const screenY = coin.laneY * CELL_SIZE - camera.y;
      if (screenY < -CELL_SIZE * 2 || screenY > camera.viewportHeight + CELL_SIZE * 2) {
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

      const screenY = lane.y * CELL_SIZE - camera.y;
      if (screenY < -CELL_SIZE * 3 || screenY > camera.viewportHeight + CELL_SIZE * 3) {
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

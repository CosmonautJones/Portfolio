import { describe, it, expect } from "vitest";
import {
  resolveSprite,
  hasVoxelMapping,
  getRequiredVoxelKeys,
} from "../sprites/sprite-style";

describe("resolveSprite", () => {
  const hasAll = () => true;
  const hasNone = () => false;

  it("returns game key unchanged in pixel mode", () => {
    expect(resolveSprite("car", "pixel", hasAll)).toBe("car");
    expect(resolveSprite("lobster_down_idle", "pixel", hasAll)).toBe("lobster_down_idle");
  });

  it("resolves player keys to voxel variants", () => {
    expect(resolveSprite("lobster_down_idle", "voxel", hasAll)).toBe("v2_player_forward");
    expect(resolveSprite("lobster_up_idle", "voxel", hasAll)).toBe("v2_player_away");
    expect(resolveSprite("lobster_right_hop", "voxel", hasAll)).toBe("v2_player_right");
    expect(resolveSprite("lobster_left_idle", "voxel", hasAll)).toBe("v2_player_left");
  });

  it("resolves all down-facing animations to same voxel sprite", () => {
    const downKeys = ["lobster_down_idle", "lobster_down_blink", "lobster_down_hop", "lobster_down_death"];
    for (const key of downKeys) {
      expect(resolveSprite(key, "voxel", hasAll)).toBe("v2_player_forward");
    }
  });

  it("resolves vehicle keys to voxel variants", () => {
    expect(resolveSprite("car", "voxel", hasAll)).toBe("v2_car_right");
    expect(resolveSprite("car_flip", "voxel", hasAll)).toBe("v2_car_left");
    expect(resolveSprite("truck", "voxel", hasAll)).toBe("v2_truck_right");
    expect(resolveSprite("truck_flip", "voxel", hasAll)).toBe("v2_truck_left");
  });

  it("resolves car color variants to same voxel sprite", () => {
    expect(resolveSprite("car_blue", "voxel", hasAll)).toBe("v2_car_right");
    expect(resolveSprite("car_yellow_flip", "voxel", hasAll)).toBe("v2_car_left");
  });

  it("resolves tile keys to voxel variants", () => {
    expect(resolveSprite("grass_0", "voxel", hasAll)).toBe("v2_tile_grass");
    expect(resolveSprite("grass_1", "voxel", hasAll)).toBe("v2_tile_grass");
    expect(resolveSprite("road_0", "voxel", hasAll)).toBe("v2_tile_road");
    expect(resolveSprite("water_0", "voxel", hasAll)).toBe("v2_tile_water");
  });

  it("resolves shadow keys to voxel shadow variants", () => {
    expect(resolveSprite("car_shadow", "voxel", hasAll)).toBe("v2_car_right_shadow");
    expect(resolveSprite("truck_flip_shadow", "voxel", hasAll)).toBe("v2_truck_left_shadow");
  });

  it("resolves side face keys to voxel side variants", () => {
    expect(resolveSprite("car_side", "voxel", hasAll)).toBe("v2_car_right_side");
    expect(resolveSprite("log_side", "voxel", hasAll)).toBe("v2_log_side");
  });

  it("falls back to pixel art when voxel key is not in atlas", () => {
    expect(resolveSprite("car", "voxel", hasNone)).toBe("car");
    expect(resolveSprite("lobster_down_idle", "voxel", hasNone)).toBe("lobster_down_idle");
  });

  it("falls back for keys with no voxel mapping (train, coins, decorations)", () => {
    expect(resolveSprite("train", "voxel", hasAll)).toBe("train");
    expect(resolveSprite("coin_gold_0", "voxel", hasAll)).toBe("coin_gold_0");
    expect(resolveSprite("tree_0", "voxel", hasAll)).toBe("tree_0");
    expect(resolveSprite("railroad_0", "voxel", hasAll)).toBe("railroad_0");
  });
});

describe("hasVoxelMapping", () => {
  it("returns true for mapped keys", () => {
    expect(hasVoxelMapping("car")).toBe(true);
    expect(hasVoxelMapping("lobster_down_idle")).toBe(true);
    expect(hasVoxelMapping("grass_0")).toBe(true);
  });

  it("returns true for shadow/side keys", () => {
    expect(hasVoxelMapping("car_shadow")).toBe(true);
    expect(hasVoxelMapping("truck_side")).toBe(true);
  });

  it("returns false for unmapped keys", () => {
    expect(hasVoxelMapping("train")).toBe(false);
    expect(hasVoxelMapping("coin_gold_0")).toBe(false);
    expect(hasVoxelMapping("railroad_0")).toBe(false);
  });
});

describe("getRequiredVoxelKeys", () => {
  it("returns all unique voxel keys", () => {
    const keys = getRequiredVoxelKeys();
    expect(keys.length).toBeGreaterThan(0);
    // Should have no duplicates
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("includes base sprite keys", () => {
    const keys = getRequiredVoxelKeys();
    expect(keys).toContain("v2_player_forward");
    expect(keys).toContain("v2_car_right");
    expect(keys).toContain("v2_tile_grass");
  });

  it("includes shadow and side variants for obstacles", () => {
    const keys = getRequiredVoxelKeys();
    expect(keys).toContain("v2_car_right_shadow");
    expect(keys).toContain("v2_car_right_side");
    expect(keys).toContain("v2_truck_left_shadow");
    expect(keys).toContain("v2_log_shadow");
  });
});

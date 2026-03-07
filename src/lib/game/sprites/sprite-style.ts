/**
 * Sprite Style Manager — maps game sprite keys to voxel or pixel variants.
 *
 * When voxel style is active, game keys are resolved to their v2_ equivalents.
 * Missing voxel sprites (train, coins, decorations, railroad) fall back to pixel art.
 */

export type SpriteStyle = "pixel" | "voxel";

const STORAGE_KEY = "adventure_sprite_style";

/**
 * Mapping from game sprite keys to voxel sprite keys.
 * Keys not present here have no voxel equivalent and always use pixel art.
 */
const VOXEL_KEY_MAP: Record<string, string> = {
  // Player — all animation variants map to single directional sprite
  lobster_down_idle: "v2_player_forward",
  lobster_down_blink: "v2_player_forward",
  lobster_down_hop: "v2_player_forward",
  lobster_down_death: "v2_player_forward",
  lobster_death: "v2_player_forward",
  lobster_up_idle: "v2_player_away",
  lobster_up_hop: "v2_player_away",
  lobster_up_land: "v2_player_away",
  lobster_up_death: "v2_player_away",
  lobster_right_idle: "v2_player_right",
  lobster_right_hop: "v2_player_right",
  lobster_right_death: "v2_player_right",
  lobster_left_idle: "v2_player_left",
  lobster_left_hop: "v2_player_left",
  lobster_left_death: "v2_player_left",

  // Vehicles
  car: "v2_car_right",
  car_flip: "v2_car_left",
  car_blue: "v2_car_right",
  car_blue_flip: "v2_car_left",
  car_yellow: "v2_car_right",
  car_yellow_flip: "v2_car_left",
  truck: "v2_truck_right",
  truck_flip: "v2_truck_left",

  // Log
  log: "v2_log",
  log_flip: "v2_log",

  // Tiles
  grass_0: "v2_tile_grass",
  grass_1: "v2_tile_grass",
  road_0: "v2_tile_road",
  road_1: "v2_tile_road",
  water_0: "v2_tile_water",
  water_1: "v2_tile_water",
};

/**
 * Shadow key suffix mapping — maps base sprite keys to their voxel shadow variants.
 */
const VOXEL_SHADOW_MAP: Record<string, string> = {};
const VOXEL_SIDE_MAP: Record<string, string> = {};

// Build shadow and side maps from the base key map (obstacles only)
for (const [gameKey, voxelKey] of Object.entries(VOXEL_KEY_MAP)) {
  // Only obstacles get shadow/side variants (not player, not tiles)
  if (
    gameKey.startsWith("car") ||
    gameKey.startsWith("truck") ||
    gameKey.startsWith("log")
  ) {
    VOXEL_SHADOW_MAP[`${gameKey}_shadow`] = `${voxelKey}_shadow`;
    VOXEL_SIDE_MAP[`${gameKey}_side`] = `${voxelKey}_side`;
  }
}

/**
 * Resolve a game sprite key to the appropriate atlas key based on style.
 *
 * @param gameKey - The original game sprite key (e.g., "car_blue_flip")
 * @param style - Current sprite style ("pixel" or "voxel")
 * @param hasVoxel - Function to check if a voxel key exists in the atlas
 * @returns The resolved atlas key to use for rendering
 */
export function resolveSprite(
  gameKey: string,
  style: SpriteStyle,
  hasVoxel: (key: string) => boolean,
): string {
  if (style === "pixel") return gameKey;

  // Check shadow variants
  const shadowVoxel = VOXEL_SHADOW_MAP[gameKey];
  if (shadowVoxel && hasVoxel(shadowVoxel)) return shadowVoxel;

  // Check side face variants
  const sideVoxel = VOXEL_SIDE_MAP[gameKey];
  if (sideVoxel && hasVoxel(sideVoxel)) return sideVoxel;

  // Check base key mapping
  const voxelKey = VOXEL_KEY_MAP[gameKey];
  if (voxelKey && hasVoxel(voxelKey)) return voxelKey;

  // Fallback to pixel art
  return gameKey;
}

/** Load saved sprite style preference */
export function loadSpriteStyle(): SpriteStyle {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "voxel" || saved === "pixel") return saved;
  } catch {
    // localStorage unavailable
  }
  return "pixel";
}

/** Save sprite style preference */
export function saveSpriteStyle(style: SpriteStyle): void {
  try {
    localStorage.setItem(STORAGE_KEY, style);
  } catch {
    // localStorage unavailable
  }
}

/** Check if a game key has a voxel mapping */
export function hasVoxelMapping(gameKey: string): boolean {
  return gameKey in VOXEL_KEY_MAP ||
    gameKey in VOXEL_SHADOW_MAP ||
    gameKey in VOXEL_SIDE_MAP;
}

/** Get all voxel keys that need to be registered (including shadow/side variants) */
export function getRequiredVoxelKeys(): string[] {
  const keys = new Set<string>();
  for (const voxelKey of Object.values(VOXEL_KEY_MAP)) {
    keys.add(voxelKey);
  }
  for (const voxelKey of Object.values(VOXEL_SHADOW_MAP)) {
    keys.add(voxelKey);
  }
  for (const voxelKey of Object.values(VOXEL_SIDE_MAP)) {
    keys.add(voxelKey);
  }
  return [...keys];
}

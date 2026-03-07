/**
 * Voxel Sprite Loader — fetches processed RGBA sprites at runtime.
 *
 * Loads manifest.json from /game/sprites/v2/, then fetches each RGBA binary
 * file in parallel. Returns a Map of sprite data ready for atlas registration.
 */

const MANIFEST_URL = "/game/sprites/v2/manifest.json";
const SPRITES_BASE_URL = "/game/sprites/v2/";

export interface VoxelSpriteData {
  key: string;
  width: number;
  height: number;
  rgba: Uint8Array;
}

interface ManifestEntry {
  key: string;
  width: number;
  height: number;
  rgbaFile: string;
}

interface Manifest {
  sprites: ManifestEntry[];
  version: number;
}

/**
 * Load all voxel sprites from the processed sprite directory.
 * Returns a Map keyed by sprite key (e.g., "v2_player_forward").
 */
export async function loadVoxelSprites(): Promise<Map<string, VoxelSpriteData>> {
  const manifestRes = await fetch(MANIFEST_URL);
  if (!manifestRes.ok) {
    throw new Error(`Failed to load voxel sprite manifest: ${manifestRes.status}`);
  }

  const manifest: Manifest = await manifestRes.json();
  const results = new Map<string, VoxelSpriteData>();

  // Fetch all RGBA files in parallel
  const fetches = manifest.sprites.map(async (entry) => {
    const res = await fetch(`${SPRITES_BASE_URL}${entry.rgbaFile}`);
    if (!res.ok) {
      console.warn(`Failed to load voxel sprite ${entry.key}: ${res.status}`);
      return null;
    }

    const buffer = await res.arrayBuffer();
    const expectedSize = entry.width * entry.height * 4;
    if (buffer.byteLength !== expectedSize) {
      console.warn(
        `Voxel sprite ${entry.key}: expected ${expectedSize} bytes, got ${buffer.byteLength}`,
      );
      return null;
    }

    return {
      key: entry.key,
      width: entry.width,
      height: entry.height,
      rgba: new Uint8Array(buffer),
    };
  });

  const loaded = await Promise.all(fetches);
  for (const sprite of loaded) {
    if (sprite) {
      results.set(sprite.key, sprite);
    }
  }

  return results;
}

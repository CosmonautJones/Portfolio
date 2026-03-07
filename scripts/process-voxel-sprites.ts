/**
 * Build-time script: processes voxel sprite PNGs into small RGBA binary files.
 *
 * For each source PNG:
 *   1. Remove white background (threshold-based alpha keying + fringe erosion)
 *   2. Auto-crop to content bounding box
 *   3. Downscale to target size (Lanczos resampling)
 *   4. Export raw RGBA binary (.rgba) + optimized PNG preview (.png)
 *
 * Output: public/game/sprites/v2/ with manifest.json
 *
 * Usage: npx tsx scripts/process-voxel-sprites.ts
 */

import sharp from "sharp";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { join, parse } from "node:path";

const SOURCE_DIR = join(import.meta.dirname ?? ".", "..", "claudeadventurev2", "sprites");
const OUTPUT_DIR = join(import.meta.dirname ?? ".", "..", "public", "game", "sprites", "v2");

/** Sprite definitions: source filename → output key + target dimensions */
const SPRITE_DEFS: Record<string, { key: string; width: number; height: number }> = {
  "Player_Forward.png": { key: "v2_player_forward", width: 64, height: 64 },
  "Player_Away.png":    { key: "v2_player_away",    width: 64, height: 64 },
  "Player_Right.png":   { key: "v2_player_right",   width: 64, height: 64 },
  "Player_Left.png":    { key: "v2_player_left",     width: 64, height: 64 },
  "Car_Right.png":      { key: "v2_car_right",       width: 128, height: 64 },
  "Car_Left.png":       { key: "v2_car_left",        width: 128, height: 64 },
  "Truck_Right.png":    { key: "v2_truck_right",     width: 192, height: 64 },
  "Truck_Left.png":     { key: "v2_truck_left",      width: 192, height: 64 },
  "Log.png":            { key: "v2_log",             width: 192, height: 64 },
  "Tile_Grass.png":     { key: "v2_tile_grass",      width: 64, height: 64 },
  "Tile_Road.png":      { key: "v2_tile_road",       width: 64, height: 64 },
  "Tile_Water.png":     { key: "v2_tile_water",      width: 64, height: 64 },
};

/** White background threshold — pixels with R, G, B all above this become transparent */
const WHITE_THRESHOLD = 240;

/** Fringe erosion radius in source pixels */
const FRINGE_RADIUS = 2;

async function removeWhiteBackground(input: Buffer): Promise<sharp.Sharp> {
  const image = sharp(input).removeAlpha().ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Pass 1: Mark white pixels as transparent
  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD) {
      data[offset + 3] = 0; // Set alpha to 0
    }
  }

  // Pass 2: Fringe erosion — reduce alpha near transparent edges
  const alphaMap = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alphaMap[i] = data[i * channels + 3];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alphaMap[idx] === 0) continue;

      // Check distance to nearest transparent pixel
      let nearTransparent = false;
      for (let dy = -FRINGE_RADIUS; dy <= FRINGE_RADIUS && !nearTransparent; dy++) {
        for (let dx = -FRINGE_RADIUS; dx <= FRINGE_RADIUS && !nearTransparent; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
          if (alphaMap[ny * width + nx] === 0) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= FRINGE_RADIUS) {
              // Fade alpha based on distance to edge
              const fade = dist / FRINGE_RADIUS;
              const currentAlpha = data[idx * channels + 3];
              data[idx * channels + 3] = Math.round(currentAlpha * fade);
              nearTransparent = true;
            }
          }
        }
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } });
}

async function processSprite(
  sourcePath: string,
  def: { key: string; width: number; height: number },
): Promise<{ key: string; width: number; height: number; rgbaFile: string; pngFile: string }> {
  console.log(`  Processing ${def.key}...`);

  const inputBuffer = await sharp(sourcePath).toBuffer();

  // Remove white background
  let image = await removeWhiteBackground(inputBuffer);

  // Auto-crop (trim transparent edges)
  image = image.trim();

  // Downscale to target size with Lanczos
  image = image.resize(def.width, def.height, {
    kernel: sharp.kernel.lanczos3,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  // Export raw RGBA
  const { data: rgbaData, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  const rgbaFile = `${def.key}.rgba`;
  const pngFile = `${def.key}.png`;

  await writeFile(join(OUTPUT_DIR, rgbaFile), rgbaData);

  // Also export a PNG preview for debugging
  await sharp(rgbaData, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(join(OUTPUT_DIR, pngFile));

  console.log(`    → ${rgbaFile} (${rgbaData.length} bytes, ${info.width}x${info.height})`);

  return {
    key: def.key,
    width: info.width,
    height: info.height,
    rgbaFile,
    pngFile,
  };
}

async function main() {
  console.log("Voxel Sprite Processor");
  console.log("======================\n");

  // Verify source directory
  const files = await readdir(SOURCE_DIR);
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Found ${files.length} files\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const manifest: Array<{
    key: string;
    width: number;
    height: number;
    rgbaFile: string;
    pngFile: string;
  }> = [];

  let totalBytes = 0;

  for (const [filename, def] of Object.entries(SPRITE_DEFS)) {
    if (!files.includes(filename)) {
      console.warn(`  WARNING: ${filename} not found in source directory, skipping`);
      continue;
    }

    const result = await processSprite(join(SOURCE_DIR, filename), def);
    manifest.push(result);
    // Calculate raw RGBA size: width * height * 4 channels
    totalBytes += result.width * result.height * 4;
  }

  // Write manifest
  await writeFile(
    join(OUTPUT_DIR, "manifest.json"),
    JSON.stringify({ sprites: manifest, version: 2 }, null, 2),
  );

  console.log(`\nDone! ${manifest.length} sprites processed.`);
  console.log(`Total RGBA data: ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

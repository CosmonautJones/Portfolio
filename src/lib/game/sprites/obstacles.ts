import type { SpritePixels } from "../types";

// Obstacle sprites for Frogger-style game — Crossy Road style pixel art
// All sprites face RIGHT by default; renderer flips for left-flowing lanes.
// 3/4 top-down isometric view with chunky boxy proportions.
// Each "logical pixel" is a 2x2 block in the array.
// Max 5 non-zero palette indices per base sprite.
//
// Palette key:
//  0 = transparent
//  1 = dark navy (outlines)
//  3 = cranberry (car body)
//  5 = gold (headlights)
//  7 = green (truck body)
// 14 = steel gray (train body)
// 15 = slate (train highlight)
// 16 = charcoal (undercarriage / train shadow)
// 18 = lobster light (car highlight / roof)
// 19 = lobster dark (car shadow / wheels)
// 22 = grass dark (truck shadow / wheels)
// 26 = log dark (log shadow / bark)
// 27 = log mid (log body)
// 28 = log light (log highlight / bark top)
// 29 = warning yellow (train stripe)
// 37 = grass bright (truck highlight)
// 47 = near-white blue (windshield)

// ---------------------------------------------------------------------------
// Helper: build a row of given width from a flat spec of [count, value] pairs
// ---------------------------------------------------------------------------
function R(width: number, ...pairs: number[]): number[] {
  const row: number[] = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const count = pairs[i];
    const value = pairs[i + 1];
    for (let j = 0; j < count; j++) row.push(value);
  }
  if (row.length !== width) {
    throw new Error(`Row length ${row.length} !== expected ${width}`);
  }
  return row;
}

// ---------------------------------------------------------------------------
// CAR: 64x32 — cranberry sedan facing right (Crossy Road style)
// Palette: 1 (outline), 3 (body), 18 (highlight/roof), 19 (shadow/wheels), 47 (windshield)
// Body spans col 4-59 (56px wide), rows 2-29 (28px tall) — fills ~69% of canvas
// ---------------------------------------------------------------------------
// prettier-ignore
const CAR: SpritePixels = [
  /* r0  */ R(64,  64,0),
  /* r1  */ R(64,  64,0),
  /* r2  */ R(64,  6,0, 2,1, 48,1, 2,1, 6,0),
  /* r3  */ R(64,  6,0, 2,1, 48,1, 2,1, 6,0),
  /* r4  */ R(64,  4,0, 2,1, 52,18, 2,1, 4,0),
  /* r5  */ R(64,  4,0, 2,1, 52,18, 2,1, 4,0),
  /* r6  */ R(64,  4,0, 2,1, 52,18, 2,1, 4,0),
  /* r7  */ R(64,  4,0, 2,1, 52,18, 2,1, 4,0),
  /* r8  */ R(64,  4,0, 2,1, 2,3, 2,1, 18,47, 2,1, 4,3, 2,1, 18,47, 2,1, 2,3, 2,1, 4,0),
  /* r9  */ R(64,  4,0, 2,1, 2,3, 2,1, 18,47, 2,1, 4,3, 2,1, 18,47, 2,1, 2,3, 2,1, 4,0),
  /* r10 */ R(64,  4,0, 2,1, 52,3, 2,1, 4,0),
  /* r11 */ R(64,  4,0, 2,1, 52,3, 2,1, 4,0),
  /* r12 */ R(64,  4,0, 2,1, 52,3, 2,1, 4,0),
  /* r13 */ R(64,  4,0, 2,1, 52,3, 2,1, 4,0),
  /* r14 */ R(64,  4,0, 2,1, 8,3, 2,1, 20,3, 2,1, 22,3, 2,1, 2,0),
  /* r15 */ R(64,  4,0, 2,1, 8,3, 2,1, 20,3, 2,1, 22,3, 2,1, 2,0),
  /* r16 */ R(64,  4,0, 2,1, 52,3, 2,1, 4,0),
  /* r17 */ R(64,  4,0, 2,1, 52,3, 2,1, 4,0),
  /* r18 */ R(64,  4,0, 2,1, 52,19, 2,1, 4,0),
  /* r19 */ R(64,  4,0, 2,1, 52,19, 2,1, 4,0),
  /* r20 */ R(64,  4,0, 2,1, 50,1, 2,19, 2,18, 2,1, 2,0),
  /* r21 */ R(64,  4,0, 2,1, 50,1, 2,19, 2,18, 2,1, 2,0),
  /* r22 */ R(64,  6,0, 2,1, 4,19, 36,0, 4,19, 2,0, 2,1, 8,0),
  /* r23 */ R(64,  6,0, 2,1, 4,19, 36,0, 4,19, 2,0, 2,1, 8,0),
  /* r24 */ R(64,  8,0, 2,1, 4,19, 2,1, 32,0, 2,1, 4,19, 2,1, 8,0),
  /* r25 */ R(64,  8,0, 2,1, 4,19, 2,1, 32,0, 2,1, 4,19, 2,1, 8,0),
  /* r26 */ R(64,  8,0, 2,1, 4,19, 2,1, 32,0, 2,1, 4,19, 2,1, 8,0),
  /* r27 */ R(64,  8,0, 2,1, 4,19, 2,1, 32,0, 2,1, 4,19, 2,1, 8,0),
  /* r28 */ R(64,  10,0, 4,1, 36,0, 4,1, 10,0),
  /* r29 */ R(64,  10,0, 4,1, 36,0, 4,1, 10,0),
  /* r30 */ R(64,  64,0),
  /* r31 */ R(64,  64,0),
];

// Helper to recolor a sprite by swapping one palette index for another
function recolorSprite(pixels: SpritePixels, from: number, to: number): SpritePixels {
  return pixels.map(row => row.map(px => px === from ? to : px));
}

// Blue car variant — same shape as CAR with cranberry (3) recolored to medium blue (10)
const CAR_BLUE = recolorSprite(CAR, 3, 10);

// Yellow car variant — cranberry body recolored to gold (5), and lobster dark (19) to orange (4)
const CAR_YELLOW = recolorSprite(recolorSprite(CAR, 3, 5), 19, 4);

// ---------------------------------------------------------------------------
// TRUCK: 96x32 — green delivery truck facing right (Crossy Road style)
// Palette: 1 (outline), 7 (body), 37 (highlight), 22 (shadow/wheels), 47 (windshield)
// Cargo box col 2-59, cab col 60-89 — fills ~91% of width
// ---------------------------------------------------------------------------
// prettier-ignore
const TRUCK: SpritePixels = [
  /* r0  */ R(96,  96,0),
  /* r1  */ R(96,  96,0),
  /* r2  */ R(96,  2,0, 2,1, 54,1, 2,1, 36,0),
  /* r3  */ R(96,  2,0, 2,1, 54,1, 2,1, 36,0),
  /* r4  */ R(96,  2,0, 2,1, 54,37, 2,1, 36,0),
  /* r5  */ R(96,  2,0, 2,1, 54,37, 2,1, 36,0),
  /* r6  */ R(96,  2,0, 2,1, 54,7, 2,1, 8,0, 2,1, 22,1, 2,1, 2,0),
  /* r7  */ R(96,  2,0, 2,1, 54,7, 2,1, 8,0, 2,1, 22,1, 2,1, 2,0),
  /* r8  */ R(96,  2,0, 2,1, 54,7, 2,1, 4,0, 2,1, 2,1, 22,37, 2,1, 4,0),
  /* r9  */ R(96,  2,0, 2,1, 54,7, 2,1, 4,0, 2,1, 2,1, 22,37, 2,1, 4,0),
  /* r10 */ R(96,  2,0, 2,1, 54,7, 2,1, 2,7, 2,1, 14,47, 2,1, 8,7, 2,1, 6,0),
  /* r11 */ R(96,  2,0, 2,1, 54,7, 2,1, 2,7, 2,1, 14,47, 2,1, 8,7, 2,1, 6,0),
  /* r12 */ R(96,  2,0, 2,1, 54,7, 2,1, 28,7, 2,1, 6,0),
  /* r13 */ R(96,  2,0, 2,1, 54,7, 2,1, 28,7, 2,1, 6,0),
  /* r14 */ R(96,  2,0, 2,1, 10,7, 2,1, 24,7, 2,1, 16,7, 2,1, 28,7, 2,1, 6,0),
  /* r15 */ R(96,  2,0, 2,1, 10,7, 2,1, 24,7, 2,1, 16,7, 2,1, 28,7, 2,1, 6,0),
  /* r16 */ R(96,  2,0, 2,1, 54,22, 2,1, 28,22, 2,1, 6,0),
  /* r17 */ R(96,  2,0, 2,1, 54,22, 2,1, 28,22, 2,1, 6,0),
  /* r18 */ R(96,  4,0, 2,1, 84,1, 2,1, 4,0),
  /* r19 */ R(96,  4,0, 2,1, 84,1, 2,1, 4,0),
  /* r20 */ R(96,  6,0, 2,1, 4,22, 34,0, 4,22, 18,0, 2,1, 6,22, 2,1, 18,0),
  /* r21 */ R(96,  6,0, 2,1, 4,22, 34,0, 4,22, 18,0, 2,1, 6,22, 2,1, 18,0),
  /* r22 */ R(96,  8,0, 2,1, 4,22, 2,1, 28,0, 2,1, 4,22, 2,1, 18,0, 2,1, 2,1, 2,22, 2,1, 18,0),
  /* r23 */ R(96,  8,0, 2,1, 4,22, 2,1, 28,0, 2,1, 4,22, 2,1, 18,0, 2,1, 2,1, 2,22, 2,1, 18,0),
  /* r24 */ R(96,  8,0, 2,1, 4,22, 2,1, 28,0, 2,1, 4,22, 2,1, 20,0, 2,1, 4,22, 2,1, 16,0),
  /* r25 */ R(96,  8,0, 2,1, 4,22, 2,1, 28,0, 2,1, 4,22, 2,1, 20,0, 2,1, 4,22, 2,1, 16,0),
  /* r26 */ R(96,  10,0, 4,1, 32,0, 4,1, 22,0, 4,1, 20,0),
  /* r27 */ R(96,  10,0, 4,1, 32,0, 4,1, 22,0, 4,1, 20,0),
  /* r28 */ R(96,  96,0),
  /* r29 */ R(96,  96,0),
  /* r30 */ R(96,  96,0),
  /* r31 */ R(96,  96,0),
];

// ---------------------------------------------------------------------------
// TRAIN: 128x32 — steel locomotive facing right (Crossy Road style)
// Palette: 1 (outline), 14 (body), 15 (highlight), 16 (shadow/wheels), 29 (warning stripe)
// Body spans col 2-125 (124px), rows 2-25 (24px) — fills ~73% of canvas
// ---------------------------------------------------------------------------
// prettier-ignore
const TRAIN: SpritePixels = [
  /* r0  */ R(128,  128,0),
  /* r1  */ R(128,  128,0),
  /* r2  */ R(128,  4,0, 2,1, 116,1, 2,1, 4,0),
  /* r3  */ R(128,  4,0, 2,1, 116,1, 2,1, 4,0),
  /* r4  */ R(128,  2,0, 2,1, 120,15, 2,1, 2,0),
  /* r5  */ R(128,  2,0, 2,1, 120,15, 2,1, 2,0),
  /* r6  */ R(128,  2,0, 2,1, 120,15, 2,1, 2,0),
  /* r7  */ R(128,  2,0, 2,1, 120,15, 2,1, 2,0),
  /* r8  */ R(128,  2,0, 2,1, 8,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 2,0),
  /* r9  */ R(128,  2,0, 2,1, 8,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 14,14, 2,1, 2,0),
  /* r10 */ R(128,  2,0, 2,1, 120,14, 2,1, 2,0),
  /* r11 */ R(128,  2,0, 2,1, 120,14, 2,1, 2,0),
  /* r12 */ R(128,  2,0, 2,1, 120,29, 2,1, 2,0),
  /* r13 */ R(128,  2,0, 2,1, 120,29, 2,1, 2,0),
  /* r14 */ R(128,  2,0, 2,1, 120,14, 2,1, 2,0),
  /* r15 */ R(128,  2,0, 2,1, 120,14, 2,1, 2,0),
  /* r16 */ R(128,  2,0, 2,1, 120,14, 2,1, 2,0),
  /* r17 */ R(128,  2,0, 2,1, 120,14, 2,1, 2,0),
  /* r18 */ R(128,  2,0, 2,1, 120,16, 2,1, 2,0),
  /* r19 */ R(128,  2,0, 2,1, 120,16, 2,1, 2,0),
  /* r20 */ R(128,  4,0, 2,1, 116,1, 2,1, 4,0),
  /* r21 */ R(128,  4,0, 2,1, 116,1, 2,1, 4,0),
  /* r22 */ R(128,  6,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 12,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 12,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 12,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 6,0),
  /* r23 */ R(128,  6,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 12,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 12,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 12,0, 2,1, 4,16, 2,1, 4,0, 2,1, 4,16, 2,1, 6,0),
  /* r24 */ R(128,  6,0, 8,1, 4,0, 8,1, 12,0, 8,1, 4,0, 8,1, 12,0, 8,1, 4,0, 8,1, 12,0, 8,1, 4,0, 8,1, 6,0),
  /* r25 */ R(128,  6,0, 8,1, 4,0, 8,1, 12,0, 8,1, 4,0, 8,1, 12,0, 8,1, 4,0, 8,1, 12,0, 8,1, 4,0, 8,1, 6,0),
  /* r26 */ R(128,  128,0),
  /* r27 */ R(128,  128,0),
  /* r28 */ R(128,  128,0),
  /* r29 */ R(128,  128,0),
  /* r30 */ R(128,  128,0),
  /* r31 */ R(128,  128,0),
];

// ---------------------------------------------------------------------------
// LOG: 96x32 — wooden log floating on water (Crossy Road style)
// Palette: 1 (outline), 26 (dark bark), 27 (mid bark body), 28 (light bark highlight)
// Body spans col 6-89 (84px), rows 2-27 (26px) — fills ~70% of canvas
// ---------------------------------------------------------------------------
// prettier-ignore
const LOG: SpritePixels = [
  /* r0  */ R(96,  96,0),
  /* r1  */ R(96,  96,0),
  /* r2  */ R(96,  12,0, 2,1, 68,1, 2,1, 12,0),
  /* r3  */ R(96,  12,0, 2,1, 68,1, 2,1, 12,0),
  /* r4  */ R(96,  8,0, 2,1, 2,1, 72,28, 2,1, 2,1, 8,0),
  /* r5  */ R(96,  8,0, 2,1, 2,1, 72,28, 2,1, 2,1, 8,0),
  /* r6  */ R(96,  6,0, 2,1, 76,28, 2,1, 2,28, 2,27, 2,1, 4,0),
  /* r7  */ R(96,  6,0, 2,1, 76,28, 2,1, 2,28, 2,27, 2,1, 4,0),
  /* r8  */ R(96,  6,0, 2,1, 28,27, 2,26, 46,27, 2,1, 4,27, 2,1, 4,0),
  /* r9  */ R(96,  6,0, 2,1, 28,27, 2,26, 46,27, 2,1, 4,27, 2,1, 4,0),
  /* r10 */ R(96,  6,0, 2,1, 16,27, 2,26, 58,27, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r11 */ R(96,  6,0, 2,1, 16,27, 2,26, 58,27, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r12 */ R(96,  6,0, 2,1, 76,27, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r13 */ R(96,  6,0, 2,1, 76,27, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r14 */ R(96,  6,0, 2,1, 14,27, 2,26, 22,27, 2,26, 36,27, 2,1, 2,27, 2,27, 2,26, 2,1, 2,0),
  /* r15 */ R(96,  6,0, 2,1, 14,27, 2,26, 22,27, 2,26, 36,27, 2,1, 2,27, 2,27, 2,26, 2,1, 2,0),
  /* r16 */ R(96,  6,0, 2,1, 76,27, 2,1, 2,26, 2,27, 2,27, 2,1, 2,0),
  /* r17 */ R(96,  6,0, 2,1, 76,27, 2,1, 2,26, 2,27, 2,27, 2,1, 2,0),
  /* r18 */ R(96,  6,0, 2,1, 76,27, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r19 */ R(96,  6,0, 2,1, 76,27, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r20 */ R(96,  6,0, 2,1, 76,26, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r21 */ R(96,  6,0, 2,1, 76,26, 2,1, 2,27, 2,26, 2,27, 2,1, 2,0),
  /* r22 */ R(96,  6,0, 2,1, 76,26, 2,1, 2,26, 2,27, 2,1, 4,0),
  /* r23 */ R(96,  6,0, 2,1, 76,26, 2,1, 2,26, 2,27, 2,1, 4,0),
  /* r24 */ R(96,  8,0, 2,1, 74,26, 2,1, 2,1, 2,1, 6,0),
  /* r25 */ R(96,  8,0, 2,1, 74,26, 2,1, 2,1, 2,1, 6,0),
  /* r26 */ R(96,  12,0, 2,1, 68,1, 2,1, 12,0),
  /* r27 */ R(96,  12,0, 2,1, 68,1, 2,1, 12,0),
  /* r28 */ R(96,  96,0),
  /* r29 */ R(96,  96,0),
  /* r30 */ R(96,  96,0),
  /* r31 */ R(96,  96,0),
];

// --- Animation frame helpers ---

/** Deep-clone a sprite pixel array */
function cloneSprite(pixels: SpritePixels): SpritePixels {
  return pixels.map(row => [...row]);
}

/**
 * Shift wheel pixels down by 1px to simulate rotation.
 * Wheels are identified as 2x2 blocks of dark color (index 19 or 22)
 * in the bottom region of the sprite (rows 22-27).
 */
function shiftWheels(pixels: SpritePixels, wheelColor: number): SpritePixels {
  const result = cloneSprite(pixels);
  const height = result.length;
  const width = result[0].length;

  // Find wheel regions: scan bottom quarter for wheel-colored blocks
  const startRow = Math.floor(height * 0.6);
  for (let r = startRow; r < height - 2; r++) {
    for (let c = 0; c < width - 1; c++) {
      // Detect a wheel pixel block and shift down by swapping with row below
      if (result[r][c] === wheelColor && result[r][c + 1] === wheelColor) {
        if (r + 2 < height && result[r + 2][c] === 0) {
          // Move the wheel pixel down by 1: copy current to below, clear current
          result[r + 2][c] = wheelColor;
          result[r + 2][c + 1] = wheelColor;
          result[r][c] = result[r + 1][c] === 1 ? 1 : 0;
          result[r][c + 1] = result[r + 1][c + 1] === 1 ? 1 : 0;
        }
      }
    }
  }
  return result;
}

/**
 * Add a small exhaust puff — set a few transparent pixels to a light color
 * behind the truck (at the left side, since truck faces right).
 */
function addExhaustPuff(pixels: SpritePixels): SpritePixels {
  const result = cloneSprite(pixels);
  // Place a tiny 2x2 puff near the left exhaust area (row 18-19, col 0-1)
  const puffRow = 18;
  const puffCol = 0;
  if (result[puffRow] && result[puffRow][puffCol] === 0) {
    result[puffRow][puffCol] = 15; // slate (exhaust)
    result[puffRow][puffCol + 1] = 15;
    result[puffRow + 1][puffCol] = 15;
    result[puffRow + 1][puffCol + 1] = 15;
  }
  return result;
}

/**
 * Shift the warning yellow stripe (index 29) by 2px to the right,
 * creating a motion blur effect on the train.
 */
function shiftWarningStripe(pixels: SpritePixels): SpritePixels {
  const result = cloneSprite(pixels);
  const width = result[0].length;

  for (let r = 0; r < result.length; r++) {
    const row = result[r];
    // Check if this row contains warning yellow (29)
    if (!row.includes(29)) continue;

    // Shift stripe pixels 2 positions to the right with wrap
    const newRow = [...row];
    for (let c = 0; c < width; c++) {
      if (row[c] === 29) {
        newRow[c] = result[r][c] !== 29 ? result[r][c] : 14; // replace with body color
      }
    }
    for (let c = 0; c < width; c++) {
      if (row[c] === 29) {
        const nc = c + 2;
        if (nc < width && row[nc] !== 1) { // don't overwrite outlines
          newRow[nc] = 29;
        }
      }
    }
    result[r] = newRow;
  }
  return result;
}

// Car frame 1: shifted wheels
const CAR_1 = shiftWheels(CAR, 19);
const CAR_BLUE_1 = recolorSprite(CAR_1, 3, 10);
const CAR_YELLOW_1 = recolorSprite(recolorSprite(CAR_1, 3, 5), 19, 4);

// Truck frame 1: shifted wheels + exhaust puff
const TRUCK_1 = addExhaustPuff(shiftWheels(TRUCK, 22));

// Train frame 1: shifted warning stripe
const TRAIN_1 = shiftWarningStripe(TRAIN);

export const OBSTACLE_SPRITES: Record<string, SpritePixels> = {
  car: CAR,
  car_blue: CAR_BLUE,
  car_yellow: CAR_YELLOW,
  truck: TRUCK,
  train: TRAIN,
  log: LOG,
  car_1: CAR_1,
  car_blue_1: CAR_BLUE_1,
  car_yellow_1: CAR_YELLOW_1,
  truck_1: TRUCK_1,
  train_1: TRAIN_1,
};

export const OBSTACLE_WIDTHS: Record<string, number> = {
  car: 64,
  car_blue: 64,
  car_yellow: 64,
  truck: 96,
  train: 128,
  log: 96,
};

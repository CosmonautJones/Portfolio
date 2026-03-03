import type { SpritePixels } from "../types";

// 8x8 coin sprites — 2 animation frames each (spin effect via highlight shift)
// Palette key:
//  0 = transparent
//  1 = dark navy (outlines)
//  4 = Claude orange (gold coin shadow)
//  5 = gold (gold coin body)
// 12 = cyan (diamond highlight)
// 13 = near-white (highlights, diamond body)
// 14 = steel gray (silver coin body)
// 15 = slate (silver shadow)

// Gold coin frame 0 — highlight on left
// prettier-ignore
const GOLD_0: SpritePixels = [
  [0, 0, 1, 5, 5, 1, 0, 0],
  [0, 1, 5, 5, 5, 5, 1, 0],
  [1,13, 5, 5, 5, 5, 4, 1],
  [1,13, 5, 5, 5, 5, 4, 1],
  [1, 5, 5, 5, 5, 5, 4, 1],
  [1, 5, 5, 5, 5, 5, 4, 1],
  [0, 1, 5, 5, 5, 4, 1, 0],
  [0, 0, 1, 4, 4, 1, 0, 0],
];

// Gold coin frame 1 — highlight on right
// prettier-ignore
const GOLD_1: SpritePixels = [
  [0, 0, 1, 5, 5, 1, 0, 0],
  [0, 1, 5, 5, 5, 5, 1, 0],
  [1, 4, 5, 5, 5,13, 5, 1],
  [1, 4, 5, 5, 5,13, 5, 1],
  [1, 4, 5, 5, 5, 5, 5, 1],
  [1, 4, 5, 5, 5, 5, 5, 1],
  [0, 1, 4, 5, 5, 5, 1, 0],
  [0, 0, 1, 4, 4, 1, 0, 0],
];

// Silver coin frame 0
// prettier-ignore
const SILVER_0: SpritePixels = [
  [0, 0, 1,14,14, 1, 0, 0],
  [0, 1,14,14,14,14, 1, 0],
  [1,13,14,14,14,14,15, 1],
  [1,13,14,14,14,14,15, 1],
  [1,14,14,14,14,14,15, 1],
  [1,14,14,14,14,14,15, 1],
  [0, 1,14,14,14,15, 1, 0],
  [0, 0, 1,15,15, 1, 0, 0],
];

// Silver coin frame 1
// prettier-ignore
const SILVER_1: SpritePixels = [
  [0, 0, 1,14,14, 1, 0, 0],
  [0, 1,14,14,14,14, 1, 0],
  [1,15,14,14,14,13,14, 1],
  [1,15,14,14,14,13,14, 1],
  [1,15,14,14,14,14,14, 1],
  [1,15,14,14,14,14,14, 1],
  [0, 1,15,14,14,14, 1, 0],
  [0, 0, 1,15,15, 1, 0, 0],
];

// Diamond coin frame 0 — bright cyan/white faceted gem
// prettier-ignore
const DIAMOND_0: SpritePixels = [
  [0, 0, 1,12,12, 1, 0, 0],
  [0, 1,12,13,13,12, 1, 0],
  [1,12,13,13,12,13,12, 1],
  [1,12,13,12,12,13,12, 1],
  [1,12,12,13,13,12,12, 1],
  [1,12,12,12,12,12,12, 1],
  [0, 1,12,12,12,12, 1, 0],
  [0, 0, 1,12,12, 1, 0, 0],
];

// Diamond coin frame 1 — shifted sparkle
// prettier-ignore
const DIAMOND_1: SpritePixels = [
  [0, 0, 1,12,12, 1, 0, 0],
  [0, 1,12,12,13,12, 1, 0],
  [1,12,12,12,13,13,12, 1],
  [1,12,13,13,12,12,12, 1],
  [1,12,13,12,12,12,12, 1],
  [1,12,12,12,12,13,12, 1],
  [0, 1,12,12,12,12, 1, 0],
  [0, 0, 1,12,12, 1, 0, 0],
];

export const COIN_SPRITES: Record<string, SpritePixels> = {
  coin_gold_0: GOLD_0,
  coin_gold_1: GOLD_1,
  coin_silver_0: SILVER_0,
  coin_silver_1: SILVER_1,
  coin_diamond_0: DIAMOND_0,
  coin_diamond_1: DIAMOND_1,
};

// Glow colors per coin type (for rendering)
export const COIN_GLOW_COLORS: Record<string, string> = {
  gold: "#ffcd75",
  silver: "#94b0c2",
  diamond: "#73eff7",
};

// Particle colors per coin type
export const COIN_PARTICLE_COLORS: Record<string, string[]> = {
  gold: ["#ffcd75", "#ef7d57", "#f4f4f4"],
  silver: ["#94b0c2", "#f4f4f4", "#566c86"],
  diamond: ["#73eff7", "#41a6f6", "#f4f4f4"],
};

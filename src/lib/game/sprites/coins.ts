import type { SpritePixels } from "../types";

// 8x8 coin sprites — 2 animation frames each (spin effect via highlight shift)
// Enhanced with better shading ramps and a new ruby coin type.
//
// Palette key:
//  0 = transparent
//  1 = dark navy (outlines)
//  2 = plum (ruby shadow)
//  3 = cranberry (ruby body)
//  4 = Claude orange (gold coin shadow)
//  5 = gold (gold coin body)
//  6 = lime (not used here)
// 12 = cyan (diamond highlight)
// 13 = near-white (highlights, diamond body)
// 14 = steel gray (silver coin body)
// 15 = slate (silver shadow)
// 17 = lobster red (ruby highlight shadow)
// 41 = Claude orange deep (gold deep shadow, new)
// 42 = gold highlight (new — bright gold shine)
// 47 = near-white blue tint (diamond specular, new)

// Gold coin frame 0 — highlight on left, bright center
// prettier-ignore
const GOLD_0: SpritePixels = [
  [0, 0, 1, 5, 5, 1, 0, 0],
  [0, 1, 5,42, 5, 5, 1, 0],
  [1,42,42, 5, 5, 5, 4, 1],
  [1,42, 5, 5, 5, 5, 4, 1],
  [1, 5, 5, 5, 5, 5,41, 1],
  [1, 5, 5, 5, 5,41,41, 1],
  [0, 1, 5, 5,41,41, 1, 0],
  [0, 0, 1,41,41, 1, 0, 0],
];

// Gold coin frame 1 — highlight shifted right
// prettier-ignore
const GOLD_1: SpritePixels = [
  [0, 0, 1, 5, 5, 1, 0, 0],
  [0, 1, 5, 5, 5,42, 1, 0],
  [1, 4, 5, 5,42,42,42, 1],
  [1, 4, 5, 5, 5,42,42, 1],
  [1,41, 5, 5, 5, 5, 5, 1],
  [1,41,41, 5, 5, 5, 5, 1],
  [0, 1,41,41, 5, 5, 1, 0],
  [0, 0, 1,41, 4, 1, 0, 0],
];

// Silver coin frame 0
// prettier-ignore
const SILVER_0: SpritePixels = [
  [0, 0, 1,14,14, 1, 0, 0],
  [0, 1,14,13,14,14, 1, 0],
  [1,13,13,14,14,14,15, 1],
  [1,13,14,14,14,14,15, 1],
  [1,14,14,14,14,14,15, 1],
  [1,14,14,14,14,15,15, 1],
  [0, 1,14,14,15,15, 1, 0],
  [0, 0, 1,15,15, 1, 0, 0],
];

// Silver coin frame 1
// prettier-ignore
const SILVER_1: SpritePixels = [
  [0, 0, 1,14,14, 1, 0, 0],
  [0, 1,14,14,14,13, 1, 0],
  [1,15,14,14,13,13,13, 1],
  [1,15,14,14,14,13,13, 1],
  [1,15,15,14,14,14,14, 1],
  [1,15,15,14,14,14,14, 1],
  [0, 1,15,14,14,14, 1, 0],
  [0, 0, 1,15,15, 1, 0, 0],
];

// Diamond coin frame 0 — bright cyan/white faceted gem with blue tint specular
// prettier-ignore
const DIAMOND_0: SpritePixels = [
  [0, 0, 1,12,12, 1, 0, 0],
  [0, 1,12,47,13,12, 1, 0],
  [1,12,47,13,12,13,12, 1],
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
  [0, 1,12,12,13,47, 1, 0],
  [1,12,12,12,47,47,12, 1],
  [1,12,13,13,12,47,12, 1],
  [1,12,13,12,12,12,12, 1],
  [1,12,12,12,12,13,12, 1],
  [0, 1,12,12,12,12, 1, 0],
  [0, 0, 1,12,12, 1, 0, 0],
];

// Ruby coin frame 0 — red gem with facets, cranberry body
// prettier-ignore
const RUBY_0: SpritePixels = [
  [0, 0, 1, 3, 3, 1, 0, 0],
  [0, 1, 3,18,17, 3, 1, 0],
  [1,17,18,17, 3,17, 2, 1],
  [1,17,17, 3, 3,17, 2, 1],
  [1, 3, 3,17,17, 3, 2, 1],
  [1, 3, 3, 3, 3, 2, 2, 1],
  [0, 1, 3, 3, 2, 2, 1, 0],
  [0, 0, 1, 2, 2, 1, 0, 0],
];

// Ruby coin frame 1 — sparkle shifted
// prettier-ignore
const RUBY_1: SpritePixels = [
  [0, 0, 1, 3, 3, 1, 0, 0],
  [0, 1, 3, 3,17,18, 1, 0],
  [1, 2, 3, 3,17,18,17, 1],
  [1, 2, 2, 3, 3,18,17, 1],
  [1, 2, 2, 3,17,17, 3, 1],
  [1, 3, 3,17,17, 3, 3, 1],
  [0, 1, 3,17, 3, 3, 1, 0],
  [0, 0, 1, 2, 3, 1, 0, 0],
];

export const COIN_SPRITES: Record<string, SpritePixels> = {
  coin_gold_0: GOLD_0,
  coin_gold_1: GOLD_1,
  coin_silver_0: SILVER_0,
  coin_silver_1: SILVER_1,
  coin_diamond_0: DIAMOND_0,
  coin_diamond_1: DIAMOND_1,
  coin_ruby_0: RUBY_0,
  coin_ruby_1: RUBY_1,
};

// Glow colors per coin type (for rendering)
export const COIN_GLOW_COLORS: Record<string, string> = {
  gold: "#ffcd75",
  silver: "#94b0c2",
  diamond: "#73eff7",
  ruby: "#b13e53",
};

// Particle colors per coin type
export const COIN_PARTICLE_COLORS: Record<string, string[]> = {
  gold: ["#ffcd75", "#ffe0a0", "#ef7d57"],
  silver: ["#94b0c2", "#f4f4f4", "#566c86"],
  diamond: ["#73eff7", "#41a6f6", "#e0e8ff"],
  ruby: ["#b13e53", "#e87461", "#f4f4f4"],
};

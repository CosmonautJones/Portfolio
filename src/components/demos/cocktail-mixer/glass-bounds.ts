import type { GlassType } from "./types";

export const STAGE = { width: 280, height: 420 } as const;
export const GLASS_RECT = { x: 40, y: 48, width: 200, height: 300 } as const;

export type IceCube = {
  dx: number;
  dy: number;
  angle: number;
  scale: number;
};

export type GlassBounds = {
  liquidTop: number;
  liquidBottom: number;
  rimY: number;
  bowlCenterX: number;
  bowlWidth: number;
  hasIce: boolean;
  garnishX: number;
  garnishY: number;
  bottle: { x: number; y: number; neckX: number; neckY: number };
};

type WidthSample = readonly [number, number];

/**
 * Mask-alpha width samples (CSS px inside GLASS_RECT). Measured from
 * glass-{type}-mask.png at 2×, then halved. Last sample is the usable
 * bowl floor — not the stem nub.
 */
const BOWL_WIDTH_SAMPLES: Record<GlassType, readonly WidthSample[]> = {
  rocks: [
    [92, 130],
    [100, 129.5],
    [120, 127],
    [140, 124],
    [160, 121.5],
    [180, 119],
    [200, 116],
    [220, 113.5],
    [240, 111],
    [252, 104],
  ],
  highball: [
    [42, 82],
    [50, 82],
    [80, 80],
    [110, 78],
    [140, 76],
    [170, 73],
    [200, 71],
    [230, 69],
    [250, 68],
    [252, 66],
  ],
  coupe: [
    [64, 155],
    [70, 153],
    [90, 146],
    [110, 135],
    [130, 121],
    [150, 102],
    [168, 74],
  ],
  margarita: [
    [54, 172],
    [60, 164],
    [80, 136],
    [100, 109],
    [120, 80],
    [140, 40],
    [148, 24],
  ],
};

export const GLASS_BOUNDS: Record<GlassType, GlassBounds> = {
  rocks: {
    liquidTop: 98,
    liquidBottom: 252,
    rimY: 92,
    bowlCenterX: 100,
    bowlWidth: 119,
    hasIce: true,
    garnishX: 154,
    garnishY: 96,
    bottle: { x: 154, y: 80, neckX: 24, neckY: 8 },
  },
  highball: {
    liquidTop: 48,
    liquidBottom: 252,
    rimY: 42,
    bowlCenterX: 100,
    bowlWidth: 74,
    hasIce: true,
    garnishX: 138,
    garnishY: 46,
    bottle: { x: 136, y: 30, neckX: 24, neckY: 8 },
  },
  coupe: {
    liquidTop: 70,
    liquidBottom: 168,
    rimY: 64,
    bowlCenterX: 100,
    bowlWidth: 128,
    hasIce: false,
    garnishX: 168,
    garnishY: 66,
    bottle: { x: 164, y: 52, neckX: 24, neckY: 8 },
  },
  margarita: {
    liquidTop: 60,
    liquidBottom: 148,
    rimY: 54,
    bowlCenterX: 100,
    bowlWidth: 95,
    hasIce: false,
    garnishX: 172,
    garnishY: 58,
    bottle: { x: 170, y: 42, neckX: 24, neckY: 8 },
  },
};

/** Ice positions relative to bowlCenterX and liquidBottom (floor of the bowl). */
export const ICE_LAYOUT: Record<"rocks" | "highball", IceCube[]> = {
  rocks: [
    { dx: -16, dy: -30, angle: 14, scale: 1.12 },
    { dx: 15, dy: -22, angle: -10, scale: 0.76 },
  ],
  highball: [
    { dx: -6, dy: -36, angle: 10, scale: 0.66 },
    { dx: 8, dy: -96, angle: -12, scale: 0.7 },
    { dx: -4, dy: -156, angle: 16, scale: 0.62 },
  ],
};

export const CONDENSATION_LAYOUT: Record<GlassType, { dx: number; dy: number }[]> = {
  rocks: [
    { dx: -28, dy: 36 },
    { dx: 26, dy: 54 },
    { dx: -12, dy: 72 },
    { dx: 18, dy: 90 },
  ],
  highball: [
    { dx: -22, dy: 40 },
    { dx: 20, dy: 70 },
    { dx: -16, dy: 100 },
    { dx: 14, dy: 130 },
    { dx: -8, dy: 160 },
    { dx: 10, dy: 190 },
  ],
  coupe: [
    { dx: -40, dy: 18 },
    { dx: 36, dy: 28 },
    { dx: -12, dy: 40 },
  ],
  margarita: [
    { dx: -48, dy: 16 },
    { dx: 44, dy: 26 },
    { dx: -10, dy: 36 },
  ],
};

const CONDENSATION_INSET = 8;

/** Condensation in glass-local pixels, clipped to the live bowl. */
export function condensationPoints(
  glass: GlassType,
): { x: number; y: number }[] {
  const bounds = GLASS_BOUNDS[glass];
  return CONDENSATION_LAYOUT[glass].map((drop) => {
    const y = bounds.liquidTop + drop.dy;
    const half = Math.max(4, bowlWidthAt(glass, y) / 2 - CONDENSATION_INSET);
    return {
      x: bounds.bowlCenterX + Math.max(-half, Math.min(half, drop.dx)),
      y,
    };
  });
}

const WALL_INSET = 6;

export function bowlWidthAt(glass: GlassType, yInGlass: number): number {
  const samples = BOWL_WIDTH_SAMPLES[glass];
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (yInGlass <= first[0]) return Math.max(10, first[1] - WALL_INSET);
  if (yInGlass >= last[0]) return Math.max(10, last[1] - WALL_INSET);

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const next = samples[index];
    if (yInGlass <= next[0]) {
      const t = (yInGlass - previous[0]) / (next[0] - previous[0]);
      return Math.max(10, previous[1] + (next[1] - previous[1]) * t - WALL_INSET);
    }
  }

  return Math.max(10, last[1] - WALL_INSET);
}

export function pourContactX(glass: GlassType, yInGlass: number): number {
  const bounds = GLASS_BOUNDS[glass];
  return bounds.bowlCenterX + bowlWidthAt(glass, yInGlass) * 0.18;
}

export function rimGarnishPoint(glass: GlassType): { x: number; y: number } {
  const bounds = GLASS_BOUNDS[glass];
  const width = bowlWidthAt(glass, bounds.rimY + 6);
  return {
    x: bounds.bowlCenterX + width / 2 - 2,
    y: bounds.rimY + 4,
  };
}

export function surfaceYForFill(glass: GlassType, fillHeight: number): number {
  const bounds = GLASS_BOUNDS[glass];
  const clamped = Math.max(0, Math.min(1, fillHeight));
  const liquidTop = GLASS_RECT.y + bounds.liquidTop;
  const liquidBottom = GLASS_RECT.y + bounds.liquidBottom;
  return liquidBottom - (liquidBottom - liquidTop) * clamped;
}

export function foamOffsetsForWidth(bowlWidth: number): number[] {
  const span = Math.max(10, (bowlWidth / 2) * 0.7);
  const count = 11;
  return Array.from(
    { length: count },
    (_, index) => -span + ((2 * span) * index) / (count - 1),
  );
}

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

export const GLASS_BOUNDS: Record<GlassType, GlassBounds> = {
  rocks: {
    liquidTop: 100,
    liquidBottom: 254,
    rimY: 95,
    bowlCenterX: 100,
    bowlWidth: 130,
    hasIce: true,
    garnishX: 140,
    garnishY: 90,
    bottle: { x: 168, y: -8, neckX: 24, neckY: 8 },
  },
  highball: {
    liquidTop: 50,
    liquidBottom: 255,
    rimY: 45,
    bowlCenterX: 100,
    bowlWidth: 82,
    hasIce: true,
    garnishX: 132,
    garnishY: 42,
    bottle: { x: 168, y: -8, neckX: 24, neckY: 8 },
  },
  coupe: {
    liquidTop: 70,
    liquidBottom: 180,
    rimY: 65,
    bowlCenterX: 100,
    bowlWidth: 150,
    hasIce: false,
    garnishX: 148,
    garnishY: 62,
    bottle: { x: 168, y: -8, neckX: 24, neckY: 8 },
  },
  margarita: {
    liquidTop: 60,
    liquidBottom: 175,
    rimY: 55,
    bowlCenterX: 100,
    bowlWidth: 170,
    hasIce: false,
    garnishX: 150,
    garnishY: 52,
    bottle: { x: 168, y: -8, neckX: 24, neckY: 8 },
  },
};

export const ICE_LAYOUT: Record<"rocks" | "highball", IceCube[]> = {
  rocks: [
    { dx: -8, dy: 10, angle: 12, scale: 1.35 },
    { dx: 18, dy: 22, angle: -8, scale: 0.85 },
  ],
  highball: [
    { dx: -10, dy: -36, angle: 10, scale: 1 },
    { dx: 12, dy: -8, angle: -12, scale: 0.9 },
    { dx: -4, dy: 28, angle: 18, scale: 0.8 },
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

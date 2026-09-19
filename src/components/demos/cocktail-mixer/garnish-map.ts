import type { GarnishType, GlassType } from "./types";

export type GarnishPose = {
  anchorX: number;
  anchorY: number;
  angle: number;
  width: number;
  height: number;
};

export const GARNISH_POSE: Record<string, GarnishPose> = {
  "garnish-lime-wheel.png": {
    anchorX: 0.22,
    anchorY: 0.55,
    angle: -26,
    width: 52,
    height: 52,
  },
  "garnish-grapefruit-wedge.png": {
    anchorX: 0.12,
    anchorY: 0.58,
    angle: -38,
    width: 60,
    height: 52,
  },
  "garnish-cherry.png": {
    anchorX: 0.48,
    anchorY: 0.88,
    angle: 14,
    width: 40,
    height: 48,
  },
  "garnish-orange-slice.png": {
    anchorX: 0.18,
    anchorY: 0.55,
    angle: -28,
    width: 52,
    height: 40,
  },
  "garnish-cherry-orange.png": {
    anchorX: 0.2,
    anchorY: 0.7,
    angle: -16,
    width: 76,
    height: 60,
  },
  "garnish-rocket.png": {
    anchorX: 0.5,
    anchorY: 0.92,
    angle: 8,
    width: 36,
    height: 70,
  },
};

export const SODA_INGREDIENT_NAME = "Grapefruit Soda";

export function isFoamIngredient(name: string): boolean {
  return name === SODA_INGREDIENT_NAME;
}

function saltPlate(glass: GlassType): string {
  switch (glass) {
    case "margarita":
      return "rim-salt-margarita.png";
    case "highball":
      return "rim-salt-highball.png";
    case "rocks":
    case "coupe":
      return "rim-salt-highball.png";
    default: {
      const _exhaustive: never = glass;
      return _exhaustive;
    }
  }
}

export function garnishPlates(
  type: GarnishType,
  glass: GlassType
): string[] {
  switch (type) {
    case "lime_wheel":
      return ["garnish-lime-wheel.png"];
    case "cherry":
      return ["garnish-cherry.png"];
    case "orange_slice":
      return ["garnish-orange-slice.png"];
    case "grapefruit_wedge":
      return ["garnish-grapefruit-wedge.png"];
    case "salt_rim":
      return [saltPlate(glass)];
    case "cherry_orange":
      return ["garnish-cherry-orange.png"];
    case "salt_grapefruit":
      return [saltPlate(glass), "garnish-grapefruit-wedge.png"];
    case "salt_lime":
      return [saltPlate(glass), "garnish-lime-wheel.png"];
    case "rocket":
      return ["garnish-rocket.png"];
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

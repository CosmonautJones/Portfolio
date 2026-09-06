import type { GarnishType, GlassType } from "./types";

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

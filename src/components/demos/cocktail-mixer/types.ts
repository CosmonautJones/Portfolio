export interface Ingredient {
  name: string;
  amount: string;
  color: string;
}

export type GlassType = "rocks" | "coupe" | "highball" | "margarita";

export type GarnishType =
  | "lime_wheel"
  | "cherry"
  | "orange_slice"
  | "grapefruit_wedge"
  | "salt_rim"
  | "cherry_orange"
  | "salt_grapefruit"
  | "salt_lime"
  | "rocket";

export type MixMethod = "shaken" | "stirred" | "built";

export interface Cocktail {
  name: string;
  glass: GlassType;
  color: string;
  emoji: string;
  ingredients: Ingredient[];
  garnish: string;
  garnishType: GarnishType;
  method: MixMethod;
  instructions: string;
  isSecret?: boolean;
}

export interface GlassConfig {
  outline: string;
  clip: string;
  rim: string;
  base: string;
  highlight: string;
  liquidTop: number;
  liquidBottom: number;
  hasIce: boolean;
}

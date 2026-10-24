/** @vitest-environment node */
import { describe, it, expect } from "vitest";
import {
  GARNISH_POSE,
  garnishPlates,
  isFoamIngredient,
  SODA_INGREDIENT_NAME,
} from "../garnish-map";
import { COCKTAILS, THE_COSMONAUT } from "../data";

describe("garnish-map", () => {
  it("puts salt on from the first frame for salt_* types", () => {
    expect(garnishPlates("salt_lime", "margarita")).toEqual([
      "rim-salt-margarita.png",
      "garnish-lime-wheel.png",
    ]);
    expect(garnishPlates("salt_grapefruit", "highball")).toEqual([
      "rim-salt-highball.png",
      "garnish-grapefruit-wedge.png",
    ]);
  });

  it("maps rocket for the Cosmonaut", () => {
    expect(garnishPlates("rocket", "coupe")).toEqual(["garnish-rocket.png"]);
  });

  it("foams only Grapefruit Soda, not Salty Dog juice", () => {
    expect(SODA_INGREDIENT_NAME).toBe("Grapefruit Soda");
    const paloma = COCKTAILS.find((c) => c.name === "Paloma")!;
    const dog = COCKTAILS.find((c) => c.name === "Salty Dog")!;
    expect(paloma.ingredients.some((i) => isFoamIngredient(i.name))).toBe(true);
    expect(dog.ingredients.some((i) => isFoamIngredient(i.name))).toBe(false);
    expect(THE_COSMONAUT.ingredients.some((i) => isFoamIngredient(i.name))).toBe(
      false
    );
  });

  it("anchors every garnish plate so it can sit on a rim", () => {
    const plates = [
      "garnish-lime-wheel.png",
      "garnish-grapefruit-wedge.png",
      "garnish-cherry.png",
      "garnish-orange-slice.png",
      "garnish-cherry-orange.png",
      "garnish-rocket.png",
    ];
    for (const plate of plates) {
      const pose = GARNISH_POSE[plate];
      expect(pose.anchorX).toBeGreaterThan(0);
      expect(pose.anchorX).toBeLessThan(1);
      expect(pose.anchorY).toBeGreaterThan(0.4);
      expect(pose.width).toBeGreaterThan(20);
    }
  });
});

/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { COCKTAILS } from "../data";
import { shouldEmitFoam, shouldShowSalt } from "../pixi/particles";

describe("particle policy", () => {
  it("foams Paloma soda pour only", () => {
    const paloma = COCKTAILS.find((cocktail) => cocktail.name === "Paloma")!;
    expect(shouldEmitFoam(paloma, 0)).toBe(false);
    expect(shouldEmitFoam(paloma, 1)).toBe(true);
    expect(shouldEmitFoam(paloma, 2)).toBe(false);
    const dog = COCKTAILS.find((cocktail) => cocktail.name === "Salty Dog")!;
    expect(
      dog.ingredients.every(
        (_, ingredientIndex) => !shouldEmitFoam(dog, ingredientIndex),
      ),
    ).toBe(true);
  });

  it("shows salt when garnishType starts with salt_", () => {
    expect(shouldShowSalt("salt_lime")).toBe(true);
    expect(shouldShowSalt("cherry")).toBe(false);
  });
});

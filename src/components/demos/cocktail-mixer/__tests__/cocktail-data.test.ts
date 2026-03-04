import { describe, it, expect } from "vitest";
import { COCKTAILS, THE_COSMONAUT, GLASS_CONFIGS } from "../data";
import type { Cocktail } from "../types";

const ALL_COCKTAILS: Cocktail[] = [...COCKTAILS, THE_COSMONAUT];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const VALID_GLASSES = Object.keys(GLASS_CONFIGS);
const VALID_METHODS = ["shaken", "stirred", "built"];

describe("cocktail data integrity", () => {
  it("has exactly 6 regular cocktails", () => {
    const regular = COCKTAILS.filter((c) => !c.isSecret);
    expect(regular).toHaveLength(6);
  });

  it("has exactly 1 secret cocktail", () => {
    expect(THE_COSMONAUT.isSecret).toBe(true);
  });

  it("all cocktails have unique names", () => {
    const names = ALL_COCKTAILS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(ALL_COCKTAILS.map((c) => [c.name, c]))(
    "%s uses a valid glass type",
    (_name, cocktail) => {
      expect(VALID_GLASSES).toContain((cocktail as Cocktail).glass);
    }
  );

  it.each(ALL_COCKTAILS.map((c) => [c.name, c]))(
    "%s uses a valid method",
    (_name, cocktail) => {
      expect(VALID_METHODS).toContain((cocktail as Cocktail).method);
    }
  );

  it.each(ALL_COCKTAILS.map((c) => [c.name, c]))(
    "%s has valid hex color",
    (_name, cocktail) => {
      expect((cocktail as Cocktail).color).toMatch(HEX_RE);
    }
  );

  it.each(ALL_COCKTAILS.map((c) => [c.name, c]))(
    "%s ingredients all have hex colors",
    (_name, cocktail) => {
      for (const ing of (cocktail as Cocktail).ingredients) {
        expect(ing.color).toMatch(HEX_RE);
      }
    }
  );

  it.each(ALL_COCKTAILS.map((c) => [c.name, c]))(
    "%s has at least 2 ingredients",
    (_name, cocktail) => {
      expect((cocktail as Cocktail).ingredients.length).toBeGreaterThanOrEqual(2);
    }
  );

  it.each(ALL_COCKTAILS.map((c) => [c.name, c]))(
    "%s has non-empty garnish and instructions",
    (_name, cocktail) => {
      const c = cocktail as Cocktail;
      expect(c.garnish.length).toBeGreaterThan(0);
      expect(c.instructions.length).toBeGreaterThan(0);
    }
  );

  it("glass configs have valid liquid ranges", () => {
    for (const [name, config] of Object.entries(GLASS_CONFIGS)) {
      expect(config.liquidTop).toBeLessThan(config.liquidBottom);
      expect(config.liquidTop).toBeGreaterThan(0);
      expect(config.liquidBottom).toBeLessThan(300);
      // Suppress unused var warning
      void name;
    }
  });
});

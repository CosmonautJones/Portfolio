/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCocktailProgress } from "../hooks";

describe("useCocktailProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty set when no localStorage data", () => {
    const { result } = renderHook(() => useCocktailProgress());
    expect(result.current.madeCocktails.size).toBe(0);
    expect(result.current.cosmonautUnlocked).toBe(false);
  });

  it("tracks a made cocktail", () => {
    const { result } = renderHook(() => useCocktailProgress());

    act(() => {
      result.current.markMade("Margarita");
    });

    expect(result.current.madeCocktails.has("Margarita")).toBe(true);
    expect(result.current.madeCocktails.size).toBe(1);
  });

  it("deduplicates same cocktail made twice", () => {
    const { result } = renderHook(() => useCocktailProgress());

    act(() => {
      result.current.markMade("Paloma");
      result.current.markMade("Paloma");
    });

    expect(result.current.madeCocktails.size).toBe(1);
  });

  it("unlocks cosmonaut at 6 unique cocktails", () => {
    const { result } = renderHook(() => useCocktailProgress());

    const cocktails = [
      "Margarita",
      "Paloma",
      "Tequila Sunrise",
      "Whiskey Sour",
      "Old Fashioned",
      "Salty Dog",
    ];

    act(() => {
      for (const name of cocktails) {
        result.current.markMade(name);
      }
    });

    expect(result.current.cosmonautUnlocked).toBe(true);
  });

  it("does not unlock cosmonaut at 5 cocktails", () => {
    const { result } = renderHook(() => useCocktailProgress());

    const cocktails = [
      "Margarita",
      "Paloma",
      "Tequila Sunrise",
      "Whiskey Sour",
      "Old Fashioned",
    ];

    act(() => {
      for (const name of cocktails) {
        result.current.markMade(name);
      }
    });

    expect(result.current.cosmonautUnlocked).toBe(false);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useCocktailProgress());

    act(() => {
      result.current.markMade("Margarita");
      result.current.markMade("Paloma");
    });

    const stored = JSON.parse(localStorage.getItem("cocktails_made") ?? "[]");
    expect(stored).toContain("Margarita");
    expect(stored).toContain("Paloma");
    expect(stored).toHaveLength(2);
  });

  it("restores from localStorage on mount", () => {
    localStorage.setItem(
      "cocktails_made",
      JSON.stringify(["Margarita", "Paloma", "Old Fashioned"])
    );

    const { result } = renderHook(() => useCocktailProgress());

    // Need to wait for useEffect to run
    expect(result.current.madeCocktails.size).toBe(3);
    expect(result.current.madeCocktails.has("Margarita")).toBe(true);
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("cocktails_made", "not-valid-json{{{");

    const { result } = renderHook(() => useCocktailProgress());

    expect(result.current.madeCocktails.size).toBe(0);
  });
});

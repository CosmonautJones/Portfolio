"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cocktails_made";

/* ─── Cocktail Progress Hook ────────────────────────────────────────── */

export interface CocktailProgress {
  madeCocktails: Set<string>;
  cosmonautUnlocked: boolean;
  markMade: (name: string) => void;
}

function loadMadeCocktails(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return new Set(parsed.filter((s): s is string => typeof s === "string"));
    }
  } catch {
    // Corrupted storage — start fresh
  }
  return new Set();
}

function saveMadeCocktails(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Storage full — ignore
  }
}

export function useCocktailProgress(): CocktailProgress {
  const [madeCocktails, setMadeCocktails] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMadeCocktails(loadMadeCocktails());
  }, []);

  const cosmonautUnlocked = madeCocktails.size >= 6;

  const markMade = useCallback((name: string) => {
    setMadeCocktails((prev) => {
      if (prev.has(name)) return prev;
      const next = new Set(prev);
      next.add(name);
      saveMadeCocktails(next);
      return next;
    });
  }, []);

  return { madeCocktails, cosmonautUnlocked, markMade };
}

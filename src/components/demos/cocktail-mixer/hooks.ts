"use client";

import { useState, useEffect, useCallback } from "react";

const POUR_DELAY = 250;
const POUR_INTERVAL = 850;
const STREAM_DURATION = 450;
const BUBBLE_LINGER = 450;

const STORAGE_KEY = "cocktails_made";

/* ─── Pour Sequence Hook ────────────────────────────────────────────── */

export interface PourState {
  pouredCount: number;
  activePour: number | null;
  bubbleIndex: number | null;
  allDone: boolean;
}

export function usePourSequence(
  ingredientCount: number,
  showImmediately = false
): PourState {
  const [pouredCount, setPouredCount] = useState(
    showImmediately ? ingredientCount : 0
  );
  const [activePour, setActivePour] = useState<number | null>(null);
  const [bubbleIndex, setBubbleIndex] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(showImmediately);

  useEffect(() => {
    if (showImmediately) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < ingredientCount; i++) {
      // Start pour stream + fill
      timers.push(
        setTimeout(() => {
          setActivePour(i);
          setPouredCount(i + 1);
        }, POUR_DELAY + i * POUR_INTERVAL)
      );

      // End stream, start bubbles
      timers.push(
        setTimeout(() => {
          setActivePour((prev) => (prev === i ? null : prev));
          setBubbleIndex(i);
        }, POUR_DELAY + i * POUR_INTERVAL + STREAM_DURATION)
      );

      // Clear bubbles
      timers.push(
        setTimeout(() => {
          setBubbleIndex((prev) => (prev === i ? null : prev));
        }, POUR_DELAY + i * POUR_INTERVAL + STREAM_DURATION + BUBBLE_LINGER)
      );
    }

    // Mark done
    timers.push(
      setTimeout(() => {
        setAllDone(true);
      }, POUR_DELAY + ingredientCount * POUR_INTERVAL + 200)
    );

    return () => timers.forEach(clearTimeout);
  }, [ingredientCount, showImmediately]);

  return { pouredCount, activePour, bubbleIndex, allDone };
}

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

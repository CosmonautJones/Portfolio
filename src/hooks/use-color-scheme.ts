"use client";

import { useEffect, useState, useCallback } from "react";

export type ColorScheme = "midnight" | "ocean" | "ember" | "emerald";

const STORAGE_KEY = "color-scheme";
const SCHEMES: ColorScheme[] = ["midnight", "ocean", "ember", "emerald"];
const CLASS_PREFIX = "theme-";

function applyScheme(scheme: ColorScheme) {
  const html = document.documentElement;
  SCHEMES.forEach((s) => html.classList.remove(`${CLASS_PREFIX}${s}`));
  if (scheme !== "midnight") {
    html.classList.add(`${CLASS_PREFIX}${scheme}`);
  }
}

export function useColorScheme() {
  const [scheme, setSchemeState] = useState<ColorScheme>("midnight");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorScheme | null;
    const initial = stored && SCHEMES.includes(stored) ? stored : "midnight";
    setSchemeState(initial);
    applyScheme(initial);
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyScheme(next);
  }, []);

  return { scheme, setScheme, schemes: SCHEMES } as const;
}

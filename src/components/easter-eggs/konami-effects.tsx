"use client";

import { AnimatePresence } from "motion/react";
import { useKonami } from "@/hooks/use-konami";
import { CRTOverlay } from "./crt-overlay";
import { PixelSprite } from "./pixel-sprite";

export function KonamiEffects() {
  const { triggered } = useKonami();

  return (
    <AnimatePresence>
      {triggered && (
        <>
          <CRTOverlay key="crt" />
          <PixelSprite key="sprite" />
        </>
      )}
    </AnimatePresence>
  );
}

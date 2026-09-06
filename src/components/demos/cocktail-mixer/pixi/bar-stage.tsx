"use client";

import { useEffect, useRef, useState } from "react";
import type { Application } from "pixi.js";
import type { PourSnapshot } from "../pour-script";
import type { Cocktail } from "../types";
import { createMixerApp, destroyMixerApp } from "./application";
import { loadMixerAssets } from "./assets";
import { CssStill } from "./css-still";

export interface BarStageProps {
  cocktail: Cocktail;
  reducedMotion: boolean;
  onSnapshot: (snapshot: PourSnapshot) => void;
}

export function BarStage({
  cocktail,
  reducedMotion,
  onSnapshot,
}: BarStageProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const onSnapshotRef = useRef(onSnapshot);
  const [showCssStill, setShowCssStill] = useState(true);
  onSnapshotRef.current = onSnapshot;

  useEffect(() => {
    let cancelled = false;
    let app: Application | null = null;

    const doneSnapshot: PourSnapshot = {
      pouredCount: cocktail.ingredients.length,
      activePour: null,
      allDone: true,
    };

    function destroyApp(): void {
      if (!app) return;
      destroyMixerApp(app);
      app = null;
    }

    async function mountStage(): Promise<void> {
      try {
        const PIXI = await import("pixi.js");
        if (cancelled) return;

        app = await createMixerApp(PIXI);
        if (cancelled) {
          destroyApp();
          return;
        }

        await loadMixerAssets(PIXI.Assets);
        if (cancelled) {
          destroyApp();
          return;
        }

        const canvasHost = canvasHostRef.current;
        if (!canvasHost) {
          destroyApp();
          return;
        }

        app.canvas.style.width = "100%";
        app.canvas.style.maxWidth = "280px";
        app.canvas.style.height = "auto";
        canvasHost.replaceChildren(app.canvas);
        setShowCssStill(false);

        if (reducedMotion) {
          onSnapshotRef.current(doneSnapshot);
        }
      } catch {
        destroyApp();
        if (cancelled) return;

        setShowCssStill(true);
        onSnapshotRef.current(doneSnapshot);
      }
    }

    void mountStage();

    return () => {
      cancelled = true;
      destroyApp();
    };
  }, [cocktail, reducedMotion]);

  return (
    <div
      data-testid="bar-stage"
      role="img"
      aria-label={cocktail.name}
      style={{ position: "relative", width: "100%", maxWidth: 280 }}
    >
      {showCssStill ? <CssStill cocktail={cocktail} /> : null}
      <div ref={canvasHostRef} style={{ lineHeight: 0 }} />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import "pixi.js/unsafe-eval";
import type { Application } from "pixi.js";
import type { PourSnapshot } from "../pour-script";
import type { Cocktail } from "../types";
import { createMixerApp, destroyMixerApp } from "./application";
import { loadMixerAssets } from "./assets";
import { CssStill } from "./css-still";
import { PourDirector } from "./pour-director";
import { createRig } from "./rig";
import type { MixerRig } from "./rig";

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
  const [activeRig, setActiveRig] = useState<{
    cocktail: Cocktail;
    reducedMotion: boolean;
    rig: MixerRig;
  } | null>(null);
  onSnapshotRef.current = onSnapshot;
  const rig =
    activeRig?.cocktail === cocktail &&
    activeRig.reducedMotion === reducedMotion
      ? activeRig.rig
      : null;
  const ready = !showCssStill && rig !== null;

  useEffect(() => {
    let cancelled = false;
    let app: Application | null = null;
    let mountedRig: MixerRig | null = null;

    const doneSnapshot: PourSnapshot = {
      pouredCount: cocktail.ingredients.length,
      activePour: null,
      allDone: true,
    };

    function destroyApp(): void {
      if (!app) return;
      app.ticker.remove(tickRig);
      mountedRig?.destroy();
      mountedRig = null;
      destroyMixerApp(app);
      app = null;
    }

    function tickRig(): void {
      if (app && mountedRig) {
        mountedRig.tick(app.ticker.deltaMS);
      }
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

        mountedRig = createRig(app.stage, cocktail, { reducedMotion });
        if (reducedMotion) {
          mountedRig.applyFinished(cocktail);
          onSnapshotRef.current(doneSnapshot);
        } else {
          app.ticker.add(tickRig);
        }

        app.canvas.style.width = "100%";
        app.canvas.style.maxWidth = "280px";
        app.canvas.style.height = "auto";
        canvasHost.replaceChildren(app.canvas);
        setActiveRig({ cocktail, reducedMotion, rig: mountedRig });
        setShowCssStill(false);
      } catch (error) {
        console.error("Cocktail mixer Pixi mount failed", error);
        destroyApp();
        if (cancelled) return;

        setActiveRig(null);
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
      {ready && !reducedMotion && rig ? (
        <PourDirector
          cocktail={cocktail}
          rig={rig}
          onSnapshot={onSnapshot}
        />
      ) : null}
    </div>
  );
}

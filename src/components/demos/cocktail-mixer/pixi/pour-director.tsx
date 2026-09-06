"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "../gsap-setup";
import { GLASS_BOUNDS, GLASS_RECT } from "../glass-bounds";
import { buildPourCues } from "../pour-script";
import type { PourSnapshot } from "../pour-script";
import type { Cocktail } from "../types";
import type { MixerRig } from "./rig";

const MENISCUS_REST = 2;
const MENISCUS_PEAK = 8;

export function buildDirectorTimeline(
  tl: gsap.core.Timeline,
  rig: MixerRig,
  cocktail: Cocktail,
  onSnapshot: (snapshot: PourSnapshot) => void,
): gsap.core.Timeline {
  const ingredientCount = cocktail.ingredients.length;
  const bounds = GLASS_BOUNDS[cocktail.glass];
  const cues = buildPourCues({
    ingredientCount,
    hasIce: bounds.hasIce,
    isSecret: Boolean(cocktail.isSecret),
    reducedMotion: false,
  });

  for (const cue of cues) {
    const ingredientIndex = cue.ingredientIndex;
    const ingredient =
      ingredientIndex === undefined
        ? undefined
        : cocktail.ingredients[ingredientIndex];

    switch (cue.kind) {
      case "snapshot":
        if (cue.snapshot) {
          const snapshot = cue.snapshot;
          tl.call(() => onSnapshot(snapshot), undefined, cue.at);
        }
        break;
      case "bottleTip":
        if (ingredient) {
          tl.set(
            rig.uniforms,
            {
              bottleAlpha: 1,
              bottleAngle: 0,
              streamColor: ingredient.color,
              flashColor: ingredient.color,
            },
            cue.at,
          );
          tl.to(
            rig.uniforms,
            {
              bottleAngle: -50,
              duration: 0.28,
              ease: "power3.inOut",
            },
            cue.at,
          );
        }
        break;
      case "streamOn":
        tl.set(rig.uniforms, { streamOn: 1 }, cue.at);
        break;
      case "fill":
        if (ingredientIndex !== undefined && ingredientCount > 0) {
          tl.to(
            rig.uniforms,
            {
              fillHeight: (ingredientIndex + 1) / ingredientCount,
              duration: 0.45,
              ease: "power2.out",
            },
            cue.at,
          );
        }
        break;
      case "meniscus":
        tl.set(
          rig.uniforms,
          { meniscusAmp: MENISCUS_PEAK, flashAmount: 1 },
          cue.at,
        );
        tl.to(
          rig.uniforms,
          {
            meniscusAmp: MENISCUS_REST,
            flashAmount: 0,
            duration: 0.2,
          },
          cue.at,
        );
        break;
      case "splash":
        if (ingredient && ingredientIndex !== undefined) {
          const fillHeight = (ingredientIndex + 1) / ingredientCount;
          const surfaceY =
            GLASS_RECT.y +
            bounds.liquidBottom -
            (bounds.liquidBottom - bounds.liquidTop) * fillHeight;
          tl.call(
            () =>
              rig.emitSplash(
                GLASS_RECT.x + bounds.bowlCenterX,
                surfaceY,
                ingredient.color,
              ),
            undefined,
            cue.at,
          );
        }
        break;
      case "streamOff":
        tl.set(rig.uniforms, { streamOn: 0 }, cue.at);
        break;
      case "bottleHide":
        tl.to(rig.uniforms, { bottleAngle: 0, duration: 0.16 }, cue.at);
        tl.set(rig.uniforms, { bottleAlpha: 0 }, cue.at + 0.16);
        if (cue.snapshot) {
          const snapshot = cue.snapshot;
          tl.call(() => onSnapshot(snapshot), undefined, cue.at);
        }
        break;
      case "ice":
        tl.fromTo(
          rig.uniforms,
          { iceAlpha: 0 },
          { iceAlpha: 1, duration: 0.28 },
          cue.at,
        );
        break;
      case "garnish":
        tl.fromTo(
          rig.uniforms,
          { garnishAlpha: 0 },
          { garnishAlpha: 1, duration: 0.28 },
          cue.at,
        );
        break;
      case "method":
        switch (cocktail.method) {
          case "shaken":
            tl.set(rig.uniforms, { swirl: 0.4 }, cue.at);
            tl.to(
              rig.uniforms,
              { swirl: 0, duration: 0.28, ease: "power2.out" },
              cue.at,
            );
            break;
          case "stirred":
            tl.set(rig.uniforms, { vortex: 1 }, cue.at);
            tl.to(
              rig.uniforms,
              { vortex: 0, duration: 0.4, ease: "sine.inOut" },
              cue.at,
            );
            break;
          case "built":
            break;
          default: {
            const exhaustive: never = cocktail.method;
            return exhaustive;
          }
        }
        break;
      case "secret":
        tl.set(rig.uniforms, { frostAlpha: 1 }, cue.at);
        tl.call(() => rig.emitMotes(), undefined, cue.at);
        tl.to(rig.uniforms, { frostAlpha: 0, duration: 0.4 }, cue.at);
        break;
      case "done":
        tl.call(
          () => {
            rig.applyFinished(cocktail);
            if (cue.snapshot) {
              onSnapshot(cue.snapshot);
            }
          },
          undefined,
          cue.at,
        );
        break;
      default: {
        const exhaustive: never = cue.kind;
        return exhaustive;
      }
    }
  }

  return tl;
}

export function PourDirector({
  cocktail,
  rig,
  onSnapshot,
}: {
  cocktail: Cocktail;
  rig: MixerRig;
  onSnapshot: (snapshot: PourSnapshot) => void;
}) {
  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  useGSAP(
    () => {
      const tl = gsap.timeline();
      buildDirectorTimeline(tl, rig, cocktail, (snapshot) =>
        onSnapshotRef.current(snapshot),
      );

      return () => tl.kill();
    },
    { dependencies: [cocktail.name], revertOnUpdate: true },
  );

  return null;
}

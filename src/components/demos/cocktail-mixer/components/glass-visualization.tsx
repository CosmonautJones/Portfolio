"use client";

import { useId } from "react";
import { AnimatePresence } from "motion/react";
import type { Cocktail } from "../types";
import { GLASS_CONFIGS } from "../data";
import { GlassSvg } from "../svg/glasses";
import { BottlePour } from "../svg/bottles";
import { GarnishOverlay } from "../svg/garnishes";
import {
  LiquidLayers,
  LiquidWave,
  BubbleParticles,
  FacetedIceCubes,
  CondensationDrips,
} from "../svg/decorations";

export function GlassVisualization({
  cocktail,
  pouredCount,
  activePour,
  bubbleIndex,
  allDone,
}: {
  cocktail: Cocktail;
  pouredCount: number;
  activePour: number | null;
  bubbleIndex: number | null;
  allDone: boolean;
}) {
  const rawId = useId();
  const clipId = `glass${rawId.replace(/:/g, "")}`;
  const config = GLASS_CONFIGS[cocktail.glass];

  const topIngredientIdx = Math.min(
    pouredCount - 1,
    cocktail.ingredients.length - 1
  );
  const topColor =
    pouredCount > 0
      ? cocktail.ingredients[topIngredientIdx].color
      : "transparent";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 300"
        width={200}
        height={300}
        className="overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={config.clip} />
          </clipPath>
        </defs>

        {/* Liquid fill */}
        <LiquidLayers
          ingredients={cocktail.ingredients}
          glass={cocktail.glass}
          pouredCount={pouredCount}
          clipId={clipId}
        />

        {/* Wave on liquid surface */}
        <LiquidWave
          glass={cocktail.glass}
          pouredCount={pouredCount}
          totalIngredients={cocktail.ingredients.length}
          topColor={topColor}
          clipId={clipId}
        />

        {/* Animated bottle pour */}
        <AnimatePresence>
          {activePour !== null && (
            <BottlePour
              key={`pour-${activePour}`}
              glass={cocktail.glass}
              ingredientIndex={activePour}
              color={cocktail.ingredients[activePour].color}
              totalIngredients={cocktail.ingredients.length}
            />
          )}
        </AnimatePresence>

        {/* Bubbles */}
        <AnimatePresence>
          {bubbleIndex !== null && (
            <BubbleParticles
              key={`bubbles-${bubbleIndex}`}
              glass={cocktail.glass}
              ingredientIndex={bubbleIndex}
              totalIngredients={cocktail.ingredients.length}
            />
          )}
        </AnimatePresence>

        {/* Faceted ice cubes */}
        <FacetedIceCubes glass={cocktail.glass} visible={allDone} />

        {/* Glass outline (rendered on top) */}
        <GlassSvg glass={cocktail.glass} />

        {/* Garnish overlay */}
        <GarnishOverlay
          type={cocktail.garnishType}
          glass={cocktail.glass}
          visible={allDone}
        />

        {/* Condensation drips (after pour) */}
        <CondensationDrips glass={cocktail.glass} visible={allDone} />
      </svg>
    </div>
  );
}

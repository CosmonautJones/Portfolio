"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { useVisitor } from "@/hooks/use-visitor";
import { useEasterEgg } from "@/hooks/use-easter-egg";
import type { Cocktail } from "./types";
import { COCKTAILS, THE_COSMONAUT, WAVE_STYLES } from "./data";
import { useCocktailProgress } from "./hooks";
import { SelectionGrid } from "./components/selection-grid";
import { RecipeView } from "./components/recipe-view";

export function CocktailMixer() {
  const [selectedDrink, setSelectedDrink] = useState<Cocktail | null>(null);
  const pourCompleteRef = useRef(false);

  const { awardXP, trackEvent, unlockAchievement } = useVisitor();
  const { discover } = useEasterEgg();
  const { madeCocktails, cosmonautUnlocked, markMade } =
    useCocktailProgress();

  const visibleCocktails = cosmonautUnlocked
    ? [...COCKTAILS, THE_COSMONAUT]
    : COCKTAILS;

  const handleSelect = useCallback((cocktail: Cocktail) => {
    pourCompleteRef.current = false;
    setSelectedDrink(cocktail);
  }, []);

  const handleReset = useCallback(() => {
    pourCompleteRef.current = false;
    setSelectedDrink(null);
  }, []);

  const handlePourComplete = useCallback(() => {
    if (pourCompleteRef.current || !selectedDrink) return;
    pourCompleteRef.current = true;

    const name = selectedDrink.name;

    // Track event + award XP
    trackEvent("make_cocktail", { cocktail: name });
    awardXP("use_demo");

    // Mark as made (updates localStorage + state)
    markMade(name);

    // Check mixologist achievement (6 unique regular cocktails)
    const updatedCount = madeCocktails.has(name)
      ? madeCocktails.size
      : madeCocktails.size + 1;
    if (updatedCount >= 6) {
      unlockAchievement("mixologist");
    }

    // Cosmonaut easter egg
    if (selectedDrink.isSecret) {
      discover("cosmonaut_cocktail");
    }
  }, [
    selectedDrink,
    madeCocktails,
    trackEvent,
    awardXP,
    markMade,
    unlockAchievement,
    discover,
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <style dangerouslySetInnerHTML={{ __html: WAVE_STYLES }} />
      <AnimatePresence mode="wait">
        {!selectedDrink ? (
          <SelectionGrid
            key="selection"
            cocktails={visibleCocktails}
            madeCocktails={madeCocktails}
            onSelect={handleSelect}
          />
        ) : (
          <RecipeView
            key={selectedDrink.name}
            cocktail={selectedDrink}
            onReset={handleReset}
            onPourComplete={handlePourComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cocktail } from "../types";
import { usePourSequence } from "../hooks";
import { GlassVisualization } from "./glass-visualization";
import { RecipeDetails } from "./recipe-details";

export function RecipeView({
  cocktail,
  onReset,
  onPourComplete,
}: {
  cocktail: Cocktail;
  onReset: () => void;
  onPourComplete: () => void;
}) {
  const { pouredCount, activePour, bubbleIndex, allDone } = usePourSequence(
    cocktail.ingredients.length
  );

  const firedRef = useRef(false);
  useEffect(() => {
    if (allDone && !firedRef.current) {
      firedRef.current = true;
      onPourComplete();
    }
  }, [allDone, onPourComplete]);

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="w-fit gap-2 rounded-full"
      >
        <ArrowLeft className="size-4" />
        Back to drinks
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center">
          <GlassVisualization
            cocktail={cocktail}
            pouredCount={pouredCount}
            activePour={activePour}
            bubbleIndex={bubbleIndex}
            allDone={allDone}
          />
        </div>
        <RecipeDetails
          cocktail={cocktail}
          pouredCount={pouredCount}
          allDone={allDone}
          onReset={onReset}
        />
      </div>
    </motion.div>
  );
}

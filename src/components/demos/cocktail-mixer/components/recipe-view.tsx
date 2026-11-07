"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarStage } from "../pixi/bar-stage";
import type { PourSnapshot } from "../pour-script";
import type { Cocktail } from "../types";
import { RecipeDetails } from "./recipe-details";

const INITIAL_SNAPSHOT: PourSnapshot = {
  pouredCount: 0,
  activePour: null,
  allDone: false,
};

export function RecipeView({
  cocktail,
  onReset,
  onPourComplete,
}: {
  cocktail: Cocktail;
  onReset: () => void;
  onPourComplete: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [snapshot, setSnapshot] = useState<PourSnapshot>(INITIAL_SNAPSHOT);
  const onSnapshot = useCallback((next: PourSnapshot) => {
    setSnapshot((prev) => {
      if (
        prev.pouredCount === next.pouredCount &&
        prev.activePour === next.activePour &&
        prev.allDone === next.allDone
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const firedRef = useRef(false);

  useEffect(() => {
    if (snapshot.allDone && !firedRef.current) {
      firedRef.current = true;
      onPourComplete();
    }
  }, [snapshot.allDone, onPourComplete]);

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
          <BarStage
            cocktail={cocktail}
            reducedMotion={Boolean(prefersReducedMotion)}
            onSnapshot={onSnapshot}
          />
        </div>
        <RecipeDetails
          cocktail={cocktail}
          pouredCount={snapshot.pouredCount}
          allDone={snapshot.allDone}
          onReset={onReset}
        />
      </div>
    </motion.div>
  );
}

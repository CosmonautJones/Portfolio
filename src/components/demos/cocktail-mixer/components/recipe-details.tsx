"use client";

import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cocktail } from "../types";

export function RecipeDetails({
  cocktail,
  pouredCount,
  allDone,
  onReset,
}: {
  cocktail: Cocktail;
  pouredCount: number;
  allDone: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <motion.h2
        className="text-3xl font-bold"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {cocktail.name}
      </motion.h2>

      {/* Method badge */}
      <motion.span
        className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {cocktail.method}
      </motion.span>

      <div className="flex flex-col gap-3">
        <motion.h3
          className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Ingredients
        </motion.h3>
        {cocktail.ingredients.map((ing, i) => (
          <motion.div
            key={ing.name}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={
              i < pouredCount
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: 20 }
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 14,
            }}
          >
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: ing.color }}
            />
            <span>
              <span className="font-medium">{ing.amount}</span> {ing.name}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={
          allDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
        }
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Garnish
        </h3>
        <p className="mt-1">{cocktail.garnish}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={
          allDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
        }
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 14,
          delay: allDone ? 0.15 : 0,
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Instructions
        </h3>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {cocktail.instructions}
        </p>
      </motion.div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: 0.3,
            }}
          >
            <Button
              onClick={onReset}
              variant="outline"
              className="gap-2 rounded-full"
            >
              <RotateCcw className="size-4" />
              Make Another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

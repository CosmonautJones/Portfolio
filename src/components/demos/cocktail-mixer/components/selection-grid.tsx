"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Cocktail } from "../types";
import { CARD_ICONS } from "../svg/card-icons";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function DrinkCard({
  cocktail,
  isMade,
  onSelect,
}: {
  cocktail: Cocktail;
  isMade: boolean;
  onSelect: (c: Cocktail) => void;
}) {
  const Icon = CARD_ICONS[cocktail.name];
  const isSecret = cocktail.isSecret;

  return (
    <motion.button
      variants={cardVariants}
      onClick={() => onSelect(cocktail)}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 8px 30px ${cocktail.color}30`,
      }}
      whileTap={{ scale: 0.97 }}
      className="glass-card relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-6 transition-colors duration-300"
      style={
        isSecret
          ? { animation: "cosmonaut-glow 3s ease-in-out infinite" }
          : undefined
      }
    >
      {/* Made badge */}
      {isMade && (
        <motion.div
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-green-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Check className="size-3.5 text-green-500" />
        </motion.div>
      )}

      {/* SVG icon or fallback emoji */}
      {Icon ? (
        <Icon className="size-16" />
      ) : (
        <span className="text-5xl">{cocktail.emoji}</span>
      )}
      <span className="font-semibold">{cocktail.name}</span>
    </motion.button>
  );
}

export function SelectionGrid({
  cocktails,
  madeCocktails,
  onSelect,
}: {
  cocktails: Cocktail[];
  madeCocktails: Set<string>;
  onSelect: (c: Cocktail) => void;
}) {
  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Drink</h2>
        <p className="mt-1 text-muted-foreground">
          Pick a cocktail to see the recipe and animated pour
        </p>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {cocktails.map((cocktail) => (
          <DrinkCard
            key={cocktail.name}
            cocktail={cocktail}
            isMade={madeCocktails.has(cocktail.name)}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

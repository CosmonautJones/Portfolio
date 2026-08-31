"use client";

import { motion } from "motion/react";
import { Check, LockKeyhole, Martini, Sparkles } from "lucide-react";
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
      <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-amber-200/[0.06] via-transparent to-fuchsia-300/[0.05] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              <Martini className="size-3.5" aria-hidden="true" /> Interactive recipe flight
            </p>
            <h2 className="text-3xl font-bold tracking-tight">The Cosmonaut’s Bar</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Pick a house cocktail for the recipe and a compact animated pour.
              Your tasting flight is saved in this browser.
            </p>
          </div>
          <div className="min-w-40 rounded-xl border border-border/60 bg-background/45 p-3">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>{Math.min(madeCocktails.size, 6)} of 6 mixed</span>
              <Sparkles className="size-4 text-amber-300" aria-hidden="true" />
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="House drinks mixed"
              aria-valuemin={0}
              aria-valuemax={6}
              aria-valuenow={Math.min(madeCocktails.size, 6)}
            >
              <div
                className="h-full rounded-full bg-amber-300 transition-[width] duration-500"
                style={{ width: `${(Math.min(madeCocktails.size, 6) / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
        {!cocktails.some((cocktail) => cocktail.isSecret) && (
          <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
            <LockKeyhole className="size-3.5 shrink-0 text-amber-300" aria-hidden="true" />
            Mix all six house drinks to unlock Travis&apos;s secret recipe, The Cosmonaut.
          </p>
        )}
      </div>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
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

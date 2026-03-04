"use client";

import { motion } from "motion/react";
import type { Cocktail } from "../types";
import { CARD_ICONS } from "../svg/card-icons";

export function CosmonautReveal({
  cocktail,
  onSelect,
}: {
  cocktail: Cocktail;
  onSelect: (c: Cocktail) => void;
}) {
  const Icon = CARD_ICONS[cocktail.name];

  return (
    <motion.button
      onClick={() => onSelect(cocktail)}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 8px 30px #8b5cf640",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      }}
      className="glass-card relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-6 transition-colors duration-300"
      style={{ animation: "cosmonaut-glow 3s ease-in-out infinite" }}
    >
      {/* Star sparkle accents */}
      {[
        { x: "10%", y: "15%", delay: 0 },
        { x: "85%", y: "20%", delay: 0.5 },
        { x: "50%", y: "5%", delay: 1 },
      ].map((star, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-xs text-yellow-400"
          style={{ left: star.x, top: star.y }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: star.delay,
          }}
        >
          &#10022;
        </motion.span>
      ))}

      {Icon ? (
        <Icon className="size-16" />
      ) : (
        <span className="text-5xl">{cocktail.emoji}</span>
      )}

      <span className="font-semibold text-purple-400">{cocktail.name}</span>
      <span className="text-xs text-muted-foreground">Secret Recipe</span>
    </motion.button>
  );
}

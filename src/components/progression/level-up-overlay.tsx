"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useVisitor } from "@/hooks/use-visitor";

/**
 * Full-screen overlay that briefly flashes when the user levels up.
 * Listens for level changes in the visitor context.
 */
export function LevelUpOverlay() {
  const { profile } = useVisitor();
  const [visible, setVisible] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(0);
  const [displayTitle, setDisplayTitle] = useState("");
  const prevLevelRef = useRef(profile?.level ?? 0);

  useEffect(() => {
    if (!profile) return;

    const prevLevel = prevLevelRef.current;
    if (profile.level > prevLevel && prevLevel > 0) {
      setDisplayLevel(profile.level);
      setDisplayTitle(profile.title);
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }

    prevLevelRef.current = profile.level;
  }, [profile?.level, profile?.title, profile]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              className="text-6xl font-black level-up-text"
            >
              LEVEL {displayLevel}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-semibold text-amber-400"
            >
              {displayTitle}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-muted-foreground"
            >
              Click to dismiss
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

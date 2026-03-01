"use client";

import { motion } from "motion/react";

export function CRTOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[300] pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />

      {/* Sweep line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.4) 20%, rgba(0,255,65,0.8) 50%, rgba(0,255,65,0.4) 80%, transparent 100%)",
          boxShadow: "0 0 20px rgba(0,255,65,0.5), 0 0 60px rgba(0,255,65,0.2)",
        }}
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 1.5, ease: "linear" }}
      />

      {/* Flicker */}
      <motion.div
        className="absolute inset-0 bg-green-500/[0.03]"
        animate={{
          opacity: [0.03, 0.06, 0.02, 0.05, 0.03],
        }}
        transition={{
          duration: 0.3,
          repeat: 6,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export function PixelSprite() {
  const [frame, setFrame] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  // Two-frame walk animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed bottom-4 z-[301] pointer-events-none"
      initial={{ x: -50 }}
      animate={{ x: windowWidth + 50 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 4, ease: "linear" }}
    >
      <div
        className="relative"
        style={{
          width: 32,
          height: 32,
          imageRendering: "pixelated",
        }}
      >
        {/* Simple pixel character using CSS */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 8 8"
          style={{ imageRendering: "pixelated" }}
        >
          {/* Head */}
          <rect x="2" y="0" width="4" height="3" fill="#00ff41" />
          {/* Eyes */}
          <rect x="3" y="1" width="1" height="1" fill="#0a0a0a" />
          <rect x="5" y="1" width="1" height="1" fill="#0a0a0a" />
          {/* Body */}
          <rect x="2" y="3" width="4" height="3" fill="#00cc33" />
          {/* Arms */}
          <rect x="1" y="3" width="1" height="2" fill="#00cc33" />
          <rect x="6" y="3" width="1" height="2" fill="#00cc33" />
          {/* Legs - alternating frames */}
          {frame === 0 ? (
            <>
              <rect x="2" y="6" width="1" height="2" fill="#009922" />
              <rect x="5" y="6" width="1" height="2" fill="#009922" />
            </>
          ) : (
            <>
              <rect x="3" y="6" width="1" height="2" fill="#009922" />
              <rect x="4" y="6" width="1" height="2" fill="#009922" />
            </>
          )}
        </svg>
      </div>
    </motion.div>
  );
}

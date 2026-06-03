"use client";

import { m, useScroll, useSpring, useReducedMotion } from "motion/react";

/**
 * Thin fixed progress bar at the very top of the viewport that fills as the
 * page scrolls. Uses the site accent gradient (matching .nav-underline /
 * .xp-bar-fill). Spring-smoothed unless the visitor prefers reduced motion,
 * in which case it snaps directly to scroll position.
 */
export function ScrollProgress() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
    restDelta: 0.001,
  });
  const scaleX = shouldReduce ? scrollYProgress : smooth;

  return (
    <m.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: "left" }}
      className="scroll-progress-fill pointer-events-none fixed inset-x-0 top-14 z-40 h-[3px] origin-left"
    />
  );
}

"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";

export function SkywatchGlint() {
  const [seen, setSeen] = useState(false);
  const shouldReduce = useReducedMotion();

  if (shouldReduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden={false}>
      <button
        type="button"
        aria-label="Skywatch note"
        title="Skywatch note"
        onClick={() => setSeen(true)}
        className="pointer-events-auto absolute right-[14%] top-[24%] h-2 w-2 rounded-full bg-foreground/50 shadow-[0_0_14px_rgba(255,255,255,0.5)] outline-none ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
        style={{ animation: "skywatch-drift 18s ease-in-out infinite" }}
      />
      {seen && (
        <p className="pointer-events-none absolute right-[10%] top-[28%] rounded-md border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
          Skywatch log: one quiet light, no conclusions.
        </p>
      )}
    </div>
  );
}

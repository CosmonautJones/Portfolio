"use client";

import { useState } from "react";

// Always rendered: returning null for reduced motion made the client disagree
// with the server. The global reduced-motion rule already stills the drift.
export function SkywatchGlint() {
  const [seen, setSeen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
      <button
        type="button"
        aria-label="Skywatch note"
        title="Skywatch note"
        onClick={() => setSeen(true)}
        className="pointer-events-auto absolute right-[9%] top-[7%] h-2 w-2 rounded-full bg-foreground/50 shadow-[0_0_14px_rgba(255,255,255,0.5)] transition-opacity hover:opacity-100"
        style={{ animation: "skywatch-drift 18s ease-in-out infinite" }}
      />
      {seen && (
        <p className="pointer-events-none absolute right-[5%] top-[11%] rounded-md border border-border bg-background/80 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur">
          Skywatch log: one quiet light, no conclusions.
        </p>
      )}
    </div>
  );
}

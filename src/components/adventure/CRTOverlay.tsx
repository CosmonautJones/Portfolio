"use client";

import { useState, useEffect } from "react";

export function CRTOverlay() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem("adventure_crt") === "true");
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        background:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
        mixBlendMode: "multiply",
        boxShadow:
          "inset 0 0 60px rgba(0,0,0,0.4), inset 0 0 120px rgba(0,0,0,0.2)",
      }}
    />
  );
}

export function CRTToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem("adventure_crt") === "true");
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem("adventure_crt", String(next));
    } catch {
      // localStorage unavailable
    }
    // Force re-render by dispatching storage event
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      onClick={toggle}
      className="font-mono text-[10px] px-2 py-1 rounded-sm transition-colors"
      style={{
        background: enabled ? "rgba(239, 125, 87, 0.2)" : "#333c57",
        color: enabled ? "#ef7d57" : "#566c86",
        border: `1px solid ${enabled ? "#ef7d57" : "#333c57"}`,
      }}
    >
      CRT {enabled ? "ON" : "OFF"}
    </button>
  );
}

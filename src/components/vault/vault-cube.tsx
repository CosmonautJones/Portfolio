"use client";

import { useState, useRef } from "react";
import { KeyRound, ChevronLeft, ChevronRight } from "lucide-react";
import { VaultLetter } from "./vault-letter";
import { VaultDiscoveries } from "./vault-discoveries";
import { SimonSays } from "./simon-says";

const FACES = ["front", "right", "back", "left"] as const;
const FACE_LABELS = ["The Vault", "A Letter", "Simon Says", "Discoveries"];

export function VaultCube() {
  const [faceIndex, setFaceIndex] = useState(0);
  const touchStartRef = useRef<number | null>(null);

  function goLeft() {
    setFaceIndex((i) => (i - 1 + FACES.length) % FACES.length);
  }

  function goRight() {
    setFaceIndex((i) => (i + 1) % FACES.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goLeft();
      else goRight();
    }
    touchStartRef.current = null;
  }

  const rotation = faceIndex * -90;

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-8 px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Cube */}
      <div
        className="relative"
        style={{
          perspective: "800px",
          width: "min(400px, 90vw)",
          height: "min(400px, 90vw)",
        }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(-200px) rotateY(${rotation}deg)`,
            transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm"
            style={{ transform: "rotateY(0deg) translateZ(200px)" }}
          >
            <KeyRound className="h-16 w-16 text-accent-glow drop-shadow-accent" />
            <h2 className="text-3xl font-bold text-foreground">The Vault</h2>
            <p className="max-w-[250px] text-center text-sm text-muted-foreground">
              You found it. Swipe or use the arrows to explore.
            </p>
          </div>

          {/* Right face */}
          <div
            className="absolute inset-0 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-auto"
            style={{ transform: "rotateY(90deg) translateZ(200px)" }}
          >
            <VaultLetter />
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-auto"
            style={{ transform: "rotateY(180deg) translateZ(200px)" }}
          >
            <SimonSays />
          </div>

          {/* Left face */}
          <div
            className="absolute inset-0 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm overflow-auto"
            style={{ transform: "rotateY(270deg) translateZ(200px)" }}
          >
            <VaultDiscoveries />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={goLeft}
          aria-label="Previous face"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {FACES.map((_, i) => (
            <button
              key={i}
              onClick={() => setFaceIndex(i)}
              aria-label={`Go to ${FACE_LABELS[i]}`}
              className={`h-2 w-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                i === faceIndex
                  ? "w-6 bg-foreground"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goRight}
          aria-label="Next face"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Face label */}
      <p className="text-sm text-muted-foreground">{FACE_LABELS[faceIndex]}</p>
    </div>
  );
}

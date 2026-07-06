"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PROOF_POINTS, SITE_CONFIG } from "@/lib/constants";
import { ArrowRight, ChevronDown } from "lucide-react";
import { m, useReducedMotion, useMotionValue, useSpring, useTransform } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const shouldReduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Pointer position normalized to [-1, 1] from hero center, spring-smoothed.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 80, damping: 20, mass: 0.5 };
  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  // Blobs translate in opposite directions, small magnitude for subtlety.
  const blob1X = useTransform(smoothX, [-1, 1], [-22, 22]);
  const blob1Y = useTransform(smoothY, [-1, 1], [-18, 18]);
  const blob2X = useTransform(smoothX, [-1, 1], [18, -18]);
  const blob2Y = useTransform(smoothY, [-1, 1], [15, -15]);
  const blob3X = useTransform(smoothX, [-1, 1], [12, -12]);
  const blob3Y = useTransform(smoothY, [-1, 1], [-10, 10]);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (shouldReduce) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointerX.set(nx);
    pointerY.set(ny);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function entry(delay: number) {
    if (shouldReduce) return {};
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, delay, ease },
    };
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Ambient glow — large, soft, slow-moving.
          Outer m.div carries pointer parallax (transform); inner div carries the
          CSS keyframe animation so the two transforms don't fight. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <m.div
          className="absolute -left-40 -top-40 h-[600px] w-[600px]"
          style={shouldReduce ? undefined : { x: blob1X, y: blob1Y }}
        >
          <div
            className="hero-glow hero-glow-1 h-full w-full"
            style={{ position: "static", animation: "pulse-glow 10s ease-in-out infinite" }}
          />
        </m.div>
        <m.div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px]"
          style={shouldReduce ? undefined : { x: blob2X, y: blob2Y }}
        >
          <div
            className="hero-glow hero-glow-2 h-full w-full"
            style={{ position: "static", animation: "pulse-glow 10s ease-in-out infinite 5s" }}
          />
        </m.div>
        <m.div
          className="absolute left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2"
          style={shouldReduce ? undefined : { x: blob3X, y: blob3Y }}
        >
          <div
            className="hero-glow hero-glow-3 h-full w-full"
            style={{ position: "static", animation: "float 12s ease-in-out infinite" }}
          />
        </m.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Pill badge */}
        <m.div {...entry(0)}>
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-secondary/80 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md">
            <span className="inline-block h-1.5 w-1.5 rounded-full accent-dot" aria-hidden="true" />
            Software Developer
          </div>
        </m.div>

        {/* Main headline — massive, Apple-style */}
        <m.h1
          {...entry(0.1)}
          className="gradient-text-animated font-display text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.95] tracking-tight"
        >
          {SITE_CONFIG.name}
        </m.h1>

        {/* Tagline */}
        <m.p
          {...entry(0.2)}
          className="mx-auto mt-8 max-w-xl text-xl font-light leading-relaxed text-muted-foreground sm:text-2xl"
        >
          {SITE_CONFIG.tagline} Play the game, try the tools, and inspect the systems behind them.
        </m.p>

        {/* CTA buttons */}
        <m.div
          {...entry(0.3)}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            asChild
            size="lg"
            className="btn-glow h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <Link href="/work">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="btn-glow h-12 rounded-full border-border/50 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </m.div>

        <m.div
          {...entry(0.4)}
          className="mx-auto mt-10 grid max-w-3xl gap-3 text-left sm:grid-cols-3"
        >
          {PROOF_POINTS.map((proof) => (
            <Link
              key={proof.href}
              href={proof.href}
              className="group rounded-lg border border-border/50 bg-background/45 px-4 py-3 backdrop-blur-md transition-colors hover:border-border hover:bg-secondary/70"
            >
              <span className="block text-sm font-medium text-foreground transition-colors group-hover:underline">
                {proof.label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {proof.detail}
              </span>
            </Link>
          ))}
        </m.div>
      </div>

      {/* Scroll cue — hints there's more below the full-height hero */}
      {shouldReduce ? (
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted-foreground/60" aria-hidden="true">
          <ChevronDown className="h-6 w-6" />
        </div>
      ) : (
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted-foreground/60" aria-hidden="true">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{
              opacity: { duration: 0.7, delay: 0.6, ease },
              y: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
          >
            <ChevronDown className="h-6 w-6" />
          </m.div>
        </div>
      )}

      {/* Bottom fade — seamless transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

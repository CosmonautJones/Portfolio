"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const shouldReduce = useReducedMotion();

  function entry(delay: number) {
    if (shouldReduce) return {};
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, delay, ease },
    };
  }

  return (
    <section aria-label="Hero" className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      {/* Ambient glow — large, soft, slow-moving */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="hero-glow -left-40 -top-40 h-[600px] w-[600px] bg-violet-500/15 dark:bg-violet-500/[0.07]"
          style={{ animation: "pulse-glow 10s ease-in-out infinite" }}
        />
        <div
          className="hero-glow -bottom-40 -right-40 h-[500px] w-[500px] bg-indigo-500/15 dark:bg-indigo-500/[0.06]"
          style={{ animation: "pulse-glow 10s ease-in-out infinite 5s" }}
        />
        <div
          className="hero-glow left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2 bg-cyan-400/10 dark:bg-cyan-400/[0.04]"
          style={{ animation: "float 12s ease-in-out infinite" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Pill badge */}
        <motion.div {...entry(0)}>
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-secondary/80 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Software Developer
          </div>
        </motion.div>

        {/* Main headline — massive, Apple-style */}
        <motion.h1
          {...entry(0.1)}
          className="gradient-text-animated text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.95] tracking-tight"
        >
          {SITE_CONFIG.name}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...entry(0.2)}
          className="mx-auto mt-8 max-w-xl text-xl font-light leading-relaxed text-muted-foreground sm:text-2xl"
        >
          {SITE_CONFIG.tagline}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
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
            className="h-12 rounded-full border-border/60 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </motion.div>
      </div>

      {/* Bottom fade — seamless transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

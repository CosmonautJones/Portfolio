"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function AboutPreview() {
  return (
    <section aria-label="About" className="container mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <AnimateOnScroll>
        <h2 className="mb-12 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          About
        </h2>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.05}>
        <blockquote className="font-display border-l-4 border-accent-glow pl-6 text-2xl font-semibold leading-relaxed tracking-tight sm:text-3xl">
          &ldquo;I like software with a point of view: fast enough to disappear,
          clear enough to maintain, and just strange enough to remember.&rdquo;
        </blockquote>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          The work is part product sense, part systems discipline, part tasteful trouble.
        </p>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.15}>
        <div className="mt-8">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="btn-glow h-12 rounded-full border-border/50 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Link href="/about">
              Read the Room
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

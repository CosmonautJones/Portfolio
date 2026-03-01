"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function AboutPreview() {
  return (
    <section aria-label="About" className="container mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h2 className="mb-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          About
        </h2>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.05}>
        <blockquote className="border-l-4 pl-6 text-2xl font-semibold leading-relaxed tracking-tight sm:text-3xl" style={{ borderColor: "var(--accent-glow)" }}>
          &ldquo;A developer who cares about craft, clarity, and shipping things that actually
          work.&rdquo;
        </blockquote>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          I build full-stack applications with a focus on clean architecture, intuitive interfaces,
          and delivering real value. Curious to learn more?
        </p>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.15}>
        <div className="mt-8">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="btn-glow h-12 rounded-full border-border/60 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Link href="/about">
              More About Me
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function AboutPreview() {
  return (
    <section aria-labelledby="about-preview" className="container mx-auto px-6 py-16 sm:py-24">
      <div className="grid gap-10 border-t border-[var(--rule-strong)] pt-10 md:grid-cols-[minmax(10rem,14rem)_1fr] md:gap-16">
        <AnimateOnScroll>
          <h2 id="about-preview" className="label-mono">
            About
          </h2>
        </AnimateOnScroll>
        <div className="max-w-3xl">
          <AnimateOnScroll delay={0.05}>
            <blockquote className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[2rem]">
              &ldquo;I like figuring out how a system really works, then making it
              easier for the next person to use, understand, or change.&rdquo;
            </blockquote>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Outside work, I’m a dad settling into Michigan, an electronics tinkerer,
              and someone who tends to learn by taking things apart and building them back up.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.15}>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)]"
            >
              More about me
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

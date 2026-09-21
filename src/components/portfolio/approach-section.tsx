"use client";

import { Users, RefreshCw, Blocks } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const principles = [
  {
    icon: Users,
    title: "Understand the workflow",
    description:
      "Working with QA, support, and module specialists taught me to ask how people actually use a system before changing it.",
  },
  {
    icon: RefreshCw,
    title: "Preserve what matters",
    description:
      "Modernization means understanding existing behavior, checking regressions, and making changes another engineer can trace.",
  },
  {
    icon: Blocks,
    title: "Make AI accountable",
    description:
      "I use AI to help build and investigate. I care about clear access boundaries, reviewable changes, and evidence that the result works.",
  },
];

export function ApproachSection() {
  return (
    <section aria-label="How I Work">
      <AnimateOnScroll>
        <h2 className="mb-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          How I Work
        </h2>
      </AnimateOnScroll>
      <StaggerChildren className="grid gap-6 sm:grid-cols-3">
        {principles.map((item) => (
          <StaggerItem key={item.title}>
            <div className="glass-card gradient-border-glow rounded-2xl p-6">
              <item.icon className="mb-4 h-8 w-8 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}

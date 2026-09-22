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
        <h2 className="label-mono mb-8">How I work</h2>
      </AnimateOnScroll>
      <StaggerChildren className="grid gap-8 sm:grid-cols-3 sm:gap-6">
        {principles.map((item) => (
          <StaggerItem key={item.title}>
            <div className="border-t border-[var(--rule-strong)] pt-5">
              <item.icon className="mb-4 h-5 w-5 text-[var(--signal)]" aria-hidden="true" />
              <h3 className="font-display mb-2 text-lg font-bold tracking-tight">
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

"use client";

import { Users, RefreshCw, Blocks } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const principles = [
  {
    icon: Users,
    title: "Obsessively User-First",
    description:
      "If a feature is technically impressive but confusing to use, it failed. I start with what people need and work backwards to the code.",
  },
  {
    icon: RefreshCw,
    title: "Ship It, Then Perfect It",
    description:
      "I'd rather show you a working prototype tomorrow than a perfect spec next month. Tight feedback loops beat long planning cycles every time.",
  },
  {
    icon: Blocks,
    title: "Built to Last",
    description:
      "I write code like someone else will maintain it at 2 AM. Strict types, meaningful tests, clear boundaries. Future me always sends thanks.",
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

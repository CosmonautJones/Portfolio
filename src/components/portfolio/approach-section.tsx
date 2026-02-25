"use client";

import { Users, RefreshCw, Blocks } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const principles = [
  {
    icon: Users,
    title: "User-First",
    description:
      "Every decision starts with the user. I prioritize clarity, speed, and intuitive interfaces.",
  },
  {
    icon: RefreshCw,
    title: "Iterative",
    description:
      "Ship early, learn fast. I work in tight feedback loops to find the best solution.",
  },
  {
    icon: Blocks,
    title: "Maintainable",
    description:
      "Code is read more than it's written. I write clean, well-structured code.",
  },
];

export function ApproachSection() {
  return (
    <section aria-label="How I Work">
      <AnimateOnScroll>
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
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

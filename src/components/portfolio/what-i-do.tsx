"use client";

import { Code2, Layers, Rocket } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const items = [
  {
    icon: Code2,
    title: "Full-Stack Development",
    description:
      "Product UI, server logic, auth, data, and the parts in between. I like when the whole thing has a reason to exist.",
  },
  {
    icon: Layers,
    title: "System Design",
    description:
      "Clear boundaries, strict types, and enough restraint that the next change does not feel like a negotiation.",
  },
  {
    icon: Rocket,
    title: "Product Delivery",
    description:
      "Move fast where it is cheap. Slow down where it counts. Ship the version people can actually use.",
  },
];

export function WhatIDo() {
  return (
    <section aria-label="What I Do" className="container mx-auto px-6 py-16 sm:py-24">
      <AnimateOnScroll>
        <h2 className="mb-12 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Range
        </h2>
      </AnimateOnScroll>
      <StaggerChildren className="grid gap-6 sm:grid-cols-3">
        {items.map((item) => (
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

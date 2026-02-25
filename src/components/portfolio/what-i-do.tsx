"use client";

import { Code2, Layers, Rocket } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const items = [
  {
    icon: Code2,
    title: "Full-Stack Development",
    description:
      "From React frontends to Node.js APIs and PostgreSQL databases — I build across the entire stack.",
  },
  {
    icon: Layers,
    title: "System Design",
    description:
      "Clean architecture, scalable patterns, and thoughtful abstractions that make codebases a joy to work in.",
  },
  {
    icon: Rocket,
    title: "Product Delivery",
    description:
      "Shipping features that users actually need. Fast iteration, clear communication, and a bias for action.",
  },
];

export function WhatIDo() {
  return (
    <section aria-label="What I Do" className="container mx-auto px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h2 className="mb-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          What I Do
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

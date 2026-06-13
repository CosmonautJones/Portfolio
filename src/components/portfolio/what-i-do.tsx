"use client";

import { Code2, Layers, Rocket } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const items = [
  {
    icon: Code2,
    title: "Full-Stack Development",
    description:
      "Database schemas with row-level security one hour, WebGL bloom shaders the next. If it runs on the web, I\u2019ve probably argued with it.",
  },
  {
    icon: Layers,
    title: "System Design",
    description:
      "I write code like someone else will debug it at 2 AM \u2014 because that someone is usually me. Strict types, clear boundaries, zero any.",
  },
  {
    icon: Rocket,
    title: "Product Delivery",
    description:
      "Working software beats perfect specs. I ship fast, gather feedback faster, and save the polish for what actually matters.",
  },
];

export function WhatIDo() {
  return (
    <section aria-label="What I Do" className="container mx-auto px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h2 className="mb-12 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
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

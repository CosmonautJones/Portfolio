"use client";

import { Code2, Handshake, Layers } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const items = [
  {
    icon: Code2,
    title: "Building useful software",
    description:
      "Product UI, server logic, auth, data, and the glue in between. I like when a tool earns its place by helping someone do a real thing.",
  },
  {
    icon: Layers,
    title: "Learning the system",
    description:
      "Clear boundaries, strict types, and enough patience to understand the shape of a problem before trying to make it behave.",
  },
  {
    icon: Handshake,
    title: "Collaborating well",
    description:
      "Good software is usually a team sport. I care about readable handoffs, honest tradeoffs, and leaving the next person a little more room.",
  },
];

export function WhatIDo() {
  return (
    <section aria-label="What I enjoy working on" className="container mx-auto px-6 py-16 sm:py-24">
      <AnimateOnScroll>
        <h2 className="mb-12 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          What I enjoy working on
        </h2>
      </AnimateOnScroll>
      <StaggerChildren className="grid gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <StaggerItem key={item.title}>
            <div className="glass-card gradient-border-glow rounded-lg p-6">
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

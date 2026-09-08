"use client";

import { Code2, Handshake, Layers } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

const items = [
  {
    icon: Code2,
    title: "Modernizing established systems",
    description:
      "At Global Shop Solutions, I worked across COBOL, VB.NET, and C#/.NET, contributing to DataLayer modernization while preserving existing business behavior.",
  },
  {
    icon: Layers,
    title: "Making knowledge accessible",
    description:
      "I built a read-only COBOL knowledge tool so QA and support could understand core business logic, with filters to strip sensitive data.",
  },
  {
    icon: Handshake,
    title: "Helping people use AI",
    description:
      "Through an internal AI help desk, training, and demos, I helped colleagues explore practical uses for AI. My own projects investigate how to make agent work verifiable.",
  },
];

export function WhatIDo() {
  return (
    <section aria-label="What I bring to a team" className="container mx-auto px-6 py-16 sm:py-24">
      <AnimateOnScroll>
        <h2 className="mb-12 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          What I bring to a team
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

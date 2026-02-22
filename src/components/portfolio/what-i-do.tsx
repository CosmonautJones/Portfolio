import { Code2, Layers, Rocket } from "lucide-react";

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
      <h2 className="mb-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        What I Do
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="animate-fade-up rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            <item.icon className="mb-4 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

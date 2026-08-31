"use client";

import { EXPERIENCE } from "@/lib/constants";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export function ExperienceTimeline() {
  return (
    <StaggerChildren className="relative" staggerDelay={0.12}>
      <div
        aria-label="Experience summary"
        className="mb-10 grid gap-4 border-y border-border/60 py-5 sm:grid-cols-[0.72fr_1fr_1.55fr] sm:items-center"
      >
        <div>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">8 years</p>
          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
            Enterprise software
          </p>
        </div>
        <div className="border-l-2 border-accent-glow/60 pl-4">
          <p className="text-sm font-semibold text-foreground">Manufacturing ERP</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Systems people depend on daily</p>
        </div>
        <p className="font-mono text-xs leading-6 text-muted-foreground">
          Legacy modernization <span aria-hidden="true">→</span> production reliability{" "}
          <span aria-hidden="true">→</span> applied AI tooling
        </p>
      </div>

      <ol
        aria-label="Career experience"
        className="relative border-l-2 border-border/50 pl-7 sm:pl-8"
      >
        {EXPERIENCE.map((item) => (
          <li key={item.year} className="relative pb-12 last:pb-0">
            <StaggerItem>
              <div
                aria-hidden="true"
                className="absolute -left-[calc(1.75rem+6px)] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent-glow bg-background shadow-[0_0_12px_hsl(var(--accent-glow)/0.25)] sm:-left-[calc(2rem+6px)]"
              />
              <time className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-glow">
                {item.year}
              </time>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-foreground/75">{item.organization}</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                {item.description}
              </p>

              {item.highlights ? (
                <ul
                  aria-label={`${item.title} highlights`}
                  className="mt-5 grid gap-x-8 gap-y-3 border-t border-border/50 pt-5 sm:grid-cols-2"
                >
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-glow/80"
                      />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </StaggerItem>
          </li>
        ))}
      </ol>
    </StaggerChildren>
  );
}

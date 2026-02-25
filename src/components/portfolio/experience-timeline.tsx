"use client";

import { EXPERIENCE } from "@/lib/constants";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export function ExperienceTimeline() {
  return (
    <StaggerChildren className="relative border-l-2 border-border/50 pl-8" staggerDelay={0.12}>
      {EXPERIENCE.map((item) => (
        <StaggerItem key={item.year}>
          <div className="relative pb-10 last:pb-0">
            {/* Dot marker */}
            <div className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full border-2 border-border bg-background" />
            {/* Year badge */}
            <span className="mb-2 inline-flex rounded-full bg-secondary/80 px-3 py-0.5 text-xs font-medium text-muted-foreground">
              {item.year}
            </span>
            <h3 className="mt-2 text-base font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}

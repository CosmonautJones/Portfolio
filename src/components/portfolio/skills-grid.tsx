"use client";

import { SKILL_CATEGORIES } from "@/lib/constants";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export function SkillsGrid() {
  return (
    <section aria-label="Skills" className="space-y-6">
      {SKILL_CATEGORIES.map((category) => (
        <AnimateOnScroll key={category.label}>
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              {category.label}
            </h3>
            <StaggerChildren className="flex flex-wrap gap-2.5" staggerDelay={0.03}>
              {category.skills.map((skill) => (
                <StaggerItem key={skill}>
                  <span className="rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-secondary hover:text-foreground">
                    {skill}
                  </span>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </AnimateOnScroll>
      ))}
    </section>
  );
}

"use client";

import { SKILL_CATEGORIES } from "@/lib/constants";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export function SkillsGrid() {
  return (
    <section aria-label="Skills" className="grid gap-8 sm:grid-cols-3 sm:gap-6">
      {SKILL_CATEGORIES.map((category) => (
        <AnimateOnScroll key={category.label}>
          <div className="border-t border-[var(--rule-strong)] pt-5">
            <h3 className="font-display mb-4 text-base font-bold tracking-tight text-foreground">
              {category.label}
            </h3>
            <StaggerChildren className="space-y-2" staggerDelay={0.03}>
              {category.skills.map((skill) => (
                <StaggerItem key={skill}>
                  <span className="block font-mono text-sm text-muted-foreground">{skill}</span>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </AnimateOnScroll>
      ))}
    </section>
  );
}

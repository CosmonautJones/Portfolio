"use client";

import Link from "next/link";
import { ProjectCard } from "@/components/portfolio/project-card";
import { PROJECTS } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export function FeaturedProjects() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <section aria-labelledby="selected-work" className="container mx-auto px-6 py-16 sm:py-24">
      <AnimateOnScroll>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[var(--rule-strong)] pb-6">
          <div className="max-w-2xl">
            <p className="label-mono">Selected work</p>
            <h2 id="selected-work" className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Running today.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Open it in the browser, install it, or read the source. Each card lists what works now.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)]"
          >
            All {PROJECTS.length} projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </AnimateOnScroll>
      <StaggerChildren className="grid gap-6 md:grid-cols-2">
        {featured.slice(0, 4).map((project, index) => (
          <StaggerItem key={project.title}>
            <ProjectCard project={project} featured priority={index < 2} />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  );
}

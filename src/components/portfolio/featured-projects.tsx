"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/project-card";
import { PROJECTS } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export function FeaturedProjects() {
  const featured = PROJECTS.filter((p) => p.featured);

  return (
    <section aria-label="Featured Work" className="container mx-auto px-6 py-16 sm:py-24">
      <AnimateOnScroll>
        <div className="mb-12 max-w-2xl">
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Selected Work
          </h2>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            A few pieces with the machinery left visible.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Built to be opened, tested, and judged on contact.
          </p>
        </div>
      </AnimateOnScroll>
      <StaggerChildren className="grid gap-6 sm:grid-cols-2">
        {featured.slice(0, 2).map((project) => (
          <StaggerItem key={project.title}>
            <ProjectCard project={project} featured />
          </StaggerItem>
        ))}
      </StaggerChildren>
      <AnimateOnScroll delay={0.3} className="mt-12 text-center">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="btn-glow h-12 rounded-full border-border/50 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
        >
          <Link href="/work">
            See More Work
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </AnimateOnScroll>
    </section>
  );
}

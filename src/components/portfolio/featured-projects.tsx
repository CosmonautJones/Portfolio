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
    <section aria-label="Featured Work" className="container mx-auto px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h2 className="mb-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Featured Work
        </h2>
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
          className="btn-glow h-12 rounded-full border-border/60 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
        >
          <Link href="/work">
            View All Projects
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </AnimateOnScroll>
    </section>
  );
}

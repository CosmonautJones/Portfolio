import { ProjectCard } from "@/components/portfolio/project-card";
import { PROJECTS } from "@/lib/constants";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export const metadata: Metadata = {
  title: "Work",
  description: "A few projects, interactive tools, and browser-native systems by Travis Jones.",
};

export default function WorkPage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const play = PROJECTS.filter((p) => !p.featured && p.demoUrl);
  const more = PROJECTS.filter((p) => !p.featured && !p.demoUrl);

  return (
    <div className="container mx-auto px-6 py-24 sm:py-32">
      <div className="mb-16 max-w-2xl">
        <AnimateOnScroll>
          <h1 className="gradient-text-animated font-display inline-block text-4xl font-bold tracking-tight sm:text-5xl">
            Work
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll delay={0.1}>
          <p className="mt-4 text-lg text-muted-foreground">
            Here are a few things I have made. Some are practical, some are playful, and all of them are built to be explored.
          </p>
        </AnimateOnScroll>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-14">
          <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Featured
          </p>
          <StaggerChildren className="grid gap-6 sm:grid-cols-2">
            {featured.map((project, index) => (
              <StaggerItem key={project.title}>
                <ProjectCard project={project} featured priority={index < 2} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* Playground */}
      {play.length > 0 && (
        <section className="mb-14">
          <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Playground
          </p>
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {play.map((project) => (
              <StaggerItem key={project.title}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* More work */}
      {more.length > 0 && (
        <section>
          <p className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            More work
          </p>
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((project) => (
              <StaggerItem key={project.title}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}
    </div>
  );
}

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
  const others = PROJECTS.filter((p) => !p.featured);

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

      {/* Featured projects */}
      {featured.length > 0 && (
        <StaggerChildren className="mb-12 grid gap-6 sm:grid-cols-2">
          {featured.map((project, index) => (
            <StaggerItem key={project.title}>
              <ProjectCard project={project} featured priority={index < 2} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {/* Other projects */}
      {others.length > 0 && (
        <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((project) => (
            <StaggerItem key={project.title}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}

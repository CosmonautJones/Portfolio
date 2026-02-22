import { ProjectCard } from "@/components/portfolio/project-card";
import { PROJECTS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const others = PROJECTS.filter((p) => !p.featured);

  return (
    <div className="container mx-auto px-6 py-24 sm:py-32">
      <div className="mb-16 max-w-2xl">
        <h1 className="animate-fade-up gradient-text inline-block text-4xl font-bold tracking-tight sm:text-5xl">
          Projects
        </h1>
        <p className="animate-fade-up delay-100 mt-4 text-lg text-muted-foreground">
          Interactive demos and projects I&apos;ve built.
        </p>
      </div>

      {/* Featured projects */}
      {featured.length > 0 && (
        <div className="mb-12 grid gap-6 sm:grid-cols-2">
          {featured.map((project, i) => (
            <div
              key={project.title}
              className="animate-scale-in"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <ProjectCard project={project} featured />
            </div>
          ))}
        </div>
      )}

      {/* Other projects */}
      {others.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((project, i) => (
            <div
              key={project.title}
              className="animate-scale-in"
              style={{ animationDelay: `${200 + (featured.length + i) * 100}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

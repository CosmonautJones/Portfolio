import { ProjectCard } from "@/components/portfolio/project-card";
import { PROJECTS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-2 text-4xl font-bold">Projects</h1>
      <p className="mb-12 text-lg text-muted-foreground">Things I have built.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}

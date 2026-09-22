import { ProjectCard } from "@/components/portfolio/project-card";
import { PageHeader } from "@/components/layout/page-header";
import { PROJECTS } from "@/lib/constants";
import type { Metadata } from "next";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Travis Jones: browser tools, a Windows usage HUD, supervised coding agents, simulations, and games. Each links to something you can run or read.",
};

function SectionLabel({ children, count }: { children: string; count: number }) {
  return (
    <p className="label-mono mb-6 flex items-center gap-3">
      <span className="text-foreground">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span>{count}</span>
    </p>
  );
}

export default function WorkPage() {
  const featured = PROJECTS.filter((p) => p.featured);
  const play = PROJECTS.filter((p) => !p.featured && (p.demoUrl || p.playground));
  const more = PROJECTS.filter((p) => !p.featured && !p.demoUrl && !p.playground);

  return (
    <div className="container mx-auto px-6 py-16 sm:py-24">
      <div className="mb-14">
        <PageHeader
          eyebrow="Projects"
          title="Tools, agents, and experiments"
          lede="Working tools, open-source agent infrastructure, and a few things I built for fun. Every card links to something you can run or read."
        />
      </div>

      {featured.length > 0 && (
        <section className="mb-16" aria-label="Selected">
          <SectionLabel count={featured.length}>Selected</SectionLabel>
          <StaggerChildren className="grid gap-6 md:grid-cols-2">
            {featured.map((project, index) => (
              <StaggerItem key={project.title}>
                <ProjectCard project={project} featured priority={index < 2} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {play.length > 0 && (
        <section className="mb-16" aria-label="Playground">
          <SectionLabel count={play.length}>Playground</SectionLabel>
          <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {play.map((project) => (
              <StaggerItem key={project.title}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {more.length > 0 && (
        <section aria-label="More work">
          <SectionLabel count={more.length}>More work</SectionLabel>
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

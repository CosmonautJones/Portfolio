import { ProjectCard } from "@/components/portfolio/project-card";
import { PageHeader } from "@/components/layout/page-header";
import { PROJECTS } from "@/lib/constants";
import type { Metadata } from "next";
import { StaggerChildren, StaggerItem } from "@/components/ui/stagger-children";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { ContributionAtlas } from "@/components/portfolio/contribution-atlas";
import { SELECTED_PROJECT_STORIES } from "@/lib/selected-project-stories";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Travis Jones: M-Local, a synthetic MCP-to-COBOL case study, the TravOS prototype, browser tools, simulations, and games.",
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
  const selectedTitles = new Set<string>(SELECTED_PROJECT_STORIES.map((project) => project.title));
  const featured = PROJECTS.filter((p) => p.featured && !selectedTitles.has(p.title));
  const play = PROJECTS.filter((p) => !p.featured && (p.demoUrl || p.playground));
  const more = PROJECTS.filter((p) => !p.featured && !p.demoUrl && !p.playground);

  return (
    <>
    <div className="container mx-auto px-6 pt-16 sm:pt-24">
      <div>
        <PageHeader
          eyebrow="Projects"
          title="Engineering, tools, and experiments"
          lede="Production contributions, a team hackathon award, and independent prototypes. Read what I built, inspect the evidence, and see what is still future work."
        />
      </div>
    </div>
    <FeaturedProjects showArchiveLink={false} />
    <div id="collection" className="container mx-auto scroll-mt-24 px-6 py-12 sm:py-16">

      {featured.length > 0 && (
        <section className="mb-16" aria-label="Tools and utilities">
          <SectionLabel count={featured.length}>Tools and utilities</SectionLabel>
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
    <div id="activity" className="scroll-mt-24"><ContributionAtlas /></div>
    </>
  );
}

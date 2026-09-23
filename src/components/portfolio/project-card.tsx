"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText, Github, ScanLine } from "lucide-react";
import type { Project } from "@/lib/types";
import { useVisitor } from "@/hooks/use-visitor";
import { rememberProjectView } from "@/lib/project-views";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  priority?: boolean;
}

const actionClass =
  "inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 transition-colors hover:decoration-[var(--signal)]";
const secondaryActionClass =
  "inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function ProjectCard({ project, featured, priority }: ProjectCardProps) {
  const CoverIcon = project.title === "Whole Page Capture" ? ScanLine : FileText;
  const { awardXP, unlockAchievement } = useVisitor();

  function handleViewProject() {
    awardXP("view_project", { key: project.title });
    if (rememberProjectView(project.title)) {
      unlockAchievement("road_scholar");
    }
  }

  const githubLabel =
    project.demoUrl || project.liveUrl || project.caseStudyUrl
      ? "Code"
      : (project.actionLabel ?? "Code");

  return (
    <article
      onClick={handleViewProject}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-[var(--rule-strong)]"
    >
      {project.preview ? (
        <figure className="border-b border-border">
          <video
            controls
            playsInline
            preload="none"
            poster={project.image}
            aria-label={`${project.title} reaction preview`}
            className="aspect-[16/9] w-full bg-black object-contain"
          >
            <source src={project.preview.src} type="video/mp4" />
          </video>
          <figcaption className="px-5 py-2.5 font-mono text-xs text-muted-foreground">
            {project.preview.caption}
          </figcaption>
        </figure>
      ) : project.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]"
          />
        </div>
      ) : (
        <div
          data-cover="fallback"
          className="cover-fallback relative flex aspect-[16/9] w-full flex-col justify-between border-b border-border p-5"
        >
          <CoverIcon className="h-10 w-10 text-foreground/70" strokeWidth={1.25} aria-hidden="true" />
          <span className="label-mono">{project.tags[0]}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div>
          <p className="label-mono">{project.role}</p>
          <h3 className="font-display mt-2 text-xl font-bold tracking-tight text-foreground">
            {project.title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        {project.proof && (
          <details className="group/details text-sm leading-relaxed text-muted-foreground">
            <summary className="cursor-pointer list-none py-1 font-medium text-foreground/85 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="mr-2 inline-block font-mono text-[var(--signal)] transition-transform group-open/details:rotate-45" aria-hidden="true">
                +
              </span>
              Engineering details
            </summary>
            <p className="pt-2">{project.proof}</p>
          </details>
        )}

        <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground" aria-label="Stack">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-4">
          {project.caseStudyUrl && (
            <Link href={project.caseStudyUrl} className={actionClass}>
              Case study
            </Link>
          )}
          {project.demoUrl && (
            <Link href={project.demoUrl} className={actionClass}>
              {project.actionLabel ?? "Demo"}
            </Link>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>
              {project.actionLabel ?? "Live"}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={
                project.demoUrl || project.liveUrl || project.caseStudyUrl ? secondaryActionClass : actionClass
              }
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              {githubLabel}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

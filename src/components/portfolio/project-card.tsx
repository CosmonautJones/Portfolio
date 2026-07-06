"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Play } from "lucide-react";
import {
  m,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { Project } from "@/lib/types";
import { useVisitor } from "@/hooks/use-visitor";
import { shouldUnlockRoadScholar } from "@/lib/easter-eggs/triggers";

// Distinct projects opened this session — feeds the "road_scholar"
// achievement (view 3 distinct projects). Module-level so it survives
// re-renders and route changes within a single session.
const viewedProjects = new Set<string>();

const gradientClasses = ["project-gradient-1", "project-gradient-2"];
const MAX_TILT = 6; // degrees

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  priority?: boolean;
}

export function ProjectCard({ project, featured, priority }: ProjectCardProps) {
  const gradientClass = gradientClasses[project.title.length % gradientClasses.length];
  const heightClass = featured ? "h-56" : "h-48";

  const shouldReduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const { awardXP, unlockAchievement } = useVisitor();

  function handleViewProject() {
    awardXP("view_project", { key: project.title });
    viewedProjects.add(project.title);
    if (shouldUnlockRoadScholar(viewedProjects)) {
      unlockAchievement("road_scholar");
    }
  }

  // Pointer offset from card center, normalized to [-1, 1].
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const sx = useSpring(px, springConfig);
  const sy = useSpring(py, springConfig);
  // Tilt: moving pointer right tilts to the right edge (rotateY), down tilts down (rotateX).
  const rotateY = useTransform(sx, [-1, 1], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-1, 1], [MAX_TILT, -MAX_TILT]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (shouldReduce) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <m.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        shouldReduce
          ? undefined
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              transformPerspective: 900,
            }
      }
      className="h-full"
    >
      <Card
        onClick={handleViewProject}
        className="glass-card gradient-border-glow hover-shadow-accent group flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1"
      >
        {project.image ? (
          <div className={`relative ${heightClass} w-full overflow-hidden`}>
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
              className="rounded-t-lg object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </div>
        ) : (
          <div className={`relative ${heightClass} w-full overflow-hidden rounded-t-lg ${gradientClass}`}>
            {/* Large faded tag overlay */}
            {project.tags[0] && (
              <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-foreground/[0.06] select-none sm:text-6xl">
                {project.tags[0]}
              </span>
            )}
          </div>
        )}
        <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold tracking-tight transition-colors duration-300 group-hover:text-foreground">
            {project.title}
          </CardTitle>
          <Badge
            variant="secondary"
            className="shrink-0 rounded-full border-0 bg-secondary/80 px-3 text-xs font-medium text-muted-foreground"
          >
            {project.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        {project.proof && (
          <p className="rounded-lg border border-border/50 bg-secondary/35 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Proof: </span>
            {project.proof}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {project.demoUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 rounded-full border-border/50 text-xs transition-all duration-300 hover:border-border hover:bg-secondary/80"
            >
              <Link href={project.demoUrl}>
                <Play className="mr-1.5 h-3 w-3" /> {project.actionLabel ?? "Demo"}
              </Link>
            </Button>
          )}
          {project.liveUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 rounded-full border-border/50 text-xs transition-all duration-300 hover:border-border hover:bg-secondary/80"
            >
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3 w-3" /> Live
              </a>
            </Button>
          )}
          {project.githubUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 rounded-full border-border/50 text-xs transition-all duration-300 hover:border-border hover:bg-secondary/80"
            >
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1.5 h-3 w-3" /> Code
              </a>
            </Button>
          )}
        </div>
        </CardContent>
      </Card>
    </m.div>
  );
}

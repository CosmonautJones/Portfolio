import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Play } from "lucide-react";
import type { Project } from "@/lib/types";

const gradientClasses = ["project-gradient-1", "project-gradient-2"];

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project, featured }: ProjectCardProps) {
  const gradientClass = gradientClasses[project.title.length % gradientClasses.length];
  const heightClass = featured ? "h-56" : "h-48";

  return (
    <Card className="glass-card gradient-border-glow hover-shadow-accent group flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1">
      {project.image ? (
        <div className={`relative ${heightClass} w-full overflow-hidden`}>
          <Image
            src={project.image}
            alt={project.title}
            width={400}
            height={225}
            className={`w-full ${heightClass} object-cover rounded-t-lg`}
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
                <Play className="mr-1.5 h-3 w-3" /> Demo
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
  );
}

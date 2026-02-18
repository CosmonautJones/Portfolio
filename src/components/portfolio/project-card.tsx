import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-border/80 hover:shadow-2xl hover:shadow-violet-500/[0.04] dark:hover:shadow-violet-500/[0.08]">
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

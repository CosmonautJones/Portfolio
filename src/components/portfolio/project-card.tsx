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
    <Card className="gradient-border group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/5 dark:hover:shadow-violet-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">{project.title}</CardTitle>
          <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{project.role}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <p className="text-muted-foreground">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-border/50 text-xs">{tag}</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {project.liveUrl && (
            <Button variant="outline" size="sm" asChild className="transition-colors hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-700 dark:hover:text-violet-400">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" /> Live
              </a>
            </Button>
          )}
          {project.githubUrl && (
            <Button variant="outline" size="sm" asChild className="transition-colors hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-700 dark:hover:text-violet-400">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1 h-3 w-3" /> Code
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

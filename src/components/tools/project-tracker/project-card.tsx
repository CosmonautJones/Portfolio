"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, FolderOpen } from "lucide-react";
import type { TrackerProject, TrackerTask } from "@/lib/types";

interface ProjectCardProps {
  project: TrackerProject;
  tasks: TrackerTask[];
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  archived: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export function ProjectCard({ project, tasks, onOpen, onEdit, onDelete }: ProjectCardProps) {
  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;

  return (
    <Card className="gradient-border cursor-pointer bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg" onClick={onOpen}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <CardTitle className="text-base truncate">{project.name}</CardTitle>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="secondary" className={statusColors[project.status]}>
            {project.status}
          </Badge>
          <span className="text-muted-foreground flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            {total > 0 ? `${done}/${total} done` : "No tasks"}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Updated {new Date(project.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

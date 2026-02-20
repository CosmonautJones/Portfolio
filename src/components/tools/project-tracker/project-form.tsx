"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrackerProject } from "@/lib/types";

interface ProjectFormProps {
  project?: TrackerProject;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project ? "Edit Project" : "New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Project name"
            defaultValue={project?.name}
            required
          />
          <Textarea
            name="description"
            placeholder="Project description (optional)"
            className="min-h-[100px]"
            defaultValue={project?.description}
          />
          {project && (
            <input type="hidden" name="status" value={project.status} />
          )}
          <div className="flex gap-2">
            <Button type="submit">{project ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createProject,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  deleteTask,
} from "@/actions/projects";
import { ProjectForm } from "./project-form";
import { ProjectCard } from "./project-card";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Archive, CheckCircle2, RotateCcw, FolderOpen } from "lucide-react";
import type { TrackerProject, TrackerTask } from "@/lib/types";
import { toast } from "sonner";

function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
            <div className="flex gap-1 ml-2">
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function ProjectTrackerApp() {
  const [projects, setProjects] = useState<TrackerProject[]>([]);
  const [tasks, setTasks] = useState<TrackerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TrackerProject | null>(null);
  const [activeProject, setActiveProject] = useState<TrackerProject | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  async function fetchProjects() {
    const { data } = await getSupabase()
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setProjects(data as TrackerProject[]);
  }

  async function fetchTasks(projectId?: string) {
    const query = getSupabase()
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (projectId) {
      query.eq("project_id", projectId);
    }
    const { data } = await query;
    if (data) setTasks(data as TrackerTask[]);
  }

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const [{ data: projectData }, { data: taskData }] = await Promise.all([
        supabase.from("projects").select("*").order("updated_at", { ascending: false }),
        supabase.from("tasks").select("*").order("created_at", { ascending: true }),
      ]);
      if (projectData) setProjects(projectData as TrackerProject[]);
      if (taskData) setTasks(taskData as TrackerTask[]);
      setLoading(false);
    }
    init();
  }, []);

  async function handleCreateProject(formData: FormData) {
    setSaving(true);
    const result = await createProject(formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Error");
      setSaving(false);
      return;
    }
    setCreating(false);
    toast.success("Project created");
    await fetchProjects();
    setSaving(false);
  }

  async function handleUpdateProject(projectId: string, formData: FormData) {
    setSaving(true);
    const result = await updateProject(projectId, formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Error");
      setSaving(false);
      return;
    }
    setEditing(null);
    toast.success("Project updated");
    await fetchProjects();
    if (activeProject?.id === projectId) {
      const updated = projects.find((p) => p.id === projectId);
      if (updated) setActiveProject({ ...updated, ...Object.fromEntries(formData) });
    }
    setSaving(false);
  }

  async function handleDeleteProject(projectId: string) {
    setSaving(true);
    const result = await deleteProject(projectId);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Delete failed");
      setSaving(false);
      return;
    }
    toast.success("Project deleted");
    if (activeProject?.id === projectId) setActiveProject(null);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.project_id !== projectId));
    setSaving(false);
  }

  async function handleStatusChange(projectId: string, newStatus: string) {
    setSaving(true);
    const fd = new FormData();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    fd.set("name", project.name);
    fd.set("description", project.description);
    fd.set("status", newStatus);
    const result = await updateProject(projectId, fd);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Error");
      setSaving(false);
      return;
    }
    toast.success(`Project marked as ${newStatus}`);
    await fetchProjects();
    if (activeProject?.id === projectId) {
      setActiveProject((prev) => prev ? { ...prev, status: newStatus as TrackerProject["status"] } : null);
    }
    setSaving(false);
  }

  async function handleCreateTask(projectId: string, formData: FormData) {
    setSaving(true);
    const result = await createTask(projectId, formData);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Error");
      setSaving(false);
      return;
    }
    toast.success("Task added");
    await Promise.all([fetchTasks(), fetchProjects()]);
    setSaving(false);
  }

  async function handleTaskStatusChange(taskId: string, newStatus: TrackerTask["status"]) {
    setSaving(true);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const fd = new FormData();
    fd.set("title", task.title);
    fd.set("status", newStatus);
    fd.set("priority", task.priority);
    if (task.due_date) fd.set("due_date", task.due_date);
    const result = await updateTask(taskId, fd);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Error");
      setSaving(false);
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await fetchProjects();
    setSaving(false);
  }

  async function handleDeleteTask(taskId: string) {
    setSaving(true);
    const result = await deleteTask(taskId);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Delete failed");
      setSaving(false);
      return;
    }
    toast.success("Task deleted");
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetchProjects();
    setSaving(false);
  }

  // Project detail view
  if (activeProject) {
    const projectTasks = tasks.filter((t) => t.project_id === activeProject.id);
    const statusActions: Record<string, { label: string; icon: typeof Archive; status: string }[]> = {
      active: [
        { label: "Complete", icon: CheckCircle2, status: "completed" },
        { label: "Archive", icon: Archive, status: "archived" },
      ],
      completed: [
        { label: "Reopen", icon: RotateCcw, status: "active" },
        { label: "Archive", icon: Archive, status: "archived" },
      ],
      archived: [
        { label: "Reopen", icon: RotateCcw, status: "active" },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveProject(null)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{activeProject.name}</CardTitle>
              {activeProject.description && (
                <p className="text-sm text-muted-foreground">
                  {activeProject.description}
                </p>
              )}
            </div>
            <div className="flex gap-1" >
              {statusActions[activeProject.status]?.map(({ label, icon: Icon, status }) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => handleStatusChange(activeProject.id, status)}
                >
                  <Icon className="mr-1 h-3 w-3" /> {label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(activeProject);
                  setCreating(false);
                }}
              >
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleDeleteProject(activeProject.id)}
              >
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{activeProject.status}</Badge>
              <span>
                {projectTasks.filter((t) => t.status === "done").length}/{projectTasks.length} tasks done
              </span>
            </div>
          </CardContent>
        </Card>

        {editing && editing.id === activeProject.id && (
          <ProjectForm
            project={editing}
            onSubmit={(fd) => handleUpdateProject(editing.id, fd)}
            onCancel={() => setEditing(null)}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TaskForm onSubmit={(fd) => handleCreateTask(activeProject.id, fd)} />
            <TaskList
              tasks={projectTasks}
              onStatusChange={handleTaskStatusChange}
              onDelete={handleDeleteTask}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Project list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading projects..."
            : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
        </p>
        <Button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          disabled={loading || saving}
        >
          <Plus className="mr-1 h-4 w-4" /> New Project
        </Button>
      </div>

      {creating && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setCreating(false)}
        />
      )}

      {editing && !activeProject && (
        <ProjectForm
          project={editing}
          onSubmit={(fd) => handleUpdateProject(editing.id, fd)}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <ProjectsSkeleton />
      ) : projects.length === 0 && !creating && !editing ? (
        <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h2 className="gradient-text mb-2 text-xl font-semibold">No projects yet</h2>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Get organized — create your first project to start tracking tasks.
          </p>
          <Button onClick={() => { setCreating(true); setEditing(null); }}>
            <Plus className="mr-1 h-4 w-4" /> New Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, i) => (
            <div key={project.id} className={`animate-scale-in delay-${Math.min((i + 1) * 100, 700)}`}>
              <ProjectCard
                project={project}
                tasks={tasks.filter((t) => t.project_id === project.id)}
                onOpen={() => {
                  setActiveProject(project);
                  setEditing(null);
                  setCreating(false);
                }}
                onEdit={() => {
                  setEditing(project);
                  setCreating(false);
                }}
                onDelete={() => handleDeleteProject(project.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

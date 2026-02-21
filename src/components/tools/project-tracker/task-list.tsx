"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, CheckCircle2 } from "lucide-react";
import type { TrackerTask } from "@/lib/types";

interface TaskListProps {
  tasks: TrackerTask[];
  onStatusChange: (taskId: string, newStatus: TrackerTask["status"]) => void;
  onDelete: (taskId: string) => void;
}

const statusCycle: Record<string, TrackerTask["status"]> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-500/10 text-gray-700 dark:text-gray-400 hover:bg-gray-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20",
  done: "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function TaskList({ tasks, onStatusChange, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="animate-fade-up flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
          <CheckCircle2 className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No tasks yet</p>
        <p className="text-xs text-muted-foreground/70">Add your first task above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`animate-fade-in flex items-center gap-3 rounded-lg border p-3 transition-all duration-300 hover:bg-muted/50 ${
            task.status === "done" ? "opacity-60" : ""
          }`}
        >
          <button
            onClick={() => onStatusChange(task.id, statusCycle[task.status])}
            className="shrink-0"
          >
            <Badge
              variant="secondary"
              className={`cursor-pointer transition-colors ${statusColors[task.status]}`}
            >
              {statusLabels[task.status]}
            </Badge>
          </button>

          <span
            className={`flex-1 text-sm ${
              task.status === "done" ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>

            {task.due_date && (
              <span
                className={`flex items-center gap-1 text-xs ${
                  isOverdue(task.due_date) && task.status !== "done"
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {new Date(task.due_date + "T00:00:00").toLocaleDateString()}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

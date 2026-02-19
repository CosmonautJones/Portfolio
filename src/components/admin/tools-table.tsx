"use client";

import { useTransition, useState } from "react";
import { toggleToolStatus, deleteTool } from "@/actions/tools";
import { ToolFormDialog } from "@/components/admin/tool-form-dialog";
import { DeployButton } from "@/components/admin/deploy-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tool } from "@/lib/types";

interface ToolsTableProps {
  tools: Tool[];
}

export function ToolsTable({ tools }: ToolsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleToggle(tool: Tool) {
    setTogglingId(tool.id);
    startTransition(async () => {
      const result = await toggleToolStatus(tool.id, tool.status);
      if (result.error) toast.error(typeof result.error === "string" ? result.error : "Failed");
      setTogglingId(null);
    });
  }

  function handleDelete(toolId: string) {
    setDeletingId(toolId);
    startTransition(async () => {
      const result = await deleteTool(toolId);
      if (result.error) toast.error(typeof result.error === "string" ? result.error : "Failed");
      else toast.success("Deleted");
      setDeletingId(null);
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => (
          <TableRow key={tool.id}>
            <TableCell className="font-medium">{tool.name}</TableCell>
            <TableCell className="font-mono text-sm">{tool.slug}</TableCell>
            <TableCell>
              <Badge variant="outline">{tool.type}</Badge>
            </TableCell>
            <TableCell>
              <Switch
                checked={tool.status === "enabled"}
                onCheckedChange={() => handleToggle(tool)}
                disabled={isPending && togglingId === tool.id}
                aria-label={`Toggle status for ${tool.name}`}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {tool.build_hook_url && <DeployButton buildHookUrl={tool.build_hook_url} />}
                <ToolFormDialog tool={tool} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      disabled={isPending && deletingId === tool.id}
                      aria-label={`Delete ${tool.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete tool</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{tool.name}&rdquo;? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isPending && deletingId === tool.id}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(tool.id)}
                        disabled={isPending && deletingId === tool.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isPending && deletingId === tool.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

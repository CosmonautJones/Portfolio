"use client";

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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tool } from "@/lib/types";

interface ToolsTableProps {
  tools: Tool[];
}

export function ToolsTable({ tools }: ToolsTableProps) {
  async function handleToggle(tool: Tool) {
    const result = await toggleToolStatus(tool.id, tool.status);
    if (result.error) toast.error(typeof result.error === "string" ? result.error : "Failed");
  }

  async function handleDelete(toolId: string) {
    if (!confirm("Delete this tool?")) return;
    const result = await deleteTool(toolId);
    if (result.error) toast.error(typeof result.error === "string" ? result.error : "Failed");
    else toast.success("Deleted");
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
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {tool.build_hook_url && <DeployButton buildHookUrl={tool.build_hook_url} />}
                <ToolFormDialog tool={tool} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(tool.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

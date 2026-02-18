"use client";

import { useState } from "react";
import { createTool, updateTool } from "@/actions/tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ToolFormDialogProps {
  tool?: Tool;
}

export function ToolFormDialog({ tool }: ToolFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<string>(tool?.type ?? "internal");
  const isEdit = !!tool;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    formData.set("type", type);
    const result = isEdit ? await updateTool(tool!.id, formData) : await createTool(formData);
    setPending(false);

    if ("error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Validation error");
      return;
    }
    toast.success(isEdit ? "Tool updated" : "Tool created");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-3 w-3" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Add Tool
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tool" : "Add Tool"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={tool?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={tool?.slug} placeholder="my-tool" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "external" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" defaultValue={tool?.url ?? ""} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={tool?.description ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" defaultValue={tool?.tags.join(", ")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide name)</Label>
            <Input id="icon" name="icon" defaultValue={tool?.icon ?? ""} placeholder="wrench" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="build_hook_url">Build Hook URL (optional)</Label>
            <Input id="build_hook_url" name="build_hook_url" type="url" defaultValue={tool?.build_hook_url ?? ""} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

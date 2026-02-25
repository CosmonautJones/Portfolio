"use client";

import { useState, useRef } from "react";
import {
  createTool,
  updateTool,
  importFromGitHub,
  fetchRepoHtml,
} from "@/actions/tools";
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
import { Loader2, Plus, Pencil, Download, Package } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ToolFormDialogProps {
  tool?: Tool;
}

export function ToolFormDialog({ tool }: ToolFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [importing, setImporting] = useState(false);
  const [type, setType] = useState<string>(tool?.type ?? "internal");
  const [githubUrl, setGithubUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!tool;

  function setFormInput(name: string, value: string) {
    if (!formRef.current) return;
    const el = formRef.current.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >(`[name="${name}"]`);
    if (!el) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      "value"
    )?.set;
    nativeSetter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function handleImport() {
    if (!githubUrl.trim()) return;
    setImporting(true);
    const result = await importFromGitHub(githubUrl.trim());
    setImporting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.data && formRef.current) {
      setFormInput("name", result.data.name);
      setFormInput("slug", result.data.slug);
      setFormInput("description", result.data.description);
      setFormInput("tags", result.data.tags);

      if (result.data.homepage) {
        // Has a live URL — default to external
        setFormInput("url", result.data.url);
        setType("external");
        toast.success("Imported from GitHub — review and save");
      } else {
        // No live URL — suggest embedding
        setType("embedded");
        toast.success(
          'No live URL found — set to "Embedded". Click "Fetch Source" to pull in the code.'
        );
      }
    }
  }

  async function handleFetchSource() {
    if (!githubUrl.trim()) {
      toast.error("Enter a GitHub URL first");
      return;
    }
    setImporting(true);
    const result = await fetchRepoHtml(githubUrl.trim());
    setImporting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.html) {
      setHtmlContent(result.html);
      toast.success(
        `Source fetched (${Math.round(result.html.length / 1024)}KB) — ready to save`
      );
    }
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    formData.set("type", type);

    if (type === "embedded" && htmlContent) {
      formData.set("html_content", htmlContent);
    }

    const result = isEdit
      ? await updateTool(tool!.id, formData)
      : await createTool(formData);
    setPending(false);

    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : "Validation error"
      );
      return;
    }
    toast.success(isEdit ? "Tool updated" : "Tool created");
    setOpen(false);
    setGithubUrl("");
    setHtmlContent(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen && !isEdit) {
          setType("internal");
          setGithubUrl("");
          setHtmlContent(null);
          formRef.current?.reset();
        }
      }}
    >
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

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="github-url">GitHub Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="github-url"
                placeholder="https://github.com/owner/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleImport();
                  }
                }}
              />
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              disabled={importing || !githubUrl.trim()}
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            </div>
          </div>
        )}

        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={tool?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={tool?.slug}
              placeholder="my-tool"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="embedded">Embedded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "external" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={tool?.url ?? ""}
                required
              />
            </div>
          )}
          {type === "embedded" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Source</Label>
                {htmlContent ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Package className="h-3 w-3" />
                    {Math.round(htmlContent.length / 1024)}KB loaded
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No source loaded
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleFetchSource}
                disabled={importing || !githubUrl.trim()}
              >
                {importing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Fetch Source from GitHub
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={tool?.description ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={tool?.tags.join(", ")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide name)</Label>
            <Input
              id="icon"
              name="icon"
              defaultValue={tool?.icon ?? ""}
              placeholder="wrench"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="build_hook_url">Build Hook URL (optional)</Label>
            <Input
              id="build_hook_url"
              name="build_hook_url"
              type="url"
              defaultValue={tool?.build_hook_url ?? ""}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={pending || (type === "embedded" && !htmlContent && !isEdit)}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEdit ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

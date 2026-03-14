"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Trash2,
  ExternalLink,
  ThumbsUp,
  MapPin,
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getIdeas,
  addIdea,
  voteIdea,
  updateIdea,
  deleteIdea,
} from "@/actions/pland";
import type { PlandIdea } from "@/lib/types";

interface IdeasTabProps {
  tripId: string;
  isAuthenticated: boolean;
}

const statusConfig: Record<PlandIdea["status"], { label: string; color: string }> = {
  suggested: { label: "Suggested", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

export function IdeasTab({ tripId, isAuthenticated }: IdeasTabProps) {
  const [ideas, setIdeas] = useState<PlandIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | PlandIdea["status"]>("all");

  useEffect(() => {
    getIdeas(tripId).then((res) => {
      if ("data" in res && res.data) setIdeas(res.data);
      setLoading(false);
    });
  }, [tripId]);

  const filtered = filter === "all" ? ideas : ideas.filter((i) => i.status === filter);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await addIdea(tripId, formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Idea added");
        setDialogOpen(false);
        const refreshed = await getIdeas(tripId);
        if ("data" in refreshed && refreshed.data) setIdeas(refreshed.data);
      }
    });
  }

  function handleVote(ideaId: string) {
    startTransition(async () => {
      const res = await voteIdea(ideaId);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setIdeas((prev) =>
          prev.map((i) => (i.id === ideaId ? { ...i, votes: i.votes + 1 } : i))
        );
      }
    });
  }

  function handleStatusChange(ideaId: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("status", status);
      // We need to pass required fields — get the current idea data
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea) return;
      formData.set("title", idea.title);
      if (idea.description) formData.set("description", idea.description);
      if (idea.link) formData.set("link", idea.link);
      if (idea.location) formData.set("location", idea.location);
      if (idea.estimated_cost !== null) formData.set("estimated_cost", String(idea.estimated_cost));

      const res = await updateIdea(ideaId, formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setIdeas((prev) =>
          prev.map((i) => (i.id === ideaId ? { ...i, status } : i))
        );
        toast.success(`Idea ${status}`);
      }
    });
  }

  function handleDelete(ideaId: string) {
    startTransition(async () => {
      const res = await deleteIdea(ideaId);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
        toast.success("Idea removed");
      }
    });
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading ideas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {(["all", "suggested", "approved", "rejected"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Idea</DialogTitle>
              </DialogHeader>
              <form action={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required placeholder="e.g. Snorkeling tour" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="What's the idea?" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link</Label>
                  <Input id="link" name="link" type="url" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="Where?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                  <Input id="estimated_cost" name="estimated_cost" type="number" step="0.01" min="0" placeholder="0.00" />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Idea"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Ideas Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {ideas.length === 0 ? "No ideas yet. Be the first to suggest something!" : "No ideas match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((idea) => {
            const status = statusConfig[idea.status];
            return (
              <Card key={idea.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{idea.title}</h4>
                        <Badge variant="secondary" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      {idea.description && (
                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                      )}
                    </div>
                    {isAuthenticated && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(idea.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {idea.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {idea.location}
                      </span>
                    )}
                    {idea.estimated_cost !== null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${idea.estimated_cost.toFixed(2)}
                      </span>
                    )}
                    {idea.link && (
                      <a
                        href={idea.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Link
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleVote(idea.id)}
                      disabled={!isAuthenticated || isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {idea.votes}
                    </Button>

                    {isAuthenticated && idea.status === "suggested" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                          onClick={() => handleStatusChange(idea.id, "approved")}
                          disabled={isPending}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                          onClick={() => handleStatusChange(idea.id, "rejected")}
                          disabled={isPending}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { PlandTrip } from "@/lib/types";
import { createTrip, updateTrip } from "@/actions/pland";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TripFormProps {
  trip?: PlandTrip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TripForm({ trip, open, onOpenChange, onSuccess }: TripFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!trip;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEditing
        ? await updateTrip(trip.id, formData)
        : await createTrip(formData);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Trip updated" : "Trip created");
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Trip" : "New Trip"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your trip details."
              : "Create a new trip to start planning."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Summer road trip"
              defaultValue={trip?.name ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              name="destination"
              placeholder="Barcelona, Spain"
              defaultValue={trip?.destination ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What's this trip about?"
              rows={3}
              defaultValue={trip?.description ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={trip?.start_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={trip?.end_date ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover image URL</Label>
            <Input
              id="cover_image_url"
              name="cover_image_url"
              type="url"
              placeholder="https://..."
              defaultValue={trip?.cover_image_url ?? ""}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save"
                  : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

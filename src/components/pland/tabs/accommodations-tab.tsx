"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Bed,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAccommodations,
  addAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from "@/actions/pland";
import type { PlandAccommodation } from "@/lib/types";

interface AccommodationsTabProps {
  tripId: string;
  isAuthenticated: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AccommodationsTab({ tripId, isAuthenticated }: AccommodationsTabProps) {
  const [accommodations, setAccommodations] = useState<PlandAccommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getAccommodations(tripId).then((res) => {
      if ("data" in res && res.data) setAccommodations(res.data);
      setLoading(false);
    });
  }, [tripId]);

  const editingItem = editingId ? accommodations.find((a) => a.id === editingId) : null;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = editingId
        ? await updateAccommodation(editingId, formData)
        : await addAccommodation(tripId, formData);

      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success(editingId ? "Accommodation updated" : "Accommodation added");
        setDialogOpen(false);
        setEditingId(null);
        const refreshed = await getAccommodations(tripId);
        if ("data" in refreshed && refreshed.data) setAccommodations(refreshed.data);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteAccommodation(id);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setAccommodations((prev) => prev.filter((a) => a.id !== id));
        toast.success("Accommodation removed");
      }
    });
  }

  function openEdit(id: string) {
    setEditingId(id);
    setDialogOpen(true);
  }

  function openAdd() {
    setEditingId(null);
    setDialogOpen(true);
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading accommodations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bed className="h-5 w-5" />
          Accommodations
        </h3>
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingId(null);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Accommodation" : "Add Accommodation"}
                </DialogTitle>
              </DialogHeader>
              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Hilton Downtown"
                    defaultValue={editingItem?.name ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Full address"
                    defaultValue={editingItem?.address ?? ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="check_in">Check-in</Label>
                    <Input
                      id="check_in"
                      name="check_in"
                      type="date"
                      defaultValue={editingItem?.check_in ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_out">Check-out</Label>
                    <Input
                      id="check_out"
                      name="check_out"
                      type="date"
                      defaultValue={editingItem?.check_out ?? ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Total Cost ($)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    defaultValue={editingItem?.cost ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking_link">Booking Link</Label>
                  <Input
                    id="booking_link"
                    name="booking_link"
                    type="url"
                    placeholder="https://..."
                    defaultValue={editingItem?.booking_link ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Check-in instructions, confirmation number, etc."
                    rows={3}
                    defaultValue={editingItem?.notes ?? ""}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Saving..." : editingId ? "Update" : "Add Accommodation"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {accommodations.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Bed className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No accommodations yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Track hotels, Airbnbs, and other stays — including dates, costs, and booking links.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accommodations.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium">{acc.name}</h4>
                  {isAuthenticated && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(acc.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(acc.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {acc.address && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {acc.address}
                    </p>
                  )}
                  {(acc.check_in || acc.check_out) && (
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {acc.check_in ? formatDate(acc.check_in) : "TBD"}
                      {" — "}
                      {acc.check_out ? formatDate(acc.check_out) : "TBD"}
                    </p>
                  )}
                  {acc.cost !== null && (
                    <p className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      ${acc.cost.toFixed(2)}
                    </p>
                  )}
                  {acc.booking_link && (
                    <a
                      href={acc.booking_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Booking link
                    </a>
                  )}
                </div>

                {acc.notes && (
                  <p className="text-sm text-muted-foreground border-t pt-2">
                    {acc.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

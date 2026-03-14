"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Image, X } from "lucide-react";
import { toast } from "sonner";
import {
  getGalleryItems,
  addGalleryItem,
  deleteGalleryItem,
} from "@/actions/pland";
import type { PlandGalleryItem } from "@/lib/types";

interface GalleryTabProps {
  tripId: string;
  isAuthenticated: boolean;
}

export function GalleryTab({ tripId, isAuthenticated }: GalleryTabProps) {
  const [items, setItems] = useState<PlandGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<PlandGalleryItem | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    getGalleryItems(tripId).then((res) => {
      if ("data" in res && res.data) setItems(res.data);
      setLoading(false);
    });
  }, [tripId]);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await addGalleryItem(tripId, formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Photo added");
        setDialogOpen(false);
        const refreshed = await getGalleryItems(tripId);
        if ("data" in refreshed && refreshed.data) setItems(refreshed.data);
      }
    });
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      const res = await deleteGalleryItem(itemId);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        if (expandedItem?.id === itemId) setExpandedItem(null);
        toast.success("Photo removed");
      }
    });
  }

  function handleImageError(itemId: string) {
    setBrokenImages((prev) => new Set(prev).add(itemId));
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image className="h-5 w-5" />
          Gallery
        </h3>
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Photo</DialogTitle>
              </DialogHeader>
              <form action={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Image URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    name="caption"
                    placeholder="Describe this photo..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Photo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Image className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No photos yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Capture the memories — add photo URLs to build a shared trip gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
          {items.map((item) => {
            const isBroken = brokenImages.has(item.id);
            return (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden border bg-muted cursor-pointer"
                onClick={() => !isBroken && setExpandedItem(item)}
              >
                {isBroken ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Image className="h-8 w-8 mx-auto mb-1 opacity-40" />
                      <span className="text-xs">Image unavailable</span>
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.caption ?? "Gallery photo"}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={() => handleImageError(item.id)}
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    {item.caption && (
                      <p className="text-white text-xs font-medium truncate">
                        {item.caption}
                      </p>
                    )}
                    {item.date && (
                      <p className="text-white/70 text-xs">
                        {new Date(item.date + "T00:00:00").toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 text-white hover:text-red-400 hover:bg-black/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Overlay */}
      {expandedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandedItem(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setExpandedItem(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expandedItem.url}
              alt={expandedItem.caption ?? "Gallery photo"}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {(expandedItem.caption || expandedItem.date) && (
              <div className="text-center" onClick={(e) => e.stopPropagation()}>
                {expandedItem.caption && (
                  <p className="text-white text-sm">{expandedItem.caption}</p>
                )}
                {expandedItem.date && (
                  <p className="text-white/60 text-xs mt-1">
                    {new Date(expandedItem.date + "T00:00:00").toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

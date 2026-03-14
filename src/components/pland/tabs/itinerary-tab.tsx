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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  MapPin,
  Car,
  Utensils,
  Bed,
  Tag,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  getItineraryItems,
  addItineraryItem,
  deleteItineraryItem,
} from "@/actions/pland";
import type { PlandTrip, PlandItineraryItem } from "@/lib/types";

interface ItineraryTabProps {
  tripId: string;
  trip: PlandTrip;
  isAuthenticated: boolean;
}

const categoryConfig: Record<
  PlandItineraryItem["category"],
  { label: string; color: string; icon: React.ElementType }
> = {
  activity: { label: "Activity", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: Tag },
  transport: { label: "Transport", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", icon: Car },
  food: { label: "Food", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: Utensils },
  accommodation: { label: "Accommodation", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: Bed },
  other: { label: "Other", color: "bg-muted text-muted-foreground", icon: Tag },
};

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getDaysInRange(start: string | null, end: string | null): string[] {
  if (!start || !end) return [];
  const days: string[] = [];
  const current = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (current <= last) {
    days.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function formatDayHeader(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function ItineraryTab({ tripId, trip, isAuthenticated }: ItineraryTabProps) {
  const [items, setItems] = useState<PlandItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    getItineraryItems(tripId).then((res) => {
      if ("data" in res && res.data) setItems(res.data);
      setLoading(false);
    });
  }, [tripId]);

  const days = getDaysInRange(trip.start_date, trip.end_date);

  // Group items by date
  const grouped: Record<string, PlandItineraryItem[]> = {};
  for (const item of items) {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  }
  // Sort items within each day by start_time
  for (const date in grouped) {
    grouped[date].sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
  }

  // Collect all dates (from range + any items outside range)
  const allDates = new Set([...days, ...Object.keys(grouped)]);
  const sortedDates = Array.from(allDates).sort();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const res = await addItineraryItem(tripId, formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Activity added");
        setDialogOpen(false);
        const refreshed = await getItineraryItems(tripId);
        if ("data" in refreshed && refreshed.data) setItems(refreshed.data);
      }
    });
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      const res = await deleteItineraryItem(itemId);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.success("Activity removed");
      }
    });
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading itinerary...</div>;
  }

  return (
    <div className="space-y-8">
      {sortedDates.length === 0 && items.length === 0 && (
        <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Calendar className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No activities yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {trip.start_date
              ? "Start building your day-by-day itinerary — add activities, transport, and meals."
              : "Set trip dates first to start planning your itinerary."}
          </p>
        </div>
      )}

      {sortedDates.map((date) => {
        const dayItems = grouped[date] ?? [];
        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{formatDayHeader(date)}</h3>
              {isAuthenticated && (
                <Dialog open={dialogOpen && selectedDate === date} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setSelectedDate(date);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Activity</DialogTitle>
                    </DialogHeader>
                    <form action={handleAdd} className="space-y-4">
                      <input type="hidden" name="date" value={date} />
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required placeholder="e.g. Museum visit" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_time">Start Time</Label>
                          <Input id="start_time" name="start_time" type="time" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_time">End Time</Label>
                          <Input id="end_time" name="end_time" type="time" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue="activity">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activity">Activity</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="Address or place name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Notes</Label>
                        <Textarea id="description" name="description" placeholder="Optional notes..." rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Link</Label>
                        <Input id="link" name="link" type="url" placeholder="https://..." />
                      </div>
                      <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Adding..." : "Add Activity"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {dayItems.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-4 border-l-2 border-border py-2">
                No activities planned
              </p>
            ) : (
              <div className="relative pl-4 border-l-2 border-border space-y-3">
                {dayItems.map((item) => {
                  const cat = categoryConfig[item.category];
                  const Icon = cat.icon;
                  return (
                    <Card key={item.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[calc(1rem+5px)] top-4 h-2.5 w-2.5 rounded-full bg-foreground border-2 border-background" />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(item.start_time || item.end_time) && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  {item.start_time && formatTime12h(item.start_time)}
                                  {item.start_time && item.end_time && " — "}
                                  {item.end_time && formatTime12h(item.end_time)}
                                </span>
                              )}
                              <Badge variant="secondary" className={cat.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {cat.label}
                              </Badge>
                            </div>
                            <h4 className="font-medium">{item.title}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                            {item.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {item.location}
                              </p>
                            )}
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Link
                              </a>
                            )}
                          </div>
                          {isAuthenticated && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      })}
    </div>
  );
}

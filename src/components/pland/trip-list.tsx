"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import type { PlandTrip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TripListProps {
  trips: PlandTrip[];
  onSelectTrip: (id: string) => void;
  isAuthenticated: boolean;
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null;
  const startDate = new Date(start + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (!end) return startDate;
  const endDate = new Date(end + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startDate} – ${endDate}`;
}

function statusVariant(status: PlandTrip["status"]) {
  switch (status) {
    case "planning":
      return "secondary" as const;
    case "active":
      return "default" as const;
    case "completed":
      return "outline" as const;
  }
}

export function TripList({ trips, onSelectTrip }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="animate-fade-up flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <MapPin className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No trips yet</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Plan your next adventure — create a trip to start organizing destinations, itineraries, and expenses.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <Card
          key={trip.id}
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => onSelectTrip(trip.id)}
        >
          {trip.cover_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trip.cover_image_url}
                alt={trip.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-1 text-lg">
                {trip.name}
              </CardTitle>
              <Badge variant={statusVariant(trip.status)}>{trip.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {trip.destination && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{trip.destination}</span>
              </div>
            )}
            {(trip.start_date || trip.end_date) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>Members</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

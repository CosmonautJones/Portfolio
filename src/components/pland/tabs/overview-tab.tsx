"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import type { PlandTrip, PlandMember } from "@/lib/types";

interface OverviewTabProps {
  trip: PlandTrip;
  members: PlandMember[];
  isAuthenticated: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTripDuration(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
}

const statusColors: Record<string, string> = {
  planning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
  completed: "bg-muted text-muted-foreground",
};

export function OverviewTab({ trip, members }: OverviewTabProps) {
  const duration = getTripDuration(trip.start_date, trip.end_date);

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">{trip.name}</h2>
          <Badge className={statusColors[trip.status] ?? ""} variant="secondary">
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </Badge>
        </div>

        {trip.destination && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{trip.destination}</span>
          </div>
        )}

        {(trip.start_date || trip.end_date) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {trip.start_date ? formatDate(trip.start_date) : "TBD"}
              {" — "}
              {trip.end_date ? formatDate(trip.end_date) : "TBD"}
            </span>
          </div>
        )}

        {trip.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {trip.description}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {members.length === 1 ? "traveler" : "travelers"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {duration ? `${duration}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {duration ? (duration === 1 ? "day" : "days") : "dates not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{trip.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Created {formatDate(trip.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trip Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5"
                >
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{
                      backgroundColor: member.avatar_color ?? "#6366f1",
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

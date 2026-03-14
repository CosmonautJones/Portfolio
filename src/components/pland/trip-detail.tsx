"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlandMember, PlandTrip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberList } from "@/components/pland/members/member-list";
import { ItineraryTab } from "@/components/pland/tabs/itinerary-tab";
import { IdeasTab } from "@/components/pland/tabs/ideas-tab";
import { AccommodationsTab } from "@/components/pland/tabs/accommodations-tab";
import { FinancesTab } from "@/components/pland/tabs/finances-tab";
import { ChatTab } from "@/components/pland/tabs/chat-tab";
import { GalleryTab } from "@/components/pland/tabs/gallery-tab";

interface TripDetailProps {
  tripId: string;
  onBack: () => void;
  isAuthenticated: boolean;
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TripDetail({ tripId, onBack, isAuthenticated }: TripDetailProps) {
  const [trip, setTrip] = useState<PlandTrip | null>(null);
  const [members, setMembers] = useState<PlandMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [tripRes, membersRes] = await Promise.all([
      supabase.from("pland_trips").select("*").eq("id", tripId).single(),
      supabase
        .from("pland_members")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true }),
    ]);

    if (tripRes.data) setTrip(tripRes.data as PlandTrip);
    if (membersRes.data) setMembers(membersRes.data as PlandMember[]);
    setIsLoading(false);
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMembersChange = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("pland_members")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true });
    if (data) setMembers(data as PlandMember[]);
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading trip...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-muted-foreground">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{trip.name}</h1>
            <Badge
              variant={
                trip.status === "active"
                  ? "default"
                  : trip.status === "planning"
                    ? "secondary"
                    : "outline"
              }
            >
              {trip.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {trip.destination && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination}
              </span>
            )}
            {trip.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(trip.start_date)}
                {trip.end_date && ` – ${formatDate(trip.end_date)}`}
              </span>
            )}
          </div>
          {trip.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {trip.description}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="stays">Stays</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold">Trip Overview</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {trip.description || "No description added yet."}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="mt-1 font-medium capitalize">{trip.status}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="mt-1 font-medium">{members.length}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Dates</p>
                  <p className="mt-1 font-medium">
                    {trip.start_date
                      ? `${formatDate(trip.start_date)}${trip.end_date ? ` – ${formatDate(trip.end_date)}` : ""}`
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="mt-6">
            <ItineraryTab tripId={tripId} trip={trip} isAuthenticated={isAuthenticated} />
          </TabsContent>

          <TabsContent value="ideas" className="mt-6">
            <IdeasTab tripId={tripId} isAuthenticated={isAuthenticated} />
          </TabsContent>

          <TabsContent value="stays" className="mt-6">
            <AccommodationsTab tripId={tripId} isAuthenticated={isAuthenticated} />
          </TabsContent>

          <TabsContent value="finances" className="mt-6">
            <FinancesTab tripId={tripId} members={members} isAuthenticated={isAuthenticated} />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatTab tripId={tripId} isAuthenticated={isAuthenticated} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <GalleryTab tripId={tripId} isAuthenticated={isAuthenticated} />
          </TabsContent>
        </Tabs>

        {/* Members sidebar */}
        <aside className="space-y-4">
          <MemberList
            members={members}
            isAuthenticated={isAuthenticated}
            tripId={tripId}
            onMembersChange={handleMembersChange}
          />
        </aside>
      </div>
    </div>
  );
}

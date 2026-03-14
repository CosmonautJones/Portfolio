"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlandTrip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TripList } from "@/components/pland/trip-list";
import { TripDetail } from "@/components/pland/trip-detail";
import { TripForm } from "@/components/pland/trip-form";

export function PlandApp() {
  const [trips, setTrips] = useState<PlandTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchTrips = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pland_trips")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) {
      setTrips(data as PlandTrip[]);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      await fetchTrips();
      setIsLoading(false);
    }
    init();
  }, [fetchTrips]);

  const handleTripCreated = useCallback(() => {
    setFormOpen(false);
    fetchTrips();
  }, [fetchTrips]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {selectedTripId ? (
        <TripDetail
          tripId={selectedTripId}
          onBack={() => {
            setSelectedTripId(null);
            fetchTrips();
          }}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Plan&apos;d</h1>
              <p className="mt-1 text-muted-foreground">
                Group trip planning, simplified.
              </p>
            </div>
            {isAuthenticated && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Trip
              </Button>
            )}
          </div>

          <TripList
            trips={trips}
            onSelectTrip={setSelectedTripId}
            isAuthenticated={isAuthenticated}
          />

          <TripForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSuccess={handleTripCreated}
          />
        </>
      )}
    </div>
  );
}

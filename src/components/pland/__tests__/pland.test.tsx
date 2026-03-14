/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// Mock Supabase client
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}));

// Mock server actions
vi.mock("@/actions/pland", () => ({
  createTrip: vi.fn(),
  updateTrip: vi.fn(),
  deleteTrip: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getMembers: vi.fn(),
  getTrips: vi.fn(),
  getTrip: vi.fn(),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { TripList } from "../trip-list";
import { MemberAvatar } from "../members/member-avatar";
import { MemberList } from "../members/member-list";
import type { PlandTrip, PlandMember } from "@/lib/types";

const mockTrip: PlandTrip = {
  id: "trip-1",
  user_id: "user-1",
  name: "Test Trip",
  destination: "Paris, France",
  description: "A fun trip",
  cover_image_url: null,
  start_date: "2026-06-01",
  end_date: "2026-06-10",
  status: "planning",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockMember: PlandMember = {
  id: "member-1",
  trip_id: "trip-1",
  user_id: "user-1",
  name: "Jane Doe",
  email: "jane@example.com",
  avatar_color: "#ef7d57",
  created_at: "2026-01-01T00:00:00Z",
};

describe("TripList", () => {
  afterEach(() => cleanup());

  it("renders empty state when no trips", () => {
    render(
      <TripList trips={[]} onSelectTrip={vi.fn()} isAuthenticated={false} />
    );
    expect(screen.getByText("No trips yet")).toBeInTheDocument();
  });

  it("renders trip cards", () => {
    render(
      <TripList
        trips={[mockTrip]}
        onSelectTrip={vi.fn()}
        isAuthenticated={false}
      />
    );
    expect(screen.getByText("Test Trip")).toBeInTheDocument();
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
    expect(screen.getByText("planning")).toBeInTheDocument();
  });

  it("calls onSelectTrip when card is clicked", () => {
    const onSelect = vi.fn();
    render(
      <TripList
        trips={[mockTrip]}
        onSelectTrip={onSelect}
        isAuthenticated={false}
      />
    );
    fireEvent.click(screen.getByText("Test Trip"));
    expect(onSelect).toHaveBeenCalledWith("trip-1");
  });
});

describe("MemberAvatar", () => {
  afterEach(() => cleanup());

  it("renders initials for single name", () => {
    render(<MemberAvatar name="Jane" color="#ef7d57" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("renders initials for full name", () => {
    render(<MemberAvatar name="Jane Doe" color="#ef7d57" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("uses fallback color when color is null", () => {
    render(<MemberAvatar name="Jane" color={null} />);
    const el = screen.getByText("J");
    expect(el.parentElement?.style.backgroundColor || el.style.backgroundColor).toBeTruthy();
  });
});

describe("MemberList", () => {
  afterEach(() => cleanup());

  it("renders empty state when no members", () => {
    render(
      <MemberList
        members={[]}
        isAuthenticated={false}
        tripId="trip-1"
        onMembersChange={vi.fn()}
      />
    );
    expect(screen.getByText("No members yet.")).toBeInTheDocument();
  });

  it("renders member names", () => {
    render(
      <MemberList
        members={[mockMember]}
        isAuthenticated={false}
        tripId="trip-1"
        onMembersChange={vi.fn()}
      />
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Members (1)")).toBeInTheDocument();
  });

  it("shows add button when authenticated", () => {
    render(
      <MemberList
        members={[]}
        isAuthenticated={true}
        tripId="trip-1"
        onMembersChange={vi.fn()}
      />
    );
    // The plus button should be present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("hides remove button when not authenticated", () => {
    render(
      <MemberList
        members={[mockMember]}
        isAuthenticated={false}
        tripId="trip-1"
        onMembersChange={vi.fn()}
      />
    );
    // No trash/remove buttons should be visible
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });
});

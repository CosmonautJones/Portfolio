/** @vitest-environment jsdom */
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { ContributionAtlas } from "../contribution-atlas";
import snapshot from "@/lib/data/github-contributions-snapshot.json";

const { initialize, dispose } = vi.hoisted(() => ({ initialize: vi.fn(), dispose: vi.fn() }));
vi.mock("../contribution-atlas-renderer", () => ({ initializeContributionAtlas: initialize }));
vi.mock("../contribution-atlas.module.css", () => ({ default: { atlas: "atlas" } }));
let enter: (entries: { isIntersecting: boolean }[]) => void;
beforeEach(() => vi.stubGlobal("IntersectionObserver", class {
  constructor(callback: typeof enter) { enter = callback; }
  observe = vi.fn();
  disconnect = vi.fn();
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

it("exposes both views, source attribution, and a dated fallback before loading the canvas", () => {
  render(<ContributionAtlas />);
  expect(screen.getByRole("heading", { name: "A year, in another dimension." })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Top view" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "3D landscape" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("link", { name: "View on GitHub" })).toHaveAttribute("href", "https://github.com/CosmonautJones");
  expect(screen.getByText(/including commits, pull requests, issues, and reviews/)).toBeInTheDocument();
  expect(screen.getByText(/Oct 4, 2025 — Oct 3, 2026/)).toBeInTheDocument();
  expect(initialize).not.toHaveBeenCalled();
});

it("loads only on entry, replaces the snapshot with fresh data, and cleans up the renderer on unmount", async () => {
  initialize.mockReturnValue(dispose);
  const fetcher = vi.fn().mockResolvedValue(Response.json({ ...snapshot, stale: false }));
  vi.stubGlobal("fetch", fetcher);
  const view = render(<ContributionAtlas />);
  await act(async () => enter([{ isIntersecting: true }]));
  await waitFor(() => expect(screen.getByText(/Refreshes daily from GitHub/)).toBeInTheDocument());
  await waitFor(() => expect(initialize).toHaveBeenCalled());
  expect(fetcher).toHaveBeenCalledWith("/api/github-contributions", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  view.unmount();
  expect(dispose).toHaveBeenCalled();
});

it("keeps the dated snapshot usable when the refresh request fails", async () => {
  initialize.mockReturnValue(dispose);
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  render(<ContributionAtlas />);
  await act(async () => enter([{ isIntersecting: true }]));
  await waitFor(() => expect(initialize).toHaveBeenCalled());
  expect(screen.getByText(/Saved snapshot/)).toBeInTheDocument();
  expect(screen.getByText("1,621")).toBeInTheDocument();
});

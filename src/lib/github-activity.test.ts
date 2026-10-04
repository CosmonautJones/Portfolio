import { afterEach, expect, it, vi } from "vitest";
import { getPublicActivity } from "./github-activity";
import { GET } from "@/app/api/github-activity/route";

const sha = "a".repeat(40);
const push = { type: "PushEvent", public: true, repo: { name: "CosmonautJones/Portfolio" }, created_at: "2026-10-04T05:00:00Z", payload: { head: sha } };
const pr = { type: "PullRequestEvent", public: true, repo: { name: "CosmonautJones/m-local" }, created_at: "2026-10-04T04:00:00Z", payload: { action: "opened", number: 20, pull_request: { title: "Add a useful change", html_url: "https://untrusted.example", body: "not exported" } } };
afterEach(() => vi.unstubAllGlobals());

it("uses only unauthenticated public sources and exports a small allowlist of fields", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json([pr, push])).mockResolvedValueOnce(Response.json({ commit: { message: "Polish the atlas\n\nExtra body", author: { email: "not-exported@example.com" } }, files: [{ patch: "not exported" }] }));
  vi.stubGlobal("fetch", fetcher);
  const response = await GET();
  const data = await response.json();
  expect(data.items).toEqual([
    { repo: push.repo.name, kind: "Commit", title: "Polish the atlas", url: `https://github.com/${push.repo.name}/commit/${sha}`, date: push.created_at },
    { repo: pr.repo.name, kind: "Pull request", title: "Add a useful change", url: `https://github.com/${pr.repo.name}/pull/20`, date: pr.created_at },
  ]);
  expect(fetcher).toHaveBeenNthCalledWith(1, "https://api.github.com/users/CosmonautJones/events/public?per_page=100", expect.objectContaining({ next: { revalidate: 3600 } }));
  for (const [, options] of fetcher.mock.calls) expect(options.headers).not.toHaveProperty("Authorization");
  expect(JSON.stringify(data)).not.toMatch(/not.exported|untrusted/);
  expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
});

it("rejects private events, malformed targets, and irrelevant activity before making commit requests", async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json([
    { ...push, public: false },
    { ...push, repo: { name: "../private" } },
    { ...push, payload: { head: "../../private" } },
    { ...push, created_at: "invalid" },
    { ...push, type: "WatchEvent" },
    { ...pr, payload: { ...pr.payload, action: "closed", pull_request: { ...pr.payload.pull_request, merged: false } } },
  ]));
  vi.stubGlobal("fetch", fetcher);
  expect(await getPublicActivity()).toEqual({ items: [], unavailable: false });
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("sorts and deduplicates the feed and bounds each request to three public changes", async () => {
  const events = Array.from({ length: 8 }, (_, index) => ({ ...push, created_at: `2026-10-04T0${index}:00:00Z`, payload: { head: String(index).repeat(40) } }));
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json([...events, events[7]])).mockImplementation(() => Promise.resolve(Response.json({ commit: { message: "A change" } })));
  vi.stubGlobal("fetch", fetcher);
  const data = await getPublicActivity();
  expect(data.items).toHaveLength(3);
  expect(data.items[0].date).toBe(events[7].created_at);
  expect(new Set(data.items.map((item) => item.url)).size).toBe(3);
  expect(fetcher).toHaveBeenCalledTimes(4);
});

it("preserves available pull requests when a commit lookup fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json([push, pr])).mockResolvedValueOnce(new Response("limited", { status: 403 })));
  const data = await getPublicActivity();
  expect(data.items).toHaveLength(1);
  expect(data.items[0].kind).toBe("Pull request");
  expect(data.unavailable).toBe(true);
});

it("degrades safely on rate limits, timeout, or invalid feed data", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(new Response("limited", { status: 429 })).mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce(Response.json({ unexpected: true }));
  vi.stubGlobal("fetch", fetcher);
  for (let i = 0; i < 3; i++) expect(await getPublicActivity()).toEqual({ items: [], unavailable: true });
});

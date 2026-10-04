import { afterEach, describe, expect, it, vi } from "vitest";
import { getContributions, parseContributions } from "./github-contributions";
import { GET } from "@/app/api/github-contributions/route";

function calendar(length = 365) {
  return Array.from({ length }, (_, i) => {
    const date = new Date(Date.UTC(2025, 9, 5 + i)).toISOString().slice(0, 10);
    const count = i === 100 ? 152 : i % 7;
    const text = count ? `${count} contributions on this day.` : "No contributions on this day.";
    return `<td data-date="${date}" id="day-${i}" data-level="${count ? 4 : 0}"></td><tool-tip for="day-${i}">${text}</tool-tip>`;
  }).join("");
}

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("GitHub contribution data", () => {
  it("uses exact tooltip counts and activity levels for 365 consecutive dates", () => {
    const days = parseContributions(calendar(), "2026-10-04");
    expect(days).toHaveLength(365);
    expect(days[0]).toEqual({ date: "2025-10-05", count: 0, level: 0 });
    expect(days[100].count).toBe(152);
    expect(days[364].date).toBe("2026-10-04");
    expect(parseContributions(calendar().replace("152 contributions", "1,152 contributions"), "2026-10-04")[100].count).toBe(1152);
  });

  it("keeps the latest year, excludes future dates, and rejects missing or duplicate days", () => {
    expect(parseContributions(calendar(366), "2026-10-04")).toHaveLength(365);
    expect(parseContributions(calendar(366), "2026-10-05")[0].date).toBe("2025-10-06");
    expect(() => parseContributions(calendar(364), "2026-10-04")).toThrow();
    expect(() => parseContributions(calendar().replace('data-date="2025-10-06"', 'data-date="2025-10-05"'), "2026-10-04")).toThrow();
    expect(() => parseContributions(calendar().replace('for="day-1"', 'for="missing"'), "2026-10-04")).toThrow();
    expect(() => parseContributions(calendar().replace('data-level="0"', 'data-level="9"'), "2026-10-04")).toThrow();
  });

  it("requests only the fixed public GitHub source and caches the upstream data for a day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00Z"));
    const fetcher = vi.fn().mockResolvedValue(new Response(calendar()));
    vi.stubGlobal("fetch", fetcher);
    const response = await GET();
    const data = await response.json();
    expect(data.stale).toBe(false);
    expect(data.to).toBe("2026-10-04");
    expect(data.days[100].count).toBe(152);
    expect(fetcher).toHaveBeenCalledWith("https://github.com/users/CosmonautJones/contributions", expect.objectContaining({ next: { revalidate: 86400 } }));
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("returns the honest dated snapshot when GitHub rejects, times out, or changes its markup", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(new Response("<html>new calendar markup</html>"));
    vi.stubGlobal("fetch", fetcher);
    for (let i = 0; i < 3; i++) {
      const data = await getContributions();
      expect(data.stale).toBe(true);
      expect(data.to).toBe("2026-10-03");
      expect(data.days.reduce((sum, day) => sum + day.count, 0)).toBe(1621);
    }
    fetcher.mockResolvedValueOnce(new Response("", { status: 503 }));
    expect((await GET()).headers.get("Cache-Control")).toContain("s-maxage=300");
  });
});

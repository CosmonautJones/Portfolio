import snapshot from "@/lib/data/github-contributions-snapshot.json";

const SOURCE = "https://github.com/users/CosmonautJones/contributions";

export interface ContributionData {
  username: string;
  from: string;
  to: string;
  source: string;
  snapshotDate: string;
  metric: string;
  stale: boolean;
  days: { date: string; count: number; level: number }[];
}

function attribute(attributes: string, name: string) {
  return attributes.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
}

export function parseContributions(html: string, today = new Date().toISOString().slice(0, 10)) {
  const counts = new Map<string, number>();
  for (const tooltip of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attribute(tooltip[1], "for");
    const text = tooltip[2].replace(/<[^>]+>/g, "").trim();
    const match = text.match(/^([\d,]+) contributions? on /);
    if (id && /^No contributions on /.test(text)) counts.set(id, 0);
    else if (id && match) counts.set(id, Number(match[1].replaceAll(",", "")));
  }

  const days = [];
  for (const cell of html.matchAll(/<td\b([^>]*)>/g)) {
    const date = attribute(cell[1], "data-date");
    if (!date || date > today) continue;
    const id = attribute(cell[1], "id");
    const level = Number(attribute(cell[1], "data-level"));
    const count = id ? counts.get(id) : undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(level) || level < 0 || level > 4 || count === undefined || !Number.isSafeInteger(count) || count < 0) {
      throw new Error("Incomplete GitHub contribution calendar");
    }
    days.push({ date, count, level });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const year = days.slice(-365);
  if (year.length !== 365 || year.some((day, i) => i > 0 && Date.parse(day.date) - Date.parse(year[i - 1].date) !== 86400000)) {
    throw new Error("GitHub calendar must contain 365 consecutive days");
  }
  return year;
}

export async function getContributions(): Promise<ContributionData> {
  try {
    const response = await fetch(SOURCE, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "text/html" },
    });
    if (!response.ok) throw new Error("GitHub calendar unavailable");
    const days = parseContributions(await response.text());
    return {
      username: snapshot.username,
      from: days[0].date,
      to: days[days.length - 1].date,
      source: SOURCE,
      snapshotDate: days[days.length - 1].date,
      metric: "contributions",
      stale: false,
      days,
    };
  } catch {
    return { ...snapshot, stale: true };
  }
}

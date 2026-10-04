export type PublicChange = {
  repo: string;
  kind: "Commit" | "Pull request";
  title: string;
  url: string;
  date: string;
};

type Candidate = Omit<PublicChange, "title"> & { title?: string; sha?: string };
const SOURCE = "https://api.github.com/users/CosmonautJones/events/public?per_page=100";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "CosmonautJones-Portfolio" };
const firstLine = (value: unknown) => typeof value === "string" ? value.split(/\r?\n/)[0].trim().slice(0, 240) : "";

// Deliberately unauthenticated: only public events and public commit metadata.
export async function getPublicActivity(): Promise<{ items: PublicChange[]; unavailable: boolean }> {
  try {
    const response = await fetch(SOURCE, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Public activity unavailable");
    const events = await response.json();
    if (!Array.isArray(events)) throw new Error("Invalid public activity");
    const candidates: Candidate[] = [];
    for (const event of events) {
      const repo = event?.repo?.name;
      const date = event?.created_at;
      if (event?.public !== true || typeof repo !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repo) || repo.split("/").some((part) => part === "." || part === "..")) continue;
      if (typeof date !== "string" || !Number.isFinite(Date.parse(date))) continue;
      const payload = event.payload;
      if (event.type === "PushEvent" && typeof payload?.head === "string" && /^[a-f0-9]{40}$/i.test(payload.head)) {
        candidates.push({ repo, date, kind: "Commit", sha: payload.head, url: `https://github.com/${repo}/commit/${payload.head}` });
      }
      if (event.type === "PullRequestEvent" && (payload?.action === "opened" || (payload?.action === "closed" && payload?.pull_request?.merged === true))) {
        const number = payload.number;
        const title = firstLine(payload.pull_request?.title);
        if (Number.isSafeInteger(number) && number > 0 && title) candidates.push({ repo, date, title, kind: "Pull request", url: `https://github.com/${repo}/pull/${number}` });
      }
    }
    const seen = new Set<string>();
    const recent = candidates.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    }).slice(0, 3);
    const changes = await Promise.all(recent.map(async (item): Promise<PublicChange | null> => {
      let title = item.title;
      if (item.sha) {
        try {
          const commit = await fetch(`https://api.github.com/repos/${item.repo}/commits/${item.sha}`, { headers, next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
          if (!commit.ok) return null;
          title = firstLine((await commit.json())?.commit?.message);
        } catch { return null; }
      }
      return title ? { repo: item.repo, kind: item.kind, title, url: item.url, date: item.date } : null;
    }));
    return { items: changes.filter((item): item is PublicChange => item !== null), unavailable: changes.some((item) => item === null) };
  } catch {
    return { items: [], unavailable: true };
  }
}

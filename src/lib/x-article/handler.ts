import { fetchPublicArticle, toPublicError } from "./fxtwitter";
import { articleToMarkdown } from "./to-markdown";
import { parseXStatusUrl } from "./x-url";
import { BodyLimitError, readBounded } from "./read-bounded";

// A bounded, best-effort allowance per server process, not a distributed quota.
export function createXArticleHandler(fetcher: typeof fetch = fetch, now: () => number = Date.now, limit = 30) {
  let windowStart = now();
  let used = 0;
  let active = 0;
  return async (request: Request) => {
    const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
    let body: unknown;
    try {
      body = JSON.parse(await readBounded(request.body, 4096));
    } catch (error) {
      return reply({ error: error instanceof BodyLimitError ? "Send only a public X post URL; this request is too large." : "Send a JSON object with a public X post URL." }, error instanceof BodyLimitError ? 413 : 400);
    }
    const data = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
    let parsed;
    try { parsed = parseXStatusUrl(typeof data.url === "string" ? data.url : ""); }
    catch { return reply({ error: "Paste a public X post URL, such as https://x.com/handle/status/123." }, 400); }
    if (now() - windowStart >= 60_000) { windowStart = now(); used = 0; }
    if (used >= limit || active >= 3) return reply({ error: "The reader is busy. Try again in a minute, or paste your article text below." }, 429);
    used++; active++;
    try {
      const article = await fetchPublicArticle(parsed, fetcher);
      const converted = articleToMarkdown(article, { obsidian: data.frontmatter === true, includeConversation: false });
      return reply({ ...converted, title: article.title, source: article.canonicalUrl, kind: article.kind });
    } catch (error) {
      const mapped = toPublicError(error);
      return reply({ error: mapped.message, code: mapped.code }, mapped.status);
    } finally { active--; }
  };
}

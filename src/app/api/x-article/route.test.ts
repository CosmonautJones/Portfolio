import { expect, it, vi } from "vitest";
import { createXArticleHandler } from "@/lib/x-article/handler";
import fixture from "@/lib/x-article/fixtures/article-response.json";

const request = (body: string) => new Request("https://www.travisjohnjones.com/api/x-article", { method: "POST", body });
it("rejects oversized and invalid requests before requesting the provider", async () => {
  const fetcher = vi.fn();
  const handler = createXArticleHandler(fetcher);
  expect((await handler(request("x".repeat(4097)))).status).toBe(413);
  expect((await handler(request(JSON.stringify({ url: "https://127.0.0.1/private" })))).status).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
it("returns attributed real Markdown and honest upstream failure", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json(fixture)).mockResolvedValueOnce(new Response("", { status: 429 }));
  const handler = createXArticleHandler(fetcher);
  const response = await handler(request(JSON.stringify({ url: "https://x.com/AnatoliKopadze/status/2080668775796314331" })));
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.markdown).toContain("Graph Engineering explained");
  expect(body.markdown).toContain("https://x.com/AnatoliKopadze/status/2080668775796314331");
  expect((await handler(request(JSON.stringify({ url: "https://x.com/i/status/20" })))).status).toBe(429);
});
it("applies a bounded per-process request allowance", async () => {
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json(fixture)));
  const handler = createXArticleHandler(fetcher, () => 1000, 2);
  for (let i = 0; i < 2; i++) await handler(request(JSON.stringify({ url: "https://x.com/i/status/20" })));
  expect((await handler(request(JSON.stringify({ url: "https://x.com/i/status/20" })))).status).toBe(429);
  expect(fetcher).toHaveBeenCalledTimes(2);
});

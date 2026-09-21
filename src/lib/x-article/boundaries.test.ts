import { expect, it, vi } from "vitest";
import { fetchPublicArticle } from "./fxtwitter";
import { parseXStatusUrl } from "./x-url";

it("does not follow provider redirects and bounds response bytes", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(" ".repeat(1_048_577)));
  await expect(fetchPublicArticle(parseXStatusUrl("https://x.com/i/status/20"), fetcher)).rejects.toMatchObject({ code: "response_too_large" });
  expect(fetcher).toHaveBeenCalledWith("https://api.fxtwitter.com/2/status/20", expect.objectContaining({ redirect: "error" }));
});

it.each(["https://x.com:444/user/status/20", "https://x.com/not%20a%20handle/status/20", "https://x.com/i/status/" + "1".repeat(100)])("rejects malformed status URL %s", (value) => {
  expect(() => parseXStatusUrl(value)).toThrow();
});

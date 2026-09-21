/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { XArticleReader } from "../x-article-reader";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("fetches only after explicit action and preserves the last result if the provider fails", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ markdown: "# Real article\n\nActual words.", filename: "real.md", source: "https://x.com/i/status/20", warnings: [] })).mockResolvedValueOnce(Response.json({ error: "The public reader is busy." }, { status: 429 }));
  vi.stubGlobal("fetch", fetcher);
  render(<XArticleReader />);
  expect(screen.getByText(/FxTwitter/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Public X post or article URL"), { target: { value: "https://x.com/i/status/20" } });
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Read article" }));
  await waitFor(() => expect(screen.getByLabelText("Extracted Markdown")).toHaveValue("# Real article\n\nActual words."));
  expect(fetcher).toHaveBeenCalledWith("/api/x-article", expect.objectContaining({ method: "POST", body: JSON.stringify({ url: "https://x.com/i/status/20" }) }));
  fireEvent.click(screen.getByRole("button", { name: "Read article" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/busy/));
  expect(screen.getByLabelText("Extracted Markdown")).toHaveValue("# Real article\n\nActual words.");
});
it("rejects a non-X URL without making any request", async () => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  render(<XArticleReader />);
  fireEvent.change(screen.getByLabelText("Public X post or article URL"), { target: { value: "https://example.com/" } });
  fireEvent.click(screen.getByRole("button", { name: "Read article" }));
  expect(screen.getByRole("alert")).toHaveTextContent(/public X post URL/i);
  expect(fetcher).not.toHaveBeenCalled();
});

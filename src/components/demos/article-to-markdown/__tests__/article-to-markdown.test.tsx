/** @vitest-environment jsdom */
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ArticleToMarkdown } from "../article-to-markdown";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("creates an attributed file from pasted content and supports copy failure", async () => {
  render(<ArticleToMarkdown />);
  expect(screen.getByText(/does not fetch X links/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Download .md" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Article title (optional)"), { target: { value: "Useful notes" } });
  fireEvent.change(screen.getByLabelText("Paste article text"), { target: { value: "One meaningful paragraph." } });
  expect(screen.getByLabelText("Markdown output")).toHaveValue("# Useful notes\n\nOne meaningful paragraph.\n");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } });
  fireEvent.click(screen.getByRole("button", { name: "Copy Markdown" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/select/i));
  expect(screen.getByRole("button", { name: "Download .md" })).toBeEnabled();
});

it("loads an original sample and blocks invalid source exports", () => {
  render(<ArticleToMarkdown />);
  fireEvent.click(screen.getByRole("button", { name: "Try a short example" }));
  expect((screen.getByLabelText("Markdown output") as HTMLTextAreaElement).value).toContain("A smaller, clearer handoff");
  fireEvent.change(screen.getByLabelText("Source URL (optional)"), { target: { value: "javascript:alert(1)" } });
  expect(screen.getByRole("alert")).toHaveTextContent(/source/i);
  expect(screen.getByRole("button", { name: "Download .md" })).toBeDisabled();
});

it("downloads the visible Markdown with a safe filename and revokes its URL", async () => {
  let downloaded: Blob | undefined;
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn((blob: Blob) => { downloaded = blob; return "blob:article"; }) });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    expect(this.download).toBe("My-notes.md");
    expect(this.href).toBe("blob:article");
  });
  render(<ArticleToMarkdown />);
  fireEvent.change(screen.getByLabelText("Article title (optional)"), { target: { value: "My notes" } });
  fireEvent.change(screen.getByLabelText("Paste article text"), { target: { value: "The exact content." } });
  fireEvent.click(screen.getByRole("button", { name: "Download .md" }));
  expect(click).toHaveBeenCalledOnce();
  const text = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(downloaded!); });
  expect(text).toBe("# My notes\n\nThe exact content.\n");
  await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:article"), { timeout: 1600 });
});

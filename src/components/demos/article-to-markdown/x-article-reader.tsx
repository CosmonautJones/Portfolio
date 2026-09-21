"use client";

import { useRef, useState } from "react";
import { ArrowRight, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseXStatusUrl } from "@/lib/x-article/x-url";

type Extracted = { markdown: string; filename: string; source: string; warnings: string[] };

export function XArticleReader() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<Extracted | null>(null);
  const output = useRef<HTMLTextAreaElement>(null);

  async function read() {
    if (busy) return;
    let source;
    try { source = parseXStatusUrl(url).canonicalUrl; }
    catch { setError("Paste a public X post URL, including /status/ and the post number."); return; }
    setBusy(true); setError(""); setNotice("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch("/api/x-article", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: source }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The article could not be read. Try again or paste its text below.");
      if (typeof data.markdown !== "string" || !data.markdown.trim() || typeof data.filename !== "string") throw new Error("The reader returned no usable content. You can paste the article text below.");
      setResult({ markdown: data.markdown, filename: data.filename.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 100), source, warnings: Array.isArray(data.warnings) ? data.warnings.filter((value: unknown) => typeof value === "string") : [] });
      setNotice("Article ready. Review the output, then copy or download it.");
    } catch (reason) {
      setError(controller.signal.aborted ? "The reader took too long. Try again or paste the article text below." : reason instanceof Error ? reason.message : "The reader is unavailable. Try again or paste the article text below.");
    } finally { window.clearTimeout(timer); setBusy(false); }
  }

  async function copy() {
    if (!result) return;
    try { await navigator.clipboard.writeText(result.markdown); setNotice("Markdown copied."); }
    catch { output.current?.focus(); output.current?.select(); setNotice("The output is selected. Use your device’s Copy command, or download the file."); }
  }

  function download() {
    if (!result) return;
    try {
      const blobUrl = URL.createObjectURL(new Blob([result.markdown], { type: "text/markdown;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = blobUrl; anchor.download = result.filename || "x-article.md";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
      setNotice(`Download requested: ${anchor.download}`);
    } catch { setNotice("The download could not start. Copy or select the Markdown output instead."); }
  }

  return (
    <section aria-labelledby="x-reader-heading" className="mt-12 min-w-0">
      <h2 id="x-reader-heading" className="font-display text-xl font-semibold">Start with a public X link</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        When you choose Read article, the post ID is sent through this site to FxTwitter, a third-party public reader. No X login or paid API key is needed. Private, deleted, or unavailable posts cannot be read. Images remain links to their original hosts.
      </p>
      <form className="mt-6 max-w-3xl" onSubmit={(event) => { event.preventDefault(); void read(); }}>
        <label htmlFor="x-article-url" className="text-sm font-medium">Public X post or article URL</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input id="x-article-url" className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/50" type="url" inputMode="url" placeholder="https://x.com/handle/status/…" maxLength={2000} value={url} onChange={(event) => { setUrl(event.target.value); setError(""); }} disabled={busy} aria-describedby="x-reader-note" />
          <Button type="submit" disabled={busy || !url.trim()} className="min-h-12 rounded-xl">{busy ? "Reading…" : "Read article"}<ArrowRight className="size-4" aria-hidden="true" /></Button>
        </div>
        <p id="x-reader-note" className="mt-3 text-xs leading-5 text-muted-foreground">One public post or article at a time. Complete threads and profile timelines are not included. Output is not saved when you leave.</p>
      </form>
      {error && <p role="alert" className="mt-5 max-w-2xl text-sm leading-6 text-destructive">{error}{result ? " Your previous result is still below." : ""}</p>}
      {result && <div className="mt-8 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h3 className="font-medium">Your extracted article</h3><a href={result.source} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline underline-offset-4">Open original on X</a></div>
        {result.warnings.length > 0 && <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
        <label className="block text-sm font-medium">Extracted Markdown<textarea ref={output} readOnly value={result.markdown} className="mt-2 min-h-96 w-full min-w-0 resize-y rounded-xl border border-border bg-secondary/20 p-4 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-primary/50" /></label>
        <div className="mt-5 flex flex-wrap gap-3"><Button className="min-h-11 rounded-full" onClick={download}><Download className="size-4" aria-hidden="true" /> Download article .md</Button><Button variant="outline" className="min-h-11 rounded-full" onClick={copy}><Copy className="size-4" aria-hidden="true" /> Copy article Markdown</Button></div>
      </div>}
      <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm leading-6 text-muted-foreground">{busy ? "Reading public content…" : notice}</p>
    </section>
  );
}

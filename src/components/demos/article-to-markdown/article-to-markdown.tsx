"use client";

import { useRef, useState } from "react";
import { Copy, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareArticle, type ArticleInput } from "./article-markdown";

const EMPTY: ArticleInput = { title: "", author: "", source: "", body: "", frontmatter: false };
const EXAMPLE: ArticleInput = {
  title: "A smaller, clearer handoff", author: "", source: "", frontmatter: false,
  body: "A useful handoff helps the next person continue without repeating the work.\n\n## Keep three things\n\n- The problem you are solving.\n- What you tried and what happened.\n- The next action and how to check it.\n\nKeep the evidence close to the conclusion. A short note with a concrete result is more useful than a long list of intentions.",
};
const fieldClass = "mt-2 w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export function ArticleToMarkdown() {
  const [input, setInput] = useState<ArticleInput>(EMPTY);
  const [notice, setNotice] = useState("");
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const result = prepareArticle(input);
  const update = (patch: Partial<ArticleInput>) => { setInput((old) => ({ ...old, ...patch })); setNotice(""); };

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.markdown);
      setNotice("Markdown copied. Ready for your notes or an assistant.");
    } catch {
      outputRef.current?.focus();
      outputRef.current?.select();
      setNotice("Clipboard access is unavailable. The output is selected; use your device’s Copy command, or download the file.");
    }
  }
  function download() {
    try {
      const url = URL.createObjectURL(new Blob([result.markdown], { type: "text/markdown;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = result.filename;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setNotice(`Download requested: ${result.filename}`);
    } catch {
      setNotice("The download could not start. You can copy the Markdown output instead.");
    }
  }

  return (
    <div className="mt-10">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Paste text you have copied from an article, including X articles. This pasted-text mode does not fetch X links or recover images and formatting lost when copying. Pasted text stays in your browser; it is not uploaded or saved after you leave.
      </p>
      {!input.body && <Button variant="ghost" className="mt-3 min-h-11 px-0 text-primary" onClick={() => { setInput(EXAMPLE); setNotice("Original example text loaded. Replace it with your own article."); }}>Try a short example <ArrowUpRight className="size-4" aria-hidden="true" /></Button>}

      <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="article-input-heading" className="min-w-0">
          <h2 id="article-input-heading" className="font-display text-xl font-semibold">Your article</h2>
          <div className="mt-5 space-y-5">
            <label className="block text-sm font-medium">Article title (optional)<input className={fieldClass} value={input.title} maxLength={300} onChange={(e) => update({ title: e.target.value })} /></label>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <label className="block min-w-0 text-sm font-medium">Author (optional)<input className={fieldClass} value={input.author} maxLength={200} onChange={(e) => update({ author: e.target.value })} /></label>
              <label className="block min-w-0 text-sm font-medium">Source URL (optional)<input className={fieldClass} type="url" inputMode="url" placeholder="https://x.com/…" value={input.source} maxLength={2000} aria-invalid={!!result.error} aria-describedby={result.error ? "article-source-error" : undefined} onChange={(e) => update({ source: e.target.value })} /></label>
            </div>
            {result.error && <p id="article-source-error" role="alert" className="text-sm leading-6 text-destructive">{result.error}</p>}
            <label className="block text-sm font-medium">Paste article text<textarea className={`${fieldClass} min-h-72 resize-y leading-7`} value={input.body} maxLength={200000} placeholder="Paste the content you want to keep…" onChange={(e) => update({ body: e.target.value })} /></label>
            <p className="text-xs leading-5 text-muted-foreground">Paragraphs, lists, and existing Markdown stay intact. Add # headings or Markdown links in the text when needed. Maximum 200,000 characters.</p>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={input.frontmatter} onChange={(e) => update({ frontmatter: e.target.checked })} /> Include YAML metadata for Obsidian</label>
          </div>
        </section>

        <section aria-labelledby="article-output-heading" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="article-output-heading" className="font-display text-xl font-semibold">Ready to keep</h2><span className="text-xs text-muted-foreground">.md · plain text · portable</span></div>
          <label className="mt-5 block text-sm font-medium">Markdown output<textarea ref={outputRef} readOnly value={result.markdown} placeholder="Your Markdown will appear here as you type." className={`${fieldClass} min-h-96 resize-y bg-secondary/20 font-mono text-sm leading-6`} /></label>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="min-h-11 rounded-full" disabled={!result.markdown} onClick={download}><Download className="size-4" aria-hidden="true" /> Download .md</Button>
            <Button variant="outline" className="min-h-11 rounded-full" disabled={!result.markdown} onClick={copy}><Copy className="size-4" aria-hidden="true" /> Copy Markdown</Button>
          </div>
          <p role="status" aria-live="polite" className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">{notice}</p>
        </section>
      </div>
    </div>
  );
}

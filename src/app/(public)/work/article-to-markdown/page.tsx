import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { ArticleToMarkdown } from "@/components/demos/article-to-markdown/article-to-markdown";
import { XArticleReader } from "@/components/demos/article-to-markdown/x-article-reader";

export const metadata: Metadata = {
  title: "Article to Markdown",
  description: "Read a public X article or paste article text, then keep an attributed Markdown file for your notes or an assistant. No account required.",
};

export default function ArticleToMarkdownPage() {
  return (
    <article className="container mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <Link href="/work" className="mb-12 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Work</Link>
      <header className="max-w-2xl">
        <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground"><FileText className="size-6 text-primary" aria-hidden="true" /> A small tool for keeping what matters</div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Article to Markdown</h1>
        <p className="mt-5 text-xl leading-relaxed text-muted-foreground">From a useful read to a useful file. Keep the words, add the source, and take it into your notes or your next conversation.</p>
      </header>
      <XArticleReader />
      <details className="mt-10 border-t border-border pt-6">
        <summary className="cursor-pointer py-3 font-medium">Or paste article text yourself</summary>
        <ArticleToMarkdown />
      </details>
    </article>
  );
}

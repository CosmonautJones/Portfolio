import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Download, ArrowUpRight } from "lucide-react";
import { resumeMarkdown } from "@/lib/resume-content";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Resume",
  description: "Resume of Travis Jones, AI engineer: eight years of manufacturing ERP software, .NET modernization, and read-only AI tooling for QA and support.",
};

export default function ResumePage() {
  return <div className="container mx-auto max-w-3xl px-6 py-16 sm:py-24">
    <div className="mb-12">
      <PageHeader
        eyebrow="Experience, in detail"
        title="Resume"
        lede="Enterprise modernization, production engineering, and practical AI. Read it here or keep the two-page PDF."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="/resume/Travis-Jones-Resume.pdf" download className="inline-flex h-12 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85"><Download size={16} aria-hidden="true" />Download resume PDF</a>
          <a href="/resume/Travis-Jones-Resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-md border border-[var(--rule-strong)] px-5 text-sm font-semibold transition-colors hover:bg-secondary">Open PDF<ArrowUpRight size={16} aria-hidden="true" /></a>
          <Link href="/contact" className="inline-flex h-12 items-center px-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Get in touch</Link>
        </div>
      </PageHeader>
    </div>
    <article className="resume-document">
      <ReactMarkdown components={{
        h1: ({children}) => <h2 className="mb-3 font-display text-3xl font-bold tracking-tight">{children}</h2>,
        h2: ({children}) => <h2 className="label-mono mb-5 mt-12 border-t border-[var(--rule-strong)] pt-8 !text-foreground">{children}</h2>,
        h3: ({children}) => <h3 className="font-display mb-3 mt-7 text-lg font-bold tracking-tight">{children}</h3>,
        p: ({children}) => <p className="mb-4 text-base leading-7 text-muted-foreground">{children}</p>,
        ul: ({children}) => <ul className="mb-6 list-disc space-y-3 pl-5 text-muted-foreground">{children}</ul>,
        li: ({children}) => <li className="pl-1 leading-7">{children}</li>,
        a: ({children,href}) => <a href={href} className="break-words underline decoration-border underline-offset-4 hover:decoration-foreground">{children}</a>,
      }}>{resumeMarkdown}</ReactMarkdown>
    </article>
  </div>;
}

import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Download, ArrowUpRight } from "lucide-react";
import { resumeMarkdown } from "@/lib/resume-content";

export const metadata: Metadata = {
  title: "Resume",
  description: "Travis Jones's Software Engineer resume: eight years of enterprise software, .NET modernization, and applied AI tooling.",
};

export default function ResumePage() {
  return <div className="container mx-auto max-w-4xl px-6 py-16 sm:py-24">
    <header className="mb-12 border-b border-border pb-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">Experience, in detail</p>
      <h1 className="font-display text-4xl font-bold tracking-tight">Resume</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">My work in enterprise modernization, production engineering, and practical AI. Read it here or keep the two-page PDF.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/resume/Travis-Jones-Resume.pdf" download className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"><Download size={16} />Download resume PDF</a>
        <a href="/resume/Travis-Jones-Resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-3 text-sm">Open PDF<ArrowUpRight size={16} /></a>
        <Link href="/contact" className="inline-flex items-center px-4 py-3 text-sm underline underline-offset-4">Get in touch</Link>
      </div>
    </header>
    <article className="resume-document">
      <ReactMarkdown components={{
        h1: ({children}) => <h2 className="mb-3 font-display text-3xl font-semibold tracking-tight">{children}</h2>,
        h2: ({children}) => <h2 className="mb-5 mt-12 border-t border-border pt-8 text-sm font-semibold tracking-wider">{children}</h2>,
        h3: ({children}) => <h3 className="mb-3 mt-7 text-lg font-semibold">{children}</h3>,
        p: ({children}) => <p className="mb-4 text-base leading-7 text-muted-foreground">{children}</p>,
        ul: ({children}) => <ul className="mb-6 list-disc space-y-3 pl-5 text-muted-foreground">{children}</ul>,
        li: ({children}) => <li className="pl-1 leading-7">{children}</li>,
        a: ({children,href}) => <a href={href} className="break-words underline decoration-border underline-offset-4 hover:decoration-foreground">{children}</a>,
      }}>{resumeMarkdown}</ReactMarkdown>
    </article>
  </div>;
}

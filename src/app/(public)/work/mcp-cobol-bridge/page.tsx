import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "A read-only MCP bridge into COBOL",
  description: "Travis Jones's read-only MCP contribution at Global Shop Solutions, explained alongside a clearly synthetic illustration with fictional code and data.",
};

const steps = [
  ["Ask", "Request the fictional rule ID DEMO-REVIEW-RULE."],
  ["Bound", "Accept an exact known ID. Reject unknown IDs; accept no paths, SQL, or commands."],
  ["Inspect", "Return only the built-in synthetic excerpt and its fictional source label."],
  ["Explain", "Tie the answer to the returned rule instead of guessing at missing behavior."],
];

const excerpt = `*> SYNTHETIC PORTFOLIO EXAMPLE
IF HOLD-FLAG = "Y" OR
   ITEM-COUNT > REVIEW-LIMIT
    MOVE "Y" TO REVIEW-REQUIRED
ELSE
    MOVE "N" TO REVIEW-REQUIRED
END-IF`;

export default function McpCobolBridgePage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <Link href="/work" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to projects
      </Link>
      <PageHeader
        eyebrow="Enterprise contribution / synthetic illustration"
        title="A read-only way into COBOL"
        lede="Making established business behavior easier for QA, Support, and engineering to investigate."
      />
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
        <a href="/downloads/MCP-COBOL-Case-Study.pdf" className="inline-flex min-h-11 items-center underline underline-offset-4">Read the case-study PDF</a>
        <a href="/downloads/illustrate_bridge.py" download className="inline-flex min-h-11 items-center underline underline-offset-4">Download the synthetic Python example</a>
      </div>

      <div className="mt-10 space-y-12 text-base leading-7 text-foreground/90">
        <section aria-labelledby="original-contribution">
          <h2 id="original-contribution" className="label-mono">What I built at Global Shop Solutions</h2>
          <p className="mt-3">I built a security-filtered, read-only Model Context Protocol (MCP) interface to COBOL business logic, and supported it with training and documentation. Eight years of manufacturing ERP work, strongest in COBOL and VB.NET, gave me the context to work with the business behavior behind the code.</p>
          <p className="mt-4">This account establishes the purpose, read-only scope, filtering, and internal audience. The original transport, retrieval method, schemas, authentication, and deployment are not documented in this public case study.</p>
        </section>

        <section aria-labelledby="synthetic-illustration" className="border-l-2 border-[var(--signal)] pl-5 sm:pl-6">
          <h2 id="synthetic-illustration" className="font-display text-2xl font-bold tracking-tight">Proposed illustration: one fictional rule</h2>
          <p className="mt-3 font-medium">The following flow, code, and data are newly authored synthetic examples. They illustrate one possible design and do not reconstruct the GSS implementation.</p>
          <p className="mt-4">A fictional QA question: &ldquo;What makes this example work order require manual review?&rdquo;</p>
          <ol className="mt-6 grid gap-5 sm:grid-cols-2" aria-label="Proposed synthetic lookup flow">
            {steps.map(([title, detail], index) => (
              <li key={title} className="border-t border-border pt-4">
                <h3 className="font-display font-semibold"><span className="mr-2 font-mono text-sm text-[var(--signal)]">0{index + 1}</span>{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
          <figure className="mt-7">
            <figcaption className="label-mono mb-3">Synthetic COBOL excerpt</figcaption>
            <pre className="overflow-x-auto rounded-md border border-border bg-secondary/40 p-4 font-mono text-xs leading-6 sm:text-sm"><code>{excerpt}</code></pre>
          </figure>
          <p className="mt-4">In this fictional rule, a hold flag or an item count above the review limit sets <code className="break-all font-mono text-sm">REVIEW-REQUIRED</code> to Y. Otherwise it is N. The illustration returns a built-in excerpt; it does not execute COBOL or inspect an employer codebase.</p>
        </section>

        <section aria-labelledby="evidence-limits">
          <h2 id="evidence-limits" className="label-mono">Evidence and limits</h2>
          <p className="mt-3">The synthetic companion checks a known-ID response and an unknown-ID rejection. Those checks describe the toy example only. The illustration does not implement the MCP wire protocol, authentication, production filtering, a COBOL runtime, or a complete security design.</p>
          <p className="mt-4">No comparable latency, accuracy, coverage, time-saving, or business-impact measurements are supplied for the original work. Employer source, customer records, internal screenshots, and proprietary architecture are not included.</p>
        </section>

        <section aria-labelledby="engineering-lesson">
          <h2 id="engineering-lesson" className="label-mono">The engineering lesson</h2>
          <p className="mt-3">Understanding legacy behavior comes before modernizing it. A useful assistant interface needs a clear access boundary and enough source context for a person to check the explanation. The public example makes that reasoning inspectable while keeping the original implementation private.</p>
        </section>
      </div>
    </article>
  );
}

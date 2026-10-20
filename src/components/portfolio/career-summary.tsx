import { ArrowUpRight } from "lucide-react";
import { EXPERIENCE } from "@/lib/constants";

export function CareerSummary() {
  const role = EXPERIENCE[0];
  return (
    <section id="experience" aria-labelledby="career-summary-title" className="container mx-auto scroll-mt-24 px-6 py-10 sm:py-12">
      <div className="grid gap-6 border-y border-[var(--rule-strong)] py-8 md:grid-cols-[minmax(11rem,16rem)_1fr] md:gap-12">
        <div>
          <p className="label-mono">Production experience</p>
          <h2 id="career-summary-title" className="font-display mt-3 text-2xl font-bold tracking-tight">{role.organization}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{role.title}</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{role.year}</p>
        </div>
        <div className="max-w-3xl">
          <p className="text-base leading-7 text-foreground/90">Built and supported the business software manufacturing teams depend on, working with system owners across engineering, shipping, sales, payroll, and accounting.</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li><span className="font-semibold text-foreground">Modernization.</span> Contributed to DataLayer modernization across ACU/Fujitsu COBOL, VB.NET, C#/.NET integration, and PSQL while preserving established behavior.</li>
            <li><span className="font-semibold text-foreground">Production quality.</span> Traced defects across legacy and modern code, built regression and integration tooling, and validated fixes before release.</li>
            <li><span className="font-semibold text-foreground">Applied AI.</span> Built a security-filtered, read-only MCP interface to COBOL business logic for QA, Support, and engineering.</li>
          </ul>
          <a href="/about#experience" className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--signal)]">Full experience and education<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RecordedTravosEvidence } from "@/components/portfolio/recorded-travos-evidence";

export const metadata: Metadata = {
  title: "TravOS | Evidence before completion",
  description: "A working engineering prototype that checks artifact evidence separately from a simulated worker's success claim. A bounded local demonstration, with no live model calls.",
};

const checkpoints = [
  {
    state: "Rejected",
    title: "A worker says succeeded. The required file is missing.",
    detail: "A simulated, scripted worker claims success. The verifier rejects the attempt, including the missing-artifact condition. The failed claim and its receipts remain recorded.",
  },
  {
    state: "Held",
    title: "The mission cannot complete on a claim alone.",
    detail: "A completion request is refused because every required task must be done. The operator can inspect the rejected attempt before choosing the next action.",
  },
  {
    state: "Accepted",
    title: "An explicit correction supplies the evidence.",
    detail: "The separately requested fixture correction passes the agreed checks and the mission completes. The original rejection remains unchanged rather than being overwritten.",
  },
];

export default function TravosCasePage() {
  return (
    <article className="container mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <Link href="/work" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to projects
      </Link>
      <PageHeader
        eyebrow="Working engineering prototype"
        title="TravOS: evidence before completion"
        lede="A worker saying done should not be enough to complete a task. This prototype keeps task requirements, artifacts, and acceptance evidence outside the worker's own success claim."
      />

      <section aria-labelledby="demonstration" className="mt-10">
        <h2 id="demonstration" className="label-mono">A bounded local demonstration</h2>
        <p className="mt-3 text-base leading-7 text-foreground/90">The October 20 demonstration uses synthetic tasks and simulated, scripted workers. Its goal is deliberately small: produce an agreed artifact and verify it. It makes three fixture dispatches and zero model-provider calls.</p>
        <ol className="mt-8 divide-y divide-border border-y border-border">
          {checkpoints.map((checkpoint, index) => (
            <li key={checkpoint.state} className="grid gap-3 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6">
              <p className="label-mono text-[var(--signal)]">0{index + 1} / {checkpoint.state}</p>
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">{checkpoint.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{checkpoint.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <RecordedTravosEvidence />
        <a href="/evidence/travos-demo-2026-10-20.json" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--signal)]">
          Inspect the demo evidence summary<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">A sanitized factual summary of the local run. It is not a live execution or a substitute for the retained receipts.</p>
      </section>

      <section aria-labelledby="proven-boundary" className="mt-12 text-base leading-7 text-foreground/90">
        <h2 id="proven-boundary" className="label-mono">What this proves</h2>
        <p className="mt-3">Within this deterministic fixture, a success claim can be rejected, mission completion is held until the checks pass, and a corrected attempt can be accepted without erasing the failed one. It is evidence of a working verification boundary in an engineering prototype.</p>
        <p className="mt-4">This demonstration does not establish live-model reliability, interruption recovery, parallel worker isolation, unattended supervision, or production readiness. A person still has to choose acceptance criteria that represent a useful goal.</p>
      </section>

      <section aria-labelledby="future-direction" className="mt-12 border-t border-[var(--rule-strong)] pt-8 text-base leading-7 text-foreground/90">
        <h2 id="future-direction" className="label-mono">Future direction</h2>
        <p className="mt-3">The longer-term idea is a model-agnostic harness that preserves useful context and lessons as workers change. Compounding learning and broader autonomous operation remain research and development goals. They are separate from the narrow behavior demonstrated above.</p>
      </section>
    </article>
  );
}

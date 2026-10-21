import evidence from "../../../public/evidence/travos-demo-2026-10-20.json";

function RecordedOutcome({
  id,
  title,
  claim,
  observed,
  verdict,
}: {
  id: string;
  title: string;
  claim: string;
  observed: string;
  verdict: string;
}) {
  return (
    <article aria-labelledby={id} className="py-5">
      <h3 id={id} className="font-display text-base font-semibold tracking-tight">{title}</h3>
      <dl className="mt-3 grid gap-3 text-sm leading-6 sm:grid-cols-[1fr_2fr_1fr] sm:gap-5">
        <div className="min-w-0">
          <dt className="label-mono">Claim or request</dt>
          <dd className="mt-1 break-words text-foreground/90">{claim}</dd>
        </div>
        <div className="min-w-0">
          <dt className="label-mono">Observed condition</dt>
          <dd className="mt-1 break-words text-muted-foreground">{observed}</dd>
        </div>
        <div className="min-w-0">
          <dt className="label-mono">Recorded verdict</dt>
          <dd className="mt-1 font-semibold text-[var(--signal)]">{verdict}</dd>
        </div>
      </dl>
    </article>
  );
}

export function RecordedTravosEvidence() {
  return (
    <section aria-labelledby="recorded-travos-evidence-title" className="mt-8 border-y border-border py-6">
      <h2 id="recorded-travos-evidence-title" className="label-mono">Recorded evidence</h2>
      <p className="mt-3 font-medium text-foreground">Recorded synthetic fixture</p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs leading-6 text-muted-foreground" aria-label="Recorded fixture scope">
        <li><time dateTime={evidence.captured_on}>{evidence.captured_on}</time></li>
        <li>{evidence.fixture_dispatch_count} dispatches</li>
        <li>{evidence.provider_dispatch_count} model calls</li>
      </ul>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        This public summary is not a live execution or a replacement for the retained local receipts.
      </p>

      <details className="group mt-4">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-foreground underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--signal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]">
          Inspect recorded outcomes
        </summary>
        <div className="divide-y divide-border border-t border-border">
          <RecordedOutcome
            id="recorded-travos-rejection"
            title="Worker success claim"
            claim={evidence.rejected_attempt.worker_claim}
            observed={evidence.rejected_attempt.observed_missing_artifact_rejection ? "The required artifact was missing." : "No missing artifact was recorded."}
            verdict={evidence.rejected_attempt.overall_pass ? "Accepted" : "Rejected"}
          />
          <RecordedOutcome
            id="recorded-travos-held-completion"
            title="Mission completion request"
            claim="Complete the mission"
            observed={evidence.completion_at_checkpoint.reason.startsWith("mission_incomplete:") ? "Required tasks were not all complete." : evidence.completion_at_checkpoint.reason}
            verdict={evidence.completion_at_checkpoint.refused ? "Held" : "Not held"}
          />
          <RecordedOutcome
            id="recorded-travos-correction"
            title="Explicitly requested correction"
            claim={evidence.explicitly_requested_correction.worker_claim}
            observed={evidence.explicitly_requested_correction.overall_pass ? "Overall verification passed." : "Overall verification did not pass."}
            verdict={evidence.explicitly_requested_correction.overall_pass ? "Accepted" : "Rejected"}
          />
        </div>
        <p className="border-t border-border pt-4 text-sm leading-6 text-foreground/90">
          Final mission status: <strong>{evidence.final_mission_status}</strong>. {evidence.retained_rejection_unchanged ? "Original rejection preserved unchanged." : "Preservation of the original rejection is not recorded."}
        </p>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          The summary records overall outcomes. Exact artifact contents and individual acceptance checks are outside this public summary.
        </p>
      </details>
    </section>
  );
}

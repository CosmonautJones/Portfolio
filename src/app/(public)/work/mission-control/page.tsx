import type { Metadata } from "next";
import { CaseStudy } from "@/components/portfolio/case-study";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "A local control plane for supervised coding agents.",
};

// Portfolio Copy LOCKED Pack A — no uniqueness hype
const SECTIONS = [
  {
    heading: "Problem",
    body:
      "Teams running several coding agents need to see, steer, and answer for what those agents do — not juggle separate terminals with no shared approval record.",
  },
  {
    heading: "Constraints",
    body:
      "• Local-first: no cloud account, no relay\n• Approvals never auto-approved; decisions stay visible to the operator\n• Rails are best-effort accident-prevention, not an adversary-proof security boundary\n• Destructive work still needs OS-level sandboxing",
  },
  {
    heading: "Architecture",
    body:
      "Cockpit (apps/cockpit) over Claude Code’s local state; optional harness rails; shared contracts. Goals split among bounded workers in separate worktrees; verifier loops can reject and retry; Core tabs center a “Needs you” triage queue with risk-typed approve/steer.",
  },
  {
    heading: "Proof",
    body:
      "Bounded worktree teams, verifier loops, approval gates, auditable run evidence. Local-first, no cloud account.",
  },
];

export default function MissionControlCasePage() {
  return (
    <CaseStudy
      title="Mission Control"
      lede="A local control plane for supervised coding agents."
      sections={SECTIONS}
      githubUrl="https://github.com/CosmonautJones/mission-control"
      installHint={`Node 22.13+ — follow the repo README for cockpit at localhost.`}
      tags={["TypeScript", "Node.js", "React", "Python"]}
    />
  );
}

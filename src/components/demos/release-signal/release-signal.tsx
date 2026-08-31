"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Check,
  Clipboard,
  DatabaseBackup,
  MonitorSmartphone,
  PackageCheck,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RELEASE_SCENARIOS,
  buildEvidencePacket,
  createScenarioGates,
  getReleaseSignalStatus,
  type ReleaseGate,
  type ReleaseScenarioId,
  type ReleaseVerdict,
} from "./release-signal-logic";

const scenarioIcons = {
  "ui-change": MonitorSmartphone,
  "data-migration": DatabaseBackup,
  "agent-workflow": Bot,
} satisfies Record<ReleaseScenarioId, typeof MonitorSmartphone>;

const verdictLabels: Record<ReleaseVerdict, string> = {
  hold: "Hold",
  "ready-with-notes": "Ready with notes",
  ready: "Ready",
};

const verdictClasses: Record<ReleaseVerdict, string> = {
  hold: "border-rose-400/35 bg-rose-400/[0.07] text-rose-300",
  "ready-with-notes": "border-amber-300/35 bg-amber-300/[0.07] text-amber-200",
  ready: "border-emerald-400/35 bg-emerald-400/[0.07] text-emerald-300",
};

export function ReleaseSignal() {
  const [scenarioId, setScenarioId] = useState<ReleaseScenarioId>("ui-change");
  const [changeName, setChangeName] = useState("Portfolio project proof upgrades");
  const [gates, setGates] = useState<ReleaseGate[]>(() =>
    createScenarioGates("ui-change")
  );
  const [releaseNote, setReleaseNote] = useState("");
  const [copied, setCopied] = useState(false);

  const scenario = RELEASE_SCENARIOS.find((item) => item.id === scenarioId)!;
  const result = useMemo(
    () => getReleaseSignalStatus(gates, releaseNote),
    [gates, releaseNote]
  );
  const evidencePacket = useMemo(
    () =>
      buildEvidencePacket({
        changeName,
        scenarioLabel: scenario.label,
        gates,
        releaseNote,
      }),
    [changeName, scenario.label, gates, releaseNote]
  );

  function selectScenario(nextId: ReleaseScenarioId) {
    setScenarioId(nextId);
    setGates(createScenarioGates(nextId));
    setReleaseNote("");
    setCopied(false);
  }

  function toggleGate(id: string) {
    setGates((current) =>
      current.map((gate) =>
        gate.id === id ? { ...gate, checked: !gate.checked } : gate
      )
    );
    setCopied(false);
  }

  async function copyEvidence() {
    await navigator.clipboard?.writeText(evidencePacket);
    setCopied(true);
  }

  function reset() {
    setGates(createScenarioGates(scenarioId));
    setReleaseNote("");
    setCopied(false);
  }

  return (
    <section className="mx-auto max-w-5xl" aria-labelledby="release-signal-title">
      <div className="mb-8 max-w-3xl">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Release evidence, not release theater
        </p>
        <h1
          id="release-signal-title"
          className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Release Signal
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Turn a UI change, migration, or agent workflow into a clear go/no-go
          decision and copy the evidence packet into a PR, ticket, or handoff.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-xl border border-border/60 bg-card/55 p-5 sm:p-6">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Change name</span>
            <input
              value={changeName}
              onChange={(event) => {
                setChangeName(event.target.value);
                setCopied(false);
              }}
              className="mt-2 h-10 w-full rounded-lg border border-border/60 bg-background/60 px-3 text-sm outline-none transition-colors focus:border-foreground/50"
            />
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-foreground">Change type</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {RELEASE_SCENARIOS.map((item) => {
                const Icon = scenarioIcons[item.id];
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={scenarioId === item.id ? "secondary" : "outline"}
                    className="h-auto min-h-12 justify-start whitespace-normal px-3 py-2 text-left"
                    aria-pressed={scenarioId === item.id}
                    onClick={() => selectScenario(item.id)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {scenario.description}
            </p>
          </fieldset>

          <div className="mt-5 space-y-3">
            {gates.map((gate) => (
              <label
                key={gate.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  gate.checked
                    ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                    : "border-border/60 bg-background/35 hover:bg-secondary/35"
                )}
              >
                <input
                  type="checkbox"
                  checked={gate.checked}
                  onChange={() => toggleGate(gate.id)}
                  aria-label={gate.label}
                  className="mt-1 h-4 w-4 accent-emerald-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {gate.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {gate.required ? "Release gate" : "Supporting evidence"}
                  </span>
                </span>
                {gate.checked && (
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400" aria-hidden="true" />
                )}
              </label>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-foreground">Release note</span>
            <textarea
              value={releaseNote}
              onChange={(event) => {
                setReleaseNote(event.target.value);
                setCopied(false);
              }}
              placeholder="What was verified, at which release head, and what still needs attention?"
              className="mt-2 min-h-28 w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm leading-relaxed outline-none transition-colors focus:border-foreground/50"
            />
          </label>
        </div>

        <aside className="h-fit rounded-xl border border-border/60 bg-card/55 p-5 sm:p-6">
          <div
            className={cn("rounded-xl border p-4", verdictClasses[result.verdict])}
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-75">
                  Decision
                </p>
                <p
                  data-testid="release-verdict"
                  className="mt-2 text-3xl font-semibold tracking-tight"
                >
                  {verdictLabels[result.verdict]}
                </p>
              </div>
              {result.verdict === "hold" ? (
                <ShieldAlert className="h-8 w-8 opacity-70" aria-hidden="true" />
              ) : (
                <PackageCheck className="h-8 w-8 opacity-70" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-xs leading-5 opacity-80">
              {result.verdict === "hold"
                ? `${result.missingRequired.length} release gate${result.missingRequired.length === 1 ? "" : "s"} still open.`
                : result.verdict === "ready-with-notes"
                  ? "The main path is covered. Record or close the remaining supporting evidence."
                  : "Every gate is checked and the handoff note is recorded."}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-border/60 bg-background/45 p-4">
            <div className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>Evidence coverage</span>
              <span>{result.completed}/{result.total}</span>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-label="Evidence coverage"
              aria-valuemin={0}
              aria-valuemax={result.total}
              aria-valuenow={result.completed}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width]"
                style={{ width: `${(result.completed / result.total) * 100}%` }}
              />
            </div>
            {result.missingRequired.length > 0 && (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Open gates: {result.missingRequired.join(", ")}
              </p>
            )}
          </div>

          <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
            {evidencePacket}
          </pre>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={copyEvidence}>
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              {copied ? "Evidence copied" : "Copy evidence"}
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset checks
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}

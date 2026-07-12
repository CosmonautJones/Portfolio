"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, FileText, PackageCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getReleaseSignalStatus,
  type ReleaseGate,
} from "./release-signal-logic";
import { cn } from "@/lib/utils";

const artifactTypes = [
  "Feature branch",
  "UI polish",
  "Open-source package",
] as const;

const gateTemplates = [
  { id: "scope", label: "Scope is clear", required: true },
  { id: "happy-path", label: "Happy path is verified", required: true },
  { id: "rough-edges", label: "Known rough edges are named", required: true },
  { id: "copy", label: "Copy reads like a person wrote it", required: false },
  { id: "handoff", label: "Handoff notes are useful", required: false },
] as const;

function createGates(): ReleaseGate[] {
  return gateTemplates.map((gate) => ({ ...gate, checked: false }));
}

export function ReleaseSignal() {
  const [artifactType, setArtifactType] = useState<(typeof artifactTypes)[number]>(
    artifactTypes[0]
  );
  const [gates, setGates] = useState<ReleaseGate[]>(createGates);
  const [releaseNote, setReleaseNote] = useState(
    "Small release with the main path checked and notes for anything still sharp."
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => getReleaseSignalStatus(gates), [gates]);
  const summary = [
    `${artifactType}: ${result.ready ? "Ready" : "Needs work"}`,
    `${result.completed}/${result.total} checks complete.`,
    result.missingRequired.length > 0
      ? `Still missing: ${result.missingRequired.join(", ")}.`
      : "Required checks are covered.",
    `Note: ${releaseNote.trim() || "No release note yet."}`,
  ].join("\n");

  function toggleGate(id: string) {
    setGates((current) =>
      current.map((gate) =>
        gate.id === id ? { ...gate, checked: !gate.checked } : gate
      )
    );
  }

  async function copySummary() {
    setCopied(false);
    await navigator.clipboard?.writeText(summary);
    setCopied(true);
  }

  function reset() {
    setGates(createGates());
    setReleaseNote("");
    setCopied(false);
  }

  return (
    <section className="mx-auto max-w-5xl" aria-labelledby="release-signal-title">
      <div className="mb-8">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Small thing to try
        </p>
        <h1 id="release-signal-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Release Signal
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A local checklist for deciding whether a piece of work is ready to hand over, or just close.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-border/60 bg-card/45 p-5">
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Artifact type">
            {artifactTypes.map((type) => (
              <Button
                key={type}
                type="button"
                variant={artifactType === type ? "secondary" : "outline"}
                size="sm"
                onClick={() => setArtifactType(type)}
              >
                <FileText className="h-4 w-4" />
                {type}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {gates.map((gate) => (
              <label
                key={gate.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  gate.checked
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border/60 bg-background/35 hover:bg-secondary/45"
                )}
              >
                <input
                  type="checkbox"
                  checked={gate.checked}
                  onChange={() => toggleGate(gate.id)}
                  className="mt-1 h-4 w-4 accent-emerald-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {gate.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {gate.required ? "Required" : "Helpful"}
                  </span>
                </span>
                {gate.checked && <Check className="mt-0.5 h-4 w-4 text-emerald-400" />}
              </label>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-foreground">Release note</span>
            <textarea
              value={releaseNote}
              onChange={(event) => setReleaseNote(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-lg border border-border/60 bg-background/60 p-3 text-sm leading-relaxed outline-none transition-colors focus:border-foreground/50"
            />
          </label>
        </div>

        <aside className="rounded-lg border border-border/60 bg-card/45 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p
                className={cn(
                  "mt-2 text-3xl font-semibold tracking-tight",
                  result.ready ? "text-emerald-300" : "text-amber-300"
                )}
              >
                {result.ready ? "Ready" : "Needs work"}
              </p>
            </div>
            <PackageCheck className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="mt-6 rounded-lg border border-border/60 bg-background/45 p-4">
            <p className="text-sm font-medium text-foreground">
              {result.completed}/{result.total} checks complete
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width]"
                style={{ width: `${(result.completed / result.total) * 100}%` }}
              />
            </div>
            {result.missingRequired.length > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Missing: {result.missingRequired.join(", ")}
              </p>
            )}
          </div>

          <pre className="mt-5 whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
            {summary}
          </pre>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={copySummary}>
              <Clipboard className="h-4 w-4" />
              {copied ? "Copied" : "Copy summary"}
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}

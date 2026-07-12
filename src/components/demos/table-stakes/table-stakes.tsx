"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatClock,
  getBlindClockState,
  type BlindLevel,
} from "./table-stakes-logic";

const defaultLevels: BlindLevel[] = [
  { id: "level-1", smallBlind: 25, bigBlind: 50, ante: 0, durationSeconds: 600 },
  { id: "level-2", smallBlind: 50, bigBlind: 100, ante: 0, durationSeconds: 600 },
  { id: "level-3", smallBlind: 100, bigBlind: 200, ante: 25, durationSeconds: 600 },
  { id: "level-4", smallBlind: 200, bigBlind: 400, ante: 50, durationSeconds: 600 },
];

export function TableStakes() {
  const [levels, setLevels] = useState<BlindLevel[]>(defaultLevels);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const state = useMemo(() => getBlindClockState(levels, elapsed), [levels, elapsed]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setRunning((value) => !value);
      }
      if (event.key.toLowerCase() === "r") {
        setElapsed(0);
        setRunning(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function updateDuration(index: number, minutes: number) {
    setLevels((current) =>
      current.map((level, levelIndex) =>
        levelIndex === index
          ? { ...level, durationSeconds: Math.max(60, Math.round(minutes * 60)) }
          : level
      )
    );
  }

  function reset() {
    setElapsed(0);
    setRunning(false);
  }

  return (
    <section className="mx-auto max-w-5xl" aria-labelledby="table-stakes-title">
      <div className="mb-8">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Small thing to try
        </p>
        <h1 id="table-stakes-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Table Stakes
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A simple blind clock for a home poker night. Set the pace, start the timer, and keep the table moving.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-border/60 bg-card/45 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Level {state.currentIndex + 1} of {levels.length}
          </p>
          <p className="mt-4 font-mono text-6xl font-semibold tracking-normal sm:text-7xl">
            {formatClock(state.secondsRemaining)}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-lg border border-border/60 bg-background/45 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Blinds
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {state.currentLevel.smallBlind}/{state.currentLevel.bigBlind}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/45 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Ante
              </p>
              <p className="mt-2 text-2xl font-semibold">{state.currentLevel.ante}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Next:{" "}
            {state.nextLevel
              ? `${state.nextLevel.smallBlind}/${state.nextLevel.bigBlind}, ante ${state.nextLevel.ante}`
              : "last level"}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => setRunning((value) => !value)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-card/45 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TimerReset className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Blind levels</h2>
          </div>
          <div className="space-y-3">
            {levels.map((level, index) => (
              <div
                key={level.id}
                className="grid gap-3 rounded-lg border border-border/60 bg-background/35 p-4 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-sm font-medium">
                    Level {index + 1}: {level.smallBlind}/{level.bigBlind}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ante {level.ante}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Minutes</span>
                  <input
                    aria-label={`Level ${index + 1} minutes`}
                    type="number"
                    min={1}
                    value={Math.round(level.durationSeconds / 60)}
                    onChange={(event) => updateDuration(index, Number(event.target.value))}
                    className="h-9 w-20 rounded-md border border-border/60 bg-background px-2 text-foreground outline-none focus:border-foreground/50"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

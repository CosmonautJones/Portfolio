"use client";

import { useEffect, useRef, useState } from "react";
import type { OutputLine } from "@/lib/terminal/types";

function TypewriterText({
  content,
  onComplete,
  onSkip,
}: {
  content: string;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    function step(time: number) {
      if (doneRef.current) return;

      if (time - lastTimeRef.current >= 15) {
        lastTimeRef.current = time;
        const nextChunk = Math.min(indexRef.current + 3, content.length);
        setDisplayed(content.slice(0, nextChunk));
        indexRef.current = nextChunk;

        if (indexRef.current >= content.length) {
          doneRef.current = true;
          onComplete();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [content, onComplete]);

  // Allow click to skip
  useEffect(() => {
    function handleClick() {
      if (!doneRef.current) {
        doneRef.current = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setDisplayed(content);
        onComplete();
        onSkip();
      }
    }

    document.addEventListener("click", handleClick, { once: true });
    return () => document.removeEventListener("click", handleClick);
  }, [content, onComplete, onSkip]);

  return <span>{displayed}</span>;
}

export function TerminalOutput({
  lines,
  isAnimating,
  onAnimationComplete,
}: {
  lines: OutputLine[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
}) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    setCompletedCount(0);
  }, [lines]);

  useEffect(() => {
    if (completedCount >= lines.length && lines.length > 0) {
      onAnimationComplete();
    }
  }, [completedCount, lines.length, onAnimationComplete]);

  return (
    <div className="flex flex-col">
      {lines.map((line, i) => {
        const isActive = isAnimating && i === completedCount;
        const isDone = i < completedCount || !isAnimating;

        if (line.type === "ascii") {
          // ASCII art fades in whole
          return (
            <pre
              key={i}
              className={`whitespace-pre text-xs leading-tight transition-opacity duration-300 ${
                isDone || isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              {line.content}
            </pre>
          );
        }

        const colorClass =
          line.type === "error"
            ? "text-red-400"
            : line.type === "system"
              ? "text-blue-400"
              : "";

        if (isActive) {
          return (
            <div key={i} className={colorClass}>
              <TypewriterText
                content={line.content}
                onComplete={() => setCompletedCount((c) => c + 1)}
                onSkip={onAnimationComplete}
              />
            </div>
          );
        }

        return (
          <div
            key={i}
            className={`${colorClass} ${isDone ? "opacity-100" : "opacity-0"}`}
          >
            {line.content}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useRef, useEffect, useCallback } from "react";
import { useTerminal } from "@/hooks/use-terminal";
import { TerminalOutput } from "./terminal-output";
import { TerminalInput } from "./terminal-input";

interface TerminalShellProps {
  theme?: "main" | "retro";
}

export function TerminalShell({ theme = "main" }: TerminalShellProps) {
  const {
    lines,
    inputValue,
    isAnimating,
    handleKeyDown,
    handleInput,
    skipAnimation,
  } = useTerminal(theme);

  const scrollRef = useRef<HTMLDivElement>(null);

  const prompt =
    theme === "retro" ? "root@halliday:~#" : "guest@travis:~$";

  // Auto-scroll to bottom when lines change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines, inputValue]);

  const handleAnimationComplete = useCallback(() => {
    skipAnimation();
  }, [skipAnimation]);

  return (
    <div
      className="flex h-full flex-col bg-[#0d1117] font-mono text-sm text-foreground"
      onClick={() => {
        // Focus the input on any click within the shell
        const input = scrollRef.current?.querySelector("input");
        input?.focus();
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center py-2">
        <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Scrollable output area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-2 scrollbar-thin"
      >
        {lines.map((line, i) => (
          <div key={i} className="mb-1">
            {line.input !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">{line.prompt}</span>
                <span>{line.input}</span>
              </div>
            )}
            <TerminalOutput
              lines={line.output}
              isAnimating={isAnimating && i === lines.length - 1}
              onAnimationComplete={handleAnimationComplete}
            />
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-white/5 px-4 py-3">
        <TerminalInput
          prompt={prompt}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isAnimating}
        />
      </div>
    </div>
  );
}

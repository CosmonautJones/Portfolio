"use client";

import { useRef, useEffect } from "react";

interface TerminalInputProps {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export function TerminalInput({
  prompt,
  value,
  onChange,
  onKeyDown,
  disabled = false,
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on mount with a small delay for sheet animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex items-center gap-2 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="shrink-0 text-emerald-400 font-mono text-sm">
        {prompt}
      </span>
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none font-mono text-sm"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <div className="font-mono text-sm text-foreground pointer-events-none flex items-center">
          <span>{value}</span>
          <span className="terminal-cursor inline-block w-[8px] h-[1.1em] bg-foreground ml-[1px]" />
        </div>
      </div>
    </div>
  );
}

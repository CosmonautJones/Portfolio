"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { OutputLine, CommandContext } from "@/lib/terminal/types";
import { parseInput } from "@/lib/terminal/parser";
import { CommandHistory } from "@/lib/terminal/history";
import { complete } from "@/lib/terminal/completer";
import { executeCommand, getCommandNames } from "@/lib/terminal/commands";
import { useVisitor } from "@/hooks/use-visitor";
import { useEasterEgg } from "@/hooks/use-easter-egg";

interface TerminalLine {
  prompt: string;
  input?: string;
  output: OutputLine[];
}

interface UseTerminalReturn {
  lines: TerminalLine[];
  inputValue: string;
  isAnimating: boolean;
  handleSubmit: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleInput: (value: string) => void;
  skipAnimation: () => void;
}

export function useTerminal(theme: "main" | "retro"): UseTerminalReturn {
  const { profile } = useVisitor();
  const { discover } = useEasterEgg();
  const historyRef = useRef<CommandHistory | null>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      prompt: "",
      output: [
        {
          type: "system",
          content:
            theme === "retro"
              ? "root@halliday:~# Access granted. Type 'help' to begin."
              : "Welcome to portfolio-shell. Type 'help' to begin.",
        },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingRef = useRef(false);

  // Lazy-init history (needs localStorage)
  useEffect(() => {
    historyRef.current = new CommandHistory();
  }, []);

  const prompt =
    theme === "retro" ? "root@halliday:~#" : "guest@travis:~$";

  const commandNames = getCommandNames(theme);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    if (animatingRef.current) return;

    const { command, args } = parseInput(inputValue);
    historyRef.current?.push(inputValue);
    setHistoryIndex(-1);

    const ctx: CommandContext = {
      theme,
      level: profile?.level ?? 1,
      title: profile?.title ?? "Visitor",
      onDiscover: discover,
    };

    const result = executeCommand(command, args, ctx);

    if (result.clear) {
      setLines([]);
      setInputValue("");
      return;
    }

    setIsAnimating(true);
    animatingRef.current = true;

    setLines((prev) => [
      ...prev,
      {
        prompt,
        input: inputValue,
        output: result.output,
      },
    ]);

    setInputValue("");

    // End animation after a delay based on content length
    const totalChars = result.output.reduce(
      (sum, line) => sum + line.content.length,
      0
    );
    const duration = Math.min(totalChars * 15, 3000);

    setTimeout(() => {
      setIsAnimating(false);
      animatingRef.current = false;
    }, duration);
  }, [inputValue, theme, prompt, profile, discover]);

  const skipAnimation = useCallback(() => {
    setIsAnimating(false);
    animatingRef.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const history = historyRef.current;
        if (!history) return;
        const nextIdx = historyIndex + 1;
        const entry = history.get(nextIdx);
        if (entry !== undefined) {
          setHistoryIndex(nextIdx);
          setInputValue(entry);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex <= 0) {
          setHistoryIndex(-1);
          setInputValue("");
        } else {
          const prevIdx = historyIndex - 1;
          const entry = historyRef.current?.get(prevIdx);
          if (entry !== undefined) {
            setHistoryIndex(prevIdx);
            setInputValue(entry);
          }
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const { completed, suggestions } = complete(inputValue, commandNames);
        if (completed) {
          setInputValue(completed + " ");
        } else if (suggestions.length > 0) {
          setLines((prev) => [
            ...prev,
            {
              prompt,
              input: inputValue,
              output: [
                { type: "system", content: suggestions.join("  ") },
              ],
            },
          ]);
        }
      }
    },
    [handleSubmit, historyIndex, inputValue, commandNames, prompt]
  );

  const handleInput = useCallback((value: string) => {
    setInputValue(value);
    setHistoryIndex(-1);
  }, []);

  return {
    lines,
    inputValue,
    isAnimating,
    handleSubmit,
    handleKeyDown,
    handleInput,
    skipAnimation,
  };
}

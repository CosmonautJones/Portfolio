"use client";

import { use, useRef } from "react";
import { SquareTerminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalContext } from "./terminal-provider";
import { useVisitor } from "@/hooks/use-visitor";

export function TerminalToggle() {
  const { setIsOpen } = use(TerminalContext);
  const { awardXP } = useVisitor();
  const tracked = useRef(false);

  function handleClick() {
    setIsOpen(true);
    if (!tracked.current) {
      tracked.current = true;
      awardXP("open_terminal");
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
      onClick={handleClick}
    >
      <SquareTerminal className="h-4 w-4" />
      <span className="sr-only">Open terminal</span>
    </Button>
  );
}

"use client";

import { use } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { TerminalContext } from "./terminal-provider";
import { TerminalShell } from "./terminal-shell";

export function TerminalSheet() {
  const { isOpen, setIsOpen } = use(TerminalContext);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[60vh] max-h-[60vh] p-0 border-t border-white/10"
      >
        <SheetTitle className="sr-only">Terminal</SheetTitle>
        <TerminalShell theme="main" />
      </SheetContent>
    </Sheet>
  );
}

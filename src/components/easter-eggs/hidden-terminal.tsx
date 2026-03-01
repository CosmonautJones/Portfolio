"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { useEasterEgg } from "@/hooks/use-easter-egg";

interface HiddenTerminalProps {
  open: boolean;
  onClose: () => void;
}

export function HiddenTerminal({ open, onClose }: HiddenTerminalProps) {
  const { discover } = useEasterEgg();
  const discoveredRef = useRef(false);

  useEffect(() => {
    if (open && !discoveredRef.current) {
      discoveredRef.current = true;
      discover("hidden_terminal");
    }
  }, [open, discover]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[640px] h-[420px] p-0 overflow-hidden border-emerald-500/30"
        style={{
          background: "#0a0a0a",
          boxShadow: "0 0 30px rgba(0,255,65,0.1), 0 0 60px rgba(0,255,65,0.05)",
        }}
      >
        <DialogTitle className="sr-only">Hidden Terminal</DialogTitle>
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          }}
        />
        <div
          className="h-full"
          style={{
            color: "#00ff41",
            textShadow: "0 0 5px rgba(0,255,65,0.4)",
            fontFamily: '"Courier New", monospace',
          }}
        >
          <TerminalShell theme="retro" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

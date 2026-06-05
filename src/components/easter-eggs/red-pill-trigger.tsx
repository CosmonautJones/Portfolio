"use client";

import { useCallback, useState } from "react";
import { useKeySequence } from "@/hooks/use-key-sequence";
import { useVisitor } from "@/hooks/use-visitor";
import { RED_PILL_SEQUENCE } from "@/lib/easter-eggs/red-pill";
import { HiddenTerminal } from "@/components/easter-eggs/hidden-terminal";

/**
 * Global mount for the "Red Pill" easter egg. Listens for the hidden
 * key sequence (type "redpill"), opens the secret terminal, and awards the
 * open_hidden_terminal XP. The HiddenTerminal itself fires the
 * hidden_terminal discovery (and red_pill achievement) when it opens.
 */
export function RedPillTrigger() {
  const [open, setOpen] = useState(false);
  const { awardXP } = useVisitor();

  const onMatch = useCallback(() => {
    setOpen(true);
    awardXP("open_hidden_terminal");
  }, [awardXP]);

  useKeySequence(RED_PILL_SEQUENCE, onMatch, { timeout: 3000 });

  return <HiddenTerminal open={open} onClose={() => setOpen(false)} />;
}

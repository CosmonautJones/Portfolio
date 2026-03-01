"use client";

import { useState, useCallback } from "react";
import { useKeySequence } from "@/hooks/use-key-sequence";
import { useEasterEgg } from "@/hooks/use-easter-egg";
import { KONAMI_SEQUENCE } from "@/lib/easter-eggs/konami";

export function useKonami() {
  const [triggered, setTriggered] = useState(false);
  const { discover } = useEasterEgg();

  const onMatch = useCallback(() => {
    setTriggered(true);
    discover("konami_code");

    // Auto-dismiss after effect duration
    setTimeout(() => setTriggered(false), 3000);
  }, [discover]);

  useKeySequence(KONAMI_SEQUENCE, onMatch);

  return { triggered };
}

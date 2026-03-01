"use client";

import { useEffect, useRef } from "react";

interface UseKeySequenceOptions {
  timeout?: number;
}

/**
 * Generic ordered-key-sequence detector.
 * Fires `onMatch` when the full sequence is entered within the timeout window.
 */
export function useKeySequence(
  sequence: readonly string[],
  onMatch: () => void,
  { timeout = 2000 }: UseKeySequenceOptions = {}
) {
  const posRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      posRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      const expected = sequence[posRef.current];
      if (e.key === expected) {
        posRef.current++;

        // Reset timeout
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(reset, timeout);

        if (posRef.current === sequence.length) {
          reset();
          onMatch();
        }
      } else {
        reset();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sequence, onMatch, timeout]);
}

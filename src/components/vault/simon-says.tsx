"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEasterEgg } from "@/hooks/use-easter-egg";

type GameState = "idle" | "showing" | "player_turn" | "complete" | "failed";

const COLORS = [
  { name: "red", bg: "#ef4444", active: "#f87171", tone: 261 },
  { name: "green", bg: "#22c55e", active: "#4ade80", tone: 329 },
  { name: "blue", bg: "#3b82f6", active: "#60a5fa", tone: 392 },
  { name: "yellow", bg: "#eab308", active: "#facc15", tone: 523 },
];

const TOTAL_ROUNDS = 5;

function playTone(frequency: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio unavailable
  }
}

export function SimonSays() {
  const { discover } = useEasterEgg();
  const [state, setState] = useState<GameState>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const discoveredRef = useRef(false);

  const startGame = useCallback(() => {
    const first = Math.floor(Math.random() * 4);
    setSequence([first]);
    setRound(1);
    setPlayerIndex(0);
    setState("showing");
  }, []);

  const addToSequence = useCallback(() => {
    const next = Math.floor(Math.random() * 4);
    setSequence((prev) => [...prev, next]);
    setPlayerIndex(0);
    setState("showing");
  }, []);

  // Show sequence animation
  useEffect(() => {
    if (state !== "showing") return;

    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function showNext() {
      if (i >= sequence.length) {
        timers.push(
          setTimeout(() => {
            setActiveButton(null);
            setState("player_turn");
          }, 300)
        );
        return;
      }

      const colorIdx = sequence[i];
      setActiveButton(colorIdx);
      playTone(COLORS[colorIdx].tone);

      timers.push(
        setTimeout(() => {
          setActiveButton(null);
          i++;
          timers.push(setTimeout(showNext, 300));
        }, 600)
      );
    }

    timers.push(setTimeout(showNext, 500));

    return () => timers.forEach(clearTimeout);
  }, [state, sequence]);

  const handlePress = useCallback(
    (colorIdx: number) => {
      if (state !== "player_turn") return;

      playTone(COLORS[colorIdx].tone);
      setActiveButton(colorIdx);
      setTimeout(() => setActiveButton(null), 200);

      if (sequence[playerIndex] !== colorIdx) {
        setState("failed");
        return;
      }

      const nextIndex = playerIndex + 1;

      if (nextIndex >= sequence.length) {
        // Round complete
        const nextRound = round + 1;

        if (nextRound > TOTAL_ROUNDS) {
          setState("complete");
          if (!discoveredRef.current) {
            discoveredRef.current = true;
            discover("vault_complete");
          }
          return;
        }

        setRound(nextRound);
        setTimeout(addToSequence, 600);
      } else {
        setPlayerIndex(nextIndex);
      }
    },
    [state, sequence, playerIndex, round, addToSequence, discover]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <h3 className="text-lg font-semibold text-foreground">Simon Says</h3>

      <div className="relative">
        {/* 2x2 grid of buttons */}
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((color, i) => (
            <button
              key={color.name}
              onClick={() => handlePress(i)}
              disabled={state !== "player_turn"}
              className="h-20 w-20 rounded-xl transition-all duration-150 sm:h-24 sm:w-24"
              style={{
                backgroundColor:
                  activeButton === i ? color.active : color.bg,
                opacity: activeButton === i ? 1 : 0.6,
                transform: activeButton === i ? "scale(1.05)" : "scale(1)",
                cursor: state === "player_turn" ? "pointer" : "default",
                boxShadow:
                  activeButton === i
                    ? `0 0 20px ${color.active}50, 0 0 40px ${color.active}20`
                    : "none",
              }}
            />
          ))}
        </div>

        {/* Center counter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border text-sm font-bold">
            {state === "complete" ? (
              <span className="text-emerald-400">!</span>
            ) : state === "idle" ? (
              "?"
            ) : (
              `${round}/${TOTAL_ROUNDS}`
            )}
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center text-sm text-muted-foreground">
        {state === "idle" && (
          <button
            onClick={startGame}
            className="rounded-lg border border-border/50 px-4 py-2 transition-colors hover:bg-secondary"
          >
            Start Game
          </button>
        )}
        {state === "showing" && "Watch the sequence..."}
        {state === "player_turn" && "Your turn! Repeat the pattern."}
        {state === "complete" && (
          <span className="text-emerald-400 font-medium">
            Vault cracked. You&apos;re in.
          </span>
        )}
        {state === "failed" && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-red-400">Wrong! Try again.</span>
            <button
              onClick={startGame}
              className="rounded-lg border border-border/50 px-4 py-2 transition-colors hover:bg-secondary"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

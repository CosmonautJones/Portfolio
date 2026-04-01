"use client";

import { Volume2, VolumeX } from "lucide-react";
import { padScore } from "./game-helpers";

interface GameHUDProps {
  canvasWidth: number;
  score: number;
  level: number;
  coinsCollected: number;
  muted: boolean;
  onToggleMute: () => void;
}

export function GameHUD({
  canvasWidth,
  score,
  level,
  coinsCollected,
  muted,
  onToggleMute,
}: GameHUDProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 pointer-events-none p-2 flex justify-between items-start"
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
      }}
    >
      <div className="flex gap-3">
        <span
          className="font-bold font-mono"
          style={{
            fontSize: canvasWidth * 0.07,
            color: "#f4f4f4",
            textShadow:
              "2px 2px 0 #1a1c2c, -1px -1px 0 #1a1c2c, 1px -1px 0 #1a1c2c, -1px 1px 0 #1a1c2c",
          }}
        >
          {padScore(score)}
        </span>
        <span
          className="font-bold"
          style={{
            fontSize: canvasWidth * 0.055,
            color: "#ffcd75",
            textShadow: "1px 1px 0 #1a1c2c, -1px -1px 0 #1a1c2c",
          }}
        >
          LVL {level}
        </span>
        {coinsCollected > 0 && (
          <span
            className="font-bold font-mono"
            style={{
              fontSize: canvasWidth * 0.05,
              color: "#ffcd75",
              textShadow: "1px 1px 0 #1a1c2c, -1px -1px 0 #1a1c2c",
            }}
          >
            {coinsCollected}
          </span>
        )}
      </div>
      <button
        onClick={onToggleMute}
        className="pointer-events-auto p-1 rounded hover:bg-white/20 transition-colors"
      >
        {muted ? (
          <VolumeX
            className="text-white/70"
            style={{
              width: canvasWidth * 0.06,
              height: canvasWidth * 0.06,
            }}
          />
        ) : (
          <Volume2
            className="text-white/70"
            style={{
              width: canvasWidth * 0.06,
              height: canvasWidth * 0.06,
            }}
          />
        )}
      </button>
    </div>
  );
}

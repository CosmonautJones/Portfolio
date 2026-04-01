"use client";

import { Volume2, VolumeX, Palette } from "lucide-react";
import type { SpriteStyle } from "@/lib/game/sprites/sprite-style";

interface MenuOverlayProps {
  canvasWidth: number;
  muted: boolean;
  spriteStyle: SpriteStyle;
  voxelReady: boolean;
  onToggleMute: () => void;
  onToggleSpriteStyle: () => void;
}

export function MenuOverlay({
  canvasWidth,
  muted,
  spriteStyle,
  voxelReady,
  onToggleMute,
  onToggleSpriteStyle,
}: MenuOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <h1
        className="font-bold text-white mb-4"
        style={{
          fontSize: canvasWidth * 0.08,
          textShadow: "2px 2px 0 #000, -1px -1px 0 #000",
        }}
      >
        ClaudeBot&apos;s Adventure
      </h1>
      <p
        className="text-white mb-2"
        style={{
          fontSize: canvasWidth * 0.05,
          textShadow: "1px 1px 0 #000",
        }}
      >
        Press any key or tap to start
      </p>
      <p
        className="text-gray-300"
        style={{
          fontSize: canvasWidth * 0.04,
          textShadow: "1px 1px 0 #000",
        }}
      >
        WASD or Arrow Keys to move
      </p>
      <div className="pointer-events-auto flex gap-2 mt-4">
        <button
          onClick={onToggleMute}
          className="p-1.5 rounded hover:bg-white/20 transition-colors"
        >
          {muted ? (
            <VolumeX
              className="text-white/50"
              style={{
                width: canvasWidth * 0.06,
                height: canvasWidth * 0.06,
              }}
            />
          ) : (
            <Volume2
              className="text-white/50"
              style={{
                width: canvasWidth * 0.06,
                height: canvasWidth * 0.06,
              }}
            />
          )}
        </button>
        {voxelReady && (
          <button
            onClick={onToggleSpriteStyle}
            className="p-1.5 rounded hover:bg-white/20 transition-colors"
            title={`Sprite style: ${spriteStyle}`}
          >
            <Palette
              className={spriteStyle === "voxel" ? "text-orange-400/80" : "text-white/50"}
              style={{
                width: canvasWidth * 0.06,
                height: canvasWidth * 0.06,
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
}

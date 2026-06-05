"use client";

import { Volume2, VolumeX, Palette, Lock } from "lucide-react";
import type { SpriteStyle } from "@/lib/game/sprites/sprite-style";
import type { SkinId } from "@/lib/game/types";
import { SKINS, getSkinUnlockHint } from "@/lib/game/skins";
import { PALETTE } from "@/lib/game/sprites/palette";

interface MenuOverlayProps {
  canvasWidth: number;
  muted: boolean;
  spriteStyle: SpriteStyle;
  voxelReady: boolean;
  unlockedSkins: SkinId[];
  selectedSkin: SkinId;
  onSelectSkin: (skin: SkinId) => void;
  onToggleMute: () => void;
  onToggleSpriteStyle: () => void;
}

const SKIN_ORDER: SkinId[] = ["default", "golden", "ghost", "diamond", "rainbow"];

/** Representative swatch color for a skin (its body override, else lobster red). */
function skinSwatch(skin: SkinId): string {
  const overrides = SKINS[skin].paletteOverrides;
  const bodyIndex = overrides[17] ?? 17;
  const hex = PALETTE[bodyIndex];
  return hex && hex !== "transparent" ? hex : "#d4513b";
}

export function MenuOverlay({
  canvasWidth,
  muted,
  spriteStyle,
  voxelReady,
  unlockedSkins,
  selectedSkin,
  onSelectSkin,
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

      {/* Skin picker */}
      <div className="pointer-events-auto mt-5 flex flex-col items-center">
        <p
          id="skin-picker-label"
          className="text-white/70 mb-1"
          style={{ fontSize: canvasWidth * 0.032, textShadow: "1px 1px 0 #000" }}
        >
          SKIN
        </p>
        <div
          role="radiogroup"
          aria-labelledby="skin-picker-label"
          className="flex gap-2 flex-wrap justify-center"
        >
          {SKIN_ORDER.map((skin) => {
            const unlocked = unlockedSkins.includes(skin);
            const selected = skin === selectedSkin;
            const name = SKINS[skin].name;
            const label = unlocked
              ? `${name}${selected ? " (selected)" : ""}`
              : `${name} — locked. ${getSkinUnlockHint(skin)}`;
            return (
              <button
                key={skin}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={label}
                title={label}
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) onSelectSkin(skin);
                }}
                className="relative rounded flex items-center justify-center min-w-11 min-h-11 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  border: selected
                    ? "2px solid #ffcd75"
                    : "2px solid rgba(255,255,255,0.25)",
                  background: "rgba(26,28,44,0.7)",
                  opacity: unlocked ? 1 : 0.45,
                  cursor: unlocked ? "pointer" : "not-allowed",
                }}
              >
                <span
                  aria-hidden="true"
                  className="rounded-sm"
                  style={{
                    width: canvasWidth * 0.045,
                    height: canvasWidth * 0.045,
                    background: skinSwatch(skin),
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)",
                  }}
                />
                {!unlocked && (
                  <Lock
                    aria-hidden="true"
                    className="absolute text-white/80"
                    style={{
                      width: canvasWidth * 0.03,
                      height: canvasWidth * 0.03,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-auto flex gap-2 mt-4">
        <button
          onClick={onToggleMute}
          className="p-1.5 rounded hover:bg-white/20 transition-colors min-w-11 min-h-11 flex items-center justify-center"
          aria-label={muted ? "Unmute" : "Mute"}
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
            className="p-1.5 rounded hover:bg-white/20 transition-colors min-w-11 min-h-11 flex items-center justify-center"
            title={`Sprite style: ${spriteStyle}`}
            aria-label="Toggle 2D/3D mode"
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

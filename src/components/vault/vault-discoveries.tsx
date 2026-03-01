"use client";

import { getAllEasterEggs } from "@/lib/easter-eggs/registry";
import { useVisitor } from "@/hooks/use-visitor";
import { Lock, Joystick, Terminal, Egg, Rocket, Compass, Palette } from "lucide-react";
import type { JSX } from "react";

const ICON_MAP: Record<string, JSX.Element> = {
  Joystick: <Joystick className="h-6 w-6" />,
  Terminal: <Terminal className="h-6 w-6" />,
  Egg: <Egg className="h-6 w-6" />,
  Rocket: <Rocket className="h-6 w-6" />,
  Compass: <Compass className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
};

export function VaultDiscoveries() {
  const { profile } = useVisitor();
  const allEggs = getAllEasterEggs();
  const discoveries = profile?.discoveries ?? [];

  return (
    <div className="flex h-full flex-col items-center justify-center p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">
        Hall of Discoveries
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {allEggs.map((egg) => {
          const found = discoveries.includes(egg.id);
          return (
            <div
              key={egg.id}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                found
                  ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                  : "border-border/30 bg-card/30"
              }`}
              style={
                found
                  ? { boxShadow: "0 0 20px rgba(0,255,65,0.05)" }
                  : undefined
              }
            >
              <div
                className={`${found ? "text-emerald-400" : "text-muted-foreground/30"}`}
              >
                {found ? (
                  ICON_MAP[egg.icon] ?? <Egg className="h-6 w-6" />
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  found ? "text-foreground" : "text-muted-foreground/40"
                }`}
              >
                {found ? egg.name : "???"}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {found ? egg.hint : "Keep exploring..."}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorScheme, type ColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/lib/utils";

const SCHEME_CONFIG: Record<
  ColorScheme,
  { label: string; swatchFrom: string; swatchTo: string }
> = {
  midnight: {
    label: "Midnight",
    swatchFrom: "#7c3aed",
    swatchTo: "#22d3ee",
  },
  ocean: {
    label: "Ocean",
    swatchFrom: "#0d9488",
    swatchTo: "#3b82f6",
  },
  ember: {
    label: "Ember",
    swatchFrom: "#d97706",
    swatchTo: "#ef4444",
  },
  emerald: {
    label: "Emerald",
    swatchFrom: "#059669",
    swatchTo: "#0d9488",
  },
};

export function ColorSchemePicker() {
  const { scheme, setScheme, schemes } = useColorScheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Change color scheme"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-2">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Color Scheme
        </p>
        {schemes.map((s) => {
          const config = SCHEME_CONFIG[s];
          const isActive = scheme === s;
          return (
            <button
              key={s}
              onClick={() => setScheme(s)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${config.swatchFrom}, ${config.swatchTo})`,
                }}
              />
              <span className="flex-1 text-left">{config.label}</span>
              {isActive && <Check className="h-3 w-3 shrink-0" />}
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

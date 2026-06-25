"use client";

import { useMemo } from "react";
import { Compass, Lock, CheckCircle2, MapPin } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useVisitor } from "@/hooks/use-visitor";
import { getAllEasterEggs } from "@/lib/easter-eggs/registry";
import { cn } from "@/lib/utils";

export function DiscoveriesPanel() {
  const { profile, isAuthenticated, loading } = useVisitor();
  const eggs = useMemo(() => getAllEasterEggs(), []);
  const discovered = useMemo(
    () => new Set(profile?.discoveries ?? []),
    [profile?.discoveries]
  );

  if (!isAuthenticated || loading) return null;

  const foundCount = eggs.filter((e) => discovered.has(e.id)).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Discoveries"
        >
          <Compass className="h-4 w-4" />
          {foundCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
              {foundCount}
            </span>
          )}
          <span className="sr-only">Discoveries</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            Discoveries
          </SheetTitle>
          <SheetDescription>
            {foundCount} / {eggs.length} secrets found. Locked entries are
            intentional — see if you can shake them loose.
          </SheetDescription>
        </SheetHeader>

        <ul className="space-y-2 p-4">
          {eggs.map((egg) => {
            const found = discovered.has(egg.id);
            const IconComp = getIcon(egg.icon);
            return (
              <li
                key={egg.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  found
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/50 bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    found
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {found ? (
                    <IconComp className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {found ? egg.name : "???"}
                    </p>
                    {found && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs italic text-muted-foreground leading-snug">
                    {egg.hint}
                  </p>
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {found ? egg.location : "Somewhere on the site"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

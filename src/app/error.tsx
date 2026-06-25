"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
      <div className="aurora-bg absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Unhandled exception
      </p>
      <h2 className="gradient-text-animated inline-block text-4xl font-bold tracking-tight sm:text-5xl">
        Something broke
      </h2>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        A component panicked mid-render. You can try again, or bail out and browse
        something else. I&apos;ll get this looked at.
      </p>
      {error.digest && (
        <p className="font-mono text-[10px] text-muted-foreground/70">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          onClick={reset}
          size="lg"
          className="btn-glow h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 rounded-full border-border/60 px-8 transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}

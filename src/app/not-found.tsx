import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lost in space",
  description: "This page drifted off into the void.",
};

const LOST_LINES = [
  "404 — this page took an unscheduled spacewalk.",
  "The page you're looking for isn't here. But there's plenty of good stuff nearby.",
  "Tip: the best things on this site are usually hidden. Try the Konami code.",
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
      <div className="aurora-bg absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Signal lost
      </p>
      <h1 className="gradient-text-animated inline-block text-7xl font-bold tracking-tight sm:text-8xl">
        404
      </h1>
      <div className="max-w-xl space-y-3">
        {LOST_LINES.map((line) => (
          <p key={line} className="text-base leading-relaxed text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="btn-glow h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Earth
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 rounded-full border-border/60 px-8 transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80"
        >
          <Link href="/work">
            <Compass className="mr-2 h-4 w-4" />
            Explore projects
          </Link>
        </Button>
      </div>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        <span className="underline-offset-4 hover:underline">or just head home</span>
      </Link>
      {/* Secret nugget for the curious — inspect element crowd */}
      <span className="sr-only" aria-hidden="true">
        {"{ \"hint\": \"the answer to everything is 42\" }"}
      </span>
    </div>
  );
}

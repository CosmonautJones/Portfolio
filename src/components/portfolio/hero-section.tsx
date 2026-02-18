import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background glow blobs */}
      <div
        className="hero-glow -left-32 -top-32 h-[500px] w-[500px] bg-violet-500/20 dark:bg-violet-500/10"
        style={{ animation: "pulse-glow 8s ease-in-out infinite" }}
      />
      <div
        className="hero-glow -bottom-32 -right-32 h-[400px] w-[400px] bg-cyan-500/20 dark:bg-cyan-500/10"
        style={{ animation: "pulse-glow 8s ease-in-out infinite 4s" }}
      />
      <div
        className="hero-glow left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 bg-indigo-500/15 dark:bg-indigo-500/8"
        style={{ animation: "float 10s ease-in-out infinite" }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Software Developer
        </div>

        <h1 className="gradient-text text-6xl font-extrabold tracking-tight sm:text-8xl">
          {SITE_CONFIG.name}
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
          {SITE_CONFIG.tagline}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:brightness-110 dark:from-violet-500 dark:to-indigo-500">
            <Link href="/work">
              View My Work <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="backdrop-blur-sm">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

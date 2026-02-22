import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function AboutPreview() {
  return (
    <section aria-label="About" className="container mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <h2 className="mb-12 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        About
      </h2>
      <blockquote className="animate-fade-up text-2xl font-semibold leading-relaxed tracking-tight sm:text-3xl">
        &ldquo;A developer who cares about craft, clarity, and shipping things that actually
        work.&rdquo;
      </blockquote>
      <p className="animate-fade-up mt-6 text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "100ms" }}>
        I build full-stack applications with a focus on clean architecture, intuitive interfaces,
        and delivering real value. Curious to learn more?
      </p>
      <div className="animate-fade-up mt-8" style={{ animationDelay: "200ms" }}>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-full border-border/60 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
        >
          <Link href="/about">
            More About Me
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

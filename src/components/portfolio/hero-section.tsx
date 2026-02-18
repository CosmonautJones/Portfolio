import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
        {SITE_CONFIG.name}
      </h1>
      <p className="mt-4 text-xl text-muted-foreground sm:text-2xl">
        {SITE_CONFIG.title}
      </p>
      <p className="mt-2 text-lg text-muted-foreground">
        {SITE_CONFIG.tagline}
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild size="lg">
          <Link href="/work">
            View My Work <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/contact">Get in Touch</Link>
        </Button>
      </div>
    </section>
  );
}

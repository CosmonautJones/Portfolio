import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { ApproachSection } from "@/components/portfolio/approach-section";
import { ExperienceTimeline } from "@/components/portfolio/experience-timeline";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h1 className="gradient-text-animated inline-block text-4xl font-bold tracking-tight sm:text-5xl">
          About Me
        </h1>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>
            I&apos;m a software developer who thrives at the intersection of design and
            engineering. I build full-stack applications with a focus on clean architecture,
            intuitive interfaces, and shipping products that people actually want to use.
          </p>
          <p>
            With experience spanning React, Node.js, Python, and cloud infrastructure, I bring
            ideas to life from concept to deployment. I care deeply about code quality, developer
            experience, and creating software that stands the test of time.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <ApproachSection />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Experience
        </h2>
        <ExperienceTimeline />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tech Stack
        </h2>
        <SkillsGrid />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20 border-t border-border/40 pt-16 text-center">
        <p className="mb-8 text-lg text-muted-foreground">
          Interested in working together or want to see what I&apos;ve built?
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="btn-glow h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <Link href="/work">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-12 rounded-full border-border/60 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </AnimateOnScroll>
    </div>
  );
}

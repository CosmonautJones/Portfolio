import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { ApproachSection } from "@/components/portfolio/approach-section";
import { ExperienceTimeline } from "@/components/portfolio/experience-timeline";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Travis Jones: eight years at Global Shop Solutions, enterprise modernization, read-only AI tooling, and a move from Texas to Michigan.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <AnimateOnScroll>
        <h1 className="gradient-text-animated font-display inline-block text-4xl font-bold tracking-tight sm:text-5xl">
          Hi, I’m Travis.
        </h1>
      </AnimateOnScroll>
      <AnimateOnScroll delay={0.1}>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>
            I’m a software engineer based in the Ann Arbor / Ypsilanti area.
            I spent eight years at Global Shop Solutions, working on the enterprise
            software that manufacturing teams use to run their businesses.
          </p>
          <p>
            My work has taken me from COBOL and VB.NET to C#/.NET interoperability
            and AI tools for QA and support. I enjoy tracing a complicated problem
            through a system, talking it through with the people who know it, and
            making the next change easier to understand.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <h2 id="experience" className="scroll-mt-28 mb-8 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Experience
        </h2>
        <ExperienceTimeline />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <section aria-labelledby="knowledge-tooling" className="space-y-5 text-base leading-relaxed text-muted-foreground">
          <h2 id="knowledge-tooling" className="scroll-mt-28 text-2xl font-semibold tracking-tight text-foreground">AI that helps people understand the work</h2>
          <p>QA and support often need to understand a rule buried in a large codebase. I built a read-only tool using Model Context Protocol (MCP) to make COBOL business logic easier to explore, with filters to strip sensitive data.</p>
          <p>The QA department, support teams, and colleagues outside the core team used it to investigate how the software behaves. I also helped with an internal AI help desk, training sessions, and demos.</p>
          <p className="text-sm">This is a summary of my contribution. Employer source code and internal data are not published here.</p>
        </section>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <ApproachSection />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <h2 className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Tools I work with
        </h2>
        <SkillsGrid />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20">
        <section aria-labelledby="beyond-code" className="space-y-5 text-lg leading-relaxed text-muted-foreground">
          <h2 id="beyond-code" className="text-2xl font-semibold tracking-tight text-foreground">A little beyond the code</h2>
          <p>I recently moved from Texas to Michigan with my family. Outside work, I’m a dad, a tinkerer, and someone who can turn a small curiosity into an evening of building.</p>
          <p>I like electronics, small hardware projects, and figuring out how things fit together. That same curiosity shows up here in the games, browser tools, and experiments alongside my professional experience.</p>
        </section>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-20 border-t border-border/40 pt-16 text-center">
        <p className="mb-8 text-lg text-muted-foreground">
          Looking for someone who can learn an established system and help it evolve? Let’s talk.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="btn-glow h-12 rounded-full bg-foreground px-8 text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
          >
            <Link href="/work">
              See the Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-12 rounded-full border-border/60 px-8 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Link href="/contact">Talk hiring</Link>
          </Button>
        </div>
      </AnimateOnScroll>
    </div>
  );
}

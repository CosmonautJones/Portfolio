import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { ApproachSection } from "@/components/portfolio/approach-section";
import { ExperienceTimeline } from "@/components/portfolio/experience-timeline";
import { ContactBand } from "@/components/portfolio/contact-band";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Travis Jones: eight years at Global Shop Solutions, enterprise modernization, read-only AI tooling, and a move from Texas to Michigan.",
};

const sectionLabel = "label-mono mb-8 scroll-mt-28";

export default function AboutPage() {
  return (
    <>
      <div className="container mx-auto max-w-3xl px-6 pt-16 sm:pt-24">
        <PageHeader
          eyebrow="About"
          title="From COBOL to MCP."
          lede="I’m an AI engineer in the Ann Arbor / Ypsilanti area. I spent eight years at Global Shop Solutions, working on the enterprise software manufacturing teams use to run their businesses."
        />

        <AnimateOnScroll className="mt-10">
          <p className="text-lg leading-relaxed text-muted-foreground">
            My work has taken me from COBOL and VB.NET to C#/.NET interoperability
            and AI tools for QA and support. I enjoy tracing a complicated problem
            through a system, talking it through with the people who know it, and
            making the next change easier to understand.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll className="mt-20">
          <h2 id="experience" className={sectionLabel}>
            Experience
          </h2>
          <ExperienceTimeline />
        </AnimateOnScroll>

        <AnimateOnScroll className="mt-20">
          <section aria-labelledby="knowledge-tooling" className="space-y-5 border-l-2 border-[var(--signal)] pl-6 text-base leading-relaxed text-muted-foreground">
            <p className="label-mono">AI tooling at Global Shop Solutions</p>
            <h2 id="knowledge-tooling" className="font-display scroll-mt-28 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              A read-only way into the COBOL
            </h2>
            <p>QA and support often need to understand a rule buried in a large codebase. I built a read-only tool using Model Context Protocol (MCP) to make COBOL business logic easier to explore, with filters to strip sensitive data.</p>
            <p>The QA department, support teams, and colleagues outside the core team used it to investigate how the software behaves. I also helped with an internal AI help desk, training sessions, and demos.</p>
            <p className="text-sm">This is a summary of my contribution. Employer source code and internal data are not published here.</p>
          </section>
        </AnimateOnScroll>

        <AnimateOnScroll className="mt-20">
          <ApproachSection />
        </AnimateOnScroll>

        <AnimateOnScroll className="mt-20">
          <h2 className={sectionLabel}>Tools I work with</h2>
          <SkillsGrid />
        </AnimateOnScroll>

        <AnimateOnScroll className="mt-20">
          <section aria-labelledby="beyond-code" className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <h2 id="beyond-code" className="label-mono">Outside work</h2>
            <p>I recently moved from Texas to Michigan with my family. Outside work, I’m a dad, a tinkerer, and someone who can turn a small curiosity into an evening of building.</p>
            <p>I like electronics, small hardware projects, and figuring out how things fit together. That same curiosity shows up here in the games, browser tools, and experiments alongside my professional experience.</p>
          </section>
        </AnimateOnScroll>
      </div>

      <div className="mt-20">
        <ContactBand />
      </div>
    </>
  );
}

import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { ApproachSection } from "@/components/portfolio/approach-section";
import { ExperienceTimeline } from "@/components/portfolio/experience-timeline";
import { ContactBand } from "@/components/portfolio/contact-band";
import { PageHeader } from "@/components/layout/page-header";
import type { Metadata } from "next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Travis Jones: Software Engineer | Legacy Modernization & Applied AI. Eight years at Global Shop Solutions, COBOL and VB.NET, a read-only MCP interface, and M-Local UI and QR contribution.",
};

const sectionLabel = "label-mono mb-8 scroll-mt-28";

export default function AboutPage() {
  return (
    <>
      <div className="container mx-auto max-w-3xl px-6 pt-16 sm:pt-24">
        <PageHeader
          eyebrow="About"
          title="From COBOL to MCP."
          lede="I am a software engineer in Ypsilanti, Michigan. I spent eight years at Global Shop Solutions, developing and supporting manufacturing ERP software."
        />

        <AnimateOnScroll className="mt-10">
          <p className="text-lg leading-relaxed text-muted-foreground">
            COBOL and VB.NET are my strongest production languages. I contributed to
            DataLayer modernization connecting ACU/Fujitsu COBOL, VB.NET,
            C#/.NET, and PSQL persistence. My C# experience supports
            integration and modernization work.
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
            <p>I built a security-filtered, read-only interface using Model Context Protocol (MCP) to expose COBOL business logic for QA, Support, and engineering.</p>
            <p>I supported the interface with training and documentation. This work connected established business systems with practical AI tools while keeping the interface read-only.</p>
            <p className="text-sm">This is a summary of my contribution. Employer source code and internal data are not published here.</p>
            <Link href="/work/mcp-cobol-bridge" className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline underline-offset-4">Explore the synthetic case study</Link>
          </section>
        </AnimateOnScroll>

        <AnimateOnScroll className="mt-20">
          <section aria-labelledby="m-local" className="space-y-5 border-l-2 border-[var(--signal)] pl-6 text-base leading-relaxed text-muted-foreground">
            <h2 id="m-local" className="font-display scroll-mt-28 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              M-Local: UI and QR redemption
            </h2>
            <p>M-Local connects U-M students with local business offers. I contributed UI and QR redemption workflows on a four-person, 24-hour hackathon team.</p>
            <p>Our team won Local Impact - Grand Prize at JacHacks a2Tech. My part was the UI and QR redemption workflows.</p>
            <Link href="/work/m-local" className="inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline underline-offset-4">Read the project story and award submission</Link>
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

import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { CareerSummary } from "@/components/portfolio/career-summary";
import { AboutPreview } from "@/components/portfolio/about-preview";
import { ContactBand } from "@/components/portfolio/contact-band";

export const metadata: Metadata = {
  title: { absolute: "Travis Jones | Software Engineer | Legacy Modernization & Applied AI" },
  description:
    "Travis Jones, software engineer in Ypsilanti, Michigan. Eight years in manufacturing ERP, strongest in COBOL and VB.NET, with legacy modernization and applied AI experience.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CareerSummary />
      <FeaturedProjects />
      <AboutPreview />
      <ContactBand />
      <section aria-labelledby="more-to-explore" className="container mx-auto px-6 pb-12">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-border pt-6 text-sm">
          <h2 id="more-to-explore" className="label-mono">More to explore</h2>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation lands on the destination section after the streamed page arrives. */}
          <a href="/work#collection" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">Tools, games, and experiments</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native navigation lands on the destination section after the streamed page arrives. */}
          <a href="/work#activity" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">Activity atlas</a>
        </div>
      </section>
    </>
  );
}

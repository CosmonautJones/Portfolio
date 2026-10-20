import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { ContributionAtlas } from "@/components/portfolio/contribution-atlas";
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
      <FeaturedProjects />
      <ContributionAtlas />
      <AboutPreview />
      <ContactBand />
    </>
  );
}

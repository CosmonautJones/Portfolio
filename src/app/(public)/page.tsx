import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { AboutPreview } from "@/components/portfolio/about-preview";
import { ContactBand } from "@/components/portfolio/contact-band";

export const metadata: Metadata = {
  title: { absolute: "Travis Jones | AI Engineer" },
  description:
    "Travis Jones, AI engineer in Ann Arbor / Ypsilanti, Michigan. Eight years on manufacturing ERP software, now building MCP tools and supervised coding agents.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProjects />
      <AboutPreview />
      <ContactBand />
    </>
  );
}

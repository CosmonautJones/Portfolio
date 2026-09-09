import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { AboutPreview } from "@/components/portfolio/about-preview";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Travis Jones, Michigan-based Software Engineer with eight years in enterprise software, legacy modernization, .NET, and practical AI tooling.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProjects />
      <AboutPreview />
    </>
  );
}

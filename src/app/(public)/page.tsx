import { HeroSection } from "@/components/portfolio/hero-section";
import { WhatIDo } from "@/components/portfolio/what-i-do";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { AboutPreview } from "@/components/portfolio/about-preview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatIDo />
      <FeaturedProjects />
      <AboutPreview />
    </>
  );
}

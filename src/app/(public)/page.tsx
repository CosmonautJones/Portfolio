import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { WhatIDo } from "@/components/portfolio/what-i-do";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { AboutPreview } from "@/components/portfolio/about-preview";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Portfolio of Travis Jones — software developer building clean, impactful products.",
};

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

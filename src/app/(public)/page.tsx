import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { WhatIDo } from "@/components/portfolio/what-i-do";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { AboutPreview } from "@/components/portfolio/about-preview";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Home",
  description:
    "Travis Jones — I build things you actually want to click on. Full-stack developer, game engine tinkerer, easter egg hider.",
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

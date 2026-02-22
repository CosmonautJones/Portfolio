import { SkillsGrid } from "@/components/portfolio/skills-grid";
import { ApproachSection } from "@/components/portfolio/approach-section";
import { ExperienceTimeline } from "@/components/portfolio/experience-timeline";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <h1 className="animate-fade-up gradient-text inline-block text-4xl font-bold tracking-tight sm:text-5xl">
        About Me
      </h1>
      <div className="animate-fade-up delay-100 mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
        <p>
          I&apos;m a software developer who thrives at the intersection of design and
          engineering. I build full-stack applications with a focus on clean architecture,
          intuitive interfaces, and shipping products that people actually want to use.
        </p>
        <p>
          With experience spanning React, Node.js, Python, and cloud infrastructure, I bring
          ideas to life from concept to deployment. I care deeply about code quality, developer
          experience, and creating software that stands the test of time.
        </p>
      </div>

      <div className="animate-fade-up delay-200 mt-20">
        <ApproachSection />
      </div>

      <div className="animate-fade-up mt-20" style={{ animationDelay: "300ms" }}>
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Experience
        </h2>
        <ExperienceTimeline />
      </div>

      <div className="animate-fade-up mt-20" style={{ animationDelay: "400ms" }}>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tech Stack
        </h2>
        <SkillsGrid />
      </div>
    </div>
  );
}

import { SkillsGrid } from "@/components/portfolio/skills-grid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-6 py-24 sm:py-32">
      <h1 className="animate-fade-up gradient-text inline-block text-4xl font-bold tracking-tight sm:text-5xl">
        About Me
      </h1>
      <div className="animate-fade-up delay-100 mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
        <p>
          I am a software developer with a passion for technology. I love taking on challenges
          and building projects that make an impact.
        </p>
        <p>
          I thrive on seeing innovation and collaborating with like-minded individuals
          who aim to make the world a better place. Let&apos;s build something!
        </p>
      </div>

      <div className="animate-fade-up delay-200 mt-20">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tech Stack
        </h2>
        <SkillsGrid />
      </div>
    </div>
  );
}

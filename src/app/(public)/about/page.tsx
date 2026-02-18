import { SkillsGrid } from "@/components/portfolio/skills-grid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="gradient-text mb-8 inline-block text-4xl font-extrabold sm:text-5xl">About Me</h1>
      <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          I am a software developer with a passion for technology. I love taking on challenges
          and building projects that make an impact.
        </p>
        <p>
          I thrive on seeing innovation and collaborating with like-minded individuals
          who aim to make the world a better place. Let&apos;s build something!
        </p>
      </div>
      <h2 className="mb-6 mt-16 text-2xl font-bold">Tech Stack</h2>
      <SkillsGrid />
    </div>
  );
}

import { SKILLS } from "@/lib/constants";

export function SkillsGrid() {
  return (
    <section aria-label="Skills" className="flex flex-wrap gap-2.5">
      {SKILLS.map((skill) => (
        <span
          key={skill}
          className="rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-secondary hover:text-foreground"
        >
          {skill}
        </span>
      ))}
    </section>
  );
}

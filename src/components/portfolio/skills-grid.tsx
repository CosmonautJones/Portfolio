import { Badge } from "@/components/ui/badge";
import { SKILLS } from "@/lib/constants";

export function SkillsGrid() {
  return (
    <div className="flex flex-wrap gap-3">
      {SKILLS.map((skill) => (
        <Badge
          key={skill}
          variant="secondary"
          className="border border-border/50 bg-gradient-to-br from-muted to-muted/50 px-4 py-2 text-sm transition-colors hover:from-violet-100 hover:to-indigo-100 hover:text-violet-700 dark:hover:from-violet-500/15 dark:hover:to-indigo-500/15 dark:hover:text-violet-300"
        >
          {skill}
        </Badge>
      ))}
    </div>
  );
}

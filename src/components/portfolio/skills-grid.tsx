import { Badge } from "@/components/ui/badge";
import { SKILLS } from "@/lib/constants";

export function SkillsGrid() {
  return (
    <div className="flex flex-wrap gap-3">
      {SKILLS.map((skill) => (
        <Badge key={skill} variant="secondary" className="px-4 py-2 text-sm">
          {skill}
        </Badge>
      ))}
    </div>
  );
}

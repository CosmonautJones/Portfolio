import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tool } from "@/lib/types";
import * as Icons from "lucide-react";
import { Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function isLucideIcon(name: string): name is keyof typeof Icons {
  return name in Icons && typeof (Icons as Record<string, unknown>)[name] === "function";
}

const typeStyles = {
  internal: {
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  external: {
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  embedded: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
} as const;

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const iconName = toPascalCase(tool.icon || "wrench");
  const IconComponent: LucideIcon = isLucideIcon(iconName)
    ? (Icons[iconName] as LucideIcon)
    : Wrench;

  const styles = typeStyles[tool.type] ?? typeStyles.internal;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="gradient-border hover-shadow-accent h-full bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-500 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg}`}>
            <IconComponent className={`h-5 w-5 ${styles.iconText}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
              {tool.type}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
          {tool.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tool.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

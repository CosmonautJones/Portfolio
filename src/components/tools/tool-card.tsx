import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/types";
import * as Icons from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  // Dynamically get icon — fallback to Wrench
  const iconName = toPascalCase(tool.icon || "wrench");
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] ?? Icons.Wrench;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="h-full transition-colors hover:border-foreground/20">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              {tool.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
          {tool.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
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

"use client";

import { Suspense } from "react";
import { getInternalToolComponent } from "@/lib/tools-registry";
import { ExternalToolFrame } from "@/components/tools/external-tool-frame";
import type { Tool } from "@/lib/types";

interface ToolRendererProps {
  tool: Tool;
}

export function ToolRenderer({ tool }: ToolRendererProps) {
  if (tool.status === "disabled") {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">This tool is currently disabled.</p>
      </div>
    );
  }

  if (tool.type === "external" && tool.url) {
    return <ExternalToolFrame tool={tool} />;
  }

  const ToolComponent = getInternalToolComponent(tool.slug);
  if (!ToolComponent) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">
          Tool component not found for &quot;{tool.slug}&quot;.
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ToolComponent />
    </Suspense>
  );
}

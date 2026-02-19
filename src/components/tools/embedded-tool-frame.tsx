"use client";

import { Package } from "lucide-react";
import type { Tool } from "@/lib/types";

interface EmbeddedToolFrameProps {
  tool: Tool;
}

export function EmbeddedToolFrame({ tool }: EmbeddedToolFrameProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
        <Package className="h-4 w-4 text-primary" />
        <span>This tool is embedded from its source repository.</span>
      </div>
      <iframe
        src={`/api/embed/${tool.slug}`}
        className="h-[calc(100vh-16rem)] w-full rounded-lg border"
        title={tool.name}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

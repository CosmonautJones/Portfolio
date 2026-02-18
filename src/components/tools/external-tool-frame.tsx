"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ExternalToolFrameProps {
  tool: Tool;
}

export function ExternalToolFrame({ tool }: ExternalToolFrameProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <span>This tool is loaded from an external source.</span>
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <a href={tool.url!} target="_blank" rel="noopener noreferrer">
            Open in new tab <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
      <iframe
        src={tool.url!}
        className="h-[calc(100vh-16rem)] w-full rounded-lg border"
        title={tool.name}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

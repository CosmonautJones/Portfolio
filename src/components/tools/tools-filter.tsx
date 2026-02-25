"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tools/tool-card";
import type { Tool } from "@/lib/types";

const typeConfig = {
  internal: {
    label: "Internal",
    active: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    inactive: "bg-transparent text-muted-foreground border-border hover:bg-violet-500/5",
  },
  external: {
    label: "External",
    active: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    inactive: "bg-transparent text-muted-foreground border-border hover:bg-sky-500/5",
  },
  embedded: {
    label: "Embedded",
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    inactive: "bg-transparent text-muted-foreground border-border hover:bg-emerald-500/5",
  },
} as const;

const toolTypes: Array<Tool["type"]> = ["internal", "external", "embedded"];

interface ToolsFilterProps {
  tools: Tool[];
}

export function ToolsFilter({ tools }: ToolsFilterProps) {
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<Tool["type"]>>(
    () => new Set(toolTypes)
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const tool of tools) {
      for (const tag of tool.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [tools]);

  const filteredTools = useMemo(() => {
    const q = query.toLowerCase();
    return tools
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
      .filter((t) => activeTypes.has(t.type))
      .filter(
        (t) =>
          selectedTags.length === 0 ||
          t.tags?.some((tag) => selectedTags.includes(tag))
      );
  }, [tools, query, activeTypes, selectedTags]);

  const hasActiveFilters =
    query !== "" ||
    activeTypes.size !== toolTypes.length ||
    selectedTags.length > 0;

  function toggleType(type: Tool["type"]) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setQuery("");
    setActiveTypes(new Set(toolTypes));
    setSelectedTags([]);
  }

  return (
    <div className="space-y-6">
      {/* Search and controls */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {toolTypes.map((type) => {
            const config = typeConfig[type];
            const isActive = activeTypes.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive ? config.active : config.inactive
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Results count and clear */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTools.length} of {tools.length} tools
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Tool grid */}
      {filteredTools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool, i) => (
            <div
              key={tool.id}
              className="animate-scale-in"
              style={{ animationDelay: `${Math.min((i + 1) * 100, 700)}ms` }}
            >
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          No tools match your filters
        </p>
      )}
    </div>
  );
}

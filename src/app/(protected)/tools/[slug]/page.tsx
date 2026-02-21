import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { Tool } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: tool } = await supabase
    .from("tools")
    .select("name, description")
    .eq("slug", slug)
    .single();
  return {
    title: tool?.name ?? "Tool",
    description: tool?.description ?? undefined,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const tool = data as Tool;

  const badgeColors = {
    internal: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    external: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    embedded: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  } as const;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="animate-fade-up">
        <Breadcrumb items={[
          { label: "Tools", href: "/tools" },
          { label: tool.name },
        ]} />
        <h1 className="gradient-text mb-2 text-3xl font-bold">{tool.name}</h1>
        {tool.description && (
          <div className="mb-8 flex items-center gap-3">
            <p className="text-muted-foreground">{tool.description}</p>
            <span className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColors[tool.type] ?? badgeColors.internal}`}>
              {tool.type}
            </span>
          </div>
        )}
      </div>
      <ToolRenderer tool={tool} />
    </div>
  );
}

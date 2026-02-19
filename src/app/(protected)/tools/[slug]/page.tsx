import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ToolRenderer } from "@/components/tools/tool-renderer";
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

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{tool.name}</h1>
      {tool.description && (
        <p className="mb-8 text-muted-foreground">{tool.description}</p>
      )}
      <ToolRenderer tool={tool} />
    </div>
  );
}

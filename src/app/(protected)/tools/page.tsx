import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ToolCard } from "@/components/tools/tool-card";
import type { Tool } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tools" };

async function ToolsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  let query = supabase.from("tools").select("*").order("created_at", { ascending: true });
  if (!isAdmin) {
    query = query.eq("status", "enabled");
  }

  const { data: tools } = await query;
  const items = (tools ?? []) as Tool[];

  if (items.length === 0) {
    return <p className="text-muted-foreground">No tools available.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Tools</h1>
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <ToolsList />
      </Suspense>
    </div>
  );
}

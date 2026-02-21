import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ToolCard } from "@/components/tools/tool-card";
import { isAdminEmail } from "@/lib/utils";
import type { Tool } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tools" };

async function ToolsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);

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
      {items.map((tool, i) => (
        <div key={tool.id} className={`animate-scale-in delay-${Math.min((i + 1) * 100, 700)}`}>
          <ToolCard tool={tool} />
        </div>
      ))}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="gradient-text animate-fade-up mb-8 text-3xl font-bold">Tools</h1>
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-14 rounded-full bg-muted" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
                <div className="mt-3 flex gap-1">
                  <div className="h-5 w-12 rounded-full bg-muted" />
                  <div className="h-5 w-16 rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ToolsList />
      </Suspense>
    </div>
  );
}

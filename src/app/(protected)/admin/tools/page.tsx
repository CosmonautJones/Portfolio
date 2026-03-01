import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ToolsTable } from "@/components/admin/tools-table";
import { ToolFormDialog } from "@/components/admin/tool-form-dialog";
import type { Tool } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Tools" };

async function AdminToolsList() {
  const supabase = await createClient();
  const { data: tools, error } = await supabase
    .from("tools")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="text-destructive">Failed to load tools.</p>;
  }

  const items = (tools ?? []) as Tool[];

  if (items.length === 0) {
    return <p className="text-muted-foreground">No tools yet. Create one above.</p>;
  }

  return <ToolsTable tools={items} />;
}

export default function AdminToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="gradient-text animate-fade-up text-3xl font-bold">Manage Tools</h1>
        <ToolFormDialog />
      </div>
      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-4">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
                <div className="h-6 w-16 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        }
      >
        <AdminToolsList />
      </Suspense>
    </div>
  );
}

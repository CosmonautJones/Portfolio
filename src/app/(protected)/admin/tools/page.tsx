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
        <h1 className="text-3xl font-bold">Manage Tools</h1>
        <ToolFormDialog />
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }
      >
        <AdminToolsList />
      </Suspense>
    </div>
  );
}

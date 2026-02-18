import { createClient } from "@/lib/supabase/server";
import { ToolsTable } from "@/components/admin/tools-table";
import { ToolFormDialog } from "@/components/admin/tool-form-dialog";
import type { Tool } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Tools" };

export default async function AdminToolsPage() {
  const supabase = await createClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Tools</h1>
        <ToolFormDialog />
      </div>
      {(!tools || tools.length === 0) ? (
        <p className="text-muted-foreground">No tools yet. Create one above.</p>
      ) : (
        <ToolsTable tools={tools as Tool[]} />
      )}
    </div>
  );
}

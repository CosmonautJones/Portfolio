import { createClient } from "@/lib/supabase/server";
import { ToolCard } from "@/components/tools/tool-card";
import type { Tool } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tools" };

export default async function ToolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.email === process.env.ADMIN_EMAIL;

  let query = supabase.from("tools").select("*").order("created_at", { ascending: true });
  if (!isAdmin) {
    query = query.eq("status", "enabled");
  }

  const { data: tools } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Tools</h1>
      {(!tools || tools.length === 0) ? (
        <p className="text-muted-foreground">No tools available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(tools as Tool[]).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

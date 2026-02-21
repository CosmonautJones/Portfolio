import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ToolsFilter } from "@/components/tools/tools-filter";
import { isAdminEmail } from "@/lib/utils";
import { Wrench } from "lucide-react";
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
    return (
      <div className="animate-fade-up flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Wrench className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h2 className="gradient-text mb-2 text-xl font-semibold">No tools yet</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tools will appear here once they&apos;ve been added to the hub.
        </p>
      </div>
    );
  }

  return <ToolsFilter tools={items} />;
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

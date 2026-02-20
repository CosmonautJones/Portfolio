import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: tool, error } = await supabase
    .from("tools")
    .select("html_content, status, type")
    .eq("slug", slug)
    .eq("type", "embedded")
    .single();

  if (error || !tool) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tool.status === "disabled") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(tool.html_content, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none';",
    },
  });
}

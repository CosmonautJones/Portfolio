"use server";

import { createClient } from "@/lib/supabase/server";

export async function triggerDeploy(buildHookUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
    return { error: "Unauthorized" };
  }

  try {
    const response = await fetch(buildHookUrl, { method: "POST" });
    if (!response.ok) return { error: `Deploy failed: ${response.statusText}` };
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to trigger deploy" };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export async function triggerDeploy(buildHookUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
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

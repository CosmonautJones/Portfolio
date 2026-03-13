"use server";

import { withAdmin } from "@/actions/utils";

export async function triggerDeploy(buildHookUrl: string) {
  return withAdmin(async () => {
    const response = await fetch(buildHookUrl, { method: "POST" });
    if (!response.ok) return { error: `Deploy failed: ${response.statusText}` };
    return { success: true };
  });
}

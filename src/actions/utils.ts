import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type ActionResult<T> = T | { error: string };

export async function withAuth<T>(
  fn: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };
    return await fn(user, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function withAdmin<T>(
  fn: (user: User, supabase: SupabaseClient) => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) return { error: "Unauthorized" };
    return await fn(user, supabase);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

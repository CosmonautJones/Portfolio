"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email);
}

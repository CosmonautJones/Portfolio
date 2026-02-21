import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export default async function AdventureLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAdmin={isAdmin} />
      <main id="main-content" className="flex-1">{children}</main>
    </div>
  );
}

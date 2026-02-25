import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="aurora-bg" aria-hidden="true" />
      <Navbar isAdmin={isAdmin} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

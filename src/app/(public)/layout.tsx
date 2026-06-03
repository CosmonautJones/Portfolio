import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAdmin = isAdminEmail(data?.claims?.email as string | undefined);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="aurora-bg" aria-hidden="true" />
      <Navbar isAdmin={isAdmin} />
      <ScrollProgress />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

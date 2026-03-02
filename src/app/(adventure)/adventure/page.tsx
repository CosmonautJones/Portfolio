import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdventureShell } from "@/components/adventure/AdventureShell";
import { WelcomeBanner } from "@/components/adventure/welcome-banner";

export const metadata: Metadata = { title: "Adventure" };

export default function AdventurePage() {
  return (
    <div className="relative flex h-[calc(100dvh-3.5rem)] items-center justify-center bg-black">
      <Link
        href="/work"
        className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/50 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white/90"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Projects
      </Link>
      <WelcomeBanner />
      <AdventureShell />
    </div>
  );
}

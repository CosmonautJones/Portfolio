import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoryForge } from "@/components/demos/story-forge/story-forge";

export const metadata: Metadata = {
  title: "Cosmonaut Story Forge",
  description:
    "A pass-the-phone family storytelling game built around deterministic story dice, themed prompt decks, seeded replays, and a tiny local Story Vault.",
};

export default function StoryForgePage() {
  return (
    <div className="relative">
      <Link
        href="/work"
        className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Projects
      </Link>
      <StoryForge />
    </div>
  );
}

import type { Metadata } from "next";
import GameCanvas from "@/components/adventure/GameCanvas";

export const metadata: Metadata = { title: "Adventure" };

export default function AdventurePage() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-black">
      <GameCanvas />
    </div>
  );
}

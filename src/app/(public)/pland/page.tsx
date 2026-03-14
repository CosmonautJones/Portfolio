import type { Metadata } from "next";
import { PlandApp } from "@/components/pland/pland-app";

export const metadata: Metadata = { title: "Plan'd — Trip Planner" };

export default function PlandPage() {
  return (
    <div className="container mx-auto px-6 py-24 sm:py-32">
      <PlandApp />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "LoopedIn — Family Plans" };

export default function PlandPage() {
  redirect("https://loopedin-family.netlify.app");
}

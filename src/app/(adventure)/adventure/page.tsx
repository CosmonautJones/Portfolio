import type { Metadata } from "next";

export const metadata: Metadata = { title: "Adventure" };

export default function AdventurePage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Coming Soon</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Something new is on the way. Check back soon.
      </p>
    </div>
  );
}

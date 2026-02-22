import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PROJECTS } from "@/lib/constants";
import { DemoLoader } from "@/components/demos/demo-loader";
import type { Metadata } from "next";

const VALID_SLUGS = ["pixel-art-editor", "cocktail-mixer"];

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.demoUrl === `/work/${slug}`);
  return {
    title: project?.title ?? "Demo",
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-24 sm:py-32">
      <Link
        href="/work"
        className="animate-fade-up mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <DemoLoader slug={slug} />
      </div>
    </div>
  );
}

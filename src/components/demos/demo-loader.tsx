"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ProjectViewTracker } from "@/components/portfolio/project-view-tracker";

const demos: Record<string, ComponentType> = {};

const PixelArtEditor = dynamic(
  () =>
    import("@/components/demos/pixel-art-editor").then(
      (mod) => mod.PixelArtEditor
    ),
  { ssr: false }
);

const CocktailMixer = dynamic(
  () =>
    import("@/components/demos/cocktail-mixer").then(
      (mod) => mod.CocktailMixer
    ),
  { ssr: false }
);

const ReleaseSignal = dynamic(
  () =>
    import("@/components/demos/release-signal/release-signal").then(
      (mod) => mod.ReleaseSignal
    ),
  { ssr: false }
);

const TableStakes = dynamic(
  () =>
    import("@/components/demos/table-stakes/table-stakes").then(
      (mod) => mod.TableStakes
    ),
  { ssr: false }
);

demos["pixel-art-editor"] = PixelArtEditor;
demos["cocktail-mixer"] = CocktailMixer;
demos["release-signal"] = ReleaseSignal;
demos["table-stakes"] = TableStakes;

export function DemoLoader({ slug }: { slug: string }) {
  const DemoComponent = demos[slug];
  if (!DemoComponent) return null;
  return (
    <>
      <ProjectViewTracker projectKey={slug} />
      <DemoComponent />
    </>
  );
}

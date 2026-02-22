"use client";

import dynamic from "next/dynamic";

const demos: Record<string, React.ComponentType> = {};

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

demos["pixel-art-editor"] = PixelArtEditor;
demos["cocktail-mixer"] = CocktailMixer;

export function DemoLoader({ slug }: { slug: string }) {
  const DemoComponent = demos[slug];
  if (!DemoComponent) return null;
  return <DemoComponent />;
}

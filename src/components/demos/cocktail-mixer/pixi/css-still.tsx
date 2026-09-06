import type { CSSProperties } from "react";
import { garnishPlates } from "../garnish-map";
import { GLASS_BOUNDS, GLASS_RECT, STAGE } from "../glass-bounds";
import type { Cocktail } from "../types";
import { MIXER_ASSET_URLS } from "./assets";

const GARNISH_SIZES: Record<string, { width: number; height: number }> = {
  "garnish-lime-wheel.png": { width: 64, height: 64 },
  "garnish-cherry.png": { width: 56, height: 64 },
  "garnish-orange-slice.png": { width: 64, height: 64 },
  "garnish-grapefruit-wedge.png": { width: 72, height: 64 },
  "garnish-cherry-orange.png": { width: 88, height: 72 },
  "garnish-rocket.png": { width: 48, height: 88 },
};

const FOAM_OFFSETS = [-30, -18, -6, 7, 20, 31] as const;

function percent(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

function imageLayer(url: string): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    backgroundImage: `url("${url}")`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
  };
}

export function CssStill({ cocktail }: { cocktail: Cocktail }) {
  const glassFrame: CSSProperties = {
    position: "absolute",
    left: percent(GLASS_RECT.x, STAGE.width),
    top: percent(GLASS_RECT.y, STAGE.height),
    width: percent(GLASS_RECT.width, STAGE.width),
    height: percent(GLASS_RECT.height, STAGE.height),
  };
  const bounds = GLASS_BOUNDS[cocktail.glass];
  const plates = garnishPlates(cocktail.garnishType, cocktail.glass);
  const saltPlate = cocktail.garnishType.startsWith("salt_")
    ? plates.find((plate) => plate.startsWith("rim-salt-"))
    : undefined;
  const garnishes = plates.filter((plate) => !plate.startsWith("rim-salt-"));
  const maskUrl = MIXER_ASSET_URLS[`glass-${cocktail.glass}-mask.png`];
  const frontUrl = MIXER_ASSET_URLS[`glass-${cocktail.glass}-front.png`];

  return (
    <div
      data-testid="bar-stage-css"
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 280,
        height: "auto",
        aspectRatio: `${STAGE.width} / ${STAGE.height}`,
        overflow: "hidden",
      }}
    >
      <div style={imageLayer(MIXER_ASSET_URLS["bar-top.png"])} />
      <div
        style={{
          ...glassFrame,
          backgroundColor: cocktail.color,
          maskImage: `url("${maskUrl}")`,
          WebkitMaskImage: `url("${maskUrl}")`,
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
      <div
        style={{
          ...glassFrame,
          backgroundImage: `url("${frontUrl}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
      />
      {saltPlate ? (
        <div
          style={{
            ...glassFrame,
            backgroundImage: `url("${MIXER_ASSET_URLS[saltPlate]}")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
          }}
        />
      ) : null}
      {cocktail.name === "Paloma"
        ? FOAM_OFFSETS.map((offset) => (
            <div
              key={offset}
              style={{
                position: "absolute",
                left: percent(
                  GLASS_RECT.x + bounds.bowlCenterX + offset,
                  STAGE.width,
                ),
                top: percent(
                  GLASS_RECT.y + bounds.liquidTop - 3 + Math.abs(offset % 3),
                  STAGE.height,
                ),
                width: percent(12, STAGE.width),
                aspectRatio: "1",
                backgroundImage: `url("${MIXER_ASSET_URLS["foam-dot.png"]}")`,
                backgroundSize: "100% 100%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))
        : null}
      {garnishes.map((plate) => {
        const size = GARNISH_SIZES[plate];
        return (
          <div
            key={plate}
            style={{
              position: "absolute",
              left: percent(GLASS_RECT.x + bounds.garnishX, STAGE.width),
              top: percent(GLASS_RECT.y + bounds.garnishY, STAGE.height),
              width: percent(size.width, STAGE.width),
              height: percent(size.height, STAGE.height),
              backgroundImage: `url("${MIXER_ASSET_URLS[plate]}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}

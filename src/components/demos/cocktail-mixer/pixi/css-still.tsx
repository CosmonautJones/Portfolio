import type { CSSProperties } from "react";
import { GARNISH_POSE, garnishPlates } from "../garnish-map";
import {
  GLASS_BOUNDS,
  GLASS_RECT,
  STAGE,
  bowlWidthAt,
  foamOffsetsForWidth,
  rimGarnishPoint,
} from "../glass-bounds";
import type { Cocktail } from "../types";
import { MIXER_ASSET_URLS } from "./assets";

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
  const garnishPoint = rimGarnishPoint(cocktail.glass);
  const foamOffsets = foamOffsetsForWidth(
    bowlWidthAt(cocktail.glass, bounds.liquidTop),
  );

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
        ? foamOffsets.map((offset) => (
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
        const pose = GARNISH_POSE[plate];
        if (!pose) return null;
        return (
          <div
            key={plate}
            style={{
              position: "absolute",
              left: percent(GLASS_RECT.x + garnishPoint.x, STAGE.width),
              top: percent(GLASS_RECT.y + garnishPoint.y, STAGE.height),
              width: percent(pose.width, STAGE.width),
              height: percent(pose.height, STAGE.height),
              backgroundImage: `url("${MIXER_ASSET_URLS[plate]}")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: `translate(-${pose.anchorX * 100}%, -${pose.anchorY * 100}%) rotate(${pose.angle}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

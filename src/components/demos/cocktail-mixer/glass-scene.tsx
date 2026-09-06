"use client";

import { useId } from "react";
import type { Cocktail } from "./types";
import { GLASS_CONFIGS, ICE_POSITIONS } from "./data";
import { GlassSvg } from "./svg/glasses";
import { GarnishOverlay } from "./svg/garnishes";
import type { PourSnapshot } from "./pour-timeline";

export function GlassScene({
  cocktail,
}: {
  cocktail: Cocktail;
  reducedMotion: boolean;
  onSnapshot: (snapshot: PourSnapshot) => void;
}) {
  const rawId = useId();
  const clipId = `glass${rawId.replace(/:/g, "")}`;
  const config = GLASS_CONFIGS[cocktail.glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const layerHeight = totalHeight / cocktail.ingredients.length;
  const iceCenterY = (config.liquidTop + config.liquidBottom) / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 300"
        width={200}
        height={300}
        className="overflow-visible"
        data-testid="glass-scene"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={config.clip} />
          </clipPath>
        </defs>

        <g data-pour="glass">
          <g clipPath={`url(#${clipId})`}>
            {cocktail.ingredients.map((ing, i) => {
              const layerBottom = config.liquidBottom - i * layerHeight;
              return (
                <rect
                  key={ing.name}
                  data-pour={`liquid-${i}`}
                  x={0}
                  width={200}
                  y={layerBottom}
                  height={0}
                  fill={ing.color}
                />
              );
            })}
            <path
              data-pour="wave"
              d="M 0,3 L 240,3 L 240,12 L 0,12 Z"
              fill={cocktail.ingredients[0]?.color ?? "#fff"}
              opacity={0}
            />
          </g>

          {config.hasIce
            ? ICE_POSITIONS.map((ice, i) => {
                const cx = 100 + ice.dx;
                const cy = iceCenterY + ice.dy;
                const w = ice.w;
                const h = ice.h;
                const topFace = `${cx},${cy - h / 2} ${cx + w / 2},${cy - h / 4} ${cx},${cy} ${cx - w / 2},${cy - h / 4}`;
                const leftFace = `${cx - w / 2},${cy - h / 4} ${cx},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy + h / 4}`;
                const rightFace = `${cx + w / 2},${cy - h / 4} ${cx},${cy} ${cx},${cy + h / 2} ${cx + w / 2},${cy + h / 4}`;
                return (
                  <g
                    key={`ice-${i}`}
                    data-pour="ice"
                    transform={`rotate(${ice.angle}, ${cx}, ${cy})`}
                    opacity={0}
                  >
                    <polygon
                      points={topFace}
                      fill="rgba(200, 225, 255, 0.3)"
                      stroke="rgba(200, 225, 255, 0.15)"
                      strokeWidth={0.3}
                    />
                    <polygon
                      points={leftFace}
                      fill="rgba(180, 210, 245, 0.2)"
                      stroke="rgba(200, 225, 255, 0.1)"
                      strokeWidth={0.3}
                    />
                    <polygon
                      points={rightFace}
                      fill="rgba(160, 195, 235, 0.15)"
                      stroke="rgba(200, 225, 255, 0.08)"
                      strokeWidth={0.3}
                    />
                  </g>
                );
              })
            : null}

          <GlassSvg glass={cocktail.glass} />

          <g data-pour="garnish" opacity={0}>
            <GarnishOverlay
              type={cocktail.garnishType}
              glass={cocktail.glass}
              visible
            />
          </g>
        </g>

        <g data-pour="bottle" opacity={0}>
          <rect
            data-pour="bottle-body"
            x={92}
            y={config.liquidTop - 55}
            width={16}
            height={28}
            rx={2}
            fill={cocktail.ingredients[0]?.color ?? "#fff"}
            fillOpacity={0.35}
            stroke={cocktail.ingredients[0]?.color ?? "#fff"}
            strokeOpacity={0.45}
            strokeWidth={1}
          />
          <rect
            x={96}
            y={config.liquidTop - 67}
            width={8}
            height={14}
            rx={1.5}
            fill={cocktail.ingredients[0]?.color ?? "#fff"}
            fillOpacity={0.2}
            stroke={cocktail.ingredients[0]?.color ?? "#fff"}
            strokeOpacity={0.3}
            strokeWidth={0.8}
          />
        </g>

        <path
          data-pour="stream"
          d={`M 100,${config.liquidTop - 25} Q 102,${config.liquidTop + 20} 100,${config.liquidTop + 40}`}
          stroke={cocktail.ingredients[0]?.color ?? "#fff"}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0}
        />

        {[
          { dx: -6, dy: 8 },
          { dx: 5, dy: 4 },
          { dx: -2, dy: 12 },
        ].map((dot, i) => (
          <circle
            key={`splash-${i}`}
            data-pour="splash"
            cx={100 + dot.dx}
            cy={config.liquidTop + 50 + dot.dy}
            r={1.6}
            fill={cocktail.ingredients[0]?.color ?? "#fff"}
            opacity={0}
          />
        ))}

        {[
          { dx: -18, r: 2.4 },
          { dx: 8, r: 3 },
          { dx: -4, r: 2 },
          { dx: 20, r: 2.5 },
        ].map((bubble, i) => (
          <circle
            key={`bubble-${i}`}
            data-pour="bubble"
            cx={100 + bubble.dx}
            cy={config.liquidBottom - 24}
            r={bubble.r}
            fill="rgba(255,255,255,0.35)"
            opacity={0}
          />
        ))}
      </svg>
    </div>
  );
}

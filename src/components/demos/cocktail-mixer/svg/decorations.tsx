import { motion } from "motion/react";
import type { Ingredient } from "../types";
import {
  GLASS_CONFIGS,
  WAVE_PATH,
  BUBBLE_SETS,
  ICE_POSITIONS,
  CONDENSATION_DROPS,
} from "../data";

/* ─── Liquid Layers ──────────────────────────────────────────────────── */

export function LiquidLayers({
  ingredients,
  glass,
  pouredCount,
  clipId,
}: {
  ingredients: Ingredient[];
  glass: string;
  pouredCount: number;
  clipId: string;
}) {
  const config = GLASS_CONFIGS[glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const layerHeight = totalHeight / ingredients.length;

  return (
    <g clipPath={`url(#${clipId})`}>
      {ingredients.map((ing, i) => {
        const layerBottom = config.liquidBottom - i * layerHeight;
        const layerTop = layerBottom - layerHeight;
        const isPoured = i < pouredCount;

        return (
          <motion.rect
            key={`liquid-${i}`}
            x={0}
            width={200}
            fill={ing.color}
            initial={{ y: layerBottom, height: 0 }}
            animate={
              isPoured
                ? { y: layerTop, height: layerHeight }
                : { y: layerBottom, height: 0 }
            }
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
          />
        );
      })}
    </g>
  );
}

/* ─── Liquid Wave ────────────────────────────────────────────────────── */

export function LiquidWave({
  glass,
  pouredCount,
  totalIngredients,
  topColor,
  clipId,
}: {
  glass: string;
  pouredCount: number;
  totalIngredients: number;
  topColor: string;
  clipId: string;
}) {
  if (pouredCount === 0) return null;

  const config = GLASS_CONFIGS[glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const filledHeight = (pouredCount / totalIngredients) * totalHeight;
  const surfaceY = config.liquidBottom - filledHeight;

  return (
    <g clipPath={`url(#${clipId})`}>
      <g style={{ animation: "wave-drift 3s linear infinite" }}>
        <path
          d={WAVE_PATH}
          fill={topColor}
          opacity={0.4}
          transform={`translate(-20, ${surfaceY - 3})`}
        />
      </g>
    </g>
  );
}

/* ─── Bubble Particles ───────────────────────────────────────────────── */

export function BubbleParticles({
  glass,
  ingredientIndex,
  totalIngredients,
}: {
  glass: string;
  ingredientIndex: number;
  totalIngredients: number;
}) {
  const config = GLASS_CONFIGS[glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const filledHeight =
    ((ingredientIndex + 1) / totalIngredients) * totalHeight;
  const surfaceY = config.liquidBottom - filledHeight;
  const bubbles = BUBBLE_SETS[ingredientIndex % BUBBLE_SETS.length];

  return (
    <>
      {bubbles.map((b, i) => (
        <motion.circle
          key={`bubble-${ingredientIndex}-${i}`}
          cx={100 + b.dx}
          cy={surfaceY + 10 + b.dy}
          r={b.r}
          fill="rgba(255,255,255,0.35)"
          initial={{ y: 0, scale: 0.5, opacity: 0.6 }}
          animate={{
            y: -30,
            scale: [0.5, 1.2, 0.8, 0],
            opacity: [0.6, 0.8, 0.4, 0],
          }}
          transition={{ duration: 0.8, delay: i * 0.12 }}
        />
      ))}
    </>
  );
}

/* ─── Faceted Ice Cubes ──────────────────────────────────────────────── */

export function FacetedIceCubes({
  glass,
  visible,
}: {
  glass: string;
  visible: boolean;
}) {
  const config = GLASS_CONFIGS[glass];
  if (!config.hasIce || !visible) return null;

  const centerY = (config.liquidTop + config.liquidBottom) / 2;

  return (
    <>
      {ICE_POSITIONS.map((ice, i) => {
        const cx = 100 + ice.dx;
        const cy = centerY + ice.dy;
        const w = ice.w;
        const h = ice.h;

        // Three-face polygon: top, left, right
        const topFace = `${cx},${cy - h / 2} ${cx + w / 2},${cy - h / 4} ${cx},${cy} ${cx - w / 2},${cy - h / 4}`;
        const leftFace = `${cx - w / 2},${cy - h / 4} ${cx},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy + h / 4}`;
        const rightFace = `${cx + w / 2},${cy - h / 4} ${cx},${cy} ${cx},${cy + h / 2} ${cx + w / 2},${cy + h / 4}`;

        return (
          <motion.g
            key={`ice-${i}`}
            transform={`rotate(${ice.angle}, ${cx}, ${cy})`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              y: [cy - 3, cy + 3],
            }}
            transition={{
              opacity: { duration: 0.4 },
              y: {
                duration: 2.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: i * 0.3,
              },
            }}
          >
            {/* Top face — lightest */}
            <polygon
              points={topFace}
              fill="rgba(200, 225, 255, 0.3)"
              stroke="rgba(200, 225, 255, 0.15)"
              strokeWidth={0.3}
            />
            {/* Left face — medium */}
            <polygon
              points={leftFace}
              fill="rgba(180, 210, 245, 0.2)"
              stroke="rgba(200, 225, 255, 0.1)"
              strokeWidth={0.3}
            />
            {/* Right face — darkest */}
            <polygon
              points={rightFace}
              fill="rgba(160, 195, 235, 0.15)"
              stroke="rgba(200, 225, 255, 0.08)"
              strokeWidth={0.3}
            />
          </motion.g>
        );
      })}
    </>
  );
}

/* ─── Condensation Drips ─────────────────────────────────────────────── */

export function CondensationDrips({
  glass,
  visible,
}: {
  glass: string;
  visible: boolean;
}) {
  const config = GLASS_CONFIGS[glass];
  if (!config.hasIce || !visible) return null;

  const midY = (config.liquidTop + config.liquidBottom) / 2;

  return (
    <>
      {CONDENSATION_DROPS.map((drop, i) => (
        <circle
          key={`drip-${i}`}
          cx={100 + drop.dx}
          cy={midY + drop.dy}
          r={1.2}
          fill="currentColor"
          fillOpacity={0.06}
          style={{
            animation: `condensation-drip 4s ease-in-out ${drop.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

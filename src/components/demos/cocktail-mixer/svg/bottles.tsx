import { motion, AnimatePresence } from "motion/react";
import { GLASS_CONFIGS } from "../data";

interface BottlePourProps {
  glass: string;
  ingredientIndex: number;
  color: string;
  totalIngredients: number;
}

export function BottlePour({
  glass,
  ingredientIndex,
  color,
  totalIngredients,
}: BottlePourProps) {
  const config = GLASS_CONFIGS[glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const filledHeight =
    (ingredientIndex / totalIngredients) * totalHeight;
  const surfaceY = config.liquidBottom - filledHeight;

  // Bottle position: centered above glass
  const bottleX = 100;
  const bottleY = config.liquidTop - 55;

  return (
    <AnimatePresence>
      <motion.g
        key={`bottle-${ingredientIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Bottle body — tilts to pour */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: -120 }}
          exit={{ rotate: 0, opacity: 0 }}
          transition={{
            rotate: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.3, delay: 0.5 },
          }}
          style={{ originX: `${bottleX}px`, originY: `${bottleY + 30}px` }}
        >
          {/* Bottle body */}
          <rect
            x={bottleX - 8}
            y={bottleY}
            width={16}
            height={28}
            rx={2}
            fill={color}
            fillOpacity={0.3}
            stroke={color}
            strokeOpacity={0.4}
            strokeWidth={1}
          />
          {/* Bottle neck */}
          <rect
            x={bottleX - 4}
            y={bottleY - 12}
            width={8}
            height={14}
            rx={1.5}
            fill={color}
            fillOpacity={0.2}
            stroke={color}
            strokeOpacity={0.3}
            strokeWidth={0.8}
          />
          {/* Label */}
          <rect
            x={bottleX - 6}
            y={bottleY + 6}
            width={12}
            height={14}
            rx={1}
            fill={color}
            fillOpacity={0.15}
          />
        </motion.g>

        {/* Pour stream — flows from above to liquid surface */}
        <motion.path
          d={`M ${bottleX},${config.liquidTop - 25} Q ${bottleX + 2},${(config.liquidTop - 25 + surfaceY) / 2} ${bottleX},${surfaceY}`}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{
            pathLength: { duration: 0.6, ease: "easeOut", delay: 0.3 },
            opacity: { duration: 0.2, delay: 0.3 },
          }}
        />

        {/* Splash dots at pour target */}
        {[
          { dx: -6, dy: -3, delay: 0.6 },
          { dx: 5, dy: -5, delay: 0.7 },
          { dx: -3, dy: -7, delay: 0.65 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={bottleX + dot.dx}
            cy={surfaceY + dot.dy}
            r={1.5}
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 0.4, delay: dot.delay }}
          />
        ))}
      </motion.g>
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Ingredient {
  name: string;
  amount: string;
  color: string;
}

interface Cocktail {
  name: string;
  glass: "rocks" | "coupe" | "highball" | "margarita";
  color: string;
  emoji: string;
  ingredients: Ingredient[];
  garnish: string;
  instructions: string;
}

/* ─── Glass SVG Geometry ────────────────────────────────────────────── */

interface GlassConfig {
  outline: string;
  clip: string;
  rim: string;
  base: string;
  highlight: string;
  liquidTop: number;
  liquidBottom: number;
  hasIce: boolean;
}

const GLASS_CONFIGS: Record<string, GlassConfig> = {
  rocks: {
    outline:
      "M24,95 L38,248 Q40,260 55,262 L145,262 Q160,260 162,248 L176,95",
    clip: "M28,97 L40,246 Q42,256 55,258 L145,258 Q158,256 160,246 L172,97 Z",
    rim: "M20,95 L180,95",
    base: "M55,262 L145,262",
    highlight: "M30,100 L42,244",
    liquidTop: 100,
    liquidBottom: 254,
    hasIce: true,
  },
  coupe: {
    outline:
      "M15,65 Q30,68 55,135 Q70,175 95,185 L95,242 L80,242 Q72,242 72,250 L72,260 L128,260 L128,250 Q128,242 120,242 L105,242 L105,185 Q130,175 145,135 Q170,68 185,65",
    clip: "M20,67 Q35,70 58,135 Q72,172 95,183 L105,183 Q128,172 142,135 Q165,70 180,67 Z",
    rim: "M12,65 L188,65",
    base: "M72,260 L128,260",
    highlight: "M22,70 Q38,72 60,135",
    liquidTop: 70,
    liquidBottom: 180,
    hasIce: false,
  },
  highball: {
    outline:
      "M55,45 L60,252 Q62,262 75,262 L125,262 Q138,262 140,252 L145,45",
    clip: "M58,47 L62,250 Q64,258 75,258 L125,258 Q136,258 138,250 L142,47 Z",
    rim: "M52,45 L148,45",
    base: "M75,262 L125,262",
    highlight: "M60,50 L64,248",
    liquidTop: 50,
    liquidBottom: 255,
    hasIce: true,
  },
  margarita: {
    outline:
      "M5,55 Q20,58 45,120 Q60,160 90,180 L90,242 L75,242 Q67,242 67,250 L67,260 L133,260 L133,250 Q133,242 125,242 L110,242 L110,180 Q140,160 155,120 Q180,58 195,55",
    clip: "M12,57 Q25,60 48,120 Q62,158 92,178 L108,178 Q138,158 152,120 Q175,60 188,57 Z",
    rim: "M2,55 L198,55",
    base: "M67,260 L133,260",
    highlight: "M15,60 Q28,62 50,120",
    liquidTop: 60,
    liquidBottom: 175,
    hasIce: false,
  },
};

/* ─── Cocktail Data ─────────────────────────────────────────────────── */

const COCKTAILS: Cocktail[] = [
  {
    name: "Margarita",
    glass: "margarita",
    color: "#a8d853",
    emoji: "\u{1F34B}",
    ingredients: [
      { name: "Tequila", amount: "2 oz", color: "#f5f0e1" },
      { name: "Lime Juice", amount: "1 oz", color: "#a8d853" },
      { name: "Triple Sec", amount: "1 oz", color: "#f5deb3" },
    ],
    garnish: "Salt rim + lime wheel",
    instructions:
      "Shake all ingredients with ice. Strain into a salt-rimmed glass over fresh ice. Garnish with a lime wheel.",
  },
  {
    name: "Paloma",
    glass: "highball",
    color: "#f5a0b0",
    emoji: "\u{1F338}",
    ingredients: [
      { name: "Tequila", amount: "2 oz", color: "#f5f0e1" },
      { name: "Grapefruit Soda", amount: "4 oz", color: "#f5a0b0" },
      { name: "Lime Juice", amount: "0.5 oz", color: "#a8d853" },
    ],
    garnish: "Salt rim + grapefruit wedge",
    instructions:
      "Build in a salt-rimmed highball glass over ice. Stir gently to combine.",
  },
  {
    name: "Tequila Sunrise",
    glass: "highball",
    color: "#ff6b35",
    emoji: "\u{1F305}",
    ingredients: [
      { name: "Tequila", amount: "2 oz", color: "#f5f0e1" },
      { name: "Orange Juice", amount: "4 oz", color: "#ffa500" },
      { name: "Grenadine", amount: "0.5 oz", color: "#dc143c" },
    ],
    garnish: "Orange slice + cherry",
    instructions:
      "Pour tequila and orange juice over ice. Slowly pour grenadine down the side of the glass \u2014 it will sink and create a sunrise gradient.",
  },
  {
    name: "Whiskey Sour",
    glass: "coupe",
    color: "#f5d78e",
    emoji: "\u{1F943}",
    ingredients: [
      { name: "Bourbon", amount: "2 oz", color: "#d4880f" },
      { name: "Lemon Juice", amount: "0.75 oz", color: "#fff44f" },
      { name: "Simple Syrup", amount: "0.5 oz", color: "#f5f0e1" },
    ],
    garnish: "Cherry + lemon peel",
    instructions:
      "Shake all ingredients vigorously with ice. Strain into a chilled coupe glass. Garnish with a cherry.",
  },
  {
    name: "Old Fashioned",
    glass: "rocks",
    color: "#c47a2b",
    emoji: "\u{1F34A}",
    ingredients: [
      { name: "Bourbon", amount: "2 oz", color: "#d4880f" },
      { name: "Sugar", amount: "1 cube", color: "#f5f0e1" },
      { name: "Angostura Bitters", amount: "2 dashes", color: "#8b2500" },
    ],
    garnish: "Orange peel + cherry",
    instructions:
      "Muddle sugar cube with bitters and a splash of water. Add bourbon and a large ice cube. Stir gently. Express orange peel over the glass.",
  },
  {
    name: "Salty Dog",
    glass: "highball",
    color: "#f4a460",
    emoji: "\u{1F415}",
    ingredients: [
      { name: "Vodka", amount: "1.5 oz", color: "#f5f0e1" },
      { name: "Grapefruit Juice", amount: "4 oz", color: "#f4a460" },
    ],
    garnish: "Salt rim + grapefruit slice",
    instructions:
      "Fill a salt-rimmed highball glass with ice. Pour vodka and grapefruit juice. Stir gently.",
  },
];

/* ─── Wave Path ─────────────────────────────────────────────────────── */

function generateWavePath(width: number, amplitude: number): string {
  let d = `M 0,${amplitude}`;
  for (let x = 0; x <= width + 40; x += 4) {
    const y =
      amplitude + Math.sin((x / 40) * Math.PI * 2) * amplitude;
    d += ` L ${x},${y}`;
  }
  d += ` L ${width + 40},${amplitude * 4} L 0,${amplitude * 4} Z`;
  return d;
}

const WAVE_PATH = generateWavePath(200, 3);

const WAVE_STYLES = `
@keyframes wave-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-40px); }
}
`;

/* ─── Decoration Data ───────────────────────────────────────────────── */

const BUBBLE_SETS = [
  [
    { dx: -20, dy: 0, r: 2.5 },
    { dx: 10, dy: -4, r: 3 },
    { dx: -5, dy: -2, r: 2 },
    { dx: 22, dy: -6, r: 2.5 },
  ],
  [
    { dx: 15, dy: 0, r: 3 },
    { dx: -12, dy: -3, r: 2 },
    { dx: 25, dy: -5, r: 2.5 },
    { dx: -18, dy: -1, r: 2 },
  ],
  [
    { dx: -8, dy: 0, r: 2 },
    { dx: 18, dy: -2, r: 3 },
    { dx: -25, dy: -4, r: 2.5 },
    { dx: 5, dy: -6, r: 2 },
  ],
];

const ICE_POSITIONS = [
  { dx: -25, dy: 0, angle: 12, w: 16, h: 13 },
  { dx: 18, dy: 8, angle: -8, w: 14, h: 11 },
  { dx: -5, dy: 4, angle: 22, w: 12, h: 10 },
];

/* ─── SVG Sub-components ────────────────────────────────────────────── */

function GlassSvg({ glass }: { glass: string }) {
  const config = GLASS_CONFIGS[glass];
  return (
    <>
      <path
        d={config.outline}
        fill="currentColor"
        fillOpacity={0.03}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d={config.rim}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={config.base}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d={config.highlight}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </>
  );
}

function LiquidLayers({
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

function LiquidWave({
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

function PourStream({
  glass,
  ingredientIndex,
  color,
  totalIngredients,
}: {
  glass: string;
  ingredientIndex: number;
  color: string;
  totalIngredients: number;
}) {
  const config = GLASS_CONFIGS[glass];
  const totalHeight = config.liquidBottom - config.liquidTop;
  const filledHeight =
    (ingredientIndex / totalIngredients) * totalHeight;
  const surfaceY = config.liquidBottom - filledHeight;
  const streamPath = `M 100,${config.liquidTop - 30} L 100,${surfaceY}`;

  return (
    <motion.path
      d={streamPath}
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0.8 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      exit={{ opacity: 0 }}
      transition={{
        pathLength: { duration: 0.6, ease: "easeOut" },
        opacity: { duration: 0.3 },
      }}
    />
  );
}

function BubbleParticles({
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

function IceCubes({
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
      {ICE_POSITIONS.map((ice, i) => (
        <motion.rect
          key={`ice-${i}`}
          x={100 + ice.dx - ice.w / 2}
          width={ice.w}
          height={ice.h}
          rx={2}
          fill="rgba(200, 225, 255, 0.25)"
          stroke="rgba(200, 225, 255, 0.15)"
          strokeWidth={0.5}
          transform={`rotate(${ice.angle}, ${100 + ice.dx}, ${centerY + ice.dy})`}
          initial={{ opacity: 0, y: centerY + ice.dy }}
          animate={{
            opacity: 1,
            y: [centerY + ice.dy - 3, centerY + ice.dy + 3],
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
        />
      ))}
    </>
  );
}

function GlassVisualization({
  cocktail,
  pouredCount,
  activePour,
  bubbleIndex,
  allDone,
}: {
  cocktail: Cocktail;
  pouredCount: number;
  activePour: number | null;
  bubbleIndex: number | null;
  allDone: boolean;
}) {
  const rawId = useId();
  const clipId = `glass${rawId.replace(/:/g, "")}`;
  const config = GLASS_CONFIGS[cocktail.glass];

  const topIngredientIdx = Math.min(
    pouredCount - 1,
    cocktail.ingredients.length - 1
  );
  const topColor =
    pouredCount > 0
      ? cocktail.ingredients[topIngredientIdx].color
      : "transparent";

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {allDone && (
          <motion.div
            className="text-3xl"
            initial={{ opacity: 0, scale: 0.3, y: -10, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
          >
            {cocktail.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        viewBox="0 0 200 300"
        width={200}
        height={300}
        className="overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={config.clip} />
          </clipPath>
        </defs>

        <LiquidLayers
          ingredients={cocktail.ingredients}
          glass={cocktail.glass}
          pouredCount={pouredCount}
          clipId={clipId}
        />

        <LiquidWave
          glass={cocktail.glass}
          pouredCount={pouredCount}
          totalIngredients={cocktail.ingredients.length}
          topColor={topColor}
          clipId={clipId}
        />

        <AnimatePresence>
          {activePour !== null && (
            <PourStream
              key={`pour-${activePour}`}
              glass={cocktail.glass}
              ingredientIndex={activePour}
              color={cocktail.ingredients[activePour].color}
              totalIngredients={cocktail.ingredients.length}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {bubbleIndex !== null && (
            <BubbleParticles
              key={`bubbles-${bubbleIndex}`}
              glass={cocktail.glass}
              ingredientIndex={bubbleIndex}
              totalIngredients={cocktail.ingredients.length}
            />
          )}
        </AnimatePresence>

        <IceCubes glass={cocktail.glass} visible={allDone} />

        <GlassSvg glass={cocktail.glass} />
      </svg>
    </div>
  );
}

/* ─── Selection Grid ─────────────────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function DrinkCard({
  cocktail,
  onSelect,
}: {
  cocktail: Cocktail;
  onSelect: (c: Cocktail) => void;
}) {
  return (
    <motion.button
      variants={cardVariants}
      onClick={() => onSelect(cocktail)}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 8px 30px ${cocktail.color}30`,
      }}
      whileTap={{ scale: 0.97 }}
      className="glass-card flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-6 transition-colors duration-300"
    >
      <span className="text-5xl">{cocktail.emoji}</span>
      <span className="font-semibold">{cocktail.name}</span>
    </motion.button>
  );
}

function SelectionGrid({
  onSelect,
}: {
  onSelect: (c: Cocktail) => void;
}) {
  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Choose Your Drink</h2>
        <p className="mt-1 text-muted-foreground">
          Pick a cocktail to see the recipe and animated pour
        </p>
      </div>
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {COCKTAILS.map((cocktail) => (
          <DrinkCard
            key={cocktail.name}
            cocktail={cocktail}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Recipe View ───────────────────────────────────────────────────── */

function RecipeDetails({
  cocktail,
  pouredCount,
  allDone,
  onReset,
}: {
  cocktail: Cocktail;
  pouredCount: number;
  allDone: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <motion.h2
        className="text-3xl font-bold"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {cocktail.name}
      </motion.h2>

      <div className="flex flex-col gap-3">
        <motion.h3
          className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Ingredients
        </motion.h3>
        {cocktail.ingredients.map((ing, i) => (
          <motion.div
            key={ing.name}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={
              i < pouredCount
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: 20 }
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 14,
            }}
          >
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: ing.color }}
            />
            <span>
              <span className="font-medium">{ing.amount}</span>{" "}
              {ing.name}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={
          allDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
        }
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Garnish
        </h3>
        <p className="mt-1">{cocktail.garnish}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={
          allDone ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
        }
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 14,
          delay: allDone ? 0.15 : 0,
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Instructions
        </h3>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {cocktail.instructions}
        </p>
      </motion.div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              delay: 0.3,
            }}
          >
            <Button
              onClick={onReset}
              variant="outline"
              className="gap-2 rounded-full"
            >
              <RotateCcw className="size-4" />
              Make Another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecipeView({
  cocktail,
  onReset,
}: {
  cocktail: Cocktail;
  onReset: () => void;
}) {
  const [pouredCount, setPouredCount] = useState(0);
  const [activePour, setActivePour] = useState<number | null>(null);
  const [bubbleIndex, setBubbleIndex] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const count = cocktail.ingredients.length;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(() => {
          setActivePour(i);
          setPouredCount(i + 1);
        }, 400 + i * 1200)
      );

      timers.push(
        setTimeout(() => {
          setActivePour((prev) => (prev === i ? null : prev));
          setBubbleIndex(i);
        }, 400 + i * 1200 + 600)
      );

      timers.push(
        setTimeout(() => {
          setBubbleIndex((prev) => (prev === i ? null : prev));
        }, 400 + i * 1200 + 1400)
      );
    }

    timers.push(
      setTimeout(() => {
        setAllDone(true);
      }, 400 + count * 1200 + 300)
    );

    return () => timers.forEach(clearTimeout);
  }, [count]);

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="w-fit gap-2 rounded-full"
      >
        <ArrowLeft className="size-4" />
        Back to drinks
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center">
          <GlassVisualization
            cocktail={cocktail}
            pouredCount={pouredCount}
            activePour={activePour}
            bubbleIndex={bubbleIndex}
            allDone={allDone}
          />
        </div>
        <RecipeDetails
          cocktail={cocktail}
          pouredCount={pouredCount}
          allDone={allDone}
          onReset={onReset}
        />
      </div>
    </motion.div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────────────── */

export function CocktailMixer() {
  const [selectedDrink, setSelectedDrink] = useState<Cocktail | null>(
    null
  );

  function handleSelect(cocktail: Cocktail) {
    setSelectedDrink(cocktail);
  }

  function handleReset() {
    setSelectedDrink(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <style dangerouslySetInnerHTML={{ __html: WAVE_STYLES }} />
      <AnimatePresence mode="wait">
        {!selectedDrink ? (
          <SelectionGrid key="selection" onSelect={handleSelect} />
        ) : (
          <RecipeView
            key={selectedDrink.name}
            cocktail={selectedDrink}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

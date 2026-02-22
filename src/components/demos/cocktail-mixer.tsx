"use client";

import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ingredient {
  name: string;
  amount: string;
  color: string;
  pourDelay: number;
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

const COCKTAILS: Cocktail[] = [
  {
    name: "Margarita",
    glass: "margarita",
    color: "#a8d853",
    emoji: "\u{1F34B}",
    ingredients: [
      { name: "Tequila", amount: "2 oz", color: "#f5f0e1", pourDelay: 0 },
      { name: "Lime Juice", amount: "1 oz", color: "#a8d853", pourDelay: 600 },
      {
        name: "Triple Sec",
        amount: "1 oz",
        color: "#f5deb3",
        pourDelay: 1200,
      },
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
      { name: "Tequila", amount: "2 oz", color: "#f5f0e1", pourDelay: 0 },
      {
        name: "Grapefruit Soda",
        amount: "4 oz",
        color: "#f5a0b0",
        pourDelay: 600,
      },
      {
        name: "Lime Juice",
        amount: "0.5 oz",
        color: "#a8d853",
        pourDelay: 1200,
      },
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
      { name: "Tequila", amount: "2 oz", color: "#f5f0e1", pourDelay: 0 },
      {
        name: "Orange Juice",
        amount: "4 oz",
        color: "#ffa500",
        pourDelay: 600,
      },
      {
        name: "Grenadine",
        amount: "0.5 oz",
        color: "#dc143c",
        pourDelay: 1200,
      },
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
      { name: "Bourbon", amount: "2 oz", color: "#d4880f", pourDelay: 0 },
      {
        name: "Lemon Juice",
        amount: "0.75 oz",
        color: "#fff44f",
        pourDelay: 600,
      },
      {
        name: "Simple Syrup",
        amount: "0.5 oz",
        color: "#f5f0e1",
        pourDelay: 1200,
      },
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
      { name: "Bourbon", amount: "2 oz", color: "#d4880f", pourDelay: 0 },
      { name: "Sugar", amount: "1 cube", color: "#f5f0e1", pourDelay: 600 },
      {
        name: "Angostura Bitters",
        amount: "2 dashes",
        color: "#8b2500",
        pourDelay: 1200,
      },
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
      { name: "Vodka", amount: "1.5 oz", color: "#f5f0e1", pourDelay: 0 },
      {
        name: "Grapefruit Juice",
        amount: "4 oz",
        color: "#f4a460",
        pourDelay: 600,
      },
    ],
    garnish: "Salt rim + grapefruit slice",
    instructions:
      "Fill a salt-rimmed highball glass with ice. Pour vodka and grapefruit juice. Stir gently.",
  },
];

const GLASS_PATHS: Record<string, string> = {
  rocks: "polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)",
  coupe: "polygon(5% 0%, 95% 0%, 70% 50%, 60% 100%, 40% 100%, 30% 50%)",
  highball: "polygon(15% 0%, 85% 0%, 82% 100%, 18% 100%)",
  margarita:
    "polygon(0% 0%, 100% 0%, 70% 40%, 60% 100%, 40% 100%, 30% 40%)",
};

const ANIMATION_STYLES = `
@keyframes pour-in {
  from { max-height: 0; opacity: 0.5; }
  to { max-height: var(--layer-height); opacity: 1; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes garnish-appear {
  from { opacity: 0; transform: scale(0.5) rotate(-20deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}
`;

function DrinkCard({
  cocktail,
  onSelect,
}: {
  cocktail: Cocktail;
  onSelect: (c: Cocktail) => void;
}) {
  return (
    <button
      onClick={() => onSelect(cocktail)}
      className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/80 hover:shadow-lg"
    >
      <span className="text-5xl">{cocktail.emoji}</span>
      <span className="font-semibold">{cocktail.name}</span>
    </button>
  );
}

function GlassVisualization({
  cocktail,
  animKey,
}: {
  cocktail: Cocktail;
  animKey: number;
}) {
  const totalIngredients = cocktail.ingredients.length;
  const layerHeight = 80 / totalIngredients;
  const maxPourDelay = Math.max(...cocktail.ingredients.map((i) => i.pourDelay));

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Garnish */}
      <div
        key={`garnish-${animKey}`}
        className="text-3xl"
        style={{
          animation: "garnish-appear 600ms ease-out forwards",
          animationDelay: `${maxPourDelay + 800}ms`,
          opacity: 0,
        }}
      >
        {cocktail.emoji}
      </div>

      {/* Glass */}
      <div className="relative" style={{ width: 200, height: 280 }}>
        <div
          className="absolute inset-0 rounded-b-lg border border-white/10 bg-white/5"
          style={{ clipPath: GLASS_PATHS[cocktail.glass] }}
        >
          {/* Liquid layers */}
          {cocktail.ingredients.map((ing, i) => (
            <div
              key={`${ing.name}-${animKey}`}
              className="absolute left-0 right-0 overflow-hidden"
              style={{
                bottom: `${i * layerHeight}%`,
                height: `${layerHeight}%`,
                ["--layer-height" as string]: `${layerHeight}%`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: ing.color,
                  maxHeight: 0,
                  opacity: 0.5,
                  animation: "pour-in 800ms ease-out forwards",
                  animationDelay: `${ing.pourDelay}ms`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Glass surface line */}
        <div className="absolute -bottom-2 left-1/2 h-px w-3/4 -translate-x-1/2 bg-border/60" />
      </div>
    </div>
  );
}

function RecipeDetails({
  cocktail,
  animKey,
  onReset,
}: {
  cocktail: Cocktail;
  animKey: number;
  onReset: () => void;
}) {
  const maxPourDelay = Math.max(...cocktail.ingredients.map((i) => i.pourDelay));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-3xl font-bold">{cocktail.name}</h2>

      {/* Ingredients */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ingredients
        </h3>
        {cocktail.ingredients.map((ing) => (
          <div
            key={`${ing.name}-${animKey}`}
            className="flex items-center gap-3"
            style={{
              animation: "fade-up 500ms ease-out forwards",
              animationDelay: `${ing.pourDelay}ms`,
              opacity: 0,
            }}
          >
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: ing.color }}
            />
            <span>
              <span className="font-medium">{ing.amount}</span> {ing.name}
            </span>
          </div>
        ))}
      </div>

      {/* Garnish */}
      <div
        key={`garnish-text-${animKey}`}
        style={{
          animation: "fade-up 500ms ease-out forwards",
          animationDelay: `${maxPourDelay + 400}ms`,
          opacity: 0,
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Garnish
        </h3>
        <p className="mt-1">{cocktail.garnish}</p>
      </div>

      {/* Instructions */}
      <div
        key={`instructions-${animKey}`}
        style={{
          animation: "fade-up 500ms ease-out forwards",
          animationDelay: `${maxPourDelay + 800}ms`,
          opacity: 0,
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Instructions
        </h3>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {cocktail.instructions}
        </p>
      </div>

      {/* Make Another button */}
      <div
        key={`btn-${animKey}`}
        style={{
          animation: "fade-up 500ms ease-out forwards",
          animationDelay: `${maxPourDelay + 1200}ms`,
          opacity: 0,
        }}
      >
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="size-4" />
          Make Another
        </Button>
      </div>
    </div>
  );
}

export function CocktailMixer() {
  const [selectedDrink, setSelectedDrink] = useState<Cocktail | null>(null);
  const [animKey, setAnimKey] = useState(0);

  function handleSelect(cocktail: Cocktail) {
    setSelectedDrink(cocktail);
    setAnimKey((k) => k + 1);
  }

  function handleReset() {
    setSelectedDrink(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

      {!selectedDrink ? (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Choose Your Drink</h2>
            <p className="mt-1 text-muted-foreground">
              Pick a cocktail to see the recipe and animated pour
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {COCKTAILS.map((cocktail) => (
              <DrinkCard
                key={cocktail.name}
                cocktail={cocktail}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="w-fit gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to drinks
          </Button>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <GlassVisualization
                cocktail={selectedDrink}
                animKey={animKey}
              />
            </div>
            <RecipeDetails
              cocktail={selectedDrink}
              animKey={animKey}
              onReset={handleReset}
            />
          </div>
        </div>
      )}
    </div>
  );
}

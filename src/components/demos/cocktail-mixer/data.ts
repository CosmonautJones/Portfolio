import type { Cocktail } from "./types";

/* ─── Cocktail Data ─────────────────────────────────────────────────── */

export const COCKTAILS: Cocktail[] = [
  {
    name: "Margarita",
    glass: "margarita",
    color: "#a8d853",
    emoji: "\u{1F34B}",
    garnishType: "salt_lime",
    method: "shaken",
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
    garnishType: "salt_grapefruit",
    method: "built",
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
    garnishType: "cherry_orange",
    method: "built",
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
    garnishType: "cherry",
    method: "shaken",
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
    garnishType: "cherry_orange",
    method: "stirred",
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
    garnishType: "salt_grapefruit",
    method: "built",
    ingredients: [
      { name: "Vodka", amount: "1.5 oz", color: "#f5f0e1" },
      { name: "Grapefruit Juice", amount: "4 oz", color: "#f4a460" },
    ],
    garnish: "Salt rim + grapefruit slice",
    instructions:
      "Fill a salt-rimmed highball glass with ice. Pour vodka and grapefruit juice. Stir gently.",
  },
];

export const THE_COSMONAUT: Cocktail = {
  name: "The Cosmonaut",
  glass: "coupe",
  color: "#8b5cf6",
  emoji: "\u{1F680}",
  garnishType: "rocket",
  method: "shaken",
  isSecret: true,
  ingredients: [
    { name: "Vodka", amount: "1.5 oz", color: "#f5f0e1" },
    { name: "Lemon Juice", amount: "0.75 oz", color: "#fff44f" },
    { name: "Raspberry Liqueur", amount: "0.75 oz", color: "#c62a88" },
    { name: "Elderflower Liqueur", amount: "0.5 oz", color: "#e8d5b7" },
  ],
  garnish: "Edible flower + lemon twist",
  instructions:
    "Shake all ingredients vigorously with ice. Double strain into a chilled coupe glass. Float an edible flower and express a lemon twist.",
};

export const WAVE_STYLES = `
@keyframes cosmonaut-glow {
  0%, 100% { box-shadow: 0 0 8px #8b5cf640, 0 0 24px #8b5cf620; }
  50% { box-shadow: 0 0 16px #8b5cf680, 0 0 40px #8b5cf640; }
}
`;

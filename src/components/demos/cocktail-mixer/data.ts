import type { Cocktail, GlassConfig } from "./types";

/* ─── Glass SVG Geometry ────────────────────────────────────────────── */

export const GLASS_CONFIGS: Record<string, GlassConfig> = {
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

/* ─── Wave Path ─────────────────────────────────────────────────────── */

function generateWavePath(width: number, amplitude: number): string {
  let d = `M 0,${amplitude}`;
  for (let x = 0; x <= width + 40; x += 4) {
    const y = amplitude + Math.sin((x / 40) * Math.PI * 2) * amplitude;
    d += ` L ${x},${y}`;
  }
  d += ` L ${width + 40},${amplitude * 4} L 0,${amplitude * 4} Z`;
  return d;
}

export const WAVE_PATH = generateWavePath(200, 3);

export const WAVE_STYLES = `
@keyframes wave-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-40px); }
}
@keyframes condensation-drip {
  0% { opacity: 0.3; transform: translateY(0); }
  70% { opacity: 0.5; }
  100% { opacity: 0; transform: translateY(12px); }
}
@keyframes cosmonaut-glow {
  0%, 100% { box-shadow: 0 0 8px #8b5cf640, 0 0 24px #8b5cf620; }
  50% { box-shadow: 0 0 16px #8b5cf680, 0 0 40px #8b5cf640; }
}
`;

/* ─── Decoration Data ───────────────────────────────────────────────── */

export const BUBBLE_SETS = [
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

export const ICE_POSITIONS = [
  { dx: -25, dy: 0, angle: 12, w: 16, h: 13 },
  { dx: 18, dy: 8, angle: -8, w: 14, h: 11 },
  { dx: -5, dy: 4, angle: 22, w: 12, h: 10 },
];

export const CONDENSATION_DROPS = [
  { dx: -30, dy: 40, delay: 0 },
  { dx: 28, dy: 60, delay: 1.2 },
  { dx: -15, dy: 80, delay: 2.4 },
];

export interface EasterEgg {
  id: string;
  name: string;
  hint: string;
  location: string;
  achievementId?: string;
  icon: string;
}

const EASTER_EGGS: EasterEgg[] = [
  {
    id: "konami_code",
    name: "Konami Code",
    hint: "The classic cheat code still works...",
    location: "Anywhere on the site",
    achievementId: "konami",
    icon: "Joystick",
  },
  {
    id: "hidden_terminal",
    name: "The Red Pill",
    hint: "Not everything is as it seems on the surface.",
    location: "Home page",
    achievementId: "red_pill",
    icon: "Terminal",
  },
  {
    id: "vault_complete",
    name: "Halliday's Egg",
    hint: "Only the worthy can crack the vault.",
    location: "The Vault",
    achievementId: "halliday_egg",
    icon: "Egg",
  },
  {
    id: "cosmonaut_cocktail",
    name: "The Cosmonaut",
    hint: "A drink reserved for those who've earned their wings.",
    location: "Cocktail Mixer",
    icon: "Rocket",
  },
  {
    id: "hitchhiker_42",
    name: "The Answer",
    hint: "Don't Panic. The answer to everything.",
    location: "ClaudeBot's Adventure",
    icon: "Compass",
  },
  {
    id: "vaporwave",
    name: "A E S T H E T I C",
    hint: "Some commands aren't listed in help.",
    location: "Terminal",
    icon: "Palette",
  },
];

export function getEasterEgg(id: string): EasterEgg | undefined {
  return EASTER_EGGS.find((e) => e.id === id);
}

export function getAllEasterEggs(): EasterEgg[] {
  return EASTER_EGGS;
}

export function getDiscoveredEggs(discoveries: string[]): EasterEgg[] {
  return EASTER_EGGS.filter((e) => discoveries.includes(e.id));
}

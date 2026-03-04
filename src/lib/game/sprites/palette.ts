// Index 0 = transparent. PICO-8 inspired + Claude orange accents.
// Indices 0-31 maintain backward compatibility with original colors.
// Indices 32-47 are new extended ramp colors for enhanced shading.
export const PALETTE: readonly string[] = [
  "transparent", // 0
  "#1a1c2c", //  1  dark navy (outlines)
  "#5d275d", //  2  plum
  "#b13e53", //  3  cranberry
  "#ef7d57", //  4  Claude orange
  "#ffcd75", //  5  gold
  "#a7f070", //  6  lime
  "#38b764", //  7  green
  "#257179", //  8  teal
  "#29366f", //  9  deep blue
  "#3b5dc9", // 10  medium blue
  "#41a6f6", // 11  sky blue
  "#73eff7", // 12  cyan
  "#f4f4f4", // 13  near-white
  "#94b0c2", // 14  steel gray
  "#566c86", // 15  slate
  "#333c57", // 16  charcoal
  "#d4513b", // 17  lobster red
  "#e87461", // 18  lobster light
  "#9e2835", // 19  lobster dark / claws
  "#3c3c50", // 20  asphalt dark
  "#4e4e66", // 21  asphalt light
  "#3e8948", // 22  grass dark
  "#265c42", // 23  grass darkest
  "#1e6aa0", // 24  water dark
  "#2d6aa5", // 25  water mid
  "#5a3a1e", // 26  log dark
  "#8b6914", // 27  log mid
  "#c4a35a", // 28  log light
  "#ffff00", // 29  warning yellow
  "#ff0000", // 30  warning red
  "#000000", // 31  black

  // Extended palette — new shading ramps
  "#f0c080", // 32  log highlight / warm sand
  "#7b4a20", // 33  log deep shadow
  "#c84c39", // 34  lobster red-orange mid
  "#ff9b7b", // 35  lobster highlight / peach
  "#6b1f28", // 36  lobster deep shadow
  "#50d090", // 37  grass bright highlight
  "#1a4030", // 38  grass very deep shadow
  "#60c8f0", // 39  water bright highlight / foam
  "#0d3a6a", // 40  water very deep shadow
  "#ffa040", // 41  Claude orange deep
  "#ffe0a0", // 42  gold highlight / bright
  "#b08020", // 43  gold shadow
  "#c0d8f0", // 44  sky pale blue
  "#8090b0", // 45  slate blue mid
  "#6080ff", // 46  electric blue (train accent)
  "#e0e8ff", // 47  near-white blue tint (windshield)

  // Extended palette 2 — 2x resolution shading ramps
  "#d08060", // 48  lobster warm mid (shell side)
  "#f5b090", // 49  lobster pale highlight (specular)
  "#4a1520", // 50  lobster darkest shadow (deep undercarriage)
  "#1896c8", // 51  water mid-light (wave crests)
  "#0a2850", // 52  water deepest (abyss)
  "#a07838", // 53  log warm mid (bark mid-tone)
  "#604020", // 54  log bark dark (deep crevice)
  "#d0d8e0", // 55  vehicle chrome light
  "#707890", // 56  vehicle chrome shadow
  "#a8c8a0", // 57  grass sage (mid-light)
  "#183820", // 58  grass moss dark
  "#505868", // 59  road surface warm
  "#282830", // 60  road surface deep
  "#c0a870", // 61  warm sand mid
  "#f8f0d0", // 62  warm highlight cream
  "#404060", // 63  neutral dark cool
] as const;

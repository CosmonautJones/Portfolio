/**
 * Generates the painted 2× raster plates used by Cocktail Mixer's Pixi stage.
 *
 * Usage: npx tsx scripts/generate-mixer-plates.ts
 */

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DEFAULT_OUTPUT_DIRECTORY = join(
  ROOT,
  "src",
  "components",
  "demos",
  "cocktail-mixer",
  "assets",
);

type PlateSpec = {
  filename: string;
  width: number;
  height: number;
  render: () => string | Buffer;
};

type GlassDefinition = {
  interior: string;
  rim: string;
  reflections: string;
  stem: string;
};

const GLASS_DEFINITIONS: Record<string, GlassDefinition> = {
  rocks: {
    interior:
      "M70 192 Q200 174 330 192 L310 492 Q304 518 270 528 Q200 544 130 528 Q96 518 90 492 Z",
    rim: "M70 192 Q200 174 330 192",
    reflections:
      '<path d="M91 226 Q96 350 116 456" stroke="url(#key)" stroke-width="20"/><path d="M304 235 Q299 336 290 423" stroke="#7daec4" stroke-opacity=".28" stroke-width="8"/>',
    stem:
      '<path d="M104 508 Q200 548 296 508 L286 548 Q200 570 114 548 Z" fill="url(#base)" opacity=".62"/>',
  },
  highball: {
    interior:
      "M118 88 Q200 76 282 88 L268 502 Q266 528 240 536 Q200 546 160 536 Q134 528 132 502 Z",
    rim: "M118 88 Q200 76 282 88",
    reflections:
      '<path d="M133 126 Q137 298 148 470" stroke="url(#key)" stroke-width="17"/><path d="M270 130 Q265 300 258 448" stroke="#78abc2" stroke-opacity=".27" stroke-width="7"/>',
    stem:
      '<path d="M139 508 Q200 538 261 508 L256 548 Q200 561 144 548 Z" fill="url(#base)" opacity=".56"/>',
  },
  coupe: {
    interior:
      "M45 128 Q200 106 355 128 Q338 246 290 320 Q258 361 200 365 Q142 361 110 320 Q62 246 45 128 Z",
    rim: "M45 128 Q200 106 355 128",
    reflections:
      '<path d="M68 157 Q90 244 133 310" stroke="url(#key)" stroke-width="18"/><path d="M326 158 Q310 238 274 294" stroke="#78a8be" stroke-opacity=".24" stroke-width="7"/>',
    stem:
      '<path d="M184 352 Q200 366 216 352 L211 494 Q210 514 233 526 L294 548 Q306 554 298 566 L102 566 Q94 554 106 548 L167 526 Q190 514 189 494 Z" fill="url(#stem)" opacity=".72"/>',
  },
  margarita: {
    interior:
      "M28 108 Q200 88 372 108 L300 212 Q264 266 222 292 L216 340 L184 340 L178 292 Q136 266 100 212 Z",
    rim: "M28 108 Q200 88 372 108",
    reflections:
      '<path d="M62 129 L125 216 Q148 251 179 273" stroke="url(#key)" stroke-width="18"/><path d="M338 130 L286 204 Q266 235 241 257" stroke="#78a8be" stroke-opacity=".24" stroke-width="7"/>',
    stem:
      '<path d="M184 325 Q200 339 216 325 L211 494 Q210 514 233 526 L294 548 Q306 554 298 566 L102 566 Q94 554 106 548 L167 526 Q190 514 189 494 Z" fill="url(#stem)" opacity=".72"/>',
  },
};

function svg(
  width: number,
  height: number,
  content: string,
  definitions = "",
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${definitions}</defs>
  ${content}
</svg>`;
}

const GLASS_GRADIENTS = `
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f5fcff" stop-opacity=".96"/>
    <stop offset=".28" stop-color="#cfe8f4" stop-opacity=".72"/>
    <stop offset=".72" stop-color="#80adbf" stop-opacity=".34"/>
    <stop offset="1" stop-color="#436b7d" stop-opacity=".58"/>
  </linearGradient>
  <linearGradient id="key" x1="0" y1="0" x2="1" y2="0">
    <stop stop-color="#ffffff" stop-opacity=".96"/>
    <stop offset=".4" stop-color="#d9f4ff" stop-opacity=".7"/>
    <stop offset="1" stop-color="#9cc9da" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="stem" x1="0" y1="0" x2="1" y2="0">
    <stop stop-color="#f5fcff" stop-opacity=".8"/>
    <stop offset=".32" stop-color="#cfe8f4" stop-opacity=".5"/>
    <stop offset=".68" stop-color="#729aac" stop-opacity=".22"/>
    <stop offset="1" stop-color="#cfe8f4" stop-opacity=".5"/>
  </linearGradient>
  <radialGradient id="base" cx=".28" cy=".2" r=".8">
    <stop stop-color="#f5fcff" stop-opacity=".78"/>
    <stop offset=".5" stop-color="#9bc2d2" stop-opacity=".35"/>
    <stop offset="1" stop-color="#35586a" stop-opacity=".18"/>
  </radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="4"/>
  </filter>
`;

function outsideMask(interior: string): string {
  return `<mask id="outside" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="600">
    <rect width="400" height="600" fill="white"/>
    <path d="${interior}" fill="black"/>
  </mask>`;
}

function glassBack(definition: GlassDefinition): string {
  return svg(
    400,
    600,
    `<g mask="url(#outside)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${definition.interior}" stroke="#183847" stroke-opacity=".28" stroke-width="30" filter="url(#soft)"/>
      <path d="${definition.interior}" stroke="url(#glass)" stroke-width="20"/>
      <path d="${definition.rim}" stroke="#183847" stroke-opacity=".45" stroke-width="25" filter="url(#soft)"/>
      <path d="${definition.rim}" stroke="url(#glass)" stroke-width="16"/>
      ${definition.reflections}
    </g>
    <g>${definition.stem}</g>`,
    `${GLASS_GRADIENTS}${outsideMask(definition.interior)}`,
  );
}

function glassFront(definition: GlassDefinition): string {
  return svg(
    400,
    600,
    `<g mask="url(#outside)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${definition.interior}" stroke="#294f61" stroke-opacity=".32" stroke-width="28" filter="url(#soft)"/>
      <path d="${definition.interior}" stroke="url(#glass)" stroke-width="18"/>
      <path d="${definition.rim}" stroke="#dff6ff" stroke-opacity=".72" stroke-width="13"/>
      <path d="${definition.rim}" stroke="#ffffff" stroke-opacity=".8" stroke-width="4"/>
      ${definition.reflections}
    </g>
    <g opacity=".72">${definition.stem}</g>`,
    `${GLASS_GRADIENTS}${outsideMask(definition.interior)}`,
  );
}

function glassMask(definition: GlassDefinition): string {
  return svg(400, 600, `<path d="${definition.interior}" fill="#ffffff"/>`);
}

function barTop(): string {
  const grain = Array.from({ length: 22 }, (_, index) => {
    const y = 38 + index * 38;
    const opacity = 0.08 + (index % 4) * 0.018;
    return `<path d="M-20 ${y} C110 ${y - 18} 200 ${y + 16} 330 ${y - 4} S500 ${y - 8} 590 ${y + 10}" fill="none" stroke="#d29b65" stroke-opacity="${opacity}" stroke-width="${2 + (index % 3)}"/>`;
  }).join("");

  return svg(
    560,
    840,
    `<rect width="560" height="840" fill="url(#wood)"/>
    <rect width="560" height="840" fill="url(#keyWash)"/>
    <g filter="url(#grainSoft)">${grain}</g>
    <path d="M0 576 C124 548 209 566 282 584 C359 602 447 599 560 566 L560 706 C442 726 349 715 273 694 C182 670 94 680 0 712 Z" fill="url(#caustic)" opacity=".72" filter="url(#causticSoft)"/>
    <ellipse cx="278" cy="650" rx="164" ry="42" fill="none" stroke="#f2d4a1" stroke-opacity=".18" stroke-width="14" filter="url(#causticSoft)"/>
    <rect y="784" width="560" height="56" fill="url(#edge)"/>`,
    `<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#5a3925"/><stop offset=".44" stop-color="#3a2418"/><stop offset="1" stop-color="#24150f"/>
    </linearGradient>
    <radialGradient id="keyWash" cx=".12" cy=".08" r=".92">
      <stop stop-color="#c98952" stop-opacity=".42"/><stop offset=".52" stop-color="#6b4028" stop-opacity=".08"/><stop offset="1" stop-color="#120b08" stop-opacity=".32"/>
    </radialGradient>
    <linearGradient id="caustic" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#f5d69d" stop-opacity="0"/><stop offset=".22" stop-color="#ffdca2" stop-opacity=".34"/><stop offset=".54" stop-color="#fff0c7" stop-opacity=".5"/><stop offset=".82" stop-color="#dba463" stop-opacity=".2"/><stop offset="1" stop-color="#f5d69d" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1b0f0a" stop-opacity=".15"/><stop offset="1" stop-color="#100907" stop-opacity=".65"/></linearGradient>
    <filter id="grainSoft"><feGaussianBlur stdDeviation=".8"/></filter>
    <filter id="causticSoft" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>`,
  );
}

function iceCube(): string {
  return svg(
    96,
    96,
    `<path d="M15 25 L56 10 L83 31 L76 75 L35 87 L10 63 Z" fill="url(#ice)" stroke="#dff7ff" stroke-width="5"/>
    <path d="M15 25 L45 42 L83 31 M45 42 L35 87 M45 42 L56 10" fill="none" stroke="#ffffff" stroke-opacity=".58" stroke-width="4"/>
    <path d="M21 28 L52 17 L42 37 Z" fill="#ffffff" opacity=".72"/>
    <path d="M55 47 L74 39 L69 65" fill="none" stroke="#6e9fb5" stroke-opacity=".32" stroke-width="5" stroke-linecap="round"/>`,
    `<linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".9"/><stop offset=".42" stop-color="#cfe8f4" stop-opacity=".76"/><stop offset="1" stop-color="#6e9fb5" stop-opacity=".64"/></linearGradient>`,
  );
}

function bottle(): string {
  return svg(
    96,
    192,
    `<path d="M34 7 Q48 1 62 7 L63 42 Q63 50 72 60 Q81 72 82 94 L84 170 Q84 186 68 189 L28 189 Q12 186 12 170 L14 94 Q15 72 24 60 Q33 50 33 42 Z" fill="url(#bottle)" stroke="#eef4f5" stroke-width="4"/>
    <path d="M34 12 Q48 7 62 12 L62 27 Q48 32 34 27 Z" fill="#edf4f5"/>
    <path d="M25 69 Q19 86 20 160" fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="9" stroke-linecap="round"/>
    <path d="M69 78 Q76 103 73 160" fill="none" stroke="#aebdc1" stroke-opacity=".42" stroke-width="6" stroke-linecap="round"/>
    <rect x="25" y="103" width="46" height="48" rx="12" fill="#ffffff" fill-opacity=".42" stroke="#e7edef" stroke-width="3"/>`,
    `<linearGradient id="bottle" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#ffffff"/><stop offset=".46" stop-color="#f5f8f8"/><stop offset=".78" stop-color="#dce5e7"/><stop offset="1" stop-color="#fafcfc"/></linearGradient>`,
  );
}

function stream(): string {
  return svg(
    128,
    8,
    '<rect width="128" height="8" rx="4" fill="url(#stream)"/><path d="M2 2.1 H112" stroke="#ffffff" stroke-opacity=".74" stroke-width="1.5" stroke-linecap="round"/>',
    '<linearGradient id="stream" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ffffff" stop-opacity=".96"/><stop offset=".62" stop-color="#f9fdff" stop-opacity=".76"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>',
  );
}

function displaceNoise(): Buffer {
  const width = 128;
  const height = 128;
  const data = Buffer.alloc(width * height * 3);
  let state = 0x5f3759df;

  for (let offset = 0; offset < data.length; offset += 3) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const value = 88 + ((state >>> 0) % 81);
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
  }

  return data;
}

function frost(): string {
  const crystals = Array.from({ length: 26 }, (_, index) => {
    const x = 58 + ((index * 67) % 286);
    const y = 134 + ((index * 89) % 218);
    const radius = 4 + (index % 7);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="#eaf9ff" opacity="${0.1 + (index % 4) * 0.05}"/>`;
  }).join("");

  return svg(
    400,
    600,
    `<path d="${GLASS_DEFINITIONS.coupe.interior}" fill="url(#mist)" opacity=".7"/>
    <g filter="url(#blur)">${crystals}</g>
    <path d="M62 143 Q200 120 338 143" fill="none" stroke="#f5fdff" stroke-opacity=".5" stroke-width="12" filter="url(#blur)"/>`,
    `<radialGradient id="mist" cx=".28" cy=".2" r=".82"><stop stop-color="#ffffff" stop-opacity=".48"/><stop offset=".5" stop-color="#d9f4ff" stop-opacity=".18"/><stop offset="1" stop-color="#a8d8e8" stop-opacity=".04"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="4"/></filter>`,
  );
}

function condensationDot(): string {
  return svg(
    24,
    32,
    '<ellipse cx="12" cy="17" rx="7" ry="11" fill="url(#drop)"/><ellipse cx="9" cy="12" rx="2.5" ry="4" fill="#ffffff" opacity=".88"/>',
    '<radialGradient id="drop" cx=".3" cy=".2" r=".8"><stop stop-color="#ffffff" stop-opacity=".92"/><stop offset=".35" stop-color="#cfe8f4" stop-opacity=".64"/><stop offset="1" stop-color="#56859a" stop-opacity=".32"/></radialGradient>',
  );
}

function rimHighlight(): string {
  return svg(
    96,
    240,
    '<path d="M71 12 C39 40 24 92 26 151 C27 188 18 214 7 230" fill="none" stroke="#122b36" stroke-opacity=".3" stroke-width="19" filter="url(#blur)"/><path d="M68 10 C36 42 27 93 29 150 C30 187 20 213 9 228" fill="none" stroke="url(#shine)" stroke-width="11" stroke-linecap="round"/>',
    '<linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".55" stop-color="#d9f4ff" stop-opacity=".72"/><stop offset="1" stop-color="#9fcbdc" stop-opacity="0"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="5"/></filter>',
  );
}

function limeWheel(): string {
  const segments = Array.from({ length: 8 }, (_, index) => {
    const angle = index * 45;
    return `<path d="M64 64 L64 20 A44 44 0 0 1 95.1 32.9 Z" fill="${index % 2 === 0 ? "#b9df63" : "#d8ef89"}" transform="rotate(${angle} 64 64)"/>`;
  }).join("");
  return svg(
    128,
    128,
    `<circle cx="64" cy="68" r="48" fill="#172112" opacity=".35" filter="url(#shadow)"/><circle cx="64" cy="64" r="50" fill="#4f7c27"/><circle cx="64" cy="64" r="44" fill="#d8ef89"/>${segments}<circle cx="64" cy="64" r="8" fill="#f4f2b1"/><path d="M29 39 A48 48 0 0 1 77 16" fill="none" stroke="#f3ffc1" stroke-opacity=".72" stroke-width="6" stroke-linecap="round"/>`,
    '<filter id="shadow"><feGaussianBlur stdDeviation="6"/></filter>',
  );
}

function cherry(): string {
  return svg(
    112,
    128,
    '<path d="M56 72 C56 39 66 23 91 15" fill="none" stroke="#668238" stroke-width="7" stroke-linecap="round"/><path d="M88 15 Q72 11 66 25 Q82 29 92 17" fill="#89a94b"/><circle cx="50" cy="83" r="32" fill="url(#fruit)"/><ellipse cx="37" cy="69" rx="9" ry="6" fill="#ffd3c8" opacity=".7"/><path d="M25 95 Q47 118 70 99" fill="none" stroke="#6d0f1c" stroke-opacity=".4" stroke-width="8" stroke-linecap="round"/>',
    '<radialGradient id="fruit" cx=".28" cy=".22" r=".8"><stop stop-color="#ff8b82"/><stop offset=".42" stop-color="#d83244"/><stop offset="1" stop-color="#6b1024"/></radialGradient>',
  );
}

function orangeSlice(): string {
  const rays = [
    [17, 99],
    [26, 72],
    [44, 53],
    [66, 48],
    [90, 57],
    [109, 79],
  ]
    .map(
      ([x, y]) =>
        `<path d="M64 105 L${x} ${y}" stroke="#fff0b0" stroke-opacity=".66" stroke-width="4"/>`,
    )
    .join("");
  return svg(
    128,
    128,
    `<path d="M8 105 A58 58 0 0 1 120 105 Z" fill="#d86d16"/><path d="M16 102 A50 50 0 0 1 112 102 Z" fill="url(#orange)"/>${rays}<path d="M26 74 A50 50 0 0 1 66 52" fill="none" stroke="#fff4bd" stroke-opacity=".6" stroke-width="7" stroke-linecap="round"/>`,
    '<linearGradient id="orange" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffd45a"/><stop offset=".55" stop-color="#f39a2b"/><stop offset="1" stop-color="#cf5514"/></linearGradient>',
  );
}

function grapefruitWedge(): string {
  return svg(
    144,
    128,
    '<path d="M8 105 L70 15 L136 104 Z" fill="#f2c570"/><path d="M17 99 L70 26 L126 98 Z" fill="url(#pink)"/><path d="M70 27 L70 98 M42 65 L70 98 M99 65 L70 98" stroke="#ffe5d0" stroke-opacity=".72" stroke-width="4"/><path d="M24 87 Q42 55 61 37" fill="none" stroke="#fff5dd" stroke-opacity=".62" stroke-width="7" stroke-linecap="round"/>',
    '<linearGradient id="pink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffb0a1"/><stop offset=".52" stop-color="#ee6e73"/><stop offset="1" stop-color="#c13f58"/></linearGradient>',
  );
}

function cherryOrange(): string {
  return svg(
    176,
    144,
    `<g transform="translate(0 16)">${orangeSlice().replace(/^.*?<svg[^>]*>|<\/svg>$/gs, "")}</g>
    <g transform="translate(76 2) scale(.72)">${cherry().replace(/^.*?<svg[^>]*>|<\/svg>$/gs, "")}</g>`,
  );
}

function rocket(): string {
  return svg(
    96,
    176,
    '<path d="M48 8 Q73 33 70 91 L59 125 L37 125 L26 91 Q23 33 48 8 Z" fill="url(#body)" stroke="#daeef4" stroke-width="4"/><circle cx="48" cy="61" r="13" fill="#173b52" stroke="#bfeafb" stroke-width="5"/><path d="M29 92 L10 126 L38 117 M67 92 L86 126 L58 117" fill="#d7554d" stroke="#f18b72" stroke-width="4" stroke-linejoin="round"/><path d="M38 127 L48 166 L58 127 Q48 143 38 127" fill="url(#flame)"/><path d="M34 39 Q39 20 48 12" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/>',
    '<linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".5" stop-color="#cfe8f4"/><stop offset="1" stop-color="#719eb1"/></linearGradient><linearGradient id="flame" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff49a"/><stop offset=".5" stop-color="#ff9d3d"/><stop offset="1" stop-color="#e04443" stop-opacity="0"/></linearGradient>',
  );
}

function saltOverlay(type: "margarita" | "highball"): string {
  const margarita = type === "margarita";
  const rim = margarita
    ? "M28 108 Q200 88 372 108"
    : "M118 88 Q200 76 282 88";
  const grains = Array.from({ length: margarita ? 48 : 30 }, (_, index) => {
    const span = margarita ? 330 : 154;
    const start = margarita ? 35 : 123;
    const x = start + ((index * 47) % span);
    const normalized = (x - 200) / (margarita ? 172 : 82);
    const y = (margarita ? 99 : 82) + normalized * normalized * (margarita ? 10 : 7) + ((index % 3) - 1) * 4;
    const radius = 2 + (index % 4);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${index % 3 === 0 ? "#ffffff" : "#f4ead7"}" opacity="${0.68 + (index % 3) * 0.1}"/>`;
  }).join("");

  return svg(
    400,
    600,
    `<path d="${rim}" fill="none" stroke="#f7eddc" stroke-opacity=".62" stroke-width="${margarita ? 11 : 9}" stroke-linecap="round"/>${grains}`,
  );
}

function softDot(
  size: number,
  centerColor: string,
  edgeColor: string,
  edgeOpacity: number,
): string {
  return svg(
    size,
    size,
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.42}" fill="url(#dot)"/>`,
    `<radialGradient id="dot"><stop stop-color="${centerColor}"/><stop offset=".42" stop-color="${edgeColor}" stop-opacity=".82"/><stop offset="1" stop-color="${edgeColor}" stop-opacity="${edgeOpacity}"/></radialGradient>`,
  );
}

function starMote(): string {
  return svg(
    32,
    32,
    '<path d="M16 1 L20 12 L31 16 L20 20 L16 31 L12 20 L1 16 L12 12 Z" fill="url(#star)"/><circle cx="16" cy="16" r="4" fill="#ffffff"/>',
    '<radialGradient id="star"><stop stop-color="#ffffff"/><stop offset=".42" stop-color="#d8eeff"/><stop offset="1" stop-color="#8cc7ed" stop-opacity="0"/></radialGradient>',
  );
}

const GLASS_SPECS: PlateSpec[] = Object.entries(GLASS_DEFINITIONS).flatMap(
  ([type, definition]) => [
    {
      filename: `glass-${type}-back.png`,
      width: 400,
      height: 600,
      render: () => glassBack(definition),
    },
    {
      filename: `glass-${type}-front.png`,
      width: 400,
      height: 600,
      render: () => glassFront(definition),
    },
    {
      filename: `glass-${type}-mask.png`,
      width: 400,
      height: 600,
      render: () => glassMask(definition),
    },
  ],
);

export const PLATE_SPECS: readonly PlateSpec[] = [
  { filename: "bar-top.png", width: 560, height: 840, render: barTop },
  ...GLASS_SPECS,
  { filename: "ice-cube.png", width: 96, height: 96, render: iceCube },
  { filename: "bottle.png", width: 96, height: 192, render: bottle },
  { filename: "stream.png", width: 128, height: 8, render: stream },
  {
    filename: "displace-noise.png",
    width: 128,
    height: 128,
    render: displaceNoise,
  },
  { filename: "frost.png", width: 400, height: 600, render: frost },
  {
    filename: "condensation-dot.png",
    width: 24,
    height: 32,
    render: condensationDot,
  },
  {
    filename: "rim-highlight.png",
    width: 96,
    height: 240,
    render: rimHighlight,
  },
  {
    filename: "garnish-lime-wheel.png",
    width: 128,
    height: 128,
    render: limeWheel,
  },
  {
    filename: "garnish-cherry.png",
    width: 112,
    height: 128,
    render: cherry,
  },
  {
    filename: "garnish-orange-slice.png",
    width: 128,
    height: 128,
    render: orangeSlice,
  },
  {
    filename: "garnish-grapefruit-wedge.png",
    width: 144,
    height: 128,
    render: grapefruitWedge,
  },
  {
    filename: "garnish-cherry-orange.png",
    width: 176,
    height: 144,
    render: cherryOrange,
  },
  {
    filename: "garnish-rocket.png",
    width: 96,
    height: 176,
    render: rocket,
  },
  {
    filename: "rim-salt-margarita.png",
    width: 400,
    height: 600,
    render: () => saltOverlay("margarita"),
  },
  {
    filename: "rim-salt-highball.png",
    width: 400,
    height: 600,
    render: () => saltOverlay("highball"),
  },
  {
    filename: "splash-dot.png",
    width: 32,
    height: 32,
    render: () => softDot(32, "#ffffff", "#d8f3ff", 0),
  },
  {
    filename: "foam-dot.png",
    width: 24,
    height: 24,
    render: () => softDot(24, "#fffdf2", "#f6ead2", 0),
  },
  {
    filename: "star-mote.png",
    width: 32,
    height: 32,
    render: starMote,
  },
];

async function writePlate(spec: PlateSpec, outputDirectory: string): Promise<void> {
  const source = spec.render();
  let image: sharp.Sharp;

  if (typeof source === "string") {
    image = sharp(Buffer.from(source));
  } else {
    image = sharp(source, {
      raw: { width: spec.width, height: spec.height, channels: 3 },
    }).blur(0.45);
  }

  await image
    .resize(spec.width, spec.height, { fit: "fill" })
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(outputDirectory, spec.filename));
}

export async function generateMixerPlates(
  outputDirectory = DEFAULT_OUTPUT_DIRECTORY,
): Promise<string[]> {
  await mkdir(outputDirectory, { recursive: true });

  for (const spec of PLATE_SPECS) {
    await writePlate(spec, outputDirectory);
  }

  return PLATE_SPECS.map(({ filename }) => filename);
}

async function main(): Promise<void> {
  const filenames = await generateMixerPlates();
  console.log(`Generated ${filenames.length} Cocktail Mixer plates:`);
  for (const filename of filenames) {
    console.log(`- ${filename}`);
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  main().catch((error: unknown) => {
    console.error("Failed to generate Cocktail Mixer plates:", error);
    process.exitCode = 1;
  });
}

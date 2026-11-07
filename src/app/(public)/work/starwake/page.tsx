import type { Metadata } from "next";
import { CaseStudy } from "@/components/portfolio/case-study";

export const metadata: Metadata = {
  title: "Starwake",
  description:
    "A browser space racer with Rocket League feel: wormhole tracks, boost pads, supersonic, demolitions, team dogfights and a craft builder.",
};

const STARWAKE_PLAY_URL = "/starwake/index.html";

const GALLERY = [
  {
    src: "/projects/starwake.jpg",
    caption:
      "Supersonic in Corona Run: the visor HUD's speed arch turns white-hot, streaks fill the tunnel and rivals' engines Doppler past.",
    alt: "A blue racer flying down a glowing teal wormhole past a ringed orange gas giant, with rival ships and a curved speed gauge reading 210",
  },
  {
    src: "/projects/starwake-title.jpg",
    caption: "The title screen flies an AI pilot through a live wormhole behind the menus.",
    alt: "Starwake title screen with menu buttons over a golden wormhole, asteroids and a cloudy planet",
  },
  {
    src: "/projects/starwake-forks.jpg",
    caption:
      "Rift Forks: rock spines split the tube three times, into a wide safe channel or a tight one with a big boost pad and mines.",
    alt: "A blue racer leading the pack down a green wormhole through an asteroid field past a cloudy orange planet",
  },
  {
    src: "/projects/starwake-medals.jpg",
    caption:
      "Results: a silver medal 1.1 s off gold, the XP breakdown, a rank up and two unlocks for the hangar.",
    alt: "Starwake results panel showing a silver medal, plus 623 XP with a rank-up tag, unlocked metallic paint and comet trail, and the finishing order",
  },
  {
    src: "/projects/starwake-battle.jpg",
    caption:
      "Team battle in Drift Yard: Blue versus Red, first to ten kills, with a plasmoid drifting through the rock field.",
    alt: "Two ships dogfighting among asteroids beside a glowing magenta plasmoid, with a blue and red team scoreboard",
  },
  {
    src: "/projects/starwake-hangar.jpg",
    caption:
      "The hangar: five bodies plus wings, engines, fins, cockpits and paint. Every part shifts six ratings, and mass is the trade-off.",
    alt: "A low-poly starfighter on a glowing hangar pad, with part pickers, colour swatches and a performance panel",
  },
];

const SECTIONS = [
  {
    heading: "The idea",
    body:
      "Flying through space dodging asteroids, plasmoids and alien drones should feel epic. The first prototype raced through rings in open space and was too hard to follow, so the track became a wormhole: a glowing tube that snakes past planets and stations. Its wall keeps you on course without stopping you, so all of your attention goes on the racing.",
  },
  {
    heading: "Rocket League physics, pod-racer speed",
    body:
      "• Boost pads: small ones down the safe middle line, three big ones a lap out by the wall, so the risky line pays\n• Supersonic at full boosted speed, with a sonic trail and a louder engine\n• Demolitions: hit a rival head-on while supersonic and they respawn behind; slower hits are bumps\n• Dodge: a sideways barrel roll that also knocks away incoming lasers\n• Near misses with rocks and rivals top up your boost\n• Streaks, radial blur, FOV kick, engine shake and Doppler pass-bys sell the speed",
  },
  {
    heading: "Two modes and a hostile galaxy",
    body:
      "Races are won by crossing the line first, against AI pilots or other players. Battle is a free-roam deathmatch around a derelict station, as a free-for-all or Blue versus Red. Both can carry hazards: drifting plasmoids that burn on contact, and the Vesk, an alien drone faction that ambushes everyone. Asteroids, cargo pods and satellites break into tumbling chunks and drop boost, missiles or shield repairs.",
  },
  {
    heading: "Reasons to race again",
    body:
      "• Ghosts: your best run on each course races alongside you as a hologram, with a live ahead/behind time\n• Medals: bronze, silver and gold targets on every track, plus a secret fourth tier\n• Pilot rank: XP from every race unlocks parts, paint finishes and boost trail styles\n• Replays: a slow-motion finish-line replay, and highlights of demolitions and photo finishes\n• Daily run: a new wormhole generated from the date, the same for everyone\n• Music that builds with your speed, lifts on the last lap and opens up when you go supersonic",
  },
  {
    heading: "Easy to pick up",
    body:
      "The ship turns toward the mouse reticle. Track assist eases you down the tunnel when you let go, aim assist locks missiles on rivals in range, and flight assist steers round rocks. Each assist runs from Off to Strong, so new pilots can enjoy the scenery and experienced ones can turn everything off. The pace was deliberately slowed to feel cinematic rather than twitchy.",
  },
  {
    heading: "How it's built",
    body:
      "Plain ES modules and a vendored Three.js r187, with no bundler. The game ships no textures, models or sound files: the sky, planets, asteroids, craft, engine audio and nine-layer adaptive soundtrack are all generated in code. Physics run at a fixed 120 Hz. Every course and arena is built from its id with a seeded random generator, so every client agrees on object ids without syncing them, and the daily run is generated and validated the same way from the date. Medal times are derived from each course's length, obstacles and bends, so generated courses get fair targets too. AI pilots use the same controls as a player. Headless tests race every preset on every course, check 60 future daily runs, check that hands-off and flailing pilots still finish, run bot battles, round-trip ghosts and exercise the network code before a release.",
  },
  {
    heading: "Multiplayer",
    body:
      "Players host or join a lobby with a four-letter code, or send an invite link that joins the room directly. Each player simulates their own ship and sends compact snapshots 20 times a second, and remote ships are drawn 110 ms in the past with interpolation. Online play goes through a small WebSocket relay with origin checks, rate limits and keepalive, ready to host on Render. On this site, multiplayer currently runs between Starwake tabs in the same browser.",
  },
];

export default function StarwakeCasePage() {
  return (
    <CaseStudy
      title="Starwake"
      lede="Wormhole racing with Rocket League feel: boost pads, supersonic, demolitions and team dogfights. Plays in the browser with a keyboard and mouse or a controller."
      tags={["Three.js", "WebGL 2", "Web Audio", "ES modules", "WebSockets"]}
      githubUrl="https://github.com/CosmonautJones/starwake"
      playUrl={STARWAKE_PLAY_URL}
      playLabel="Play Starwake"
      gallery={GALLERY}
      sections={SECTIONS}
    />
  );
}

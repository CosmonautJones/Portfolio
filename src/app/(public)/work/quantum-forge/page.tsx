import type { Metadata } from "next";
import { CaseStudy } from "@/components/portfolio/case-study";

export const metadata: Metadata = {
  title: "Quantum Forge",
  description:
    "A slow, musical browser game through the quantum realm, from vacuum foam and quarks to the first light, a star's heart and the cosmic web.",
};

const QUANTUM_FORGE_PLAY_URL = "/quantum-forge/index.html";

const GALLERY = [
  {
    src: "/projects/quantum-forge.jpg",
    caption: "Title screen: a 3d xy hydrogen orbital, sampled in 3D from |ψ|² and coloured by phase. Drag it, or touch the void to play notes.",
    alt: "Quantum Forge title screen with a rotating hydrogen orbital point cloud",
  },
  {
    src: "/projects/quantum-forge-foam.jpg",
    caption: "Chapter I, The Foam: holding Focus lends a flickering electron–positron pair enough energy to become real.",
    alt: "A glowing particle pair in shimmering, iridescent quantum foam",
  },
  {
    src: "/projects/quantum-forge-confinement.jpg",
    caption: "Chapter II, Confinement: quarks tethered by gluon strings. Pull too hard and a string snaps into a new quark–antiquark pair.",
    alt: "Red and green quarks joined to the player by sparkling gluon strings",
  },
  {
    src: "/projects/quantum-forge-first-light.jpg",
    caption: "Chapter IV, First Light: hydrogen's Hα and Hβ emission lines painted across the sky, beside the energy-level staff.",
    alt: "Red and cyan aurora bands across a dark sky with an energy-level diagram",
  },
  {
    src: "/projects/quantum-forge-star.jpg",
    caption: "Chapter V, The Heart of a Star: a trembling beryllium-8 nucleus waits for a second alpha particle on the beat.",
    alt: "A golden nucleus surrounded by drifting alpha particles in a red stellar core",
  },
  {
    src: "/projects/quantum-forge-web.jpg",
    caption: "Chapter VI, The Cosmic Web: galaxy clusters strung along filaments, each holding one open question.",
    alt: "Clusters of galaxies connected by faint filaments",
  },
];

const SECTIONS = [
  {
    heading: "The idea",
    body:
      "A game that feels closer to a planetarium show than an arcade. You play a ripple of probability that wakes in the vacuum foam and rises through six scales of reality, from 10⁻³⁵ metres to 10²⁵. Nothing is timed. When something important happens, time slows to 8%, the camera pushes in behind letterbox bars, and the physics is explained in a sentence or two.",
  },
  {
    heading: "Six scales, six verbs",
    body:
      "• The Foam: hold Focus to make a virtual particle pair real\n• Confinement: combine one quark of each colour; stretched gluon strings snap into new matter\n• The First Nuclei: become a wave to tunnel through the Coulomb barrier and build helium-4\n• First Light: catch an electron, then absorb only the photons that fit hydrogen's energy gaps\n• The Heart of a Star: strike the beat to hit the Hoyle resonance and make carbon\n• The Cosmic Web: visit five open questions, then one small yellow star",
  },
  {
    heading: "Real values, compressed time",
    body:
      "The numbers on screen are measured: Hα 656.3 nm, Hβ 486.1 nm and Hγ 434.0 nm, hydrogen's 13.6 eV ionization energy, the 2.22 MeV deuteron, and the 7.65 MeV Hoyle state. The title sculpture samples real hydrogen wavefunctions in three dimensions. What is simplified is time: beryllium-8 lasts about 10⁻¹⁶ s in nature and three beats in the game.",
  },
  {
    heading: "How it's built",
    body:
      "One self-contained HTML file with no dependencies. A full-screen GLSL shader draws the foam from domain-warped noise and animated Voronoi cells, with shockwave ripples that bend the field. Particles are additive glow points, drawn a second time into a half-resolution buffer and blurred for bloom. The score is generated with Web Audio: a chapter-specific pad, pentatonic bell tones for every interaction, and a heartbeat scheduled on the audio clock that also judges rhythm timing.",
  },
  {
    heading: "Story, access and performance",
    body:
      "A prologue, one hidden echo per chapter with a deeper fact, and field notes that keep every explanation you reach. Keyboard, mouse and touch all work, reduced-motion settings soften shake and ripples, and the renderer lowers its resolution when frames run long.",
  },
];

export default function QuantumForgeCasePage() {
  return (
    <CaseStudy
      title="Quantum Forge"
      lede="A slow, musical journey through the quantum realm, from the vacuum foam to the cosmic web. Best with sound on; about twenty minutes."
      tags={["WebGL 2", "GLSL", "Web Audio", "No dependencies"]}
      playUrl={QUANTUM_FORGE_PLAY_URL}
      playLabel="Play Quantum Forge"
      gallery={GALLERY}
      sections={SECTIONS}
    />
  );
}

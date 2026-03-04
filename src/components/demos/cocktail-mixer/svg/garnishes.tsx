import { motion } from "motion/react";
import type { GarnishType } from "../types";
import { GLASS_CONFIGS } from "../data";

interface GarnishOverlayProps {
  type: GarnishType;
  glass: string;
  visible: boolean;
}

const springPop = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring" as const, stiffness: 300, damping: 15, delay: 0.2 },
};

function LimeWheel({ x, y }: { x: number; y: number }) {
  return (
    <motion.g {...springPop}>
      <circle cx={x} cy={y} r={8} fill="#6cbe44" fillOpacity={0.8} />
      <circle cx={x} cy={y} r={5} fill="#a8d853" fillOpacity={0.6} />
      {/* Radial segments */}
      {[0, 60, 120].map((angle) => (
        <line
          key={angle}
          x1={x}
          y1={y - 5}
          x2={x}
          y2={y + 5}
          stroke="#4a8c2a"
          strokeWidth={0.6}
          strokeOpacity={0.5}
          transform={`rotate(${angle}, ${x}, ${y})`}
        />
      ))}
    </motion.g>
  );
}

function Cherry({ x, y }: { x: number; y: number }) {
  return (
    <motion.g {...springPop}>
      <circle cx={x} cy={y} r={5} fill="#dc143c" fillOpacity={0.85} />
      <circle cx={x - 1} cy={y - 1} r={1.5} fill="white" fillOpacity={0.2} />
      <path
        d={`M${x},${y - 5} Q${x + 2},${y - 12} ${x - 1},${y - 14}`}
        fill="none"
        stroke="#654321"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </motion.g>
  );
}

function OrangeSlice({ x, y }: { x: number; y: number }) {
  return (
    <motion.g {...springPop}>
      <path
        d={`M${x - 10},${y} A10,10 0 0,1 ${x + 10},${y}`}
        fill="#ffa500"
        fillOpacity={0.7}
      />
      <path
        d={`M${x - 8},${y} A8,8 0 0,1 ${x + 8},${y}`}
        fill="#ffcc66"
        fillOpacity={0.4}
      />
      {/* Segment lines */}
      {[-6, -2, 2, 6].map((dx) => (
        <line
          key={dx}
          x1={x + dx}
          y1={y}
          x2={x + dx * 0.6}
          y2={y - 7}
          stroke="#e8960a"
          strokeWidth={0.5}
          strokeOpacity={0.5}
        />
      ))}
    </motion.g>
  );
}

function GrapefruitWedge({ x, y }: { x: number; y: number }) {
  return (
    <motion.g {...springPop}>
      <path
        d={`M${x},${y - 8} L${x - 8},${y + 4} L${x + 8},${y + 4} Z`}
        fill="#e8846a"
        fillOpacity={0.7}
      />
      <path
        d={`M${x},${y - 5} L${x - 5},${y + 2} L${x + 5},${y + 2} Z`}
        fill="#f5a0b0"
        fillOpacity={0.4}
      />
    </motion.g>
  );
}

function SaltRim({ glass }: { glass: string }) {
  const config = GLASS_CONFIGS[glass];
  // Parse rim path start/end for dot placement
  const rimMatch = config.rim.match(/M([\d.]+),([\d.]+)\s+L([\d.]+),([\d.]+)/);
  if (!rimMatch) return null;

  const x1 = parseFloat(rimMatch[1]);
  const y = parseFloat(rimMatch[2]);
  const x2 = parseFloat(rimMatch[3]);
  const count = 16;

  return (
    <motion.g {...springPop}>
      {Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        const x = x1 + (x2 - x1) * t;
        const jitterY = (Math.random() - 0.5) * 3;
        return (
          <circle
            key={i}
            cx={x}
            cy={y + jitterY}
            r={1 + Math.random() * 0.5}
            fill="currentColor"
            fillOpacity={0.2 + Math.random() * 0.1}
          />
        );
      })}
    </motion.g>
  );
}

function RocketGarnish({ x, y }: { x: number; y: number }) {
  return (
    <motion.g {...springPop}>
      {/* Rocket body */}
      <path
        d={`M${x},${y - 12} L${x - 4},${y} L${x + 4},${y} Z`}
        fill="#8b5cf6"
        fillOpacity={0.8}
      />
      {/* Rocket fins */}
      <path
        d={`M${x - 4},${y - 2} L${x - 7},${y + 2} L${x - 3},${y} Z`}
        fill="#a78bfa"
        fillOpacity={0.6}
      />
      <path
        d={`M${x + 4},${y - 2} L${x + 7},${y + 2} L${x + 3},${y} Z`}
        fill="#a78bfa"
        fillOpacity={0.6}
      />
      {/* Window */}
      <circle cx={x} cy={y - 6} r={2} fill="#e0e7ff" fillOpacity={0.7} />
      {/* Flame */}
      <path
        d={`M${x - 2},${y} Q${x},${y + 6} ${x + 2},${y}`}
        fill="#fbbf24"
        fillOpacity={0.7}
      />
    </motion.g>
  );
}

function CherryOrange({ x, y }: { x: number; y: number }) {
  return (
    <motion.g {...springPop}>
      <OrangeSlice x={x - 6} y={y} />
      <Cherry x={x + 8} y={y - 2} />
    </motion.g>
  );
}

function SaltGrapefruit({ x, y, glass }: { x: number; y: number; glass: string }) {
  return (
    <motion.g {...springPop}>
      <SaltRim glass={glass} />
      <GrapefruitWedge x={x} y={y} />
    </motion.g>
  );
}

function SaltLime({ x, y, glass }: { x: number; y: number; glass: string }) {
  return (
    <motion.g {...springPop}>
      <SaltRim glass={glass} />
      <LimeWheel x={x} y={y} />
    </motion.g>
  );
}

export function GarnishOverlay({ type, glass, visible }: GarnishOverlayProps) {
  if (!visible) return null;

  const config = GLASS_CONFIGS[glass];
  // Position garnish near the rim
  const rimY = config.liquidTop - 5;
  const garnishX = 140;

  switch (type) {
    case "lime_wheel":
      return <LimeWheel x={garnishX} y={rimY} />;
    case "cherry":
      return <Cherry x={garnishX} y={rimY} />;
    case "orange_slice":
      return <OrangeSlice x={garnishX} y={rimY} />;
    case "grapefruit_wedge":
      return <GrapefruitWedge x={garnishX} y={rimY} />;
    case "salt_rim":
      return <SaltRim glass={glass} />;
    case "cherry_orange":
      return <CherryOrange x={garnishX} y={rimY} />;
    case "salt_grapefruit":
      return <SaltGrapefruit x={garnishX} y={rimY} glass={glass} />;
    case "salt_lime":
      return <SaltLime x={garnishX} y={rimY} glass={glass} />;
    case "rocket":
      return <RocketGarnish x={garnishX} y={rimY} />;
  }
}

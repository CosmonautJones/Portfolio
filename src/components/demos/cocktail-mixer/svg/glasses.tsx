import { useId } from "react";
import { GLASS_CONFIGS } from "../data";

export function GlassSvg({ glass }: { glass: string }) {
  const rawId = useId();
  const gradId = `sheen${rawId.replace(/:/g, "")}`;
  const config = GLASS_CONFIGS[glass];

  return (
    <>
      {/* Glass sheen gradient */}
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity={0.05} />
          <stop offset="50%" stopColor="white" stopOpacity={0.02} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Glass body with subtle sheen */}
      <path
        d={config.outline}
        fill={`url(#${gradId})`}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Double-line rim highlight */}
      <path
        d={config.rim}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={config.rim}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Base */}
      <path
        d={config.base}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Side highlight */}
      <path
        d={config.highlight}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* Condensation dots on iced glasses */}
      {config.hasIce && (
        <g opacity={0.07}>
          <circle cx={32} cy={130} r={1.5} fill="currentColor" />
          <circle cx={168} cy={150} r={1.2} fill="currentColor" />
          <circle cx={35} cy={170} r={1} fill="currentColor" />
          <circle cx={165} cy={120} r={1.3} fill="currentColor" />
          <circle cx={30} cy={200} r={1.1} fill="currentColor" />
          <circle cx={170} cy={190} r={1.4} fill="currentColor" />
          <circle cx={34} cy={155} r={0.9} fill="currentColor" />
          <circle cx={167} cy={170} r={1.2} fill="currentColor" />
          <circle cx={33} cy={220} r={1} fill="currentColor" />
          <circle cx={166} cy={210} r={0.8} fill="currentColor" />
        </g>
      )}
    </>
  );
}

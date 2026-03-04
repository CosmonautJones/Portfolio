/** Custom SVG card illustrations for each cocktail (64x80 viewBox) */

interface CardIconProps {
  className?: string;
}

export function MargaritaIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      {/* Wide V-shaped glass */}
      <path
        d="M8,20 L28,58 L28,68 L22,68 L22,72 L42,72 L42,68 L36,68 L36,58 L56,20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Lime liquid */}
      <path
        d="M14,30 L26,56 L38,56 L50,30 Z"
        fill="#a8d853"
        fillOpacity={0.6}
      />
      {/* Salt rim dots */}
      {[10, 16, 22, 28, 34, 40, 48, 54].map((x) => (
        <circle
          key={x}
          cx={x}
          cy={19}
          r={1}
          fill="currentColor"
          fillOpacity={0.3}
        />
      ))}
      {/* Lime wheel */}
      <circle cx={48} cy={26} r={5} fill="#6cbe44" fillOpacity={0.7} />
      <circle cx={48} cy={26} r={3} fill="#a8d853" fillOpacity={0.5} />
    </svg>
  );
}

export function PalomaIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      {/* Tall highball */}
      <rect
        x={18}
        y={12}
        width={28}
        height={56}
        rx={3}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Pink liquid */}
      <rect
        x={20}
        y={22}
        width={24}
        height={44}
        rx={2}
        fill="#f5a0b0"
        fillOpacity={0.5}
      />
      {/* Bubbles */}
      <circle cx={28} cy={48} r={1.5} fill="white" fillOpacity={0.4} />
      <circle cx={35} cy={40} r={1} fill="white" fillOpacity={0.3} />
      <circle cx={30} cy={55} r={1} fill="white" fillOpacity={0.35} />
      {/* Grapefruit wedge */}
      <path
        d="M40,16 L48,10 L48,22 Z"
        fill="#e8846a"
        fillOpacity={0.7}
      />
    </svg>
  );
}

export function TequilaSunriseIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      {/* Highball glass */}
      <rect
        x={18}
        y={12}
        width={28}
        height={56}
        rx={3}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Gradient layers — red bottom to orange top */}
      <rect x={20} y={50} width={24} height={16} rx={2} fill="#dc143c" fillOpacity={0.6} />
      <rect x={20} y={36} width={24} height={16} fill="#ff6b35" fillOpacity={0.5} />
      <rect x={20} y={22} width={24} height={16} rx={2} fill="#ffa500" fillOpacity={0.5} />
      {/* Orange slice */}
      <path
        d="M38,14 A8,8 0 0,1 50,14"
        fill="#ffa500"
        fillOpacity={0.7}
        stroke="#e8960a"
        strokeWidth={0.5}
      />
      {/* Cherry */}
      <circle cx={44} cy={18} r={2.5} fill="#dc143c" fillOpacity={0.8} />
      <path d="M44,16 Q45,12 43,10" fill="none" stroke="#654321" strokeWidth={0.7} />
    </svg>
  );
}

export function WhiskeySourIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      {/* Coupe glass */}
      <path
        d="M10,24 Q18,26 26,48 L26,62 L22,62 L22,68 L42,68 L42,62 L38,62 L38,48 Q46,26 54,24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Amber liquid */}
      <path
        d="M14,28 Q20,30 27,46 L37,46 Q44,30 50,28 Z"
        fill="#f5d78e"
        fillOpacity={0.6}
      />
      {/* Cherry garnish */}
      <circle cx={38} cy={28} r={3} fill="#dc143c" fillOpacity={0.8} />
      <path d="M38,25 Q39,21 37,18" fill="none" stroke="#654321" strokeWidth={0.7} />
    </svg>
  );
}

export function OldFashionedIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      {/* Short rocks glass */}
      <path
        d="M14,28 L18,68 L46,68 L50,28"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Amber liquid */}
      <rect x={16} y={38} width={32} height={28} rx={1} fill="#c47a2b" fillOpacity={0.5} />
      {/* Large ice cube */}
      <rect x={24} y={40} width={14} height={12} rx={1} fill="white" fillOpacity={0.15} stroke="white" strokeOpacity={0.2} strokeWidth={0.5} />
      {/* Orange peel */}
      <path
        d="M42,32 Q48,28 52,32"
        fill="none"
        stroke="#ff8c00"
        strokeWidth={2}
        strokeLinecap="round"
        strokeOpacity={0.8}
      />
    </svg>
  );
}

export function SaltyDogIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      {/* Highball glass */}
      <rect
        x={18}
        y={12}
        width={28}
        height={56}
        rx={3}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Peach-orange liquid */}
      <rect x={20} y={24} width={24} height={42} rx={2} fill="#f4a460" fillOpacity={0.5} />
      {/* Salt rim dots */}
      {[20, 25, 30, 35, 40, 44].map((x) => (
        <circle
          key={x}
          cx={x}
          cy={12}
          r={0.8}
          fill="currentColor"
          fillOpacity={0.3}
        />
      ))}
      {/* Grapefruit slice */}
      <path
        d="M40,16 A6,6 0 0,1 50,16"
        fill="#e8846a"
        fillOpacity={0.7}
      />
    </svg>
  );
}

export function CosmonautIcon({ className }: CardIconProps) {
  return (
    <svg viewBox="0 0 64 80" width={64} height={80} className={className}>
      <defs>
        <linearGradient id="cosmo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Coupe glass */}
      <path
        d="M10,24 Q18,26 26,48 L26,62 L22,62 L22,68 L42,68 L42,62 L38,62 L38,48 Q46,26 54,24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {/* Purple liquid with gradient */}
      <path
        d="M14,28 Q20,30 27,46 L37,46 Q44,30 50,28 Z"
        fill="url(#cosmo-grad)"
        fillOpacity={0.65}
      />
      {/* Star sparkles */}
      <polygon points="20,18 21,15 22,18 25,19 22,20 21,23 20,20 17,19" fill="#fbbf24" fillOpacity={0.7} />
      <polygon points="44,14 45,12 46,14 48,15 46,16 45,18 44,16 42,15" fill="#fbbf24" fillOpacity={0.5} />
      <polygon points="32,10 32.5,8 33,10 35,10.5 33,11 32.5,13 32,11 30,10.5" fill="#fbbf24" fillOpacity={0.6} />
      {/* Small rocket garnish */}
      <path
        d="M42,26 L44,20 L46,26 M43,26 L44,28 L45,26"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={1}
        strokeLinecap="round"
        strokeOpacity={0.8}
      />
    </svg>
  );
}

/** Map cocktail name → icon component */
export const CARD_ICONS: Record<string, React.ComponentType<CardIconProps>> = {
  Margarita: MargaritaIcon,
  Paloma: PalomaIcon,
  "Tequila Sunrise": TequilaSunriseIcon,
  "Whiskey Sour": WhiskeySourIcon,
  "Old Fashioned": OldFashionedIcon,
  "Salty Dog": SaltyDogIcon,
  "The Cosmonaut": CosmonautIcon,
};

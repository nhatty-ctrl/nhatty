import React from 'react';

export const AVATAR_COLORS = [
  '#C7F26B', // Lime
  '#7FB2FF', // Blue
  '#FF8A65', // Coral
  '#C4A6FF', // Purple
  '#5EE0C0', // Aqua/Teal
  '#FFC857', // Amber
  '#FF8FB1', // Pink
  '#8DA2FB', // Periwinkle
  '#F59E7A', // Peach
  '#E5E2D8', // Light Gray
];

export interface AvatarPersona {
  id: string;
  name: string;
  type: 'founder' | 'creator';
  renderFeatures: (d: string) => React.ReactNode;
}

const D = '#16140F';

export const AVATAR_PERSONAS: AvatarPersona[] = [
  // Founders
  {
    id: 'builder',
    name: 'Builder',
    type: 'founder',
    renderFeatures: (d) => (
      <g>
        {/* Antenna */}
        <path d="M40 16 L40 9" stroke={d} strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="7" r="3.5" fill={d} />
        {/* Pill eyes */}
        <rect x="31" y="35" width="6" height="14" rx="3" fill={d} />
        <rect x="43" y="35" width="6" height="14" rx="3" fill={d} />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'operator',
    name: 'Operator',
    type: 'founder',
    renderFeatures: (d) => (
      <g>
        {/* Shades */}
        <rect x="26" y="36" width="12" height="9" rx="3" fill={d} />
        <rect x="42" y="36" width="12" height="9" rx="3" fill={d} />
        <rect x="37" y="39" width="6" height="2.5" fill={d} />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'visionary',
    name: 'Visionary',
    type: 'founder',
    renderFeatures: (d) => (
      <g>
        {/* Spark */}
        <path d="M64 6 L66 12 L72 14 L66 16 L64 22 L62 16 L56 14 L62 12 Z" fill={d} />
        {/* Wink: left pill eye, right arc wink */}
        <rect x="31" y="35" width="6" height="14" rx="3" fill={d} />
        <path d="M42 46 Q46 38 50 46" stroke={d} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'maker',
    name: 'Maker',
    type: 'founder',
    renderFeatures: (d) => (
      <g>
        {/* Beanie */}
        <path d="M14 31 A26 22 0 0 1 66 31 Z" fill={d} />
        <rect x="13" y="28" width="54" height="7" rx="3.5" fill="#2E2E2B" />
        <circle cx="40" cy="9" r="4" fill={d} />
        {/* Pill eyes */}
        <rect x="31" y="35" width="6" height="14" rx="3" fill={d} />
        <rect x="43" y="35" width="6" height="14" rx="3" fill={d} />
      </g>
    ),
  },
  {
    id: 'boss',
    name: 'Boss',
    type: 'founder',
    renderFeatures: (d) => (
      <g>
        {/* Monocle */}
        <circle cx="49" cy="42" r="8.5" fill="none" stroke={d} strokeWidth="2.5" />
        <path d="M52 50 L56 62" stroke={d} strokeWidth="2" strokeLinecap="round" />
        {/* Pill eyes */}
        <rect x="31" y="35" width="6" height="14" rx="3" fill={d} />
        <rect x="43" y="35" width="6" height="14" rx="3" fill={d} />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },

  // Creators
  {
    id: 'streamer',
    name: 'Streamer',
    type: 'creator',
    renderFeatures: (d) => (
      <g>
        {/* Headphones */}
        <path d="M13 44 A27 28 0 0 1 67 44" stroke={d} strokeWidth="5" fill="none" />
        <rect x="8" y="40" width="9" height="17" rx="4.5" fill={d} />
        <rect x="63" y="40" width="9" height="17" rx="4.5" fill={d} />
        {/* Pill eyes */}
        <rect x="31" y="35" width="6" height="14" rx="3" fill={d} />
        <rect x="43" y="35" width="6" height="14" rx="3" fill={d} />
      </g>
    ),
  },
  {
    id: 'vlogger',
    name: 'Vlogger',
    type: 'creator',
    renderFeatures: (d) => (
      <g>
        {/* Cap */}
        <path d="M16 31 A24 19 0 0 1 64 31 Z" fill={d} />
        <path d="M38 31 L72 31 Q72 37 60 37 L38 37 Z" fill="#2E2E2B" />
        {/* Arcs eyes */}
        <path d="M30 46 Q34 38 38 46 M42 46 Q46 38 50 46" stroke={d} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'trendsetter',
    name: 'Trendsetter',
    type: 'creator',
    renderFeatures: (d) => (
      <g>
        {/* Spark */}
        <path d="M64 6 L66 12 L72 14 L66 16 L64 22 L62 16 L56 14 L62 12 Z" fill={d} />
        {/* Arcs eyes */}
        <path d="M30 46 Q34 38 38 46 M42 46 Q46 38 50 46" stroke={d} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'chill',
    name: 'Chill',
    type: 'creator',
    renderFeatures: (d) => (
      <g>
        {/* Headband */}
        <path d="M14 33 Q40 21 66 33" stroke={d} strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Sleepy eyes */}
        <rect x="30" y="44" width="8" height="3.5" rx="1.75" fill={d} />
        <rect x="42" y="44" width="8" height="3.5" rx="1.75" fill={d} />
        {/* Smile */}
        <path d="M34 56 Q40 62 46 56" stroke={d} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'hype',
    name: 'Hype',
    type: 'creator',
    renderFeatures: (d) => (
      <g>
        {/* Pill eyes */}
        <rect x="31" y="35" width="6" height="14" rx="3" fill={d} />
        <rect x="43" y="35" width="6" height="14" rx="3" fill={d} />
        {/* Oh mouth */}
        <circle cx="40" cy="58" r="3.5" fill={d} />
      </g>
    ),
  },
];

export const DEFAULT_AVATAR_PALETTE = AVATAR_COLORS[0]; // Lime '#C7F26B'
export const DEFAULT_AVATAR_PERSONA = 'builder';
export type AvatarMood = string;
export const DEFAULT_AVATAR_MOOD = 'builder';

interface SmileyAvatarProps {
  paletteId?: string; // Hex color or color index
  personaId?: string; // ID of persona: builder, streamer, etc.
  mood?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const SmileyAvatar: React.FC<SmileyAvatarProps> = ({
  paletteId = DEFAULT_AVATAR_PALETTE,
  personaId = DEFAULT_AVATAR_PERSONA,
  mood,
  size = 34,
  className = '',
  onClick,
}) => {
  // Support either personaId or mood
  const activeId = personaId || mood || DEFAULT_AVATAR_PERSONA;
  const persona = AVATAR_PERSONAS.find((p) => p.id === activeId) || AVATAR_PERSONAS[0];

  // Resolve color (either raw hex or palette key)
  const bgColor = paletteId.startsWith('#')
    ? paletteId
    : AVATAR_COLORS[0];

  return (
    <div
      onClick={onClick}
      className={`rounded-full flex items-center justify-center shrink-0 select-none overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${persona.name} avatar`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        role="img"
        aria-hidden="true"
        className="w-full h-full"
      >
        {/* Outer color circle */}
        <circle cx="40" cy="40" r="40" fill={bgColor} />
        {/* Silver inner face */}
        <circle cx="40" cy="43" r="27" fill="#D8D7D2" />
        {/* Specular highlight */}
        <ellipse
          cx="31"
          cy="31"
          rx="10"
          ry="4.5"
          fill="#EEEDE9"
          transform="rotate(-25 31 31)"
        />
        {/* Persona features */}
        {persona.renderFeatures(D)}
      </svg>
    </div>
  );
};

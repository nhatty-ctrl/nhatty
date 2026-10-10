import React from 'react';

export const ICONS_SVG: Record<string, string> = {
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  book: '<path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M8 4v13"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6"/><path d="M16 5a3.5 3.5 0 010 6M18 14c2 .8 3 3 3 6"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  pct: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  apple: '<path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8C6.9 7.5 5.5 8.4 4.7 9.8c-1.6 2.8-.4 6.9 1.2 9.1.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3z" fill="currentColor"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="3"/><path d="M5 15V6a2 2 0 012-2h9"/>',
  game: '<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4M15.5 12h.01M18 14h.01"/>',
  wallet: '<path d="M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M4 7l11-3v3M16 14h2"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  chat: '<path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  map: '<path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2z"/><path d="M9 4v14M15 6v14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 01-8 0zM8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 14v4M8 20h8"/>',
  trend: '<path d="M4 17l5-5 4 4 7-8M15 8h5v5"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6h-3M14 20h.01"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  moon: '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  bell: '<path d="M6 16V11a6 6 0 1112 0v5l2 2H4z"/><path d="M10 21h4"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  kredLogo: '<path d="M12 4v16M5 8l14 8M19 8L5 16"/>',
  navCampaigns: '<path d="M4 11l16-7v16L4 13z"/><path d="M8 14v5"/>',
  navDiscover: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
};

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

// Sculpted organic petal: blooms gracefully from base near center to rounded crown
const PETAL_PATH =
  'M 50 46 C 40 42, 27 32, 30 18 C 33 6, 67 6, 70 18 C 73 32, 60 42, 50 46 Z';

// Standalone single sculpted petal centered in viewport
const SINGLE_PETAL_PATH =
  'M 50 84 C 34 80, 16 58, 22 32 C 27 12, 73 12, 78 32 C 84 58, 66 80, 50 84 Z';

export const UmiLogoMark: React.FC<{
  size?: number | string;
  variant?: 'lime' | 'dark' | 'ghost';
  className?: string;
  spinning?: boolean;
}> = ({ size = 32, variant = 'lime', className = '', spinning = false }) => {
  const color = variant === 'lime' ? '#C9B8FF' : variant === 'dark' ? '#0E0E0E' : '#F4F2EC';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 select-none ${spinning ? 'spin' : ''} ${className}`}
      aria-label="Umi logo mark"
    >
      <path d={PETAL_PATH} fill={color} />
      <path d={PETAL_PATH} fill={color} transform="rotate(90 50 50)" />
      <path d={PETAL_PATH} fill={color} transform="rotate(180 50 50)" />
      <path d={PETAL_PATH} fill={color} transform="rotate(270 50 50)" />
    </svg>
  );
};

export const UmiPetalMark: React.FC<{
  size?: number | string;
  color?: string;
  className?: string;
  spinning?: boolean;
}> = ({ size = 24, color = '#C9B8FF', className = '', spinning = false }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 select-none ${spinning ? 'spin' : ''} ${className}`}
      aria-label="Umi petal mark"
    >
      <path d={SINGLE_PETAL_PATH} fill={color} />
    </svg>
  );
};

export const UmiLockup: React.FC<{
  markSize?: number;
  variant?: 'lime' | 'dark' | 'inverted';
  className?: string;
}> = ({ markSize = 28, variant = 'lime', className = '' }) => {
  const isLightBanner = variant === 'inverted';
  return (
    <div
      className={`inline-flex items-center gap-[10px] select-none ${
        isLightBanner ? 'bg-[#C9B8FF] text-[#000000] px-3 py-1.5 rounded-[12px]' : ''
      } ${className}`}
    >
      <UmiLogoMark size={markSize} variant={isLightBanner ? 'dark' : 'lime'} />
      <span
        className={`font-serif tracking-tight font-medium ${
          isLightBanner ? 'text-[#000000]' : 'text-[#F4F2EC]'
        }`}
        style={{ fontSize: `${Math.max(20, Math.round(markSize * 0.78))}px`, lineHeight: 1 }}
      >
        umi
      </span>
    </div>
  );
};

export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5', fill = false, style }) => {
  const svgContent = ICONS_SVG[name];
  if (!svgContent) {
    return <span className={`inline-block ${className}`} />;
  }

  return (
    <svg
      className={`shrink-0 transition-transform ${className}`}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={fill ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

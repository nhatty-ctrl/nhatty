export type PayoutType = 'fixed' | 'pct';
export type UserRole = 'creator' | 'founder';

export interface CampaignRate {
  t: PayoutType;
  v: number;
  avg?: number;
}

export interface Campaign {
  id: string;
  name: string;
  cat: string;
  by: string; // Company / Studio name
  host?: string; // alias for by
  tag: string; // Short tagline, e.g. "Pop, match, repeat"
  desc: string;
  price: string; // e.g. "1.80"
  rate?: CampaignRate;
  pay: string; // e.g. "$1.80 per verified install"
  days: number; // e.g. 25
  creators: number; // e.g. 638
  rating: string; // e.g. "4.7"
  installsVerified: string; // e.g. "12.4k"
  rc?: string;
  icon: string; // tabler icon e.g. "ti-device-gamepad-2"
  bg: string; // pastel background e.g. "#CECBF6"
  fg: string; // dark text pair e.g. "#26215C"
  slug: string;
  joined: boolean;
  appleUrl?: string;
  playUrl?: string;
  platforms?: ('ios' | 'android')[];
  hue?: [string, string];
  posted?: string;
  budget?: number;
  sdkConnected?: boolean;
}

export interface CampaignStats {
  days: number[];
  inst: number;
  clicks: number;
  conv: number;
  earned: number;
}

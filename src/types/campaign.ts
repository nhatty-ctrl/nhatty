export type PayoutType = 'fixed' | 'pct';
export type UserRole = 'creator' | 'founder';

export interface CampaignRate {
  t: PayoutType;
  v: number;
  avg?: number;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorHandle: string;
  creatorName: string;
  primaryChannel: 'tiktok' | 'youtube' | 'instagram' | 'x' | 'twitch';
  followerCount: string;
  pitchNote: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface UserSocialLinks {
  twitter?: string;
  tiktok?: string;
  instagram?: string;
  youtube?: string;
  twitch?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  role: UserRole;
  avatarPalette: string;
  avatarMood: string;
  socials: UserSocialLinks;
  onboardingCompleted: boolean;
}

export interface WithdrawalReceipt {
  id: string;
  amount: number;
  fee: number;
  net: number;
  destination: string;
  methodType: 'bank' | 'card' | 'paypal' | 'usdc';
  timestamp: string;
  status: 'completed' | 'processing';
  hash: string;
  creatorHandle: string;
  settlementBatch: string;
}

export interface SettlementReceipt {
  id: string;
  campaignId: string;
  campaignName: string;
  amount: number;
  timestamp: string;
  type: 'deposit' | 'weekly_disbursement';
  status: 'confirmed';
  settlementHash: string;
  recipientCount?: number;
  escrowRemaining: number;
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
  requiresApproval?: boolean;
  applicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  isCreatedByMe?: boolean;
  logoUrl?: string; // uploaded square logo image data URL
  sdkKey?: string;
  escrowSettled?: number;
  escrowBalance?: number;
}

export interface CampaignStats {
  days: number[];
  inst: number;
  clicks: number;
  conv: number;
  earned: number;
}

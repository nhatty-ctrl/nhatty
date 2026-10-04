// Umi Convex Data Model & Type System
// Based on the Umi Convex Backend & Product UI Blueprint

export type UserRole = 'founder' | 'creator' | 'admin';

export type RewardStatus =
  | 'pending'
  | 'qualified'
  | 'on_hold'
  | 'verified'
  | 'available'
  | 'paid'
  | 'frozen'
  | 'rejected'
  | 'reversed';

export const REWARD_STATUS_LABELS: Record<RewardStatus, { label: string; meaning: string; badgeColor: string }> = {
  pending: {
    label: 'Pending',
    meaning: 'We received the activity and are checking the campaign rules.',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  qualified: {
    label: 'Qualified',
    meaning: 'The required event was completed.',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  on_hold: {
    label: 'On hold',
    meaning: 'The reward is waiting for the safety hold window to finish.',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  verified: {
    label: 'Verified',
    meaning: 'The reward passed the automated safety checks.',
    badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
  available: {
    label: 'Available',
    meaning: 'The reward is eligible for payout.',
    badgeColor: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
  },
  paid: {
    label: 'Paid',
    meaning: 'The payout provider confirmed the transfer.',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  frozen: {
    label: 'Frozen',
    meaning: 'We temporarily stopped this reward because an automated safety rule triggered.',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  rejected: {
    label: 'Rejected',
    meaning: 'The activity did not meet the campaign terms.',
    badgeColor: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
  },
  reversed: {
    label: 'Reversed',
    meaning: 'The reward was removed after a later refund, dispute, or chargeback signal.',
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
};

export interface Organization {
  id: string;
  name: string;
  ownerUserId: string;
  type: 'founder' | 'platform';
  legalCountry: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  handle: string;
  name: string;
  avatarUrl?: string;
  payoutState: 'not_connected' | 'onboarding' | 'ready' | 'restricted';
  whopAccountId?: string;
  riskTier: 'standard' | 'trusted' | 'probation';
  status: 'active' | 'frozen';
  joinedAt: string;
}

export interface FounderApp {
  id: string;
  organizationId: string;
  name: string;
  bundleId: string;
  appStoreId: string;
  teamId: string;
  ownershipState: 'verified' | 'pending_dns' | 'failed';
  sdkState: 'connected' | 'waiting_first_event' | 'disconnected';
  icon: string;
  category: string;
  createdAt: string;
  lastEventAt?: string;
}

export interface AppKey {
  id: string;
  appId: string;
  publicPrefix: string;
  secretHash: string;
  status: 'active' | 'rotated' | 'revoked';
  createdAt: string;
  rotatedAt?: string;
}

export interface Campaign {
  id: string;
  founderOrgId: string;
  appId: string;
  name: string;
  appName: string;
  category: string;
  icon: string;
  status: 'active' | 'paused' | 'ended';
  currency: 'USD';
  rewardMinor: number; // e.g. 450 = $4.50
  qualifyingEvent: string; // e.g. "onboarding_completed", "first_workout", "iap_subscription"
  qualifyingEventLabel: string;
  startAt: string;
  endAt: string;
  totalBudgetMinor: number; // e.g. 1000000 = $10,000.00
  reservedMinor: number;
  paidMinor: number;
  holdDays: number; // e.g. 7 or 14
  riskPolicyId: string;
  version: number;
  creatorsCount: number;
  clicksCount: number;
  installsCount: number;
  qualifiedCount: number;
  createdAt: string;
}

export interface CampaignVersion {
  id: string;
  campaignId: string;
  version: number;
  rewardMinor: number;
  eventRule: string;
  termsVersion: string;
  effectiveAt: string;
  createdBy: string;
}

export interface ReferralCode {
  id: string;
  campaignId: string;
  creatorId: string;
  code: string; // e.g. "ALEX88"
  slug: string;
  shortUrl: string;
  qrPayload: string;
  status: 'active' | 'expired' | 'revoked';
  clicks: number;
  installs: number;
  createdAt: string;
}

export interface ClickRecord {
  id: string;
  referralCodeId: string;
  creatorId: string;
  campaignId: string;
  userAgentClass: 'ios_safari' | 'chrome' | 'bot_filtered' | 'other';
  country: string;
  occurredAt: string;
  acceptedAt?: string;
  botClass?: 'human' | 'suspicious' | 'crawler';
}

export interface SourceConfirmation {
  id: string;
  appId: string;
  campaignId: string;
  creatorId: string;
  code: string;
  installToken: string;
  confirmationMethod: 'clipboard_deep_link' | 'manual_code_entry' | 'universal_link';
  confirmedAt: string;
}

export interface SdkEvent {
  id: string;
  eventId: string;
  appId: string;
  installId: string;
  eventType: 'app_install' | 'source_confirmed' | 'qualifying_event' | 'iap_purchase';
  clientTime: string;
  receivedAt: string;
  payloadHash: string;
  sdkVersion: string;
  status: 'processed' | 'duplicate' | 'rejected';
  metadata?: Record<string, any>;
}

export interface AttributionDecision {
  id: string;
  installId: string;
  campaignId: string;
  campaignName: string;
  creatorId: string;
  creatorHandle: string;
  confidence: number; // 0.00 to 1.00
  status: 'approved' | 'rejected' | 'frozen_under_review';
  ruleVersion: string;
  evidenceIds: string[];
  reasonCode: string;
  decidedAt: string;
  ledgerTransactionId?: string;
}

// Double-Entry Ledger Schema
export type LedgerAccountKind =
  | 'founder_escrow'
  | 'creator_payable_pending'
  | 'creator_payable_available'
  | 'platform_revenue'
  | 'whop_clearing_in_transit'
  | 'payout_settled';

export interface LedgerAccount {
  id: string;
  ownerType: 'organization' | 'creator' | 'platform';
  ownerId: string;
  name: string;
  kind: LedgerAccountKind;
  currency: 'USD';
  balanceMinor: number;
  allowNegative: boolean;
}

export interface LedgerTransaction {
  id: string;
  idempotencyKey: string;
  kind:
    | 'escrow_deposit'
    | 'reward_reserved'
    | 'hold_released'
    | 'payout_initiated'
    | 'payout_settled'
    | 'reversal';
  referenceType: 'campaign' | 'attribution' | 'payout' | 'deposit';
  referenceId: string;
  description: string;
  createdAt: string;
  entries: LedgerEntry[];
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  accountName: string;
  direction: 'debit' | 'credit';
  amountMinor: number;
  currency: 'USD';
}

export interface RewardEntitlement {
  id: string;
  campaignId: string;
  campaignName: string;
  creatorId: string;
  creatorHandle: string;
  attributionId: string;
  amountMinor: number;
  currency: 'USD';
  status: RewardStatus;
  holdUntil: string;
  ledgerTransactionId: string;
  ruleVersion: string;
  createdAt: string;
  releasedAt?: string;
  paidAt?: string;
  frozenReason?: string;
}

export interface PayoutIntent {
  id: string;
  creatorId: string;
  amountMinor: number;
  currency: 'USD';
  provider: 'whop';
  providerPayoutId?: string;
  idempotencyKey: string;
  status: 'pending' | 'in_transit' | 'settled' | 'failed';
  submittedAt: string;
  settledAt?: string;
  failureReason?: string;
}

export interface ProviderInboxItem {
  id: string;
  provider: 'whop' | 'revenuecat' | 'apple';
  providerEventId: string;
  eventType: string;
  rawBodyHash: string;
  receivedAt: string;
  processingState: 'processed' | 'pending' | 'failed';
  processedAt?: string;
  summary: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  role: 'admin' | 'system' | 'founder';
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// Umi In-Memory Convex Reactive Engine
// Implements the Umi Convex Backend & Product UI Blueprint

import {
  UserRole,
  RewardStatus,
  Organization,
  CreatorProfile,
  FounderApp,
  AppKey,
  Campaign,
  CampaignVersion,
  ReferralCode,
  ClickRecord,
  SourceConfirmation,
  SdkEvent,
  AttributionDecision,
  LedgerAccount,
  LedgerTransaction,
  LedgerEntry,
  RewardEntitlement,
  PayoutIntent,
  ProviderInboxItem,
  AuditLogItem,
} from '../types/umi';

const STORAGE_KEY = 'umi_convex_state_v1';

export interface UmiState {
  currentRole: UserRole;
  organizations: Organization[];
  creators: CreatorProfile[];
  apps: FounderApp[];
  appKeys: AppKey[];
  campaigns: Campaign[];
  campaignVersions: CampaignVersion[];
  referralCodes: ReferralCode[];
  clicks: ClickRecord[];
  sourceConfirmations: SourceConfirmation[];
  sdkEvents: SdkEvent[];
  attributionDecisions: AttributionDecision[];
  ledgerAccounts: LedgerAccount[];
  ledgerTransactions: LedgerTransaction[];
  rewardEntitlements: RewardEntitlement[];
  payouts: PayoutIntent[];
  providerInbox: ProviderInboxItem[];
  auditLogs: AuditLogItem[];
}

const INITIAL_APPS: FounderApp[] = [
  {
    id: 'app_pixelpop',
    organizationId: 'org_nova_games',
    name: 'Pixel Pop',
    bundleId: 'com.novaplay.pixelpop',
    appStoreId: 'id1598234120',
    teamId: '9Y82KA923B',
    ownershipState: 'verified',
    sdkState: 'connected',
    icon: 'ti-device-gamepad-2',
    category: 'Games',
    createdAt: '2026-09-10T10:00:00Z',
    lastEventAt: '3 mins ago',
  },
  {
    id: 'app_stride',
    organizationId: 'org_northbeat',
    name: 'Stride Health',
    bundleId: 'com.northbeat.stride',
    appStoreId: 'id1629841029',
    teamId: '3X44PZ819A',
    ownershipState: 'verified',
    sdkState: 'connected',
    icon: 'ti-heart',
    category: 'Health & Fitness',
    createdAt: '2026-09-15T12:30:00Z',
    lastEventAt: '12 mins ago',
  },
  {
    id: 'app_focusly',
    organizationId: 'org_deepwork',
    name: 'Focusly AI',
    bundleId: 'com.deepwork.focusly',
    appStoreId: 'id1492048123',
    teamId: '8K29QW112M',
    ownershipState: 'verified',
    sdkState: 'connected',
    icon: 'ti-bolt',
    category: 'Productivity',
    createdAt: '2026-09-18T14:15:00Z',
    lastEventAt: '1 hour ago',
  },
  {
    id: 'app_vaultly',
    organizationId: 'org_vault_fin',
    name: 'Vaultly',
    bundleId: 'com.vaultly.finance',
    appStoreId: 'id1688192039',
    teamId: '7L55MT482N',
    ownershipState: 'pending_dns',
    sdkState: 'waiting_first_event',
    icon: 'ti-coin',
    category: 'Finance',
    createdAt: '2026-09-28T09:00:00Z',
    lastEventAt: undefined,
  },
];

const INITIAL_APP_KEYS: AppKey[] = [
  {
    id: 'key_1',
    appId: 'app_pixelpop',
    publicPrefix: 'umi_live_pxp_9f82b',
    secretHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'active',
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'key_2',
    appId: 'app_stride',
    publicPrefix: 'umi_live_str_44a19',
    secretHash: 'sha256_d41d8cd98f00b204e9800998ecf8427e',
    status: 'active',
    createdAt: '2026-09-15T12:30:00Z',
  },
  {
    id: 'key_3',
    appId: 'app_focusly',
    publicPrefix: 'umi_live_foc_88c21',
    secretHash: 'sha256_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    status: 'active',
    createdAt: '2026-09-18T14:15:00Z',
  },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_pixelpop',
    founderOrgId: 'org_nova_games',
    appId: 'app_pixelpop',
    name: 'Pixel Pop Verified Installs',
    appName: 'Pixel Pop',
    category: 'Games',
    icon: 'ti-device-gamepad-2',
    status: 'active',
    currency: 'USD',
    rewardMinor: 180, // $1.80
    qualifyingEvent: 'level_3_completed',
    qualifyingEventLabel: 'Complete Level 3 (Anti-Fraud Proof)',
    startAt: '2026-09-20T00:00:00Z',
    endAt: '2026-10-25T00:00:00Z',
    totalBudgetMinor: 500000, // $5,000.00
    reservedMinor: 182400, // $1,824.00
    paidMinor: 94200, // $942.00
    holdDays: 7,
    riskPolicyId: 'policy_standard_v1',
    version: 1,
    creatorsCount: 638,
    clicksCount: 14280,
    installsCount: 3120,
    qualifiedCount: 1536,
    createdAt: '2026-09-20T00:00:00Z',
  },
  {
    id: 'camp_stride',
    founderOrgId: 'org_northbeat',
    appId: 'app_stride',
    name: 'Stride 7-Day Step Challenge',
    appName: 'Stride Health',
    category: 'Health & Fitness',
    icon: 'ti-heart',
    status: 'active',
    currency: 'USD',
    rewardMinor: 290, // $2.90
    qualifyingEvent: 'first_1000_steps_logged',
    qualifyingEventLabel: 'Log First 1,000 Steps in HealthKit',
    startAt: '2026-09-22T00:00:00Z',
    endAt: '2026-11-01T00:00:00Z',
    totalBudgetMinor: 800000, // $8,000.00
    reservedMinor: 245000,
    paidMinor: 122000,
    holdDays: 7,
    riskPolicyId: 'policy_health_v1',
    version: 1,
    creatorsCount: 351,
    clicksCount: 9450,
    installsCount: 2040,
    qualifiedCount: 1265,
    createdAt: '2026-09-22T00:00:00Z',
  },
  {
    id: 'camp_focusly',
    founderOrgId: 'org_deepwork',
    appId: 'app_focusly',
    name: 'Focusly Deep Work Acquisition',
    appName: 'Focusly AI',
    category: 'Productivity',
    icon: 'ti-bolt',
    status: 'active',
    currency: 'USD',
    rewardMinor: 210, // $2.10
    qualifyingEvent: 'first_focus_session_25m',
    qualifyingEventLabel: 'Finish 25-Min Focus Session',
    startAt: '2026-09-25T00:00:00Z',
    endAt: '2026-10-31T00:00:00Z',
    totalBudgetMinor: 650000,
    reservedMinor: 148000,
    paidMinor: 88000,
    holdDays: 14,
    riskPolicyId: 'policy_standard_v1',
    version: 1,
    creatorsCount: 204,
    clicksCount: 6800,
    installsCount: 1540,
    qualifiedCount: 1120,
    createdAt: '2026-09-25T00:00:00Z',
  },
];

const INITIAL_REFERRAL_CODES: ReferralCode[] = [
  {
    id: 'ref_alex_pxp',
    campaignId: 'camp_pixelpop',
    creatorId: 'creator_alex',
    code: 'ALEX24',
    slug: 'pixelpop-alex24',
    shortUrl: 'https://umi.link/c/ALEX24',
    qrPayload: 'https://umi.link/c/ALEX24',
    status: 'active',
    clicks: 1420,
    installs: 312,
    createdAt: '2026-09-21T11:00:00Z',
  },
  {
    id: 'ref_alex_stride',
    campaignId: 'camp_stride',
    creatorId: 'creator_alex',
    code: 'ALEXFIT',
    slug: 'stride-alexfit',
    shortUrl: 'https://umi.link/c/ALEXFIT',
    qrPayload: 'https://umi.link/c/ALEXFIT',
    status: 'active',
    clicks: 890,
    installs: 184,
    createdAt: '2026-09-23T14:00:00Z',
  },
];

const INITIAL_LEDGER_ACCOUNTS: LedgerAccount[] = [
  {
    id: 'acc_escrow_pixelpop',
    ownerType: 'organization',
    ownerId: 'org_nova_games',
    name: 'Pixel Pop Escrow Reserve',
    kind: 'founder_escrow',
    currency: 'USD',
    balanceMinor: 223400, // $2,234.00 remaining
    allowNegative: false,
  },
  {
    id: 'acc_escrow_stride',
    ownerType: 'organization',
    ownerId: 'org_northbeat',
    name: 'Stride Escrow Reserve',
    kind: 'founder_escrow',
    currency: 'USD',
    balanceMinor: 433000, // $4,330.00 remaining
    allowNegative: false,
  },
  {
    id: 'acc_creator_pending_alex',
    ownerType: 'creator',
    ownerId: 'creator_alex',
    name: 'Alex Bekele Pending Rewards',
    kind: 'creator_payable_pending',
    currency: 'USD',
    balanceMinor: 8460, // $84.60
    allowNegative: false,
  },
  {
    id: 'acc_creator_avail_alex',
    ownerType: 'creator',
    ownerId: 'creator_alex',
    name: 'Alex Bekele Available for Payout',
    kind: 'creator_payable_available',
    currency: 'USD',
    balanceMinor: 24860, // $248.60
    allowNegative: false,
  },
  {
    id: 'acc_whop_clearing',
    ownerType: 'platform',
    ownerId: 'platform_umi',
    name: 'Whop Payout Clearing Account',
    kind: 'whop_clearing_in_transit',
    currency: 'USD',
    balanceMinor: 0,
    allowNegative: true,
  },
  {
    id: 'acc_platform_fees',
    ownerType: 'platform',
    ownerId: 'platform_umi',
    name: 'Umi Platform Fee Revenue',
    kind: 'platform_revenue',
    currency: 'USD',
    balanceMinor: 18450,
    allowNegative: false,
  },
  {
    id: 'acc_payout_settled_global',
    ownerType: 'platform',
    ownerId: 'platform_umi',
    name: 'Settled Creator Transfers (Whop)',
    kind: 'payout_settled',
    currency: 'USD',
    balanceMinor: 462500,
    allowNegative: true,
  },
];

const INITIAL_REWARDS: RewardEntitlement[] = [
  {
    id: 'rew_101',
    campaignId: 'camp_pixelpop',
    campaignName: 'Pixel Pop',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    attributionId: 'att_88190',
    amountMinor: 180,
    currency: 'USD',
    status: 'available',
    holdUntil: '2026-10-01T12:00:00Z',
    ledgerTransactionId: 'tx_hold_rel_101',
    ruleVersion: 'v1.4',
    createdAt: '2026-09-24T12:00:00Z',
    releasedAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'rew_102',
    campaignId: 'camp_stride',
    campaignName: 'Stride Health',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    attributionId: 'att_88191',
    amountMinor: 290,
    currency: 'USD',
    status: 'on_hold',
    holdUntil: '2026-10-06T15:00:00Z',
    ledgerTransactionId: 'tx_res_102',
    ruleVersion: 'v1.4',
    createdAt: '2026-09-29T15:00:00Z',
  },
  {
    id: 'rew_103',
    campaignId: 'camp_pixelpop',
    campaignName: 'Pixel Pop',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    attributionId: 'att_88192',
    amountMinor: 180,
    currency: 'USD',
    status: 'pending',
    holdUntil: '2026-10-08T18:00:00Z',
    ledgerTransactionId: 'tx_res_103',
    ruleVersion: 'v1.4',
    createdAt: '2026-10-01T18:00:00Z',
  },
  {
    id: 'rew_104',
    campaignId: 'camp_stride',
    campaignName: 'Stride Health',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    attributionId: 'att_88193',
    amountMinor: 290,
    currency: 'USD',
    status: 'paid',
    holdUntil: '2026-09-25T10:00:00Z',
    ledgerTransactionId: 'tx_payout_104',
    ruleVersion: 'v1.3',
    createdAt: '2026-09-18T10:00:00Z',
    releasedAt: '2026-09-25T10:00:00Z',
    paidAt: '2026-09-26T17:00:00Z',
  },
  {
    id: 'rew_105',
    campaignId: 'camp_pixelpop',
    campaignName: 'Pixel Pop',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    attributionId: 'att_88194',
    amountMinor: 180,
    currency: 'USD',
    status: 'frozen',
    holdUntil: '2026-10-09T00:00:00Z',
    ledgerTransactionId: 'tx_res_105',
    ruleVersion: 'v1.4',
    createdAt: '2026-10-02T08:00:00Z',
    frozenReason: 'Automated safety check: IP subnet cluster velocity exceeded threshold.',
  },
];

const INITIAL_ATTRIBUTIONS: AttributionDecision[] = [
  {
    id: 'att_88190',
    installId: 'inst_tok_9918a',
    campaignId: 'camp_pixelpop',
    campaignName: 'Pixel Pop',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    confidence: 0.98,
    status: 'approved',
    ruleVersion: 'v1.4',
    evidenceIds: ['clk_8812', 'src_conf_912', 'evt_lvl3_101'],
    reasonCode: 'source_confirmed_level3_verified',
    decidedAt: '2026-09-24T12:05:00Z',
    ledgerTransactionId: 'tx_res_101',
  },
  {
    id: 'att_88191',
    installId: 'inst_tok_4412b',
    campaignId: 'camp_stride',
    campaignName: 'Stride Health',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    confidence: 0.95,
    status: 'approved',
    ruleVersion: 'v1.4',
    evidenceIds: ['clk_8899', 'src_conf_913', 'evt_steps_102'],
    reasonCode: 'healthkit_steps_verified',
    decidedAt: '2026-09-29T15:04:00Z',
    ledgerTransactionId: 'tx_res_102',
  },
  {
    id: 'att_88194',
    installId: 'inst_tok_7721d',
    campaignId: 'camp_pixelpop',
    campaignName: 'Pixel Pop',
    creatorId: 'creator_alex',
    creatorHandle: '@amara',
    confidence: 0.52,
    status: 'frozen_under_review',
    ruleVersion: 'v1.4',
    evidenceIds: ['clk_9100', 'src_conf_914'],
    reasonCode: 'velocity_threshold_breach',
    decidedAt: '2026-10-02T08:01:00Z',
  },
];

const INITIAL_PROVIDER_INBOX: ProviderInboxItem[] = [
  {
    id: 'inbox_whop_8812',
    provider: 'whop',
    providerEventId: 'whop_evt_transfer_settled_91823',
    eventType: 'payout.settled',
    rawBodyHash: 'sha256_7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    receivedAt: '2026-10-02T16:45:00Z',
    processingState: 'processed',
    processedAt: '2026-10-02T16:45:01Z',
    summary: 'Whop confirmed payout $142.50 to Chase Checking (••4821)',
  },
  {
    id: 'inbox_rc_1092',
    provider: 'revenuecat',
    providerEventId: 'rc_evt_sub_initial_4492',
    eventType: 'INITIAL_PURCHASE',
    rawBodyHash: 'sha256_3b64db6bc22f7d9e7093b48324b476b70f04d2f641e39b724f07a8259457870b',
    receivedAt: '2026-10-02T18:12:00Z',
    processingState: 'processed',
    processedAt: '2026-10-02T18:12:01Z',
    summary: 'Pixel Pop monthly VIP pass purchased by install tok_9918a',
  },
  {
    id: 'inbox_apple_551',
    provider: 'apple',
    providerEventId: 'appstore_notif_v2_91002',
    eventType: 'DID_RENEW',
    rawBodyHash: 'sha256_6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    receivedAt: '2026-10-03T02:00:00Z',
    processingState: 'processed',
    processedAt: '2026-10-03T02:00:01Z',
    summary: 'App Store server notification: Auto-renewable subscription renewed',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit_1',
    actor: 'system_scheduler',
    role: 'system',
    action: 'hold_scheduler_run',
    targetType: 'reward_entitlements',
    targetId: 'rew_101',
    details: 'Hold expired at 2026-10-01T12:00:00Z. Atomic transition: on_hold → available ($1.80).',
    timestamp: '2026-10-01T12:00:01Z',
  },
  {
    id: 'audit_2',
    actor: 'admin_security',
    role: 'admin',
    action: 'risk_freeze_triggered',
    targetType: 'attribution_decision',
    targetId: 'att_88194',
    details: 'Automated policy rule triggered: IP subnet burst rate > 12 events/min.',
    timestamp: '2026-10-02T08:01:00Z',
  },
  {
    id: 'audit_3',
    actor: 'founder_nova',
    role: 'founder',
    action: 'campaign_created',
    targetType: 'campaign',
    targetId: 'camp_pixelpop',
    details: 'Created Pixel Pop campaign version 1 with $5,000 budget and 7-day safety hold.',
    timestamp: '2026-09-20T00:00:00Z',
  },
];

class UmiConvexStore {
  private state: UmiState;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): UmiState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.campaigns && parsed.ledgerAccounts) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse Umi state from localStorage', e);
    }

    return {
      currentRole: 'founder',
      organizations: [
        {
          id: 'org_nova_games',
          name: 'Nova Play Studio',
          ownerUserId: 'user_founder_nova',
          type: 'founder',
          legalCountry: 'US',
          status: 'active',
          createdAt: '2026-09-01T00:00:00Z',
        },
      ],
      creators: [
        {
          id: 'creator_alex',
          userId: 'user_alex',
          handle: '@amara',
          name: 'Amara Bekele',
          payoutState: 'ready',
          whopAccountId: 'whop_acct_88192a',
          riskTier: 'trusted',
          status: 'active',
          joinedAt: '2026-09-12T00:00:00Z',
        },
      ],
      apps: INITIAL_APPS,
      appKeys: INITIAL_APP_KEYS,
      campaigns: INITIAL_CAMPAIGNS,
      campaignVersions: [
        {
          id: 'ver_pxp_1',
          campaignId: 'camp_pixelpop',
          version: 1,
          rewardMinor: 180,
          eventRule: 'level_3_completed',
          termsVersion: 'terms_v1_2026',
          effectiveAt: '2026-09-20T00:00:00Z',
          createdBy: 'user_founder_nova',
        },
      ],
      referralCodes: INITIAL_REFERRAL_CODES,
      clicks: [
        {
          id: 'clk_8812',
          referralCodeId: 'ref_alex_pxp',
          creatorId: 'creator_alex',
          campaignId: 'camp_pixelpop',
          userAgentClass: 'ios_safari',
          country: 'US',
          occurredAt: '2026-09-24T11:45:00Z',
          acceptedAt: '2026-09-24T11:45:01Z',
          botClass: 'human',
        },
      ],
      sourceConfirmations: [
        {
          id: 'src_conf_912',
          appId: 'app_pixelpop',
          campaignId: 'camp_pixelpop',
          creatorId: 'creator_alex',
          code: 'ALEX24',
          installToken: 'inst_tok_9918a',
          confirmationMethod: 'manual_code_entry',
          confirmedAt: '2026-09-24T11:58:00Z',
        },
      ],
      sdkEvents: [
        {
          id: 'evt_lvl3_101',
          eventId: 'evt_9100_lvl3',
          appId: 'app_pixelpop',
          installId: 'inst_tok_9918a',
          eventType: 'qualifying_event',
          clientTime: '2026-09-24T12:04:30Z',
          receivedAt: '2026-09-24T12:04:32Z',
          payloadHash: 'sha256_mock_8812',
          sdkVersion: '1.2.0',
          status: 'processed',
          metadata: { level: 3, score: 420 },
        },
      ],
      attributionDecisions: INITIAL_ATTRIBUTIONS,
      ledgerAccounts: INITIAL_LEDGER_ACCOUNTS,
      ledgerTransactions: [
        {
          id: 'tx_seed_escrow',
          idempotencyKey: 'idem_seed_escrow_nova',
          kind: 'escrow_deposit',
          referenceType: 'deposit',
          referenceId: 'dep_1001',
          description: 'Escrow funding via Whop Checkout for Pixel Pop ($5,000.00)',
          createdAt: '2026-09-20T00:00:00Z',
          entries: [
            {
              id: 'ent_1',
              transactionId: 'tx_seed_escrow',
              accountId: 'acc_whop_clearing',
              accountName: 'Whop Payout Clearing',
              direction: 'debit',
              amountMinor: 500000,
              currency: 'USD',
            },
            {
              id: 'ent_2',
              transactionId: 'tx_seed_escrow',
              accountId: 'acc_escrow_pixelpop',
              accountName: 'Pixel Pop Escrow Reserve',
              direction: 'credit',
              amountMinor: 500000,
              currency: 'USD',
            },
          ],
        },
      ],
      rewardEntitlements: INITIAL_REWARDS,
      payouts: [
        {
          id: 'payout_whop_9921',
          creatorId: 'creator_alex',
          amountMinor: 14250, // $142.50
          currency: 'USD',
          provider: 'whop',
          providerPayoutId: 'whop_pay_tr_99182',
          idempotencyKey: 'idem_payout_alex_sept26',
          status: 'settled',
          submittedAt: '2026-09-26T14:00:00Z',
          settledAt: '2026-09-26T16:45:00Z',
        },
      ],
      providerInbox: INITIAL_PROVIDER_INBOX,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save Umi state to localStorage', e);
    }
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((sub) => sub());
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public getState(): UmiState {
    return this.state;
  }

  // -------------------------------------------------------------
  // Role & Session Mutations
  // -------------------------------------------------------------
  public setRole(role: UserRole): void {
    this.state.currentRole = role;
    this.saveState();
  }

  // -------------------------------------------------------------
  // Double-Entry Ledger Engine
  // Rule: External API calls NEVER happen inside money mutations.
  // Rule: Transactions must be balanced: sum(debits) === sum(credits).
  // -------------------------------------------------------------
  public postLedgerTransaction(params: {
    idempotencyKey: string;
    kind: LedgerTransaction['kind'];
    referenceType: LedgerTransaction['referenceType'];
    referenceId: string;
    description: string;
    entries: {
      accountId: string;
      direction: 'debit' | 'credit';
      amountMinor: number;
    }[];
  }): LedgerTransaction {
    // Check idempotency
    const existing = this.state.ledgerTransactions.find(
      (t) => t.idempotencyKey === params.idempotencyKey
    );
    if (existing) {
      return existing;
    }

    // Verify balance
    let totalDebit = 0;
    let totalCredit = 0;
    for (const e of params.entries) {
      if (e.direction === 'debit') totalDebit += e.amountMinor;
      if (e.direction === 'credit') totalCredit += e.amountMinor;
    }

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Ledger Invariant Violation: Debits ($${(totalDebit / 100).toFixed(2)}) must equal Credits ($${(totalCredit / 100).toFixed(2)})`
      );
    }

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEntries: LedgerEntry[] = params.entries.map((e, idx) => {
      const acc = this.state.ledgerAccounts.find((a) => a.id === e.accountId);
      const accName = acc ? acc.name : e.accountId;

      // Update account balance
      if (acc) {
        if (e.direction === 'credit') {
          acc.balanceMinor += e.amountMinor;
        } else {
          if (!acc.allowNegative && acc.balanceMinor < e.amountMinor) {
            throw new Error(`Insufficient funds in account: ${acc.name}`);
          }
          acc.balanceMinor -= e.amountMinor;
        }
      }

      return {
        id: `ent_${Date.now()}_${idx}`,
        transactionId: txId,
        accountId: e.accountId,
        accountName: accName,
        direction: e.direction,
        amountMinor: e.amountMinor,
        currency: 'USD',
      };
    });

    const tx: LedgerTransaction = {
      id: txId,
      idempotencyKey: params.idempotencyKey,
      kind: params.kind,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      description: params.description,
      createdAt: new Date().toISOString(),
      entries: newEntries,
    };

    this.state.ledgerTransactions.unshift(tx);
    this.saveState();
    return tx;
  }

  // -------------------------------------------------------------
  // Invariant Auditor
  // -------------------------------------------------------------
  public verifyLedgerInvariants(): {
    passed: boolean;
    totalTransactions: number;
    unbalancedTransactions: string[];
    negativeRestrictedAccounts: string[];
    totalEscrowMinor: number;
    totalCreatorPayableMinor: number;
  } {
    const unbalanced: string[] = [];
    const negative: string[] = [];

    for (const tx of this.state.ledgerTransactions) {
      let d = 0;
      let c = 0;
      for (const ent of tx.entries) {
        if (ent.direction === 'debit') d += ent.amountMinor;
        if (ent.direction === 'credit') c += ent.amountMinor;
      }
      if (d !== c) unbalanced.push(tx.id);
    }

    for (const acc of this.state.ledgerAccounts) {
      if (!acc.allowNegative && acc.balanceMinor < 0) {
        negative.push(acc.name);
      }
    }

    const totalEscrow = this.state.ledgerAccounts
      .filter((a) => a.kind === 'founder_escrow')
      .reduce((sum, a) => sum + a.balanceMinor, 0);

    const totalCreatorPayable = this.state.ledgerAccounts
      .filter((a) => a.kind === 'creator_payable_pending' || a.kind === 'creator_payable_available')
      .reduce((sum, a) => sum + a.balanceMinor, 0);

    return {
      passed: unbalanced.length === 0 && negative.length === 0,
      totalTransactions: this.state.ledgerTransactions.length,
      unbalancedTransactions: unbalanced,
      negativeRestrictedAccounts: negative,
      totalEscrowMinor: totalEscrow,
      totalCreatorPayableMinor: totalCreatorPayable,
    };
  }

  // -------------------------------------------------------------
  // Founder Mutations
  // -------------------------------------------------------------
  public createCampaign(data: {
    appId: string;
    name: string;
    rewardMinor: number;
    qualifyingEvent: string;
    qualifyingEventLabel: string;
    totalBudgetMinor: number;
    holdDays: number;
  }): Campaign {
    const app = this.state.apps.find((a) => a.id === data.appId) || this.state.apps[0];
    const campId = `camp_${Date.now()}`;

    // Create Escrow account for campaign
    const escrowAccId = `acc_escrow_${campId}`;
    this.state.ledgerAccounts.push({
      id: escrowAccId,
      ownerType: 'organization',
      ownerId: app.organizationId,
      name: `${data.name} Escrow Reserve`,
      kind: 'founder_escrow',
      currency: 'USD',
      balanceMinor: data.totalBudgetMinor,
      allowNegative: false,
    });

    // Record Escrow deposit transaction
    this.postLedgerTransaction({
      idempotencyKey: `escrow_deposit_${campId}`,
      kind: 'escrow_deposit',
      referenceType: 'campaign',
      referenceId: campId,
      description: `Funded campaign budget via Whop for ${data.name} ($${(data.totalBudgetMinor / 100).toFixed(2)})`,
      entries: [
        {
          accountId: 'acc_whop_clearing',
          direction: 'debit',
          amountMinor: data.totalBudgetMinor,
        },
        {
          accountId: escrowAccId,
          direction: 'credit',
          amountMinor: data.totalBudgetMinor,
        },
      ],
    });

    const newCampaign: Campaign = {
      id: campId,
      founderOrgId: app.organizationId,
      appId: app.id,
      name: data.name,
      appName: app.name,
      category: app.category,
      icon: app.icon,
      status: 'active',
      currency: 'USD',
      rewardMinor: data.rewardMinor,
      qualifyingEvent: data.qualifyingEvent,
      qualifyingEventLabel: data.qualifyingEventLabel,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      totalBudgetMinor: data.totalBudgetMinor,
      reservedMinor: 0,
      paidMinor: 0,
      holdDays: data.holdDays,
      riskPolicyId: 'policy_standard_v1',
      version: 1,
      creatorsCount: 0,
      clicksCount: 0,
      installsCount: 0,
      qualifiedCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.campaigns.unshift(newCampaign);

    this.state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      actor: 'founder',
      role: 'founder',
      action: 'campaign_created',
      targetType: 'campaign',
      targetId: campId,
      details: `Created campaign "${data.name}" with $${(data.totalBudgetMinor / 100).toFixed(2)} budget & ${data.holdDays}-day hold.`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
    return newCampaign;
  }

  public registerApp(data: {
    name: string;
    bundleId: string;
    appStoreId: string;
    teamId: string;
    category: string;
    icon: string;
  }): FounderApp {
    const appId = `app_${Date.now()}`;
    const newApp: FounderApp = {
      id: appId,
      organizationId: 'org_nova_games',
      name: data.name,
      bundleId: data.bundleId,
      appStoreId: data.appStoreId,
      teamId: data.teamId,
      ownershipState: 'pending_dns',
      sdkState: 'waiting_first_event',
      icon: data.icon || 'ti-brand-apple',
      category: data.category || 'Productivity',
      createdAt: new Date().toISOString(),
    };

    // Generate public app key
    const prefix = `umi_live_${data.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)}_${Math.random().toString(36).substring(2, 7)}`;
    this.state.appKeys.push({
      id: `key_${Date.now()}`,
      appId,
      publicPrefix: prefix,
      secretHash: `sha256_${Math.random().toString(36).substring(2, 12)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    this.state.apps.unshift(newApp);
    this.saveState();
    return newApp;
  }

  public rotateAppKey(appId: string): AppKey {
    const existing = this.state.appKeys.find((k) => k.appId === appId && k.status === 'active');
    if (existing) {
      existing.status = 'rotated';
      existing.rotatedAt = new Date().toISOString();
    }

    const app = this.state.apps.find((a) => a.id === appId);
    const prefix = `umi_live_${(app?.name || 'app').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)}_${Math.random().toString(36).substring(2, 7)}`;
    const newKey: AppKey = {
      id: `key_${Date.now()}`,
      appId,
      publicPrefix: prefix,
      secretHash: `sha256_${Math.random().toString(36).substring(2, 12)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.state.appKeys.unshift(newKey);
    this.saveState();
    return newKey;
  }

  public verifyAppOwnership(appId: string): void {
    const app = this.state.apps.find((a) => a.id === appId);
    if (app) {
      app.ownershipState = 'verified';
      this.state.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        actor: 'founder',
        role: 'founder',
        action: 'app_ownership_verified',
        targetType: 'founder_app',
        targetId: appId,
        details: `Apple App Site Association and DNS verified for ${app.bundleId}.`,
        timestamp: new Date().toISOString(),
      });
      this.saveState();
    }
  }

  public toggleCampaignStatus(campaignId: string): void {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      campaign.status = campaign.status === 'active' ? 'paused' : 'active';
      this.saveState();
    }
  }

  // -------------------------------------------------------------
  // Creator Mutations
  // -------------------------------------------------------------
  public joinCampaign(campaignId: string): ReferralCode {
    const creator = this.state.creators[0];
    const existing = this.state.referralCodes.find(
      (r) => r.campaignId === campaignId && r.creatorId === creator.id
    );
    if (existing) {
      return existing;
    }

    const campaign = this.state.campaigns.find((c) => c.id === campaignId);
    if (campaign) {
      campaign.creatorsCount += 1;
    }

    const code = `${creator.name.split(' ')[0].toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
    const refCode: ReferralCode = {
      id: `ref_${Date.now()}`,
      campaignId,
      creatorId: creator.id,
      code,
      slug: `${campaign?.appName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}-${code.toLowerCase()}`,
      shortUrl: `https://umi.link/c/${code}`,
      qrPayload: `https://umi.link/c/${code}`,
      status: 'active',
      clicks: 0,
      installs: 0,
      createdAt: new Date().toISOString(),
    };

    this.state.referralCodes.unshift(refCode);
    this.saveState();
    return refCode;
  }

  // -------------------------------------------------------------
  // End-to-End Attribution Pipeline & Simulation
  // Steps: Click -> iOS Install + Source Confirmation -> Qualifying Event -> Risk Evaluation -> Ledger Hold -> Payout
  // -------------------------------------------------------------
  public simulateFullAttributionFlow(campaignId: string): {
    click: ClickRecord;
    sourceConfirmation: SourceConfirmation;
    sdkEvent: SdkEvent;
    attribution: AttributionDecision;
    reward: RewardEntitlement;
  } {
    const campaign = this.state.campaigns.find((c) => c.id === campaignId) || this.state.campaigns[0];
    const creator = this.state.creators[0];
    const refCode =
      this.state.referralCodes.find((r) => r.campaignId === campaign.id) ||
      this.joinCampaign(campaign.id);

    // 1. Edge Worker Redirect Click
    const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const click: ClickRecord = {
      id: clickId,
      referralCodeId: refCode.id,
      creatorId: creator.id,
      campaignId: campaign.id,
      userAgentClass: 'ios_safari',
      country: 'US',
      occurredAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      botClass: 'human',
    };
    refCode.clicks += 1;
    campaign.clicksCount += 1;
    this.state.clicks.unshift(click);

    // 2. iOS Install & Source Confirmation
    const installToken = `inst_tok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const srcConfId = `src_conf_${Date.now()}`;
    const sourceConfirmation: SourceConfirmation = {
      id: srcConfId,
      appId: campaign.appId,
      campaignId: campaign.id,
      creatorId: creator.id,
      code: refCode.code,
      installToken,
      confirmationMethod: 'manual_code_entry',
      confirmedAt: new Date(Date.now() + 30000).toISOString(),
    };
    refCode.installs += 1;
    campaign.installsCount += 1;
    this.state.sourceConfirmations.unshift(sourceConfirmation);

    // 3. iOS SDK Qualifying Event Ingestion
    const eventId = `evt_${Date.now()}`;
    const sdkEvent: SdkEvent = {
      id: eventId,
      eventId: `sdk_evt_${Math.random().toString(36).substring(2, 8)}`,
      appId: campaign.appId,
      installId: installToken,
      eventType: 'qualifying_event',
      clientTime: new Date(Date.now() + 60000).toISOString(),
      receivedAt: new Date(Date.now() + 60500).toISOString(),
      payloadHash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      sdkVersion: '1.2.0',
      status: 'processed',
      metadata: { event: campaign.qualifyingEvent, verifiedViaUmiSdk: true },
    };
    this.state.sdkEvents.unshift(sdkEvent);
    campaign.qualifiedCount += 1;

    // 4. Automated Risk Evaluation & Attribution Decision
    const attId = `att_${Date.now()}`;
    const attribution: AttributionDecision = {
      id: attId,
      installId: installToken,
      campaignId: campaign.id,
      campaignName: campaign.appName,
      creatorId: creator.id,
      creatorHandle: creator.handle,
      confidence: 0.99,
      status: 'approved',
      ruleVersion: 'v1.4',
      evidenceIds: [clickId, srcConfId, eventId],
      reasonCode: `${campaign.qualifyingEvent}_verified`,
      decidedAt: new Date().toISOString(),
    };
    this.state.attributionDecisions.unshift(attribution);

    // 5. Atomic Double-Entry Ledger Entry (Escrow -> Creator Pending)
    const escrowAcc =
      this.state.ledgerAccounts.find((a) => a.kind === 'founder_escrow' && a.name.includes(campaign.name)) ||
      this.state.ledgerAccounts.find((a) => a.kind === 'founder_escrow')!;

    const creatorPendingAcc =
      this.state.ledgerAccounts.find(
        (a) => a.kind === 'creator_payable_pending' && a.ownerId === creator.id
      ) || this.state.ledgerAccounts[2];

    const tx = this.postLedgerTransaction({
      idempotencyKey: `reward_reserve_${attId}`,
      kind: 'reward_reserved',
      referenceType: 'attribution',
      referenceId: attId,
      description: `Reserved reward for verified install on ${campaign.appName} ($${(campaign.rewardMinor / 100).toFixed(2)})`,
      entries: [
        {
          accountId: escrowAcc.id,
          direction: 'debit',
          amountMinor: campaign.rewardMinor,
        },
        {
          accountId: creatorPendingAcc.id,
          direction: 'credit',
          amountMinor: campaign.rewardMinor,
        },
      ],
    });

    campaign.reservedMinor += campaign.rewardMinor;

    // 6. Reward Entitlement with Safety Hold Expiry
    const holdUntilDate = new Date(Date.now() + campaign.holdDays * 86400000).toISOString();
    const reward: RewardEntitlement = {
      id: `rew_${Date.now()}`,
      campaignId: campaign.id,
      campaignName: campaign.appName,
      creatorId: creator.id,
      creatorHandle: creator.handle,
      attributionId: attId,
      amountMinor: campaign.rewardMinor,
      currency: 'USD',
      status: 'on_hold',
      holdUntil: holdUntilDate,
      ledgerTransactionId: tx.id,
      ruleVersion: 'v1.4',
      createdAt: new Date().toISOString(),
    };
    this.state.rewardEntitlements.unshift(reward);

    // Audit log
    this.state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      actor: 'umi_attribution_engine',
      role: 'system',
      action: 'reward_entitlement_created',
      targetType: 'reward_entitlement',
      targetId: reward.id,
      details: `Attributed $${(campaign.rewardMinor / 100).toFixed(2)} to ${creator.handle} for ${campaign.appName}. Safety hold until ${new Date(holdUntilDate).toLocaleDateString()}.`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
    return { click, sourceConfirmation, sdkEvent, attribution, reward };
  }

  // -------------------------------------------------------------
  // Scheduled Hold Expiry Runner
  // -------------------------------------------------------------
  public releaseHold(rewardId: string): RewardEntitlement {
    const reward = this.state.rewardEntitlements.find((r) => r.id === rewardId);
    if (!reward || reward.status !== 'on_hold') {
      throw new Error('Reward not eligible for hold release');
    }

    const creator = this.state.creators.find((c) => c.id === reward.creatorId) || this.state.creators[0];
    const creatorPendingAcc =
      this.state.ledgerAccounts.find(
        (a) => a.kind === 'creator_payable_pending' && a.ownerId === creator.id
      ) || this.state.ledgerAccounts[2];

    const creatorAvailAcc =
      this.state.ledgerAccounts.find(
        (a) => a.kind === 'creator_payable_available' && a.ownerId === creator.id
      ) || this.state.ledgerAccounts[3];

    // Atomic Ledger Transition: pending -> available
    this.postLedgerTransaction({
      idempotencyKey: `hold_release_${reward.id}`,
      kind: 'hold_released',
      referenceType: 'attribution',
      referenceId: reward.id,
      description: `Safety hold expired: released $${(reward.amountMinor / 100).toFixed(2)} to Available for ${creator.name}`,
      entries: [
        {
          accountId: creatorPendingAcc.id,
          direction: 'debit',
          amountMinor: reward.amountMinor,
        },
        {
          accountId: creatorAvailAcc.id,
          direction: 'credit',
          amountMinor: reward.amountMinor,
        },
      ],
    });

    reward.status = 'available';
    reward.releasedAt = new Date().toISOString();

    this.state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      actor: 'system_scheduler',
      role: 'system',
      action: 'hold_expired_released',
      targetType: 'reward_entitlement',
      targetId: reward.id,
      details: `Hold expired for reward ${reward.id}. Status changed to Available ($${(reward.amountMinor / 100).toFixed(2)}).`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
    return reward;
  }

  // -------------------------------------------------------------
  // Whop Payout Action & Webhook Execution
  // External API calls NEVER happen inside money mutations.
  // Convex mutation -> create a payout intent -> scheduled/action calls Whop -> Whop webhook returns -> Convex mutation finalizes state.
  // -------------------------------------------------------------
  public requestWhopPayout(amountMinor?: number): PayoutIntent {
    const creator = this.state.creators[0];
    const creatorAvailAcc =
      this.state.ledgerAccounts.find(
        (a) => a.kind === 'creator_payable_available' && a.ownerId === creator.id
      ) || this.state.ledgerAccounts[3];

    const withdrawAmount = amountMinor ?? creatorAvailAcc.balanceMinor;
    if (withdrawAmount <= 0) {
      throw new Error('No available balance to withdraw');
    }
    if (withdrawAmount > creatorAvailAcc.balanceMinor) {
      throw new Error('Requested amount exceeds available balance');
    }

    const idempotencyKey = `idem_whop_payout_${Date.now()}`;
    const payoutId = `payout_${Date.now()}`;

    // 1. Convex Mutation: Deduct available, credit in-transit clearing
    this.postLedgerTransaction({
      idempotencyKey,
      kind: 'payout_initiated',
      referenceType: 'payout',
      referenceId: payoutId,
      description: `Whop payout batch initiated for ${creator.name} ($${(withdrawAmount / 100).toFixed(2)})`,
      entries: [
        {
          accountId: creatorAvailAcc.id,
          direction: 'debit',
          amountMinor: withdrawAmount,
        },
        {
          accountId: 'acc_whop_clearing',
          direction: 'credit',
          amountMinor: withdrawAmount,
        },
      ],
    });

    const payoutIntent: PayoutIntent = {
      id: payoutId,
      creatorId: creator.id,
      amountMinor: withdrawAmount,
      currency: 'USD',
      provider: 'whop',
      idempotencyKey,
      status: 'in_transit',
      submittedAt: new Date().toISOString(),
    };
    this.state.payouts.unshift(payoutIntent);

    // 2. Simulated Whop Action: Whop webhook callback returns
    setTimeout(() => {
      this.handleWhopWebhookSettlement(payoutId, withdrawAmount);
    }, 1500);

    this.saveState();
    return payoutIntent;
  }

  private handleWhopWebhookSettlement(payoutId: string, amountMinor: number): void {
    const payout = this.state.payouts.find((p) => p.id === payoutId);
    if (!payout) return;

    payout.status = 'settled';
    payout.providerPayoutId = `whop_tr_${Math.random().toString(36).substring(2, 9)}`;
    payout.settledAt = new Date().toISOString();

    // Settle clearing account in double-entry ledger
    this.postLedgerTransaction({
      idempotencyKey: `whop_settled_${payoutId}`,
      kind: 'payout_settled',
      referenceType: 'payout',
      referenceId: payoutId,
      description: `Whop confirmed settlement for transfer ${payout.providerPayoutId}`,
      entries: [
        {
          accountId: 'acc_whop_clearing',
          direction: 'debit',
          amountMinor: amountMinor,
        },
        {
          accountId: 'acc_payout_settled_global',
          direction: 'credit',
          amountMinor: amountMinor,
        },
      ],
    });

    // Mark eligible available rewards as paid
    let remaining = amountMinor;
    for (const rew of this.state.rewardEntitlements) {
      if (rew.status === 'available' && remaining >= rew.amountMinor) {
        rew.status = 'paid';
        rew.paidAt = new Date().toISOString();
        remaining -= rew.amountMinor;
      }
    }

    // Add to Whop inbox
    this.state.providerInbox.unshift({
      id: `inbox_${Date.now()}`,
      provider: 'whop',
      providerEventId: `whop_evt_${payout.providerPayoutId}`,
      eventType: 'payout.settled',
      rawBodyHash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      receivedAt: new Date().toISOString(),
      processingState: 'processed',
      processedAt: new Date().toISOString(),
      summary: `Transfer $${(amountMinor / 100).toFixed(2)} completed to creator bank`,
    });

    this.saveState();
  }

  // -------------------------------------------------------------
  // RevenueCat Webhook Handler
  // -------------------------------------------------------------
  public simulateRevenueCatPurchase(appId: string): void {
    const app = this.state.apps.find((a) => a.id === appId) || this.state.apps[0];
    const eventId = `rc_evt_${Date.now()}`;

    this.state.providerInbox.unshift({
      id: `inbox_rc_${Date.now()}`,
      provider: 'revenuecat',
      providerEventId: eventId,
      eventType: 'INITIAL_PURCHASE',
      rawBodyHash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      receivedAt: new Date().toISOString(),
      processingState: 'processed',
      processedAt: new Date().toISOString(),
      summary: `${app.name} In-App Purchase ($9.99/mo) verified via RevenueCat webhook`,
    });

    this.state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      actor: 'revenuecat_webhook',
      role: 'system',
      action: 'revenuecat_event_received',
      targetType: 'provider_inbox',
      targetId: eventId,
      details: `Received signed RevenueCat webhook for ${app.name}. Normalized into qualifying event pipeline.`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
  }

  // -------------------------------------------------------------
  // Admin Operations & Risk Freezes
  // -------------------------------------------------------------
  public freezeReward(rewardId: string, reason: string): void {
    const reward = this.state.rewardEntitlements.find((r) => r.id === rewardId);
    if (reward) {
      reward.status = 'frozen';
      reward.frozenReason = reason;

      this.state.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        actor: 'admin',
        role: 'admin',
        action: 'reward_frozen_safety_rule',
        targetType: 'reward_entitlement',
        targetId: rewardId,
        details: `Safety rule invoked: ${reason}`,
        timestamp: new Date().toISOString(),
      });

      this.saveState();
    }
  }

  public unfreezeReward(rewardId: string): void {
    const reward = this.state.rewardEntitlements.find((r) => r.id === rewardId);
    if (reward && reward.status === 'frozen') {
      reward.status = 'on_hold';
      reward.frozenReason = undefined;

      this.state.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        actor: 'admin',
        role: 'admin',
        action: 'reward_unfrozen_approved',
        targetType: 'reward_entitlement',
        targetId: rewardId,
        details: 'Admin reviewed evidence graph and released security freeze back to On Hold.',
        timestamp: new Date().toISOString(),
      });

      this.saveState();
    }
  }
}

export const umiStore = new UmiConvexStore();

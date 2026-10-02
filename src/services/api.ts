import { Campaign } from '../types/campaign';

const API_BASE = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalyticsOverview {
  totalVerifiedInstalls: number;
  grossPaidOut: number;
  averageConversionRate: number;
  activeCreatorCount: number;
  fraudPreventionRate: number;
}

export interface TimeSeriesPoint {
  date: string;
  installs: number;
  clicks: number;
  earnings: number;
}

export interface DisputeItem {
  id: string;
  targetRef: string;
  role: 'creator' | 'founder';
  reason: string;
  notes?: string;
  status: 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
}

export interface PayoutMethodItem {
  id: string;
  type: string;
  label: string;
  isDefault: boolean;
  verified: boolean;
}

export interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  method: string;
}

export interface SdkKeysData {
  liveKey: string;
  sandboxKey: string;
  webhookSecret: string;
  endpointUrl: string;
}

export const api = {
  // Campaigns
  async getCampaigns(params?: {
    search?: string;
    cat?: string;
    platform?: string;
    filter?: 'open' | 'joined' | 'all';
    sort?: string;
  }): Promise<{ campaigns: Campaign[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.cat && params.cat !== 'all') query.set('cat', params.cat);
    if (params?.platform && params.platform !== 'all') query.set('platform', params.platform);
    if (params?.filter && params.filter !== 'all') query.set('filter', params.filter);
    if (params?.sort) query.set('sort', params.sort);

    const url = `${API_BASE}/campaigns${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch campaigns (${res.status})`);
    }
    const data = await res.json();
    return { campaigns: data.campaigns || [] };
  },

  async getCampaignById(id: string): Promise<{ campaign: Campaign; analyticsSummary: any }> {
    const res = await fetch(`${API_BASE}/campaigns/${encodeURIComponent(id)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch campaign ${id}`);
    }
    return res.json();
  },

  async createCampaign(campaign: Partial<Campaign>): Promise<{ campaign: Campaign; message: string }> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create campaign');
    }
    return data;
  },

  async toggleJoin(id: string): Promise<{ joined: boolean; creators: number; trackingLink: string; message: string }> {
    const res = await fetch(`${API_BASE}/campaigns/${encodeURIComponent(id)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update campaign membership');
    }
    return data;
  },

  async updateCampaign(
    id: string,
    updates: { isPaused?: boolean; budget?: number; isEnded?: boolean }
  ): Promise<{ campaign: Campaign; message: string }> {
    const res = await fetch(`${API_BASE}/campaigns/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update campaign');
    }
    return data;
  },

  // Analytics
  async getAnalyticsOverview(): Promise<{ metrics: AnalyticsOverview; timeSeries: TimeSeriesPoint[] }> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) {
      throw new Error('Failed to fetch analytics overview');
    }
    return res.json();
  },

  // Payouts
  async getPayouts(): Promise<{
    balance: number;
    nextSettlementDate: string;
    pendingVerification: number;
    methods: PayoutMethodItem[];
    history: TransactionItem[];
  }> {
    const res = await fetch(`${API_BASE}/payouts`);
    if (!res.ok) {
      throw new Error('Failed to fetch payouts');
    }
    return res.json();
  },

  async requestWithdrawal(amount?: number): Promise<{ withdrawn: number; newBalance: number; message: string }> {
    const res = await fetch(`${API_BASE}/payouts/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Withdrawal failed');
    }
    return data;
  },

  async addPayoutMethod(type: string, accountDetails: string): Promise<{ method: PayoutMethodItem; message: string }> {
    const res = await fetch(`${API_BASE}/payouts/methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, accountDetails }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add payout method');
    }
    return data;
  },

  // Billing
  async getBilling(): Promise<{ balance: number; activeCampaignBudgets: number; invoices: any[] }> {
    const res = await fetch(`${API_BASE}/billing`);
    if (!res.ok) {
      throw new Error('Failed to fetch billing details');
    }
    return res.json();
  },

  async depositFunds(amount: number): Promise<{ balance: number; message: string }> {
    const res = await fetch(`${API_BASE}/billing/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to deposit funds');
    }
    return data;
  },

  // Disputes
  async getDisputes(): Promise<{ disputes: DisputeItem[] }> {
    const res = await fetch(`${API_BASE}/disputes`);
    if (!res.ok) {
      throw new Error('Failed to fetch disputes');
    }
    return res.json();
  },

  async submitDispute(
    targetRef: string,
    role: 'creator' | 'founder',
    reason: string,
    notes?: string
  ): Promise<{ dispute: DisputeItem; message: string }> {
    const res = await fetch(`${API_BASE}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRef, role, reason, notes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit dispute');
    }
    return data;
  },

  // SDK Keys
  async getSdkKeys(): Promise<{ keys: SdkKeysData }> {
    const res = await fetch(`${API_BASE}/sdk-keys`);
    if (!res.ok) {
      throw new Error('Failed to fetch SDK keys');
    }
    return res.json();
  },

  async rotateSdkKey(target: 'sandbox' | 'live'): Promise<{ keys: SdkKeysData; message: string }> {
    const res = await fetch(`${API_BASE}/sdk-keys/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to rotate key');
    }
    return data;
  },
};

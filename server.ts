import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store for Enterprise Marketplace
interface CampaignRate {
  t: 'fixed' | 'pct';
  v: number;
  avg?: number;
}

interface CampaignRecord {
  id: string;
  name: string;
  cat: string;
  by: string;
  host?: string;
  tag: string;
  desc: string;
  price: string;
  rate?: CampaignRate;
  pay: string;
  days: number;
  creators: number;
  rating: string;
  installsVerified: string;
  rc?: string;
  icon: string;
  bg: string;
  fg: string;
  slug: string;
  joined: boolean;
  appleUrl?: string;
  playUrl?: string;
  platforms?: ('ios' | 'android')[];
  hue?: [string, string];
  posted?: string;
  budget?: number;
  sdkConnected?: boolean;
  isPaused?: boolean;
  isEnded?: boolean;
  conversionRate?: number;
  createdAt?: string;
}

// Initial seed campaigns
let campaignsDb: CampaignRecord[] = [
  {
    id: 'atelier',
    name: 'Atelier Craft',
    cat: 'Art & Design',
    by: 'Maison des Beaux-Arts',
    host: 'Maison des Beaux-Arts',
    tag: 'Studio sketch & art patron gallery',
    price: '4.50',
    pay: '$4.50 per verified install',
    rate: { t: 'fixed', v: 4.5 },
    days: 30,
    creators: 184,
    rating: '4.8',
    installsVerified: '14.2k',
    rc: '14.2K',
    icon: 'ti-brush',
    bg: '#CECBF6',
    fg: '#26215C',
    slug: 'atelier',
    desc: 'A studio app for artists to plan, sketch, and share work from their phone. Promote it to your patrons and earn on every signup.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/atelier-craft/id101',
    playUrl: 'https://play.google.com/store/apps/details?id=com.beauxarts.atelier',
    platforms: ['ios', 'android'],
    posted: '1 day ago',
    budget: 9500,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.32,
  },
  {
    id: 'palazzo',
    name: 'Palazzo Lens',
    cat: 'Photography',
    by: 'Palazzo Optical',
    host: 'Palazzo Optical',
    tag: 'Architectural camera & perspective tools',
    price: '3.80',
    pay: '$3.80 per verified install',
    rate: { t: 'fixed', v: 3.8 },
    days: 22,
    creators: 318,
    rating: '4.9',
    installsVerified: '9.8k',
    rc: '9.8K',
    icon: 'ti-camera',
    bg: '#FAC775',
    fg: '#412402',
    slug: 'palazzo',
    desc: 'Precision architectural camera with perspective tilt-shift correction and raw photogrammetry capture.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/palazzo-lens/id102',
    playUrl: 'https://play.google.com/store/apps/details?id=com.palazzo.lens',
    platforms: ['ios', 'android'],
    posted: '2 days ago',
    budget: 8200,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.30,
  },
  {
    id: 'pixelpop',
    name: 'Pixel Pop',
    cat: 'Games',
    by: 'Nova Play Studio',
    host: 'Nova Play Studio',
    tag: 'Pop, match, repeat',
    price: '1.80',
    pay: '$1.80 per verified install',
    rate: { t: 'fixed', v: 1.8 },
    days: 25,
    creators: 638,
    rating: '4.7',
    installsVerified: '12.4k',
    rc: '12K',
    icon: 'ti-device-gamepad-2',
    bg: '#CECBF6',
    fg: '#26215C',
    slug: 'pixelpop',
    desc: 'A casual puzzle game with daily streaks and short rounds that fit anywhere. Great for gaming, commute, and relaxing content. Creators earn on every verified install from iOS or Android.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/pixel-pop/id123',
    playUrl: 'https://play.google.com/store/apps/details?id=com.nova.pixelpop',
    platforms: ['ios', 'android'],
    posted: '3 days ago',
    budget: 5000,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.28,
  },
  {
    id: 'stride',
    name: 'Stride',
    cat: 'Health',
    by: 'Northbeat Labs',
    host: 'Northbeat Labs',
    tag: 'Every step counts',
    price: '2.90',
    pay: '$2.90 per verified install',
    rate: { t: 'fixed', v: 2.9 },
    days: 18,
    creators: 351,
    rating: '4.6',
    installsVerified: '8.1k',
    rc: '8.1K',
    icon: 'ti-heart',
    bg: '#F5C4B3',
    fg: '#4A1B0C',
    slug: 'stride',
    desc: 'A walking tracker that turns daily steps into weekly goals. Best for fitness, wellness, and lifestyle creators looking to promote healthy everyday habits.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/stride-steps/id456',
    playUrl: 'https://play.google.com/store/apps/details?id=com.northbeat.stride',
    platforms: ['ios', 'android'],
    posted: '1 week ago',
    budget: 8000,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.35,
  },
  {
    id: 'focusly',
    name: 'Focusly',
    cat: 'Productivity',
    by: 'Deepwork Inc.',
    host: 'Deepwork Inc.',
    tag: 'Deep work, on demand',
    price: '2.10',
    pay: '$2.10 per verified install',
    rate: { t: 'fixed', v: 2.1 },
    days: 45,
    creators: 204,
    rating: '4.8',
    installsVerified: '5.3k',
    rc: '5.3K',
    icon: 'ti-bolt',
    bg: '#B5D4F4',
    fg: '#042C53',
    slug: 'focusly',
    desc: 'A focus timer with ambient soundscapes and session telemetry. Fits study, work-from-home, and desk setup content. Pays guaranteed bounty per verified install.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/focusly-deepwork/id789',
    playUrl: 'https://play.google.com/store/apps/details?id=com.deepwork.focusly',
    platforms: ['ios', 'android'],
    posted: '2 weeks ago',
    budget: 6500,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.22,
  },
  {
    id: 'vaultly',
    name: 'Vaultly',
    cat: 'Finance',
    by: 'Vault Financial',
    host: 'Vault Financial',
    tag: 'Budget without spreadsheets',
    price: '3.40',
    pay: '$3.40 per verified install',
    rate: { t: 'fixed', v: 3.4 },
    days: 12,
    creators: 412,
    rating: '4.9',
    installsVerified: '14.8k',
    rc: '14.8K',
    icon: 'ti-coin',
    bg: '#C0DD97',
    fg: '#173404',
    slug: 'vaultly',
    desc: 'Modern personal finance and auto-categorized expense tracking for Gen Z and young professionals. Features instant bank sync with 256-bit AES encryption.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/vaultly/id999',
    playUrl: 'https://play.google.com/store/apps/details?id=com.vaultly.app',
    platforms: ['ios', 'android'],
    posted: '5 days ago',
    budget: 12000,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.31,
  },
  {
    id: 'zenread',
    name: 'ZenRead',
    cat: 'Education',
    by: 'Zenith Labs',
    host: 'Zenith Labs',
    tag: 'Read 3x faster with ease',
    price: '2.50',
    pay: '$2.50 per verified install',
    rate: { t: 'fixed', v: 2.5 },
    days: 30,
    creators: 189,
    rating: '4.7',
    installsVerified: '4.2k',
    rc: '4.2K',
    icon: 'ti-book',
    bg: '#FAC775',
    fg: '#412402',
    slug: 'zenread',
    desc: 'Bionic reading companion and speed reading coach. Converts epubs, PDFs, and web articles into optimized visual saccade text for hyper-retention.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/zenread/id333',
    playUrl: 'https://play.google.com/store/apps/details?id=com.zenread.reader',
    platforms: ['ios'],
    posted: '4 days ago',
    budget: 4500,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.26,
  },
  {
    id: 'soundscape',
    name: 'Soundscape AI',
    cat: 'Lifestyle',
    by: 'Aura Sound Works',
    host: 'Aura Sound Works',
    tag: 'Generative sleep & focus audio',
    price: '2.20',
    pay: '$2.20 per verified install',
    rate: { t: 'fixed', v: 2.2 },
    days: 20,
    creators: 277,
    rating: '4.8',
    installsVerified: '9.6k',
    rc: '9.6K',
    icon: 'ti-leaf',
    bg: '#9FE1CB',
    fg: '#04342C',
    slug: 'soundscape',
    desc: 'Binaural beats, sleep soundscapes, and adaptive pink noise generated in real-time according to circadian rhythm telemetry.',
    joined: false,
    appleUrl: 'https://apps.apple.com/app/soundscape-ai/id222',
    playUrl: 'https://play.google.com/store/apps/details?id=com.aura.soundscape',
    platforms: ['ios', 'android'],
    posted: '6 days ago',
    budget: 7000,
    sdkConnected: true,
    isPaused: false,
    conversionRate: 0.29,
  }
];

// Financial Ledger & State
let creatorBalance = 248.60;
let founderBalance = 3420.00;

interface DisputeRecord {
  id: string;
  targetRef: string;
  role: 'creator' | 'founder';
  reason: string;
  notes?: string;
  status: 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
  resolutionNote?: string;
}

let disputesDb: DisputeRecord[] = [
  {
    id: 'dsp_88192',
    targetRef: 'inst_9a8f2',
    role: 'creator',
    reason: 'first_launch_done',
    notes: 'User verified in Discord community with screenshot of level 12 completion',
    status: 'under_review',
    createdAt: '2026-10-01T14:22:00Z',
  }
];

let sdkKeysDb = {
  liveKey: 'kred_live_pixelpop7k2x98q1',
  sandboxKey: 'kred_test_sandbox_dev3x11',
  webhookSecret: 'whsec_99af28c11e7492b49e18b',
  endpointUrl: 'https://api.kred.io/v1/attribution/events',
};

let payoutMethodsDb = [
  {
    id: 'pm_1',
    type: 'bank',
    label: 'Chase Checking (••4821)',
    isDefault: true,
    verified: true,
  },
  {
    id: 'pm_2',
    type: 'paypal',
    label: 'PayPal (alex@creativeworks.io)',
    isDefault: false,
    verified: true,
  }
];

let transactionHistoryDb = [
  {
    id: 'tx_9921',
    type: 'payout',
    amount: 142.50,
    date: '2026-09-26',
    status: 'settled',
    method: 'Chase Checking (••4821)',
  },
  {
    id: 'tx_9918',
    type: 'payout',
    amount: 320.00,
    date: '2026-09-19',
    status: 'settled',
    method: 'Chase Checking (••4821)',
  }
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'kred-marketplace-api',
      timestamp: new Date().toISOString(),
      campaignsCount: campaignsDb.length,
    });
  });

  // Get all campaigns with search and filtering
  app.get('/api/campaigns', (req: Request, res: Response) => {
    try {
      let filtered = [...campaignsDb];
      const { search, cat, platform, filter, sort } = req.query;

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.by.toLowerCase().includes(q) ||
            c.tag.toLowerCase().includes(q) ||
            c.cat.toLowerCase().includes(q)
        );
      }

      if (cat && typeof cat === 'string' && cat !== 'all') {
        filtered = filtered.filter((c) => c.cat.toLowerCase() === cat.toLowerCase());
      }

      if (platform && typeof platform === 'string' && platform !== 'all') {
        filtered = filtered.filter((c) => c.platforms?.includes(platform as any));
      }

      if (filter === 'open') {
        filtered = filtered.filter((c) => !c.joined);
      } else if (filter === 'joined') {
        filtered = filtered.filter((c) => c.joined);
      }

      if (sort === 'payout') {
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      } else if (sort === 'creators') {
        filtered.sort((a, b) => b.creators - a.creators);
      } else if (sort === 'days') {
        filtered.sort((a, b) => a.days - b.days);
      }

      res.json({
        success: true,
        count: filtered.length,
        campaigns: filtered,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch campaigns' });
    }
  });

  // Get single campaign
  app.get('/api/campaigns/:id', (req: Request, res: Response) => {
    const campaign = campaignsDb.find((c) => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }
    res.json({
      success: true,
      campaign,
      analyticsSummary: {
        totalInstalls: parseInt(campaign.installsVerified) || 12400,
        activeCreators: campaign.creators,
        verificationRate: '94.2%',
        escrowBalance: campaign.budget || 5000,
        averageSettlementDays: 14,
      },
    });
  });

  // Create campaign
  app.post('/api/campaigns', (req: Request, res: Response) => {
    try {
      const { name, cat, by, tag, pay, price, budget, days, appleUrl, playUrl, platforms } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Campaign name is required' });
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `camp-${Date.now()}`;
      const payoutVal = parseFloat(price) || parseFloat(pay) || 2.0;
      const budgetVal = parseFloat(budget) || 5000;

      const newCampaign: CampaignRecord = {
        id,
        name: name.trim(),
        cat: cat || 'Games',
        by: by?.trim() || 'Independent Studio',
        host: by?.trim() || 'Independent Studio',
        tag: tag?.trim() || 'Next-gen verified mobile experience',
        desc: req.body.desc || `${name} verified install acquisition campaign with automated anti-fraud telemetry.`,
        price: payoutVal.toFixed(2),
        pay: `$${payoutVal.toFixed(2)} per verified install`,
        rate: { t: 'fixed', v: payoutVal },
        days: parseInt(days, 10) || 30,
        creators: 1,
        rating: '5.0',
        installsVerified: '0',
        icon: req.body.icon || 'ti-device-gamepad-2',
        bg: req.body.bg || '#CECBF6',
        fg: req.body.fg || '#26215C',
        slug: id,
        joined: false,
        appleUrl: appleUrl || '',
        playUrl: playUrl || '',
        platforms: platforms && platforms.length > 0 ? platforms : ['ios', 'android'],
        posted: 'Just now',
        budget: budgetVal,
        sdkConnected: true,
        isPaused: false,
        conversionRate: 0.25,
        createdAt: new Date().toISOString(),
      };

      campaignsDb.unshift(newCampaign);

      res.status(201).json({
        success: true,
        message: 'Campaign published successfully',
        campaign: newCampaign,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to create campaign' });
    }
  });

  // Toggle join / leave campaign
  app.post('/api/campaigns/:id/join', (req: Request, res: Response) => {
    const campaign = campaignsDb.find((c) => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const isNowJoined = !campaign.joined;
    campaign.joined = isNowJoined;
    if (isNowJoined) {
      campaign.creators += 1;
    } else {
      campaign.creators = Math.max(1, campaign.creators - 1);
    }

    res.json({
      success: true,
      joined: campaign.joined,
      creators: campaign.creators,
      trackingLink: `https://kred.link/${campaign.slug}/you`,
      message: isNowJoined ? `Joined ${campaign.name}` : `Left ${campaign.name}`,
    });
  });

  // Update campaign management settings (pause, resume, budget, end)
  app.patch('/api/campaigns/:id', (req: Request, res: Response) => {
    const campaign = campaignsDb.find((c) => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const { isPaused, budget, isEnded } = req.body;

    if (typeof isPaused === 'boolean') {
      campaign.isPaused = isPaused;
    }
    if (typeof budget === 'number' && budget > 0) {
      campaign.budget = budget;
    }
    if (isEnded) {
      campaign.isEnded = true;
      campaign.days = 0;
    }

    res.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully',
    });
  });

  // Analytics overview
  app.get('/api/analytics/overview', (_req: Request, res: Response) => {
    res.json({
      success: true,
      metrics: {
        totalVerifiedInstalls: 44520,
        grossPaidOut: 112840.50,
        averageConversionRate: 0.284,
        activeCreatorCount: 1780,
        fraudPreventionRate: 0.998,
      },
      timeSeries: [
        { date: 'Sep 24', installs: 1420, clicks: 5120, earnings: 3820 },
        { date: 'Sep 25', installs: 1610, clicks: 5800, earnings: 4210 },
        { date: 'Sep 26', installs: 1840, clicks: 6400, earnings: 4920 },
        { date: 'Sep 27', installs: 1520, clicks: 5310, earnings: 4090 },
        { date: 'Sep 28', installs: 1980, clicks: 6950, earnings: 5380 },
        { date: 'Sep 29', installs: 2150, clicks: 7600, earnings: 5890 },
        { date: 'Sep 30', installs: 2410, clicks: 8200, earnings: 6420 },
        { date: 'Oct 01', installs: 2680, clicks: 9100, earnings: 7150 },
      ],
    });
  });

  // Payouts & balance
  app.get('/api/payouts', (_req: Request, res: Response) => {
    res.json({
      success: true,
      balance: creatorBalance,
      nextSettlementDate: '2026-10-09T17:00:00Z',
      pendingVerification: 84.50,
      methods: payoutMethodsDb,
      history: transactionHistoryDb,
    });
  });

  // Process withdrawal
  app.post('/api/payouts/withdraw', (req: Request, res: Response) => {
    const { amount } = req.body;
    const withdrawAmount = typeof amount === 'number' ? amount : creatorBalance;

    if (withdrawAmount <= 0) {
      return res.status(400).json({ success: false, error: 'No available balance to withdraw' });
    }
    if (withdrawAmount > creatorBalance) {
      return res.status(400).json({ success: false, error: 'Withdrawal amount exceeds available balance' });
    }

    const previous = creatorBalance;
    creatorBalance = 0;

    const newTx = {
      id: `tx_${Date.now().toString().slice(-4)}`,
      type: 'payout',
      amount: withdrawAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'scheduled_settlement',
      method: payoutMethodsDb[0]?.label || 'Standard Bank Wire',
    };
    transactionHistoryDb.unshift(newTx);

    res.json({
      success: true,
      withdrawn: withdrawAmount,
      newBalance: creatorBalance,
      transaction: newTx,
      message: `Withdrawal of $${withdrawAmount.toFixed(2)} scheduled for Friday settlement`,
    });
  });

  // Add payout method
  app.post('/api/payouts/methods', (req: Request, res: Response) => {
    const { type, accountDetails } = req.body;
    if (!type || !accountDetails) {
      return res.status(400).json({ success: false, error: 'Method type and account details are required' });
    }

    const newMethod = {
      id: `pm_${Date.now()}`,
      type,
      label: accountDetails,
      isDefault: payoutMethodsDb.length === 0,
      verified: true,
    };
    payoutMethodsDb.push(newMethod);

    res.status(201).json({
      success: true,
      method: newMethod,
      methods: payoutMethodsDb,
      message: 'Payout method linked and verified',
    });
  });

  // Billing (Founder campaigns escrow)
  app.get('/api/billing', (_req: Request, res: Response) => {
    res.json({
      success: true,
      balance: founderBalance,
      activeCampaignBudgets: 31500,
      invoices: [
        { id: 'inv_1028', date: '2026-09-15', amount: 5000, status: 'paid', description: 'Pixel Pop Escrow Deposit' },
        { id: 'inv_1024', date: '2026-08-30', amount: 8000, status: 'paid', description: 'Stride Escrow Deposit' },
      ],
    });
  });

  // Add funds to founder campaign balance
  app.post('/api/billing/deposit', (req: Request, res: Response) => {
    const { amount } = req.body;
    const addVal = parseFloat(amount) || 1000;

    founderBalance += addVal;

    res.json({
      success: true,
      balance: founderBalance,
      message: `Successfully deposited $${addVal.toLocaleString('en-US')} to campaign balance`,
    });
  });

  // Disputes & Attribution Audit
  app.get('/api/disputes', (_req: Request, res: Response) => {
    res.json({
      success: true,
      disputes: disputesDb,
    });
  });

  app.post('/api/disputes', (req: Request, res: Response) => {
    const { targetRef, role, reason, notes } = req.body;
    if (!targetRef) {
      return res.status(400).json({ success: false, error: 'Attribution event reference ID is required' });
    }

    const newDispute: DisputeRecord = {
      id: `dsp_${Math.floor(10000 + Math.random() * 90000)}`,
      targetRef,
      role: role || 'creator',
      reason: reason || 'verification_telemetry_review',
      notes,
      status: 'under_review',
      createdAt: new Date().toISOString(),
    };
    disputesDb.unshift(newDispute);

    res.status(201).json({
      success: true,
      dispute: newDispute,
      message: 'Dispute ticket submitted. Attribution telemetry is locked under forensic review.',
    });
  });

  // SDK Keys
  app.get('/api/sdk-keys', (_req: Request, res: Response) => {
    res.json({
      success: true,
      keys: sdkKeysDb,
    });
  });

  app.post('/api/sdk-keys/rotate', (req: Request, res: Response) => {
    const { target } = req.body;
    if (target === 'sandbox') {
      sdkKeysDb.sandboxKey = `kred_test_sandbox_${Math.random().toString(36).substring(2, 9)}`;
    } else {
      sdkKeysDb.liveKey = `kred_live_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 6)}`;
    }

    res.json({
      success: true,
      keys: sdkKeysDb,
      message: `${target === 'sandbox' ? 'Sandbox' : 'Production'} app key rotated successfully.`,
    });
  });

  // -------------------------------------------------------------
  // Frontend Mounting: Vite middleware in Dev, Static in Prod
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[kred] Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[kred] Failed to start server:', err);
  process.exit(1);
});

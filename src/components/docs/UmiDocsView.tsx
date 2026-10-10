import React, { useState, useMemo } from 'react';

interface UmiDocsViewProps {
  onBack: () => void;
  onNavigateKeys: () => void;
}

type Platform = 'ios' | 'and' | 'rn' | 'fl';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const PLATFORMS: [Platform, string][] = [
  ['ios', 'iOS'],
  ['and', 'Android'],
  ['rn', 'React Native'],
  ['fl', 'Flutter'],
];

const NAV_GROUPS: [string, [string, string][]][] = [
  [
    'Welcome',
    [
      ['start', 'Start here'],
      ['quick', 'SDK Quickstart'],
    ],
  ],
  [
    'Apps and keys',
    [
      ['keys', 'API keys'],
      ['env', 'Environments'],
    ],
  ],
  [
    'Mobile SDKs',
    [
      ['install', 'Install the SDK'],
      ['config', 'Configure the SDK'],
      ['source', 'Source confirmation'],
      ['events', 'Events'],
      ['testing', 'Testing'],
    ],
  ],
  [
    'Links and QR',
    [
      ['links', 'Short links'],
      ['qr', 'QR codes'],
    ],
  ],
  [
    'Money & Business Model',
    [
      ['fees', 'Pricing & Business Model'],
      ['trust', 'Prefunded Escrow & Trust'],
      ['holds', 'Holds & Settlement Pipeline'],
      ['compliance', 'Creator Approvals & FTC #ad'],
      ['outcomes', 'Verified Outcomes vs Views'],
      ['controls', 'Campaign Controls & Pacing'],
      ['managed', 'Managed Launch Tier'],
      ['webhooks', 'Webhooks'],
    ],
  ],
  [
    'Reference',
    [
      ['errors', 'Errors'],
      ['changelog', 'Changelog'],
    ],
  ],
];

const CODE_SNIPPETS: Record<string, Record<Platform, [string, string]>> = {
  install: {
    ios: ['Package.swift', '.package(url: "https://github.com/umi-app/umi-ios", from: "1.0.0")'],
    and: ['build.gradle.kts', 'implementation("io.umi:sdk:1.0.0")'],
    rn: ['terminal', 'npm install umi-react-native'],
    fl: ['terminal', 'flutter pub add umi_flutter'],
  },
  init: {
    ios: [
      'Swift',
      `import Umi\n\n@main\nstruct MyApp: App {\n  init() {\n    Umi.configure(appKey: "umi_pk_live_...")\n  }\n}`,
    ],
    and: [
      'Kotlin',
      `class MyApp : Application() {\n  override fun onCreate() {\n    super.onCreate()\n    Umi.configure(this, appKey = "umi_pk_live_...")\n  }\n}`,
    ],
    rn: [
      'TypeScript',
      `import Umi from "umi-react-native";\n\nUmi.configure({ appKey: "umi_pk_live_..." });`,
    ],
    fl: [
      'Dart',
      `import "package:umi_flutter/umi_flutter.dart";\n\nawait Umi.configure(appKey: "umi_pk_live_...");`,
    ],
  },
  source: {
    ios: ['Swift', `// Show once, after the first launch\nUmi.presentSourceSheet()`],
    and: ['Kotlin', `// Nothing to do. The SDK reads the Play Install Referrer on first launch.`],
    rn: ['TypeScript', `await Umi.presentSourceSheet(); // iOS only, no-op on Android`],
    fl: ['Dart', `await Umi.presentSourceSheet(); // iOS only, no-op on Android`],
  },
  track: {
    ios: ['Swift', `Umi.track("onboarding_completed")`],
    and: ['Kotlin', `Umi.track("onboarding_completed")`],
    rn: ['TypeScript', `Umi.track("onboarding_completed");`],
    fl: ['Dart', `await Umi.track("onboarding_completed");`],
  },
};

function formatMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const UmiDocsView: React.FC<UmiDocsViewProps> = ({ onBack, onNavigateKeys }) => {
  const [currentPage, setCurrentPage] = useState<string>('start');
  const [platform, setPlatform] = useState<Platform>('ios');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [activeSecId, setActiveSecId] = useState<string | null>(null);

  // Fee Calculator State (SaaS Subscription Model vs Cut)
  const [campaignBudget, setCampaignBudget] = useState(1000);
  const [rewardPerInstall, setRewardPerInstall] = useState(0.5);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'scale' | 'managed'>('starter');
  const [showFeeComparison, setShowFeeComparison] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const copySnippet = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    showToast('Copied to clipboard');
  };

  const scrollToSection = (secId: string) => {
    setActiveSecId(secId);
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fee calculations (Subscription + Outcome micro-fee model)
  const planFee = selectedPlan === 'starter' ? 199 : selectedPlan === 'scale' ? 399 : 599;
  const outcomeInfraFeeRate = 0.05; // $0.05 per verified outcome
  const coveredInstalls = Math.floor(campaignBudget / (rewardPerInstall > 0 ? rewardPerInstall : 0.5));
  const totalOutcomeInfraFee = coveredInstalls * outcomeInfraFeeRate;
  const founderTotalToday = campaignBudget + planFee + totalOutcomeInfraFee;
  const creatorPerInstall = rewardPerInstall; // 0% fee deducted! Creators keep 100% of their bounty

  // Legacy volume-cut math comparison (from User Brief)
  // Under 7% founder cut + 3% creator cut on $0.50 reward:
  // Gross = $0.05. After Stripe processor fees (2.9% + $0.30), Umi nets ~$0.036/outcome.
  // Covering $199/mo takes roughly 5,500 outcomes!
  const legacyNetPerOutcome = 0.036;
  const legacyOutcomesNeeded = Math.round(199 / legacyNetPerOutcome); // ~5,528

  // Render a Code Block
  const renderCodeBlock = (key: 'install' | 'init' | 'source' | 'track') => {
    const item = CODE_SNIPPETS[key][platform];
    return (
      <div className="rounded-xl my-3.5 overflow-hidden bg-[#0E0E0E] border border-[#262626]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1B1B1B] text-[11px] font-mono text-[#71717A] bg-[#141414]">
          <span>{item[0]}</span>
          <button
            type="button"
            onClick={() => copySnippet(item[1])}
            className="h-6 px-3 rounded-full border border-white/10 hover:border-white/30 text-[#9C9A92] hover:text-[#F4F2EC] text-[11px] bg-transparent cursor-pointer transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="p-4 m-0 font-mono text-[12.5px] leading-relaxed text-[#D8D7D2] overflow-x-auto whitespace-pre-wrap">
          {item[1]}
        </pre>
      </div>
    );
  };

  // Platform Capsule selector
  const renderPlatformCapsule = () => (
    <div className="inline-flex rounded-full p-0.5 border border-white/15 bg-[#181818] my-3">
      {PLATFORMS.map(([pId, pLabel]) => (
        <button
          key={pId}
          type="button"
          onClick={() => setPlatform(pId)}
          className={`rounded-full h-7 px-3.5 text-[12px] font-medium border-0 cursor-pointer transition-all ${
            platform === pId ? 'bg-[#F4F2EC] text-[#000000]' : 'bg-transparent text-[#9C9A92] hover:text-[#F4F2EC]'
          }`}
        >
          {pLabel}
        </button>
      ))}
    </div>
  );

  // App Key callout card
  const renderKeyCallout = () => (
    <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] my-4 space-y-2.5">
      <div className="text-[15px] font-medium text-[#F4F2EC]">Get your app key</div>
      <p className="text-[13px] text-[#9C9A92] leading-relaxed">
        Keys live in your app settings. Copy the publishable key for the app, and keep secret keys on your server.
      </p>
      <div className="pt-1">
        <button
          type="button"
          onClick={onNavigateKeys}
          className="h-8.5 px-4.5 rounded-full bg-[#F4F2EC] hover:bg-white text-[#000000] text-[12.5px] font-medium cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>Open API keys</span>
          <i className="ti ti-arrow-up-right text-[12px]"></i>
        </button>
      </div>
    </div>
  );

  // Fee Calculator Card (Subscription + 0% Creator Fee + Micro-fee)
  const renderFeeCalculator = () => (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#181818] border border-[#262626] my-5 space-y-5 text-left">
      {/* Plan Selector */}
      <div>
        <label className="text-[12px] text-[#9C9A92] block mb-2 font-medium uppercase tracking-wider">
          1. Choose Founder Subscription Plan
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'starter' as const, name: 'Starter', price: '$199', desc: 'Beta founders, 0% creator cut' },
            { id: 'scale' as const, name: 'Scale', price: '$399', desc: 'Multi-campaigns, auto anti-fraud' },
            { id: 'managed' as const, name: 'Managed Launch', price: '$599', desc: 'White-glove matching (design partner)' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlan(p.id)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                selectedPlan === p.id
                  ? 'border-[#C9B8FF] bg-[#141414] shadow-xs'
                  : 'border-[#2E2E2E] bg-[#111111] hover:border-[#444]'
              }`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-semibold text-[13.5px] text-[#F4F2EC]">{p.name}</span>
                <span className="font-mono font-bold text-[13.5px] text-[#C9B8FF]">{p.price}<span className="text-[10px] text-[#888] font-normal">/mo</span></span>
              </div>
              <div className="text-[11px] text-[#9C9A92] leading-tight">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget & Reward Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[12px] text-[#9C9A92] block mb-1 font-medium">Campaign bounty budget (Stripe Escrow)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-[#9A9892] text-[13px]">$</span>
            <input
              type="number"
              min={100}
              step={100}
              value={campaignBudget}
              onChange={(e) => setCampaignBudget(Math.max(100, parseFloat(e.target.value) || 0))}
              className="w-full h-10.5 pl-8 pr-3 rounded-xl bg-[#0F0F0F] border border-[#2E2E2E] focus:border-[#C9B8FF] text-[13.5px] text-[#F4F2EC] font-mono outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[12px] text-[#9C9A92] block mb-1 font-medium">Bounty per verified install (to creator)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-[#9A9892] text-[13px]">$</span>
            <input
              type="number"
              min={0.1}
              step={0.05}
              value={rewardPerInstall}
              onChange={(e) => setRewardPerInstall(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full h-10.5 pl-8 pr-3 rounded-xl bg-[#0F0F0F] border border-[#2E2E2E] focus:border-[#C9B8FF] text-[13.5px] text-[#F4F2EC] font-mono outline-none"
            />
          </div>
        </div>
      </div>

      {/* Outcome & Fee Table */}
      <table className="w-full border-collapse text-[13px] mt-2">
        <tbody>
          <tr className="border-t border-[#262626]">
            <td className="py-2.5 text-[#9C9A92]">Prefunded creator bounty escrow (100% to creators)</td>
            <td className="py-2.5 text-right font-mono font-medium text-[#F4F2EC]">
              {formatMoney(campaignBudget)}
            </td>
          </tr>
          <tr className="border-t border-[#262626]">
            <td className="py-2.5 text-[#9C9A92]">Founder SaaS plan ({selectedPlan})</td>
            <td className="py-2.5 text-right font-mono text-[#F4F2EC]">
              {formatMoney(planFee)}/mo
            </td>
          </tr>
          <tr className="border-t border-[#262626]">
            <td className="py-2.5 text-[#9C9A92]">Outcome network infra fee ($0.05 / verified install)</td>
            <td className="py-2.5 text-right font-mono text-[#9C9A92]">
              {formatMoney(totalOutcomeInfraFee)}
            </td>
          </tr>
          <tr className="border-t border-[#262626]">
            <td className="py-2.5 text-[#9C9A92]">Platform fee taken from creator pay</td>
            <td className="py-2.5 text-right font-mono text-[#C0DD97] font-semibold">
              0% ($0.00 fee)
            </td>
          </tr>
          <tr className="border-t border-[#262626]">
            <td className="py-2.5 text-[#9C9A92]">Creator receives per verified install (Net)</td>
            <td className="py-2.5 text-right font-mono text-[#C9B8FF] font-bold">
              {formatMoney(creatorPerInstall)} (100% payout)
            </td>
          </tr>
          <tr className="border-t border-[#262626]">
            <td className="py-2.5 text-[#9C9A92]">Verified installs budget covers</td>
            <td className="py-2.5 text-right font-mono text-[#F4F2EC]">
              {coveredInstalls.toLocaleString('en-US')} installs
            </td>
          </tr>
          <tr className="border-t border-[#262626] font-medium text-[14.5px]">
            <td className="py-3 text-[#F4F2EC]">Total charged today</td>
            <td className="py-3 text-right font-mono font-bold text-[#C9B8FF]">
              {formatMoney(founderTotalToday)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* The Fee Math Comparison Card (Point 1 from user prompt) */}
      <div className="p-4 rounded-xl bg-[#121215] border border-[#C9B8FF]/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-[#F4F2EC] flex items-center gap-1.5">
            <i className="ti ti-chart-arrows text-[#C9B8FF]"></i>
            <span>The Fee Math: Subscription vs. Volume-Based Cut</span>
          </span>
          <button
            type="button"
            onClick={() => setShowFeeComparison(!showFeeComparison)}
            className="text-[11px] text-[#C9B8FF] hover:underline bg-transparent border-0 cursor-pointer"
          >
            {showFeeComparison ? 'Hide Analysis' : 'Show Analysis'}
          </button>
        </div>

        {showFeeComparison && (
          <div className="text-[11.5px] text-[#9C9A92] leading-relaxed space-y-1.5 pt-1">
            <p>
              Under a traditional cut model (e.g. 7% on founder + 3% on creator on a $0.50 bounty), Umi grossed $0.05 per outcome. After payment processor fees (Stripe 2.9% + $0.30), Umi nets only <b>$0.036 per outcome</b>.
            </p>
            <p className="text-[#F4F2EC]">
              Covering $199 a month under that cut model would take <b>~{legacyOutcomesNeeded.toLocaleString()} verified outcomes</b>—far too high for early betas and design partners.
            </p>
            <p>
              A <b>predictable SaaS subscription ($199/mo) plus a small outcome fee ($0.05)</b> decouples platform revenue from beta volume, protects unit economics, and leaves creator earnings completely untouched (<b>0% creator cut</b>), creating unmatched trust and viral adoption.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Content for each page
  const pageData = useMemo(() => {
    if (currentPage === 'start') {
      return {
        title: 'Documentation',
        subtitle: 'Everything you need to track installs, share creator links, and settle payouts with umi.',
        sections: [] as Section[],
      };
    }

    if (currentPage === 'quick') {
      return {
        title: 'SDK Quickstart',
        subtitle: 'Count verified installs from creator links with a few lines of code.',
        sections: [
          {
            id: 'pre',
            title: 'Prerequisites',
            content: (
              <div className="text-[13.5px] text-[#9C9A92] space-y-2 leading-relaxed">
                <p>You need three things before you start:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#F4F2EC]">
                  <li>A umi account</li>
                  <li>Your app registered in umi with its App Store or Google Play link</li>
                  <li>A campaign, or just a sandbox key if you only want to test</li>
                </ul>
              </div>
            ),
          },
          {
            id: 's1',
            title: '1. Get your app key',
            content: renderKeyCallout(),
          },
          {
            id: 's2',
            title: '2. Install the SDK',
            content: (
              <div>
                {renderPlatformCapsule()}
                {renderCodeBlock('install')}
              </div>
            ),
          },
          {
            id: 's3',
            title: '3. Initialize at launch',
            content: (
              <div>
                <p className="text-[13.5px] text-[#9C9A92]">
                  Call <code className="font-mono text-[#F4F2EC]">configure</code> once, as early as you can. Use the{' '}
                  <strong className="text-[#F4F2EC]">publishable</strong> key.
                </p>
                {renderCodeBlock('init')}
              </div>
            ),
          },
          {
            id: 's4',
            title: '4. Confirm the source',
            content: (
              <div>
                <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                  On Android the SDK reads Google's Play Install Referrer by itself. On iOS there is no equivalent, so the
                  SDK shows a short sheet where the user enters the one-time code from the creator's link page.
                </p>
                {renderCodeBlock('source')}
              </div>
            ),
          },
          {
            id: 's5',
            title: '5. Send a qualifying event',
            content: (
              <div>
                <p className="text-[13.5px] text-[#9C9A92]">
                  A verified install is a new user who finishes the step you chose when you created the campaign. Send that
                  event by name.
                </p>
                {renderCodeBlock('track')}
              </div>
            ),
          },
          {
            id: 's6',
            title: '6. Test in sandbox',
            content: (
              <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                Use a <code className="font-mono text-[#FAC775]">umi_pk_test_</code> key, run the app, then check your
                app overview. Sandbox events never create payable installs.
              </p>
            ),
          },
          {
            id: 's7',
            title: '7. Go live',
            content: (
              <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                Swap in the <code className="font-mono text-[#C9B8FF]">umi_pk_live_</code> key and publish the new app
                version. Your campaign goes live when its first live event arrives.
              </p>
            ),
          },
          {
            id: 'tr',
            title: 'Troubleshooting',
            content: (
              <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                No events after 5 minutes? Check that the key matches the environment, that{' '}
                <code className="font-mono text-[#F4F2EC]">configure</code> runs before any{' '}
                <code className="font-mono text-[#F4F2EC]">track</code> call, and that the device is online.
              </p>
            ),
          },
          {
            id: 'nx',
            title: 'Next steps',
            content: (
              <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                Read <strong className="text-[#F4F2EC]">Source confirmation</strong>, then{' '}
                <strong className="text-[#F4F2EC]">Holds and settlement</strong> to see when creators are paid.
              </p>
            ),
          },
        ],
      };
    }

    if (currentPage === 'keys') {
      return {
        title: 'API keys',
        subtitle: 'Two kinds of keys, per app and per environment.',
        sections: [
          {
            id: 'kinds',
            title: 'Key types',
            content: (
              <table className="w-full border-collapse text-[13.5px] my-3.5">
                <thead>
                  <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-[#71717A] border-b border-[#1B1B1B] pb-2">
                    <th className="pb-2">Key</th>
                    <th className="pb-2">Starts with</th>
                    <th className="pb-2">Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B1B1B]">
                  <tr>
                    <td className="py-3 text-[#F4F2EC] font-medium pr-4">Publishable</td>
                    <td className="py-3 font-mono text-[#F4F2EC] pr-4">umi_pk_</td>
                    <td className="py-3 text-[#9C9A92]">
                      Ships inside your app. Safe to share. Can only send install and event data.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[#F4F2EC] font-medium pr-4">Secret</td>
                    <td className="py-3 font-mono text-[#F4F2EC] pr-4">umi_sk_</td>
                    <td className="py-3 text-[#9C9A92]">
                      Server only. Sends events from your backend. Shown once when created.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-[#F4F2EC] font-medium pr-4">Access token</td>
                    <td className="py-3 font-mono text-[#F4F2EC] pr-4">umi_at_</td>
                    <td className="py-3 text-[#9C9A92]">
                      Reads campaigns and analytics through the REST API. Scoped and expiring.
                    </td>
                  </tr>
                </tbody>
              </table>
            ),
          },
          {
            id: 'get',
            title: 'Find your keys',
            content: (
              <div className="space-y-3">
                <p className="text-[13.5px] text-[#9C9A92]">
                  Open <strong className="text-[#F4F2EC]">Settings, API keys</strong> in your app. Switch between
                  Sandbox and Live at the top.
                </p>
                <button
                  type="button"
                  onClick={onNavigateKeys}
                  className="h-8.5 px-4.5 rounded-full bg-[#F4F2EC] text-[#000000] text-[12.5px] font-medium cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Open API keys</span>
                  <i className="ti ti-arrow-up-right text-[12px]"></i>
                </button>
              </div>
            ),
          },
          {
            id: 'rot',
            title: 'Rotate or revoke',
            content: (
              <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                Create the new key first, deploy it, then revoke the old one. A revoked key stops working within a minute.
              </p>
            ),
          },
        ],
      };
    }

    if (currentPage === 'fees' || currentPage === 'pricing') {
      return {
        title: 'Pricing & Business Model',
        subtitle: 'Predictable founder subscriptions, 0% creator fee, and transparent unit economics.',
        sections: [
          {
            id: 'model',
            title: 'Founder Subscription vs. Volume Cuts',
            content: (
              <div className="space-y-3.5 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  Traditional affiliate networks take a percentage cut from both founders and creators. Umi prices founders by <strong className="text-[#F4F2EC]">predictable monthly subscription</strong> with <strong className="text-[#C9B8FF]">0% fee taken on creator payouts</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#262626]">
                    <div className="text-[14px] font-semibold text-[#F4F2EC]">Starter Tier</div>
                    <div className="text-[20px] font-bold font-mono text-[#C9B8FF] mt-1">$199<span className="text-[12px] text-[#888] font-normal">/mo</span></div>
                    <div className="text-[12px] text-[#9C9A92] mt-1">For early beta founders. Up to 3 active campaigns. Full SDK verification.</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#262626]">
                    <div className="text-[14px] font-semibold text-[#F4F2EC]">Scale Tier</div>
                    <div className="text-[20px] font-bold font-mono text-[#C9B8FF] mt-1">$399<span className="text-[12px] text-[#888] font-normal">/mo</span></div>
                    <div className="text-[12px] text-[#9C9A92] mt-1">Unlimited campaigns, automated anti-fraud queue, priority webhook dispatch.</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#262626] relative">
                    <span className="absolute top-2 right-2 text-[9.5px] uppercase font-bold bg-[#C9B8FF] text-black px-2 py-0.5 rounded-full">Partner</span>
                    <div className="text-[14px] font-semibold text-[#F4F2EC]">Managed Launch</div>
                    <div className="text-[20px] font-bold font-mono text-[#C9B8FF] mt-1">$599<span className="text-[12px] text-[#888] font-normal">/mo</span></div>
                    <div className="text-[12px] text-[#9C9A92] mt-1">White-glove: Umi team sources creators, writes briefs, and manages settlements.</div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'fee-math',
            title: 'The Fee Math: Why Subscriptions Win',
            content: (
              <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#262626] space-y-2.5 text-[13px] text-[#9C9A92] leading-relaxed">
                <p>
                  Consider an app offering a <b>$0.50 install bounty</b>. Under a typical volume cut model (7% on founder and 3% on creator), Umi grossed $0.05 per outcome. After card processing costs (2.9% + $0.30), Umi netted roughly <b>$0.036 per outcome</b>.
                </p>
                <p className="text-[#F4F2EC]">
                  Covering just $199/month under volume cuts would require <b>~5,500 qualified outcomes</b>—an impossible hurdle for an early founder in beta.
                </p>
                <p>
                  A <b>monthly subscription ($199/mo) plus a small outcome fee ($0.05)</b> provides sustainable revenue independent of volume. Most importantly, it keeps platform fees <b>100% off the creator's money</b>, maximizing viral creator signups and eliminating "paid install" optics issues.
                </p>
              </div>
            ),
          },
          {
            id: 'calc',
            title: 'Interactive Fee & Pacing Calculator',
            content: renderFeeCalculator(),
          },
          {
            id: 'guardrails',
            title: 'Strategic Guardrails: Three Things Not to Copy Blindly',
            content: (
              <div className="p-4 rounded-xl bg-[#141414] border border-[#FAC775]/30 space-y-2 text-[13px] text-[#9C9A92] leading-relaxed">
                <div className="flex items-center gap-2 text-[#FAC775] font-semibold">
                  <i className="ti ti-alert-triangle text-[16px]"></i>
                  <span>Treat NewWave Public Data as Hypotheses, Not Facts</span>
                </div>
                <p>
                  While analyzing NewWave's public landing pages gives helpful market insights, remember these three mechanics are completely proprietary and confidential:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#F4F2EC]">
                  <li><b>Their legal structure:</b> Terms of service and creator contractor classification vary by jurisdiction.</li>
                  <li><b>Their refund rules:</b> Real dispute, chargeback, and clawback treatment are not public.</li>
                  <li><b>How Stripe approved them:</b> Underwriting approval for high-risk performance pay and escrow is confidential.</li>
                </ul>
              </div>
            ),
          },
          {
            id: 'roadmap',
            title: 'Roadmap & Later Ideas (Phase 2 & 3)',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  Advanced mechanics to pilot once core beta unit economics are proven:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                  <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#262626]">
                    <div className="text-[13px] font-semibold text-[#F4F2EC] mb-1">1. Tiered Milestone Bonuses</div>
                    <div className="text-[11.5px] text-[#9C9A92] leading-snug">
                      Reward creators with +$50 at 100 qualified installs. Low overhead to test and highly motivating.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#262626]">
                    <div className="text-[13px] font-semibold text-[#F4F2EC] mb-1">2. Hybrid View + Outcome Pay</div>
                    <div className="text-[11.5px] text-[#9C9A92] leading-snug">
                      Blended payout: $0.10/1k views floor plus $1.50 per verified install.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#262626]">
                    <div className="text-[13px] font-semibold text-[#F4F2EC] mb-1">3. AI-Agent Campaign Setup</div>
                    <div className="text-[11.5px] text-[#9C9A92] leading-snug">
                      Autonomous agent scans App Store metadata, drafts creative video briefs, and suggests optimal CPI pricing.
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'ref',
            title: 'Refund & Escrow Guarantee',
            content: (
              <div className="space-y-2 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  100% of unused campaign escrow is refunded back to the founder's corporate payment rail when a campaign ends. Funds never expire while a campaign is live.
                </p>
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'trust') {
      return {
        title: 'Prefunded Escrow & Trust',
        subtitle: 'Why prefunding is the indispensable trust mechanism for performance campaigns.',
        sections: [
          {
            id: 'why-prefund',
            title: 'The Creator Trust Imperative',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  Performance marketing only works if creators have absolute confidence that earned money will show up. "Statements only" or post-pay models fail because creators will not script, film, and edit content on credit.
                </p>
                <p>
                  Umi enforces <strong className="text-[#F4F2EC]">100% prefunded budgets in Stripe Escrow</strong>. Before a creator publishes a video, they can see that the campaign budget is already deposited and guaranteed.
                </p>
              </div>
            ),
          },
          {
            id: 'ledger',
            title: 'Double-Entry Escrow Ledger',
            content: (
              <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#262626] space-y-2 text-[13px] text-[#9C9A92] leading-relaxed">
                <p>
                  When a founder funds a campaign, funds atomically enter <code className="text-[#C9B8FF]">founder_escrow</code>. When an SDK install verifies, the bounty atomically moves to <code className="text-[#C9B8FF]">creator_payable_pending</code>. Neither founders nor Umi can claw back legitimately qualified rewards.
                </p>
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'holds') {
      return {
        title: 'Holds & Settlement Pipeline',
        subtitle: 'The 5-stage earnings lifecycle from initial device click to bank payout.',
        sections: [
          {
            id: 'stages',
            title: 'The 5-Stage Earnings Pipeline',
            content: (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 my-3">
                {[
                  { step: '1. Reported', desc: 'Raw link click / edge telemetry received' },
                  { step: '2. Qualified', desc: 'In-app SDK attestation event recorded' },
                  { step: '3. Held (14d)', desc: 'Safety hold window for anti-fraud check' },
                  { step: '4. Available', desc: 'Released and eligible for Friday disbursement' },
                  { step: '5. Paid', desc: 'Settled to creator bank or debit card' },
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#262626] text-left">
                    <div className="text-[12px] font-semibold text-[#F4F2EC] mb-1">{s.step}</div>
                    <div className="text-[11px] text-[#9C9A92] leading-tight">{s.desc}</div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'settlement-date',
            title: 'Settlement Batch Schedule',
            content: (
              <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
                Available balances ≥ $20.00 disburse weekly on <strong className="text-[#F4F2EC]">Fridays at 17:00 UTC</strong> via Whop / Stripe Direct rails.
              </p>
            ),
          },
          {
            id: 'disclaimer',
            title: 'Regulatory & FTC Earnings Claim Notice',
            content: (
              <div className="p-4 rounded-xl bg-[#121215] border border-[#FAC775]/30 space-y-1 text-[12px] text-[#9C9A92] leading-relaxed">
                <span className="font-semibold text-[#FAC775] block">FTC Disclosure on Earnings Projections:</span>
                Live telemetry estimates and projected milestone earnings are previews and do not represent a guaranteed payout amount until validated by SDK hardware attestation, compliance auditing, and completion of the safety hold.
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'compliance') {
      return {
        title: 'Creator Approvals & FTC Compliance',
        subtitle: 'Protecting brand reputation and satisfying regulatory disclosure monitoring duties.',
        sections: [
          {
            id: 'approvals',
            title: 'Brand Approval Workflow',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  Founders review and approve each creator before tracking links and campaign assets are generated. This prevents brand hijacking and ensures audience fit.
                </p>
              </div>
            ),
          },
          {
            id: 'esign',
            title: 'E-Signed Performance Agreement & FTC Pledge',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  Before receiving a campaign link, creators must e-sign the <b>Umi Creator Performance Agreement</b> and take the <b>FTC Disclosure Pledge</b>:
                </p>
                <div className="p-3.5 rounded-xl bg-[#0E0E0E] border border-[#262626] text-[12px] text-[#B8B6AE]">
                  "I pledge to clearly and conspicuously disclose sponsored content using <b>#ad</b> or platform-approved sponsored tags on TikTok, YouTube, Instagram, or X, adhering strictly to FTC Endorsement Guides."
                </div>
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'outcomes') {
      return {
        title: 'Verified Outcomes vs. Vanity Views',
        subtitle: 'Why SDK in-app verification creates fundamentally superior ROI than view-count platforms.',
        sections: [
          {
            id: 'comparison',
            title: 'Comparing Attribution Models',
            content: (
              <div className="overflow-x-auto my-3">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#262626] text-[#777] text-[11px] uppercase font-mono">
                      <th className="pb-2">Feature</th>
                      <th className="pb-2">Public View Counts (NewWave)</th>
                      <th className="pb-2 text-[#C9B8FF]">SDK Verified Outcomes (Umi)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    <tr>
                      <td className="py-2.5 text-[#F4F2EC] font-medium">What is measured</td>
                      <td className="py-2.5 text-[#9C9A92]">Passive scroll-by views</td>
                      <td className="py-2.5 text-[#C9B8FF] font-medium">Completed in-app onboarding / install</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[#F4F2EC] font-medium">Fraud resistance</td>
                      <td className="py-2.5 text-[#9C9A92]">Vulnerable to view bots & spoofing</td>
                      <td className="py-2.5 text-[#C9B8FF] font-medium">Device hardware attestation (iOS/Android)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[#F4F2EC] font-medium">Self-reporting</td>
                      <td className="py-2.5 text-[#9C9A92]">Public scraping API</td>
                      <td className="py-2.5 text-[#C9B8FF] font-medium">Zero self-reporting (cryptographic handshake)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-[#F4F2EC] font-medium">Conversion guarantee</td>
                      <td className="py-2.5 text-[#9C9A92]">None (views do not imply installs)</td>
                      <td className="py-2.5 text-[#C9B8FF] font-medium">Guaranteed: only pay for verified users</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'controls') {
      return {
        title: 'Campaign Controls & Pacing',
        subtitle: 'Anti-monopolization caps, daily pacing, and automated budget expiration.',
        sections: [
          {
            id: 'caps',
            title: 'Campaign Controls',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  Founders can configure granular controls to keep campaigns on pacing:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#F4F2EC]">
                  <li><b>Per-Creator Video Caps:</b> Limit each creator to 1, 3, or 5 monetized videos to prevent single creators from draining the budget.</li>
                  <li><b>Daily Budget Pacing:</b> Smooth out daily spend (e.g. $250/day cap) to avoid spikes from viral reels.</li>
                  <li><b>Campaign End Dates:</b> Automatically close the campaign and return unspent escrow upon expiration.</li>
                  <li><b>Tiered Bonuses:</b> Optional milestone bonus (e.g. +$50 bonus at 100 qualified installs) to incentivize top creators.</li>
                </ul>
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'managed') {
      return {
        title: 'Managed Launch Tier',
        subtitle: 'Hands-on launch support for your first 3 to 5 design partner campaigns.',
        sections: [
          {
            id: 'managed-details',
            title: 'How Managed Launch Works',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  For early founders who want guaranteed execution, Umi offers a lightweight <b>Managed Launch Tier ($599/month)</b>:
                </p>
                <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#262626] space-y-2 text-[#F4F2EC]">
                  <div>• <b>Creator Vetting & Outreach:</b> We recruit 25-30 top vertical creators tailored to your app.</div>
                  <div>• <b>Creative Briefs:</b> Proven high-conversion script templates and hook instructions.</div>
                  <div>• <b>FTC Disclosure Auditing:</b> We verify every video for #ad compliance.</div>
                  <div>• <b>Settlement Management:</b> We coordinate weekly payouts and creator inquiries.</div>
                </div>
              </div>
            ),
          },
        ],
      };
    }

    if (currentPage === 'source') {
      return {
        title: 'Source Confirmation',
        subtitle: 'Cryptographic attribution handshake between creator links and installed devices.',
        sections: [
          {
            id: 'mechanics',
            title: 'How Source Confirmation Works',
            content: (
              <div className="space-y-3 text-[13.5px] text-[#9C9A92] leading-relaxed">
                <p>
                  When a user clicks a creator's short link or scans their QR code, Umi generates an ephemeral single-use
                  install token.
                </p>
                <p>
                  On iOS, the SDK prompts the user with an Apple Human Interface Guidelines-compliant bottom sheet.
                  On Android, the Google Play Install Referrer API is interrogated silently during cold launch.
                </p>
                {renderCodeBlock('source')}
              </div>
            ),
          },
        ],
      };
    }

    // Generic fallback for other sections
    return {
      title: currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' '),
      subtitle: `Complete documentation and architectural guidelines for ${currentPage}.`,
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          content: (
            <p className="text-[13.5px] text-[#9C9A92] leading-relaxed">
              This specification outlines the telemetry, security boundaries, and protocol definitions for{' '}
              <strong className="text-[#F4F2EC]">{currentPage}</strong> within the Umi ecosystem.
            </p>
          ),
        },
      ],
    };
  }, [currentPage, platform, campaignBudget, rewardPerInstall]);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#000000] text-[#F4F2EC] font-sans select-none text-left">
      {/* Top Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 py-3.5 border-b border-[#1E1E1E] bg-[#0E0E0E] flex-wrap">
          <div className="text-[18px] font-semibold tracking-tight text-[#F4F2EC] flex items-center gap-1.5">
            <span>umi</span>
            <span className="text-[#9A9892] font-normal">docs</span>
          </div>

          <div className="flex-1"></div>

          {/* Search Docs Input */}
          <div className="h-9.5 px-3.5 rounded-full bg-[#181818] border border-[#262626] flex items-center gap-2.5 w-52 sm:w-64">
            <i className="ti ti-search text-[#9A9892] text-[13px]"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs"
              className="bg-transparent border-0 outline-none text-[#F4F2EC] text-[13px] w-full"
            />
          </div>

          {/* Return to Dashboard */}
          <button
            type="button"
            onClick={onBack}
            className="h-8.5 px-4.5 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F4F2EC] text-[12px] font-medium cursor-pointer transition-colors"
          >
            Dashboard
          </button>
        </div>

        {/* 3-Column Shell (Sidebar, Main Content, TOC) - Corner to corner fluid */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_200px] min-h-[700px]">
          {/* Left Sidebar */}
          <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#1E1E1E] bg-[#0E0E0E]/50 text-left overflow-y-auto max-h-[850px]">
            {NAV_GROUPS.map(([groupName, items]) => {
              const filtered = items.filter(
                ([id, label]) =>
                  !searchQuery ||
                  label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  groupName.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filtered.length === 0) return null;

              return (
                <div key={groupName} className="mb-4.5">
                  <div className="text-[13px] font-medium text-[#F4F2EC] px-2.5 mb-1.5">{groupName}</div>
                  <div className="space-y-0.5">
                    {filtered.map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setCurrentPage(id);
                          setActiveSecId(null);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[12.5px] rounded-lg border transition-all cursor-pointer ${
                          currentPage === id
                            ? 'border-white/30 bg-[#1E1E1E] text-[#F4F2EC] font-medium shadow-sm'
                            : 'border-transparent bg-transparent text-[#9C9A92] hover:text-[#F4F2EC] hover:bg-[#0E0E0E]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Main Content */}
          <div className="p-6 sm:p-10 lg:p-12 min-w-0 bg-[#000000] overflow-y-auto max-h-[850px]">
            {currentPage === 'start' ? (
              /* Start Here Landing */
              <div className="py-6 sm:py-8 space-y-8 animate-[fadeIn_0.12s_ease-out]">
                <div>
                  <div className="text-[13px] font-medium text-[#C9B8FF]">umi</div>
                  <h1 className="text-[40px] sm:text-[46px] font-semibold tracking-tight text-[#F4F2EC] mt-1">
                    Documentation
                  </h1>
                  <p className="text-[16px] text-[#9C9A92] mt-3 max-w-xl leading-relaxed">
                    Everything you need to track installs, share creator links, and settle payouts with umi.
                  </p>
                  <div className="flex gap-3 mt-7">
                    <button
                      type="button"
                      onClick={() => setCurrentPage('quick')}
                      className="h-10.5 px-6 rounded-full bg-[#F4F2EC] hover:bg-white text-[#000000] text-[13px] font-medium cursor-pointer transition-all"
                    >
                      Get started
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('install')}
                      className="h-10.5 px-5 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F4F2EC] text-[13px] font-medium cursor-pointer transition-colors"
                    >
                      Install the SDK
                    </button>
                  </div>
                </div>

                {/* 3-Column Link Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-7 border-t border-[#1B1B1B]">
                  {[
                    {
                      category: 'Quick links',
                      links: [
                        { label: 'Create your first campaign', page: 'holds' },
                        { label: 'Connect your app', page: 'quick' },
                        { label: 'How creators get paid', page: 'holds' },
                      ],
                    },
                    {
                      category: 'For developers',
                      links: [
                        { label: 'SDK Quickstart', page: 'quick' },
                        { label: 'API keys', page: 'keys' },
                        { label: 'Webhooks', page: 'webhooks' },
                      ],
                    },
                    {
                      category: 'Popular articles',
                      links: [
                        { label: 'Fees', page: 'fees' },
                        { label: 'Source confirmation', page: 'source' },
                        { label: 'Environments', page: 'env' },
                      ],
                    },
                  ].map((col, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="text-[14.5px] font-medium text-[#F4F2EC]">{col.category}</div>
                      <div className="space-y-1.5">
                        {col.links.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => setCurrentPage(link.page)}
                            className="block text-left text-[13px] text-[#9C9A92] hover:text-[#F4F2EC] py-1 bg-transparent border-0 cursor-pointer transition-colors"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Documentation Page Content */
              <div className="space-y-7 animate-[fadeIn_0.12s_ease-out]">
                <div>
                  <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight text-[#F4F2EC]">{pageData.title}</h1>
                  <p className="text-[14.5px] text-[#9C9A92] mt-1.5">{pageData.subtitle}</p>
                </div>

                {/* Mobile TOC Pills */}
                {pageData.sections.length > 0 && (
                  <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 border-b border-[#1B1B1B]">
                    {pageData.sections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`h-7 px-3 rounded-full text-[12px] border whitespace-nowrap cursor-pointer transition-colors ${
                          activeSecId === sec.id
                            ? 'bg-[#F4F2EC] text-[#000000] border-transparent font-medium'
                            : 'bg-transparent text-[#9A9892] border-white/10 hover:text-white'
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content Sections */}
                <div className="space-y-9 pt-2">
                  {pageData.sections.map((sec, i) => (
                    <div
                      key={sec.id}
                      id={sec.id}
                      className={`scroll-mt-4 ${i > 0 ? 'pt-7 border-t border-[#1B1B1B]' : ''}`}
                    >
                      <h2 className="text-[19px] font-medium text-[#F4F2EC] mb-3">{sec.title}</h2>
                      {sec.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Feedback Toast */}
            {toast && (
              <div className="min-h-[20px] mt-6 text-[12.5px] text-[#C9B8FF] font-mono animate-[fadeIn_0.15s_ease-out]">
                {toast}
              </div>
            )}
          </div>

          {/* Right Sidebar: "On this page" TOC */}
          {currentPage !== 'start' && pageData.sections.length > 0 && (
            <div className="hidden lg:block p-6 border-l border-[#1E1E1E] text-left text-[12px] bg-[#0E0E0E]/40">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#71717A] mb-3.5">
                On this page
              </div>
              <div className="space-y-1.5">
                {pageData.sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`block w-full text-left py-1 text-[12px] transition-colors border-0 bg-transparent cursor-pointer leading-snug ${
                      activeSecId === sec.id
                        ? 'text-[#F4F2EC] font-medium'
                        : 'text-[#9A9892] hover:text-[#F4F2EC]'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

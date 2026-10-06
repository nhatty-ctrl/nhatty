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
    'Money',
    [
      ['fees', 'Fees'],
      ['holds', 'Holds and settlement'],
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

  // Fee Calculator State
  const [campaignBudget, setCampaignBudget] = useState(1000);
  const [rewardPerInstall, setRewardPerInstall] = useState(0.5);

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

  // Fee calculations
  const platformFee = campaignBudget * 0.07;
  const founderTotal = campaignBudget + platformFee;
  const creatorPerInstall = rewardPerInstall * 0.97; // 3% creator fee deducted
  const coveredInstalls = Math.floor(campaignBudget / (rewardPerInstall > 0 ? rewardPerInstall : 0.5));

  // Render a Code Block
  const renderCodeBlock = (key: 'install' | 'init' | 'source' | 'track') => {
    const item = CODE_SNIPPETS[key][platform];
    return (
      <div className="rounded-xl my-3 overflow-hidden bg-[#0A0A0A] border border-[#1F1F1F]">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#1F1F1F] text-[11px] font-mono text-[#6F6E69]">
          <span>{item[0]}</span>
          <button
            type="button"
            onClick={() => copySnippet(item[1])}
            className="h-6 px-2.5 rounded-full border border-white/10 hover:border-white/30 text-[#B9B7AF] hover:text-[#F5F3EC] text-[11px] bg-transparent cursor-pointer transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="p-3.5 m-0 font-mono text-[12px] leading-relaxed text-[#D8D7D2] overflow-x-auto whitespace-pre-wrap">
          {item[1]}
        </pre>
      </div>
    );
  };

  // Platform Capsule selector
  const renderPlatformCapsule = () => (
    <div className="inline-flex rounded-full p-0.5 border border-white/15 bg-[#0B0B0B] my-3">
      {PLATFORMS.map(([pId, pLabel]) => (
        <button
          key={pId}
          type="button"
          onClick={() => setPlatform(pId)}
          className={`rounded-full h-7 px-3 text-[12px] font-medium border-0 cursor-pointer transition-all ${
            platform === pId ? 'bg-[#F5F3EC] text-[#000000]' : 'bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC]'
          }`}
        >
          {pLabel}
        </button>
      ))}
    </div>
  );

  // App Key callout card
  const renderKeyCallout = () => (
    <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] my-3 space-y-2">
      <div className="text-[14.5px] font-medium text-[#F5F3EC]">Get your app key</div>
      <p className="text-[12.5px] text-[#9A9892] leading-relaxed">
        Keys live in your app settings. Copy the publishable key for the app, and keep secret keys on your server.
      </p>
      <div className="pt-1">
        <button
          type="button"
          onClick={onNavigateKeys}
          className="h-8 px-4 rounded-full bg-[#F5F3EC] hover:bg-white text-[#000000] text-[12.5px] font-medium cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>Open API keys</span>
          <i className="ti ti-arrow-up-right text-[12px]"></i>
        </button>
      </div>
    </div>
  );

  // Fee Calculator Card
  const renderFeeCalculator = () => (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] my-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-[11.5px] text-[#9A9892] block mb-1">Campaign budget</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[#9A9892] text-[13px]">$</span>
            <input
              type="number"
              min={50}
              step={50}
              value={campaignBudget}
              onChange={(e) => setCampaignBudget(Math.max(50, parseFloat(e.target.value) || 0))}
              className="w-full h-10 pl-7 pr-3 rounded-xl bg-[#000000] border border-[#2E2E2E] focus:border-white text-[13.5px] text-[#F5F3EC] font-mono outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[11.5px] text-[#9A9892] block mb-1">Reward per install</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[#9A9892] text-[13px]">$</span>
            <input
              type="number"
              min={0.1}
              step={0.05}
              value={rewardPerInstall}
              onChange={(e) => setRewardPerInstall(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full h-10 pl-7 pr-3 rounded-xl bg-[#000000] border border-[#2E2E2E] focus:border-white text-[13.5px] text-[#F5F3EC] font-mono outline-none"
            />
          </div>
        </div>
      </div>

      <table className="w-full border-collapse text-[13px] mt-2">
        <tbody>
          <tr className="border-t border-[#1F1F1F]">
            <td className="py-2.5 text-[#B9B7AF]">Founder pays today</td>
            <td className="py-2.5 text-right font-mono font-medium text-[#F5F3EC]">
              {formatMoney(founderTotal)}
            </td>
          </tr>
          <tr className="border-t border-[#1F1F1F]">
            <td className="py-2.5 text-[#B9B7AF]">of which platform fee (7%)</td>
            <td className="py-2.5 text-right font-mono text-[#9A9892]">
              {formatMoney(platformFee)}
            </td>
          </tr>
          <tr className="border-t border-[#1F1F1F]">
            <td className="py-2.5 text-[#B9B7AF]">Held in escrow for creators</td>
            <td className="py-2.5 text-right font-mono text-[#F5F3EC]">
              {formatMoney(campaignBudget)}
            </td>
          </tr>
          <tr className="border-t border-[#1F1F1F]">
            <td className="py-2.5 text-[#B9B7AF]">Creator receives per install (net 3% fee)</td>
            <td className="py-2.5 text-right font-mono text-[#C7F26B] font-medium">
              {formatMoney(creatorPerInstall)}
            </td>
          </tr>
          <tr className="border-t border-[#1F1F1F]">
            <td className="py-2.5 text-[#B9B7AF]">Installs the budget covers</td>
            <td className="py-2.5 text-right font-mono text-[#F5F3EC]">
              {coveredInstalls.toLocaleString('en-US')}
            </td>
          </tr>
        </tbody>
      </table>
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
              <div className="text-[13.5px] text-[#B9B7AF] space-y-2 leading-relaxed">
                <p>You need three things before you start:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#F5F3EC]">
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
                <p className="text-[13.5px] text-[#B9B7AF]">
                  Call <code className="font-mono text-[#F5F3EC]">configure</code> once, as early as you can. Use the{' '}
                  <strong className="text-[#F5F3EC]">publishable</strong> key.
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
                <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
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
                <p className="text-[13.5px] text-[#B9B7AF]">
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
              <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
                Use a <code className="font-mono text-[#FAC775]">umi_pk_test_</code> key, run the app, then check your
                app overview. Sandbox events never create payable installs.
              </p>
            ),
          },
          {
            id: 's7',
            title: '7. Go live',
            content: (
              <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
                Swap in the <code className="font-mono text-[#C7F26B]">umi_pk_live_</code> key and publish the new app
                version. Your campaign goes live when its first live event arrives.
              </p>
            ),
          },
          {
            id: 'tr',
            title: 'Troubleshooting',
            content: (
              <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
                No events after 5 minutes? Check that the key matches the environment, that{' '}
                <code className="font-mono text-[#F5F3EC]">configure</code> runs before any{' '}
                <code className="font-mono text-[#F5F3EC]">track</code> call, and that the device is online.
              </p>
            ),
          },
          {
            id: 'nx',
            title: 'Next steps',
            content: (
              <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
                Read <strong className="text-[#F5F3EC]">Source confirmation</strong>, then{' '}
                <strong className="text-[#F5F3EC]">Holds and settlement</strong> to see when creators are paid.
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
              <table className="w-full border-collapse text-[13px] my-3">
                <thead>
                  <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-[#6F6E69]">
                    <th className="pb-2">Key</th>
                    <th className="pb-2">Starts with</th>
                    <th className="pb-2">Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  <tr>
                    <td className="py-2.5 text-[#F5F3EC] font-medium pr-4">Publishable</td>
                    <td className="py-2.5 font-mono text-[#F5F3EC] pr-4">umi_pk_</td>
                    <td className="py-2.5 text-[#B9B7AF]">
                      Ships inside your app. Safe to share. Can only send install and event data.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#F5F3EC] font-medium pr-4">Secret</td>
                    <td className="py-2.5 font-mono text-[#F5F3EC] pr-4">umi_sk_</td>
                    <td className="py-2.5 text-[#B9B7AF]">
                      Server only. Sends events from your backend. Shown once when created.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#F5F3EC] font-medium pr-4">Access token</td>
                    <td className="py-2.5 font-mono text-[#F5F3EC] pr-4">umi_at_</td>
                    <td className="py-2.5 text-[#B9B7AF]">
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
                <p className="text-[13.5px] text-[#B9B7AF]">
                  Open <strong className="text-[#F5F3EC]">Settings, API keys</strong> in your app. Switch between
                  Sandbox and Live at the top.
                </p>
                <button
                  type="button"
                  onClick={onNavigateKeys}
                  className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] text-[12.5px] font-medium cursor-pointer inline-flex items-center gap-1.5"
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
              <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
                Create the new key first, deploy it, then revoke the old one. A revoked key stops working within a minute.
              </p>
            ),
          },
        ],
      };
    }

    if (currentPage === 'fees') {
      return {
        title: 'Fees',
        subtitle: 'What founders and creators pay, with a live interactive calculator.',
        sections: [
          {
            id: 'rates',
            title: 'Rates',
            content: (
              <table className="w-full border-collapse text-[13px] my-3">
                <thead>
                  <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-[#6F6E69]">
                    <th className="pb-2">Who</th>
                    <th className="pb-2">Fee</th>
                    <th className="pb-2">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  <tr>
                    <td className="py-2.5 text-[#F5F3EC] font-medium pr-4">Founders</td>
                    <td className="py-2.5 text-[#F5F3EC] pr-4">7% of the budget</td>
                    <td className="py-2.5 text-[#B9B7AF]">
                      Charged when you fund a campaign, on top of the budget.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#F5F3EC] font-medium pr-4">Creators</td>
                    <td className="py-2.5 text-[#F5F3EC] pr-4">3% of each reward</td>
                    <td className="py-2.5 text-[#B9B7AF]">
                      Taken when a reward moves to your available balance.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-[#F5F3EC] font-medium pr-4">Payout provider</td>
                    <td className="py-2.5 text-[#F5F3EC] pr-4">Varies</td>
                    <td className="py-2.5 text-[#B9B7AF]">
                      Shown before you confirm a withdrawal (e.g. Whop / Stripe).
                    </td>
                  </tr>
                </tbody>
              </table>
            ),
          },
          {
            id: 'calc',
            title: 'Calculator',
            content: renderFeeCalculator(),
          },
          {
            id: 'ref',
            title: 'Refunds',
            content: (
              <div className="space-y-2">
                <p className="text-[13.5px] text-[#B9B7AF]">Unused budget is refunded when a campaign ends.</p>
                <div className="p-3.5 rounded-xl bg-[#0B0B0B] border border-[#1F1F1F] text-[12px] text-[#9A9892]">
                  Draft note: whether the 7% fee on the unused portion is refunded is finalized upon campaign closure.
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
              <div className="space-y-3 text-[13.5px] text-[#B9B7AF] leading-relaxed">
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
            <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
              This specification outlines the telemetry, security boundaries, and protocol definitions for{' '}
              <strong className="text-[#F5F3EC]">{currentPage}</strong> within the Umi ecosystem.
            </p>
          ),
        },
      ],
    };
  }, [currentPage, platform, campaignBudget, rewardPerInstall]);

  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-2 sm:px-6">
      <div className="w-full max-w-[1040px] bg-[#000000] text-[#F5F3EC] rounded-[20px] border border-[#1F1F1F] shadow-2xl overflow-hidden font-sans select-none text-left">
        {/* Top Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-[#1F1F1F] bg-[#000000] flex-wrap">
          <div className="text-[18px] font-semibold tracking-tight text-[#F5F3EC] flex items-center gap-1.5">
            <span>umi</span>
            <span className="text-[#9A9892] font-normal">docs</span>
          </div>

          <div className="flex-1"></div>

          {/* Search Docs Input */}
          <div className="h-9 px-3 rounded-full bg-[#0B0B0B] border border-[#1F1F1F] flex items-center gap-2 w-48 sm:w-60">
            <i className="ti ti-search text-[#9A9892] text-[13px]"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs"
              className="bg-transparent border-0 outline-none text-[#F5F3EC] text-[13px] w-full"
            />
          </div>

          {/* Return to Dashboard */}
          <button
            type="button"
            onClick={onBack}
            className="h-8 px-4 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12px] font-medium cursor-pointer transition-colors"
          >
            Dashboard
          </button>
        </div>

        {/* 3-Column Shell (Sidebar, Main Content, TOC) */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)_170px] min-h-[620px]">
          {/* Left Sidebar */}
          <div className="p-3 md:p-4 border-b md:border-b-0 md:border-r border-[#1F1F1F] bg-[#000000]/60 text-left overflow-y-auto max-h-[800px]">
            {NAV_GROUPS.map(([groupName, items]) => {
              const filtered = items.filter(
                ([id, label]) =>
                  !searchQuery ||
                  label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  groupName.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filtered.length === 0) return null;

              return (
                <div key={groupName} className="mb-4">
                  <div className="text-[13px] font-medium text-[#F5F3EC] px-2.5 mb-1.5">{groupName}</div>
                  <div className="space-y-0.5">
                    {filtered.map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setCurrentPage(id);
                          setActiveSecId(null);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[12.5px] rounded-lg border transition-all cursor-pointer ${
                          currentPage === id
                            ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                            : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
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
          <div className="p-5 sm:p-7 min-w-0 bg-[#000000] overflow-y-auto max-h-[800px]">
            {currentPage === 'start' ? (
              /* Start Here Landing */
              <div className="py-6 sm:py-8 space-y-7 animate-[fadeIn_0.12s_ease-out]">
                <div>
                  <div className="text-[13px] font-medium text-[#C7F26B]">umi</div>
                  <h1 className="text-[38px] sm:text-[44px] font-medium tracking-tight text-[#F5F3EC] mt-1">
                    Documentation
                  </h1>
                  <p className="text-[16px] text-[#9A9892] mt-3 max-w-lg leading-relaxed">
                    Everything you need to track installs, share creator links, and settle payouts with umi.
                  </p>
                  <div className="flex gap-2.5 mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentPage('quick')}
                      className="h-10 px-5 rounded-full bg-[#F5F3EC] hover:bg-white text-[#000000] text-[13px] font-medium cursor-pointer transition-all"
                    >
                      Get started
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('install')}
                      className="h-10 px-4 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[13px] font-medium cursor-pointer transition-colors"
                    >
                      Install the SDK
                    </button>
                  </div>
                </div>

                {/* 3-Column Link Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#1F1F1F]">
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
                    <div key={idx} className="space-y-2">
                      <div className="text-[14px] font-medium text-[#F5F3EC]">{col.category}</div>
                      <div className="space-y-1">
                        {col.links.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => setCurrentPage(link.page)}
                            className="block text-left text-[13px] text-[#B9B7AF] hover:text-[#F5F3EC] py-1 bg-transparent border-0 cursor-pointer transition-colors"
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
              <div className="space-y-6 animate-[fadeIn_0.12s_ease-out]">
                <div>
                  <h1 className="text-[30px] font-medium tracking-tight text-[#F5F3EC]">{pageData.title}</h1>
                  <p className="text-[14px] text-[#9A9892] mt-1.5">{pageData.subtitle}</p>
                </div>

                {/* Mobile TOC Pills */}
                {pageData.sections.length > 0 && (
                  <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 border-b border-[#1F1F1F]">
                    {pageData.sections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`h-7 px-3 rounded-full text-[12px] border whitespace-nowrap cursor-pointer transition-colors ${
                          activeSecId === sec.id
                            ? 'bg-[#F5F3EC] text-[#000000] border-transparent font-medium'
                            : 'bg-transparent text-[#9A9892] border-white/10 hover:text-white'
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content Sections */}
                <div className="space-y-8 pt-2">
                  {pageData.sections.map((sec, i) => (
                    <div
                      key={sec.id}
                      id={sec.id}
                      className={`scroll-mt-4 ${i > 0 ? 'pt-6 border-t border-[#1F1F1F]' : ''}`}
                    >
                      <h2 className="text-[18px] font-medium text-[#F5F3EC] mb-2.5">{sec.title}</h2>
                      {sec.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Feedback Toast */}
            {toast && (
              <div className="min-h-[20px] mt-6 text-[12.5px] text-[#C7F26B] font-mono animate-[fadeIn_0.15s_ease-out]">
                {toast}
              </div>
            )}
          </div>

          {/* Right Sidebar: "On this page" TOC */}
          {currentPage !== 'start' && pageData.sections.length > 0 && (
            <div className="hidden lg:block p-4 border-l border-[#1F1F1F] text-left text-[12px]">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-3">
                On this page
              </div>
              <div className="space-y-1">
                {pageData.sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`block w-full text-left py-1 text-[12px] transition-colors border-0 bg-transparent cursor-pointer leading-snug ${
                      activeSecId === sec.id
                        ? 'text-[#F5F3EC] font-medium'
                        : 'text-[#9A9892] hover:text-[#F5F3EC]'
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
    </div>
  );
};

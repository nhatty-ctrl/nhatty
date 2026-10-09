import React, { useState, useMemo } from 'react';

interface DocumentationViewProps {
  onBack?: () => void;
  onNavigateCreateCampaign?: () => void;
}

interface DocSection {
  id: string;
  title: string;
  category: string;
  badge?: string;
  icon: string;
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'overview', title: 'Overview & Architecture', category: 'GETTING STARTED', icon: 'ti-sparkles' },
  { id: 'quickstart', title: 'Quickstart in 5 Minutes', category: 'GETTING STARTED', icon: 'ti-bolt' },
  { id: 'ios', title: 'iOS SDK (Swift SPM)', category: 'CLIENT LIBRARIES', badge: 'v2.4', icon: 'ti-brand-apple' },
  { id: 'android', title: 'Android SDK (Kotlin)', category: 'CLIENT LIBRARIES', badge: 'v2.4', icon: 'ti-brand-android' },
  { id: 'react-native', title: 'React Native & Expo', category: 'CLIENT LIBRARIES', icon: 'ti-brand-react' },
  { id: 'unity', title: 'Unity Game Engine', category: 'CLIENT LIBRARIES', icon: 'ti-brand-unity' },
  { id: 'webhooks', title: 'Webhooks & HMAC Signatures', category: 'BACKEND & APIS', icon: 'ti-webhook' },
  { id: 'rest-api', title: 'Attribution REST API', category: 'BACKEND & APIS', icon: 'ti-api' },
  { id: 'compliance', title: 'Creator FTC Compliance', category: 'POLICIES', icon: 'ti-shield-check' },
  { id: 'sandbox', title: 'Interactive Sandbox Tester', category: 'TESTING', badge: 'Live', icon: 'ti-terminal-2' },
];

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onBack,
  onNavigateCreateCampaign,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<'swift' | 'kotlin' | 'ts' | 'curl'>('swift');

  // Sandbox simulation state
  const [sandboxPlatform, setSandboxPlatform] = useState<'ios' | 'android'>('ios');
  const [sandboxSimulating, setSandboxSimulating] = useState(false);
  const [sandboxLog, setSandboxLog] = useState<any | null>(null);

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return DOC_SECTIONS;
    const q = searchQuery.toLowerCase();
    return DOC_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const list: string[] = [];
    filteredSections.forEach((s) => {
      if (!list.includes(s.category)) list.push(s.category);
    });
    return list;
  }, [filteredSections]);

  const handleRunSandbox = () => {
    setSandboxSimulating(true);
    setSandboxLog(null);
    setTimeout(() => {
      setSandboxSimulating(false);
      setSandboxLog({
        status: 200,
        event: 'install.verified',
        eventId: `evt_${Math.random().toString(36).substring(2, 10)}`,
        timestamp: new Date().toISOString(),
        deviceAttestation: {
          platform: sandboxPlatform,
          hardwareConfidence: 0.992,
          attestationToken: `att_sig_${Math.random().toString(36).substring(2, 12)}`,
          antiFraudPassed: true,
        },
        attribution: {
          campaignId: 'pixelpop',
          creatorHandle: 'maya.makes',
          payoutUsd: 1.80,
          payoutStatus: 'escrow_reserved',
          settlementDate: '2026-10-09 (Friday)',
        },
      });
    }, 650);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F5F3EC] select-none text-left">
      {/* Top Floating Bar inspired by Luma */}
      <div className="sticky top-0 z-30 bg-[#09090B]/90 backdrop-blur-md border-b border-[#1F1F23] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-[12.5px] text-[#A1A1AA] hover:text-[#F5F3EC] bg-transparent border-0 cursor-pointer transition-colors"
            >
              <i className="ti ti-arrow-left text-[14px]"></i>
              <span>Back</span>
            </button>
          )}

          <div className="h-4 w-px bg-[#27272A] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-[6px] bg-[#1C1C1F] text-[#F5F3EC] flex items-center justify-center text-[12px]">
              <i className="ti ti-asterisk"></i>
            </span>
            <span className="font-medium text-[13.5px] text-[#F5F3EC]">KRED Developer Docs</span>
            <span className="chip text-[10px] py-0.5 px-2 bg-[#C7F26B]/15 text-[#C7F26B] font-mono">
              SDK v2.4.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateCreateCampaign && (
            <button
              type="button"
              onClick={onNavigateCreateCampaign}
              className="pill on text-[12px] py-1.5 px-3.5 cursor-pointer font-medium"
            >
              <span>Create campaign</span>
              <i className="ti ti-arrow-right text-[12px]"></i>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Corner-to-corner fluid layout */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        {/* Left Sticky Navigation Column */}
        <aside className="sticky top-20 space-y-4">
          {/* Quick Search Input */}
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-2.5 text-[14px] text-[#71717A]"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation…"
              className="w-full bg-[#121215] border border-[#27272A] rounded-[12px] pl-9 pr-3 py-1.5 text-[12.5px] text-[#F5F3EC] placeholder-[#71717A] focus:outline-none focus:border-[#388BFD] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[12px] text-[#71717A] hover:text-[#F5F3EC] bg-transparent border-0 cursor-pointer"
              >
                <i className="ti ti-x"></i>
              </button>
            )}
          </div>

          {/* Navigation Links grouped by Category */}
          <nav className="space-y-4">
            {categories.map((cat) => (
              <div key={cat} className="space-y-1">
                <div className="text-[10.5px] font-mono tracking-wider uppercase text-[#71717A] px-2.5 py-1">
                  {cat}
                </div>
                <div className="space-y-0.5">
                  {filteredSections
                    .filter((s) => s.category === cat)
                    .map((item) => {
                      const isActive = activeSectionId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveSectionId(item.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-[10px] text-[13px] transition-all cursor-pointer border-0 ${
                            isActive
                              ? 'bg-[#1F1F24] text-white font-medium shadow-xs'
                              : 'bg-transparent text-[#A1A1AA] hover:bg-[#151518] hover:text-[#F5F3EC]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <i className={`ti ${item.icon} text-[15px] ${isActive ? 'text-[#C7F26B]' : 'text-[#71717A]'}`} />
                            <span className="truncate">{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#27272A] text-[#A1A1AA]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Content Pane (Luma Clean Typography & Components) */}
        <main className="min-w-0 max-w-[820px] space-y-8">
          {/* Section: Overview */}
          {activeSectionId === 'overview' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#388BFD]">
                  ARCHITECTURE & PLATFORM
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  KRED Attribution Engine
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  KRED provides performance-based creator marketing for mobile apps. Mobile founders deposit campaign budgets into verified escrow, while vetted creators drive authentic installs through cryptographic deferred deep links.
                </p>
              </div>

              {/* 3 Steps Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 bg-[#121215] border border-[#27272A] rounded-[18px] space-y-2">
                  <div className="w-8 h-8 rounded-[10px] bg-[#CECBF6] text-[#26215C] flex items-center justify-center text-[16px] font-semibold">
                    1
                  </div>
                  <div className="text-[14px] font-medium text-[#F5F3EC]">Creator Discovery & Join</div>
                  <div className="text-[12px] text-[#A1A1AA] leading-relaxed">
                    Creators discover apps, join performance tiers, and generate custom tracking links (`kred.link/app/creator`).
                  </div>
                </div>

                <div className="p-4 bg-[#121215] border border-[#27272A] rounded-[18px] space-y-2">
                  <div className="w-8 h-8 rounded-[10px] bg-[#C7F26B] text-[#16140F] flex items-center justify-center text-[16px] font-semibold">
                    2
                  </div>
                  <div className="text-[14px] font-medium text-[#F5F3EC]">Attestation & Matching</div>
                  <div className="text-[12px] text-[#A1A1AA] leading-relaxed">
                    Upon App Store download, the SDK matches Apple DeviceCheck or Google Play Integrity tokens to prevent fraud.
                  </div>
                </div>

                <div className="p-4 bg-[#121215] border border-[#27272A] rounded-[18px] space-y-2">
                  <div className="w-8 h-8 rounded-[10px] bg-[#FAC775] text-[#412402] flex items-center justify-center text-[16px] font-semibold">
                    3
                  </div>
                  <div className="text-[14px] font-medium text-[#F5F3EC]">Weekly Escrow Settlement</div>
                  <div className="text-[12px] text-[#A1A1AA] leading-relaxed">
                    Verified installs disburse weekly every Friday directly to the creator’s linked bank or PayPal account.
                  </div>
                </div>
              </div>

              {/* Callout Box */}
              <div className="p-4 bg-[#121215] border-l-3 border-[#C7F26B] rounded-r-[16px] space-y-1">
                <div className="text-[13px] font-medium text-[#F5F3EC] flex items-center gap-2">
                  <i className="ti ti-shield-check text-[#C7F26B] text-[16px]"></i>
                  <span>Zero Chargebacks for Founders</span>
                </div>
                <div className="text-[12px] text-[#A1A1AA] leading-relaxed">
                  Campaign budgets are only drawn when installs pass hardware attestation and retention verification. Clicks and unverified downloads incur $0.00 spend.
                </div>
              </div>
            </div>
          )}

          {/* Section: Quickstart */}
          {activeSectionId === 'quickstart' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#C7F26B]">
                  INTEGRATION
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  Quickstart Guide
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  Get your app connected and tracking in less than 5 minutes.
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-5 bg-[#121215] border border-[#27272A] rounded-[20px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#F5F3EC]">Step 1: Get your API Key</span>
                  <span className="chip text-[11px] py-0.5 px-2 bg-[#388BFD]/15 text-[#388BFD]">Production</span>
                </div>
                <p className="text-[13px] text-[#A1A1AA]">
                  During campaign creation, you receive your unique client key:
                </p>
                <div className="flex items-center justify-between p-3 bg-[#0B0B0D] rounded-[12px] border border-[#27272A] font-mono text-[12px]">
                  <span className="text-[#C7F26B]">kred_live_pixelpop7k2x98q1</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('kred_live_pixelpop7k2x98q1', 'api-key')}
                    className="chip text-[11px] py-1 px-2.5 cursor-pointer"
                  >
                    <span>{copiedKey === 'api-key' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Language switcher */}
              <div className="p-5 bg-[#121215] border border-[#27272A] rounded-[20px] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#F5F3EC]">Step 2: Add KRED SDK</span>
                  <div className="flex gap-1 bg-[#1A1A1E] p-1 rounded-full border border-[#27272A]">
                    {(['swift', 'kotlin', 'ts', 'curl'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveCodeLang(lang)}
                        className={`pill text-[11px] py-0.5 px-2.5 border-0 ${
                          activeCodeLang === lang ? 'on font-medium' : 'gh text-[#71717A]'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {activeCodeLang === 'swift' && (
                  <pre className="p-4 bg-[#09090B] border border-[#27272A] rounded-[14px] text-[12.5px] font-mono text-[#D4D4D8] overflow-x-auto leading-relaxed">
{`// 1. Add Swift Package: https://github.com/kred-org/kred-ios-sdk
import KredSDK

@main
struct YourApp: App {
    init() {
        Kred.configure(apiKey: "kred_live_pixelpop7k2x98q1")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    Kred.handleDeepLink(url)
                }
        }
    }
}`}
                  </pre>
                )}

                {activeCodeLang === 'kotlin' && (
                  <pre className="p-4 bg-[#09090B] border border-[#27272A] rounded-[14px] text-[12.5px] font-mono text-[#D4D4D8] overflow-x-auto leading-relaxed">
{`// 1. Add Gradle: implementation("io.kred:kred-android:2.4.0")
import io.kred.Kred

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Kred.initialize(
            context = this,
            apiKey = "kred_live_pixelpop7k2x98q1"
        )
    }
}`}
                  </pre>
                )}

                {activeCodeLang === 'ts' && (
                  <pre className="p-4 bg-[#09090B] border border-[#27272A] rounded-[14px] text-[12.5px] font-mono text-[#D4D4D8] overflow-x-auto leading-relaxed">
{`// npm install @kred/react-native
import { Kred } from '@kred/react-native';

export default function App() {
  useEffect(() => {
    Kred.init({ apiKey: 'kred_live_pixelpop7k2x98q1' });
  }, []);
}`}
                  </pre>
                )}

                {activeCodeLang === 'curl' && (
                  <pre className="p-4 bg-[#09090B] border border-[#27272A] rounded-[14px] text-[12.5px] font-mono text-[#D4D4D8] overflow-x-auto leading-relaxed">
{`curl -X POST https://api.kred.link/v1/attribution/events \\
  -H "Authorization: Bearer kred_live_pixelpop7k2x98q1" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"app_launch","device_token":"att_123","campaign_id":"pixelpop"}'`}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Section: iOS SDK */}
          {activeSectionId === 'ios' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#388BFD]">
                  CLIENT SDK · APPLE ECOSYSTEM
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  iOS SDK Integration
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  Support for iOS 15+, iPadOS, and macOS via Swift Package Manager. Native integration with Apple DeviceCheck API for cryptographic install attestation.
                </p>
              </div>

              <div className="p-5 bg-[#121215] border border-[#27272A] rounded-[20px] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#F5F3EC]">Swift Package Manager</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('https://github.com/kred-org/kred-ios-sdk', 'ios-repo')}
                    className="chip text-[12px] py-1 px-3 cursor-pointer"
                  >
                    <span>{copiedKey === 'ios-repo' ? 'Copied' : 'Copy SPM URL'}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#0B0B0D] rounded-[12px] border border-[#27272A] font-mono text-[12.5px] text-[#C7F26B]">
                  https://github.com/kred-org/kred-ios-sdk
                </div>
                <div className="text-[12.5px] text-[#A1A1AA] leading-relaxed">
                  In Xcode, go to <span className="text-[#F5F3EC]">File &gt; Add Package Dependencies</span>, paste the URL above, and select <span className="text-[#F5F3EC]">Up to Next Major Version (2.4.0)</span>.
                </div>
              </div>
            </div>
          )}

          {/* Section: Android SDK */}
          {activeSectionId === 'android' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#388BFD]">
                  CLIENT SDK · GOOGLE PLAY ECOSYSTEM
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  Android SDK Integration
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  Compatible with Android API 23+, Kotlin Coroutines, and Google Play Integrity API.
                </p>
              </div>

              <div className="p-5 bg-[#121215] border border-[#27272A] rounded-[20px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#F5F3EC]">Gradle Dependency</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('implementation("io.kred:kred-android:2.4.0")', 'and-dep')}
                    className="chip text-[12px] py-1 px-3 cursor-pointer"
                  >
                    <span>{copiedKey === 'and-dep' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#0B0B0D] rounded-[12px] border border-[#27272A] font-mono text-[12.5px] text-[#C7F26B] overflow-x-auto">
                  implementation("io.kred:kred-android:2.4.0")
                </pre>
              </div>
            </div>
          )}

          {/* Section: Webhooks */}
          {activeSectionId === 'webhooks' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#C7F26B]">
                  SERVER-TO-SERVER
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  Webhooks & Signatures
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  Receive instant HTTPS POST webhooks whenever an install is verified. Signatures are computed using HMAC SHA-256 with your Webhook Secret.
                </p>
              </div>

              <div className="p-5 bg-[#121215] border border-[#27272A] rounded-[20px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#F5F3EC]">Verification Example (Node.js)</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `const crypto = require('crypto');\n\nfunction verifyKredWebhook(payload, signature, secret) {\n  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');\n  return signature === expected;\n}`,
                        'node-wh'
                      )
                    }
                    className="chip text-[12px] py-1 px-3 cursor-pointer"
                  >
                    <span>{copiedKey === 'node-wh' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#09090B] border border-[#27272A] rounded-[14px] font-mono text-[12px] text-[#D4D4D8] overflow-x-auto leading-relaxed">
{`const crypto = require('crypto');

function verifyKredWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expected;
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Section: Interactive Sandbox Tester */}
          {activeSectionId === 'sandbox' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#C7F26B]">
                  PLAYGROUND & TESTING
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  Sandbox Event Tester
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  Trigger mock attribution events, test anti-fraud validation, and inspect live JSON payload responses without affecting real campaign budget balances.
                </p>
              </div>

              <div className="p-6 bg-[#121215] border border-[#27272A] rounded-[24px] space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
                  <div className="space-y-1">
                    <div className="text-[15px] font-medium text-[#F5F3EC]">Emulate Device Install</div>
                    <div className="text-[12px] text-[#A1A1AA]">
                      Simulates a user tapping a creator link, installing, and launching.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex bg-[#1A1A1E] p-1 rounded-full border border-[#27272A]">
                      <button
                        type="button"
                        onClick={() => setSandboxPlatform('ios')}
                        className={`pill text-[11px] py-1 px-3 border-0 ${
                          sandboxPlatform === 'ios' ? 'on font-medium' : 'gh text-[#71717A]'
                        }`}
                      >
                        iOS (iPhone 15)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSandboxPlatform('android')}
                        className={`pill text-[11px] py-1 px-3 border-0 ${
                          sandboxPlatform === 'android' ? 'on font-medium' : 'gh text-[#71717A]'
                        }`}
                      >
                        Android (Pixel 9)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunSandbox}
                      disabled={sandboxSimulating}
                      className="pill on text-[12.5px] py-1.5 px-4 cursor-pointer font-medium disabled:opacity-50"
                    >
                      <i className={`ti ${sandboxSimulating ? 'ti-loader-2 spin' : 'ti-play'}`} />
                      <span>{sandboxSimulating ? 'Attesting…' : 'Fire Test Event'}</span>
                    </button>
                  </div>
                </div>

                {/* Results Inspector */}
                {sandboxLog ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-mono text-[#C7F26B] font-medium">
                        ✓ 200 OK — ATTESTATION SIGNATURE VERIFIED
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(sandboxLog, null, 2), 'sandbox-json')}
                        className="chip text-[11px]"
                      >
                        <span>{copiedKey === 'sandbox-json' ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-[#09090B] border border-[#27272A] rounded-[16px] font-mono text-[12px] text-[#A1A1AA] overflow-x-auto leading-relaxed">
                      {JSON.stringify(sandboxLog, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[13px] text-[#71717A] border border-dashed border-[#27272A] rounded-[16px]">
                    Click "Fire Test Event" to simulate an install attestation.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Compliance */}
          {activeSectionId === 'compliance' && (
            <div className="space-y-6 animate-[fade-in_0.15s_ease-out]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#FAC775]">
                  LEGAL & FTC RULES
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-semibold tracking-[-0.8px] text-[#F5F3EC] mt-1">
                  Creator Disclosure Guidelines
                </h1>
                <p className="text-[15px] text-[#A1A1AA] mt-2.5 leading-relaxed">
                  To protect creators and apps, all partner referrals require clear and conspicuous commercial disclosure under FTC 16 CFR § 255.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-[#121215] border border-[#27272A] rounded-[18px] space-y-1">
                  <div className="text-[14px] font-medium text-[#F5F3EC]">Always use #ad or #sponsored</div>
                  <div className="text-[12.5px] text-[#A1A1AA] leading-relaxed">
                    Place disclosures above the fold or in the first 2 lines of video descriptions before the "Show More" fold.
                  </div>
                </div>

                <div className="p-4 bg-[#121215] border border-[#27272A] rounded-[18px] space-y-1">
                  <div className="text-[14px] font-medium text-[#F5F3EC]">Verbal Audio Disclosure on Video</div>
                  <div className="text-[12.5px] text-[#A1A1AA] leading-relaxed">
                    In video sponsorships, verbally state "Thanks to [App] for sponsoring this video" when presenting the app or QR code.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other sections: clean placeholder */}
          {!['overview', 'quickstart', 'ios', 'android', 'webhooks', 'sandbox', 'compliance'].includes(activeSectionId) && (
            <div className="p-12 text-center text-[#71717A] bg-[#121215] border border-[#27272A] rounded-[24px]">
              <i className="ti ti-book text-[28px] mb-2 block text-[#388BFD]" />
              <div className="text-[15px] font-medium text-[#F5F3EC] mb-1">
                {DOC_SECTIONS.find((s) => s.id === activeSectionId)?.title}
              </div>
              <p className="text-[13px] text-[#A1A1AA] max-w-[420px] mx-auto">
                Comprehensive guide and API reference for this section. Refer to the Quickstart or Sandbox to start building.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

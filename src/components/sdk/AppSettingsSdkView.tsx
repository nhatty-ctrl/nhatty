import React, { useState, useEffect } from 'react';

export interface KeyItem {
  id: number;
  kind: 'pk' | 'sk';
  env: 'live' | 'test';
  name: string;
  desc: string;
  val: string;
}

export interface TokenItem {
  id: number;
  name: string;
  scopes: string[];
  last: string;
  exp: string;
  val: string;
}

interface AppSettingsSdkViewProps {
  onBack: () => void;
  onNavigateDocs: () => void;
  onNavigateBilling?: () => void;
}

const APPS_LIST = [
  { id: 'pixelpop', name: 'Pixel Pop', icon: 'ti-device-gamepad-2', bg: '#CECBF6', fg: '#26215C', bundleId: 'com.novaplay.pixelpop' },
  { id: 'atelier', name: 'Atelier Craft', icon: 'ti-brush', bg: '#CECBF6', fg: '#26215C', bundleId: 'com.beauxarts.atelier' },
  { id: 'palazzo', name: 'Palazzo Lens', icon: 'ti-camera', bg: '#FAC775', fg: '#412402', bundleId: 'com.palazzo.lens' },
  { id: 'stride', name: 'Stride', icon: 'ti-heart', bg: '#F5C4B3', fg: '#4A1B0C', bundleId: 'com.northbeat.stride' },
];

const SCOPES_OPTIONS = ['campaigns:read', 'analytics:read', 'links:write', 'earnings:read'];

function randomStr(len: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export const AppSettingsSdkView: React.FC<AppSettingsSdkViewProps> = ({
  onBack,
  onNavigateDocs,
  onNavigateBilling,
}) => {
  // Navigation within App Settings
  const [page, setPage] = useState<'overview' | 'general' | 'keys' | 'hooks' | 'rc' | 'whop' | 'fund' | 'usage'>('overview');
  const [tab, setTab] = useState<'keys' | 'tok'>('keys');
  const [env, setEnv] = useState<'live' | 'test'>('live');

  // App Selection
  const [selectedAppId, setSelectedAppId] = useState('pixelpop');
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const activeApp = APPS_LIST.find((a) => a.id === selectedAppId) || APPS_LIST[0];

  // Feedback Toast
  const [toast, setToast] = useState<string>('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Modals / Dropdowns state
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | number | null>(null);
  const [creationForm, setCreationForm] = useState<'pk' | 'sk' | 'tk' | null>(null);
  const [revealData, setRevealData] = useState<{ kind: 'sk' | 'tk'; val: string } | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formScopes, setFormScopes] = useState<Record<string, boolean>>({ 'campaigns:read': true });
  const [formExp, setFormExp] = useState('90 days');
  const [formError, setFormError] = useState('');

  // Banners
  const [showBanner1, setShowBanner1] = useState(true);
  const [showBanner2, setShowBanner2] = useState(true);

  // Filter for tokens
  const [tokenFilter, setTokenFilter] = useState('');

  // Keys Database State
  const [keys, setKeys] = useState<KeyItem[]>(() => {
    try {
      const stored = localStorage.getItem('umi_app_keys_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 1,
        kind: 'pk',
        env: 'live',
        name: 'default',
        desc: 'Used by the iOS and Android apps',
        val: 'umi_pk_live_7Kx2mQ9aVt4LdR8nBw3hPz',
      },
      {
        id: 2,
        kind: 'sk',
        env: 'live',
        name: 'backend',
        desc: 'Sends purchase events from our server',
        val: 'umi_sk_live_a1b2************3f9d',
      },
      {
        id: 3,
        kind: 'pk',
        env: 'test',
        name: 'default',
        desc: 'No description',
        val: 'umi_pk_test_Zq8nLw2xYc5TrD1vHk7sMe',
      },
    ];
  });

  const [tokens, setTokens] = useState<TokenItem[]>(() => {
    try {
      const stored = localStorage.getItem('umi_app_tokens_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 1,
        name: 'analytics export',
        scopes: ['analytics:read', 'campaigns:read'],
        last: '3 days ago',
        exp: 'in 61 days',
        val: 'umi_at_Rt5k••••••••••••••••••••••••a91c',
      },
      {
        id: 2,
        name: 'old script',
        scopes: ['campaigns:read'],
        last: 'Never used',
        exp: 'Expired',
        val: 'umi_at_Lm0d••••••••••••••••••••••••7be2',
      },
    ];
  });

  // Save changes to storage
  useEffect(() => {
    try {
      localStorage.setItem('umi_app_keys_v2', JSON.stringify(keys));
    } catch {}
  }, [keys]);

  useEffect(() => {
    try {
      localStorage.setItem('umi_app_tokens_v2', JSON.stringify(tokens));
    } catch {}
  }, [tokens]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 2800);
  };

  const copyText = (val: string, label = 'Copied to clipboard') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(val);
    }
    setCopiedKeyId(val);
    showToast(label);
    setTimeout(() => {
      setCopiedKeyId(null);
    }, 1200);
  };

  // Filtered keys
  const livePublishableKey = keys.find((k) => k.kind === 'pk' && k.env === env);
  const publishableKeys = keys.filter((k) => k.kind === 'pk' && k.env === env);
  const secretKeys = keys.filter((k) => k.kind === 'sk' && k.env === env);
  const filteredTokens = tokens.filter(
    (t) => !tokenFilter || t.name.toLowerCase().includes(tokenFilter.toLowerCase())
  );

  const handleCreateKeyOrToken = (kind: 'pk' | 'sk' | 'tk') => {
    if (!formName.trim()) {
      setFormError('Give it a name.');
      return;
    }
    setFormError('');

    if (kind === 'pk') {
      const val = `umi_pk_${env === 'live' ? 'live' : 'test'}_${randomStr(22)}`;
      const newKey: KeyItem = {
        id: Date.now(),
        kind: 'pk',
        env,
        name: formName.trim(),
        desc: 'Created just now',
        val,
      };
      setKeys((prev) => [...prev, newKey]);
      setCreationForm(null);
      showToast('Created new publishable key');
    } else if (kind === 'sk') {
      const raw = `umi_sk_${env === 'live' ? 'live' : 'test'}_${randomStr(30)}`;
      const masked = `${raw.slice(0, 16)}************${raw.slice(-4)}`;
      const newKey: KeyItem = {
        id: Date.now(),
        kind: 'sk',
        env,
        name: formName.trim(),
        desc: 'Created just now',
        val: masked,
      };
      setKeys((prev) => [...prev, newKey]);
      setRevealData({ kind: 'sk', val: raw });
      setCreationForm(null);
    } else {
      const selectedScopes = SCOPES_OPTIONS.filter((s) => formScopes[s]);
      if (selectedScopes.length === 0) {
        setFormError('Choose at least one scope.');
        return;
      }
      const raw2 = `umi_at_${randomStr(32)}`;
      const masked2 = `${raw2.slice(0, 11)}••••••••••••••••••••••••${raw2.slice(-4)}`;
      const newToken: TokenItem = {
        id: Date.now(),
        name: formName.trim(),
        scopes: selectedScopes,
        last: 'Never used',
        exp: `in ${formExp}`,
        val: masked2,
      };
      setTokens((prev) => [newToken, ...prev]);
      setRevealData({ kind: 'tk', val: raw2 });
      setCreationForm(null);
    }
    setFormName('');
  };

  const handleRevoke = (id: string | number) => {
    if (typeof id === 'string' && id.startsWith('t')) {
      const numId = parseInt(id.replace('t', ''), 10);
      setTokens((prev) => prev.filter((t) => t.id !== numId));
      showToast('Token revoked successfully');
    } else {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      showToast('API key revoked successfully');
    }
    setActiveMenuId(null);
    setConfirmRevokeId(null);
  };

  // Status tiles config
  const statusTiles = [
    {
      icon: 'ti-activity',
      label: 'Status',
      value: env === 'live' ? (
        <span className="flex items-center gap-1.5 text-[#C7F26B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7F26B] animate-pulse"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7F26B] animate-pulse delay-75"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7F26B] animate-pulse delay-150"></span>
          <span className="ml-1 text-[#F5F3EC]">Healthy</span>
        </span>
      ) : (
        <span className="text-[#FAC775]">Test mode</span>
      ),
      bg: '#C0DD97',
      fg: '#173404',
    },
    {
      icon: 'ti-clock',
      label: 'Last event',
      value: env === 'live' ? '2 minutes ago' : 'Yesterday',
      bg: '#B5D4F4',
      fg: '#042C53',
    },
    {
      icon: 'ti-package',
      label: 'SDK version',
      value: '0.3.1',
      bg: '#CECBF6',
      fg: '#26215C',
    },
    {
      icon: 'ti-device-mobile',
      label: 'Platforms',
      value: 'iOS and Android',
      bg: '#F4C0D1',
      fg: '#4B1528',
    },
    {
      icon: 'ti-speakerphone',
      label: 'Live campaigns',
      value: env === 'live' ? '2' : '0',
      bg: '#FAC775',
      fg: '#412402',
    },
    {
      icon: 'ti-calendar-event',
      label: 'Next settlement',
      value: env === 'live' ? 'Friday, Oct 9' : 'None in sandbox',
      bg: '#9FE1CB',
      fg: '#04342C',
    },
  ];

  return (
    <div className="w-full flex justify-center py-4 sm:py-6 px-2 sm:px-6">
      <div className="w-full max-w-[960px] bg-[#000000] text-[#F5F3EC] rounded-[20px] border border-[#1F1F1F] shadow-2xl overflow-hidden font-sans select-none text-left">
        {/* Top Header Bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3.5 border-b border-[#1F1F1F] flex-wrap bg-[#000000]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12px] text-[#B9B7AF] hover:text-[#F5F3EC] bg-transparent border-0 cursor-pointer px-1 py-1 transition-colors"
          >
            <i className="ti ti-arrow-left text-[14px]"></i>
            <span>Back to dashboard</span>
          </button>

          {/* App Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-[#0B0B0B] hover:bg-[#161616] cursor-pointer text-[13px] text-[#F5F3EC] transition-all"
            >
              <span
                style={{ backgroundColor: activeApp.bg, color: activeApp.fg }}
                className="w-[22px] h-[22px] rounded-[7px] inline-flex items-center justify-center text-[12px]"
              >
                <i className={`ti ${activeApp.icon}`}></i>
              </span>
              <span className="font-medium">{activeApp.name}</span>
              <i className="ti ti-chevron-down text-[11px] text-[#9A9892]"></i>
            </button>

            {isAppMenuOpen && (
              <div className="absolute left-0 top-9 z-20 w-[200px] bg-[#0B0B0B] border border-[#2E2E2E] rounded-xl shadow-xl p-1 animate-[fadeIn_0.1s_ease-out]">
                {APPS_LIST.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setIsAppMenuOpen(false);
                      showToast(`Switched app to ${app.name}`);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg border-0 cursor-pointer text-left transition-colors ${
                      activeApp.id === app.id
                        ? 'bg-[#1C1C1C] text-[#F5F3EC] font-medium'
                        : 'bg-transparent text-[#B9B7AF] hover:bg-[#161616] hover:text-[#F5F3EC]'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: app.bg, color: app.fg }}
                      className="w-5 h-5 rounded-md inline-flex items-center justify-center text-[11px]"
                    >
                      <i className={`ti ${app.icon}`}></i>
                    </span>
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live vs Sandbox Environment Toggle */}
          <div className="inline-flex rounded-full p-0.5 border border-white/15 bg-[#0B0B0B]">
            <button
              type="button"
              onClick={() => {
                setEnv('live');
                showToast('Switched to Live environment');
              }}
              className={`rounded-full h-7 px-3 text-[12px] font-medium inline-flex items-center gap-1.5 border-0 cursor-pointer transition-all ${
                env === 'live' ? 'bg-[#F5F3EC] text-[#000000]' : 'bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7F26B]"></span>
              <span>Live</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEnv('test');
                showToast('Switched to Sandbox environment');
              }}
              className={`rounded-full h-7 px-3 text-[12px] font-medium inline-flex items-center gap-1.5 border-0 cursor-pointer transition-all ${
                env === 'test' ? 'bg-[#F5F3EC] text-[#000000]' : 'bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAC775]"></span>
              <span>Sandbox</span>
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Open Documentation Button */}
          <button
            type="button"
            onClick={onNavigateDocs}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12px] font-medium cursor-pointer transition-colors"
          >
            <i className="ti ti-book text-[14px]"></i>
            <span>Docs</span>
          </button>
        </div>

        {/* 2-Column Shell */}
        <div className="grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)] min-h-[580px]">
          {/* Left Sidebar */}
          <div className="p-3 md:p-4 border-b md:border-b-0 md:border-r border-[#1F1F1F] bg-[#000000]/60 text-left">
            <div className="text-[15px] font-medium text-[#F5F3EC] px-2.5 pb-2">Settings</div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] px-2.5 mt-3 mb-1.5">
              Configuration
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setPage('overview')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'overview'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setPage('general')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'general'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>General</span>
              </button>

              <button
                type="button"
                onClick={() => setPage('keys')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'keys'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>API keys</span>
              </button>

              <button
                type="button"
                onClick={() => setPage('hooks')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'hooks'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>Webhooks</span>
              </button>
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] px-2.5 mt-5 mb-1.5">
              Integrations
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setPage('rc')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'rc'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>RevenueCat</span>
                <i className="ti ti-arrow-up-right text-[12px] text-[#6F6E69]"></i>
              </button>

              <button
                type="button"
                onClick={() => setPage('whop')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'whop'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>Whop payments</span>
                <i className="ti ti-arrow-up-right text-[12px] text-[#6F6E69]"></i>
              </button>
            </div>

            <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] px-2.5 mt-5 mb-1.5">
              Billing
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateBilling) onNavigateBilling();
                  else setPage('fund');
                }}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'fund'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>Funding & receipts</span>
                <i className="ti ti-arrow-up-right text-[12px] text-[#6F6E69]"></i>
              </button>

              <button
                type="button"
                onClick={() => setPage('usage')}
                className={`w-full text-left px-2.5 py-1.5 text-[13px] rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  page === 'usage'
                    ? 'border-white/30 bg-[#161616] text-[#F5F3EC] font-medium shadow-sm'
                    : 'border-transparent bg-transparent text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#141414]'
                }`}
              >
                <span>Usage</span>
                <i className="ti ti-arrow-up-right text-[12px] text-[#6F6E69]"></i>
              </button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="p-5 sm:p-7 min-w-0 bg-[#000000]">
            {page === 'overview' ? (
              /* Overview Screen */
              <div className="space-y-7 animate-[fadeIn_0.12s_ease-out]">
                {/* App Title & Key Copy Row */}
                <div>
                  <h1 className="text-[30px] font-medium tracking-tight text-[#F5F3EC]">{activeApp.name}</h1>
                  <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    <span className="font-mono text-[13px] text-[#F5F3EC] bg-[#161616] px-3 py-1 rounded-full border border-white/10 select-all">
                      {livePublishableKey ? livePublishableKey.val : 'No key in this environment'}
                    </span>
                    <button
                      type="button"
                      onClick={() => livePublishableKey && copyText(livePublishableKey.val, 'Publishable key copied')}
                      className="h-7 px-3 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
                    >
                      {copiedKeyId === livePublishableKey?.val ? (
                        <>
                          <i className="ti ti-check text-[#C7F26B]"></i>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <i className="ti ti-copy"></i>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 6 Status Tiles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statusTiles.map((t, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] flex items-center gap-3.5 hover:border-white/20 transition-colors"
                    >
                      <span
                        style={{ backgroundColor: t.bg, color: t.fg }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px] shrink-0"
                      >
                        <i className={`ti ${t.icon}`}></i>
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69]">{t.label}</div>
                        <div className="text-[15px] font-medium text-[#F5F3EC] mt-0.5">{t.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Get Connected Checklist */}
                <div className="pt-2">
                  <h2 className="text-[20px] font-medium tracking-tight text-[#F5F3EC]">Get connected</h2>
                  <p className="text-[13px] text-[#9A9892] mt-0.5">Four steps from a new app to live installs.</p>

                  <div className="mt-3.5 space-y-2.5">
                    {[
                      { title: 'Install the SDK', done: true },
                      { title: 'Initialize with your publishable key', done: true },
                      { title: 'Send a test event', done: true },
                      { title: 'Add the iOS source sheet', done: false, link: '/docs/sdk/source-confirmation' },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 px-4.5 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] flex items-center gap-3.5 hover:border-white/20 transition-colors"
                      >
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-semibold shrink-0 ${
                            step.done ? 'bg-[#C7F26B] text-[#000000]' : 'border border-[#2E2E2E] text-[#9A9892]'
                          }`}
                        >
                          {step.done ? <i className="ti ti-check font-bold"></i> : idx + 1}
                        </span>

                        <span className="flex-1 text-[13.5px] text-[#F5F3EC]">{step.title}</span>

                        {!step.done && (
                          <button
                            type="button"
                            onClick={onNavigateDocs}
                            className="h-7 px-3 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12px] cursor-pointer transition-colors inline-flex items-center gap-1"
                          >
                            <span>Open docs</span>
                            <i className="ti ti-arrow-right text-[11px]"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : page === 'keys' ? (
              /* API Keys Screen */
              <div className="space-y-6 animate-[fadeIn_0.12s_ease-out]">
                {/* Header & Tabs */}
                <div>
                  <h1 className="text-[26px] font-medium tracking-tight text-[#F5F3EC]">API keys</h1>
                  <p className="text-[13px] text-[#9A9892] mt-1">Configure keys to control access to your app's data.</p>

                  <div className="flex gap-6 border-b border-[#1F1F1F] mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('keys');
                        setCreationForm(null);
                        setRevealData(null);
                      }}
                      className={`pb-2.5 text-[13.5px] font-medium border-b-2 transition-all cursor-pointer bg-transparent border-t-0 border-x-0 ${
                        tab === 'keys'
                          ? 'border-[#F5F3EC] text-[#F5F3EC]'
                          : 'border-transparent text-[#9A9892] hover:text-[#F5F3EC]'
                      }`}
                    >
                      Publishable and secret keys
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('tok');
                        setCreationForm(null);
                        setRevealData(null);
                      }}
                      className={`pb-2.5 text-[13.5px] font-medium border-b-2 transition-all cursor-pointer bg-transparent border-t-0 border-x-0 ${
                        tab === 'tok'
                          ? 'border-[#F5F3EC] text-[#F5F3EC]'
                          : 'border-transparent text-[#9A9892] hover:text-[#F5F3EC]'
                      }`}
                    >
                      Access tokens
                    </button>
                  </div>
                </div>

                {tab === 'keys' ? (
                  /* Publishable & Secret Keys Tab */
                  <div className="space-y-7">
                    {/* Environment Explanation Banner */}
                    {showBanner1 && (
                      <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#262626] flex items-start gap-3 relative">
                        <div className="flex-1 text-left">
                          <div className="text-[14px] font-medium text-[#F5F3EC]">Keys belong to one app and one environment</div>
                          <div className="text-[12.5px] text-[#9A9892] mt-0.5 leading-relaxed">
                            Sandbox keys never create payable installs. Live keys count real installs and affect settlement.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowBanner1(false)}
                          className="w-6 h-6 rounded-full border border-white/10 hover:border-white/30 text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center bg-transparent cursor-pointer"
                        >
                          <i className="ti ti-x text-[12px]"></i>
                        </button>
                      </div>
                    )}

                    {/* Publishable Keys Section */}
                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <h2 className="text-[20px] font-medium text-[#F5F3EC]">Publishable key</h2>
                          <p className="text-[12.5px] text-[#9A9892] mt-0.5 max-w-sm">
                            Ships inside your app. It can only send install and event data.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCreationForm('pk');
                            setFormName('');
                            setFormError('');
                          }}
                          className="h-8 px-3.5 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5"
                        >
                          <i className="ti ti-plus text-[12px]"></i>
                          <span>New publishable key</span>
                        </button>
                      </div>

                      {/* Creation form */}
                      {creationForm === 'pk' && (
                        <div className="mt-3.5 p-4 rounded-2xl bg-[#0B0B0B] border border-white/20 space-y-3 animate-[fadeIn_0.1s_ease-out]">
                          <div className="text-[14px] font-medium text-[#F5F3EC]">New publishable key</div>
                          <div>
                            <label className="text-[11px] font-mono uppercase text-[#6F6E69] block mb-1">Name</label>
                            <input
                              type="text"
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              placeholder="e.g. ios app production"
                              className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] focus:border-white text-[13.5px] text-[#F5F3EC] outline-none"
                              autoFocus
                            />
                            {formError && <div className="text-[12px] text-[#FF8A80] mt-1">{formError}</div>}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCreateKeyOrToken('pk')}
                              className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] font-medium text-[12.5px] cursor-pointer hover:bg-white"
                            >
                              Create key
                            </button>
                            <button
                              type="button"
                              onClick={() => setCreationForm(null)}
                              className="h-8 px-3.5 rounded-full border border-white/20 text-[#B9B7AF] hover:text-[#F5F3EC] text-[12.5px] bg-transparent cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Publishable Keys Table */}
                      <div className="mt-3 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] overflow-hidden">
                        <div className="grid grid-cols-[1fr_1.5fr_36px] items-center px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] border-b border-[#1F1F1F]">
                          <span>Name</span>
                          <span>API key</span>
                          <span></span>
                        </div>

                        {publishableKeys.length > 0 ? (
                          publishableKeys.map((k) => (
                            <div
                              key={k.id}
                              className="grid grid-cols-[1fr_1.5fr_36px] items-center px-4 py-3 border-t border-[#1F1F1F] first:border-t-0 relative"
                            >
                              <div>
                                <div className="text-[13.5px] font-medium text-[#F5F3EC]">{k.name}</div>
                                <div className="text-[11.5px] text-[#9A9892]">{k.desc}</div>
                              </div>

                              <div>
                                <span className="font-mono text-[12px] bg-[#161616] border border-white/10 px-2.5 py-1 rounded-full text-[#F5F3EC] inline-flex items-center gap-1.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                  <span>{k.val}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyText(k.val, 'Copied publishable key')}
                                    className="w-5 h-5 rounded-full border-0 bg-transparent text-[#9A9892] hover:text-[#F5F3EC] cursor-pointer inline-flex items-center justify-center"
                                  >
                                    <i className="ti ti-copy text-[11px]"></i>
                                  </button>
                                </span>
                              </div>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(activeMenuId === k.id ? null : k.id)}
                                  className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 text-[#9A9892] hover:text-[#F5F3EC] bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                  <i className="ti ti-dots-vertical text-[13px]"></i>
                                </button>

                                {activeMenuId === k.id && (
                                  <div className="absolute right-0 top-8 z-30 w-52 bg-[#000000] border border-[#2E2E2E] rounded-xl shadow-2xl p-2 animate-[fadeIn_0.1s_ease-out]">
                                    {confirmRevokeId === k.id ? (
                                      <div className="space-y-2 p-1">
                                        <div className="text-[11.5px] text-[#9A9892] leading-tight">
                                          Apps using this key stop within a minute.
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleRevoke(k.id)}
                                            className="h-7 px-3 rounded-full bg-[#FF8A80] text-[#000000] font-medium text-[11.5px] border-0 cursor-pointer"
                                          >
                                            Revoke
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmRevokeId(null)}
                                            className="h-7 px-2.5 rounded-full border border-white/20 text-[#B9B7AF] text-[11.5px] bg-transparent cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmRevokeId(k.id)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#FF8A80] hover:bg-[#FF8A80]/15 border-0 bg-transparent cursor-pointer flex items-center gap-2"
                                      >
                                        <i className="ti ti-trash"></i>
                                        <span>Revoke key</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-[13px] text-[#9A9892]">No publishable key in this environment.</div>
                        )}

                        <div className="p-3 px-4 border-t border-[#1F1F1F] text-[11.5px] text-[#6F6E69]">
                          Publishable keys can be shared publicly.
                        </div>
                      </div>
                    </div>

                    {/* Secret Keys Section */}
                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <h2 className="text-[20px] font-medium text-[#F5F3EC]">Secret keys</h2>
                          <p className="text-[12.5px] text-[#9A9892] mt-0.5 max-w-sm">
                            For your servers only. They send events from your backend.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCreationForm('sk');
                            setFormName('');
                            setFormError('');
                          }}
                          className="h-8 px-3.5 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1.5"
                        >
                          <i className="ti ti-plus text-[12px]"></i>
                          <span>New secret key</span>
                        </button>
                      </div>

                      {/* Secret key form */}
                      {creationForm === 'sk' && (
                        <div className="mt-3.5 p-4 rounded-2xl bg-[#0B0B0B] border border-white/20 space-y-3 animate-[fadeIn_0.1s_ease-out]">
                          <div className="text-[14px] font-medium text-[#F5F3EC]">New secret key</div>
                          <div>
                            <label className="text-[11px] font-mono uppercase text-[#6F6E69] block mb-1">Name</label>
                            <input
                              type="text"
                              value={formName}
                              onChange={(e) => setFormName(e.target.value)}
                              placeholder="e.g. backend server"
                              className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] focus:border-white text-[13.5px] text-[#F5F3EC] outline-none"
                              autoFocus
                            />
                            {formError && <div className="text-[12px] text-[#FF8A80] mt-1">{formError}</div>}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCreateKeyOrToken('sk')}
                              className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] font-medium text-[12.5px] cursor-pointer hover:bg-white"
                            >
                              Create key
                            </button>
                            <button
                              type="button"
                              onClick={() => setCreationForm(null)}
                              className="h-8 px-3.5 rounded-full border border-white/20 text-[#B9B7AF] hover:text-[#F5F3EC] text-[12.5px] bg-transparent cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reveal Card for Secret Key */}
                      {revealData && revealData.kind === 'sk' && (
                        <div className="mt-3.5 p-4.5 rounded-2xl bg-[#0B0B0B] border border-[#F5F3EC] shadow-xl space-y-3 animate-[fadeIn_0.15s_ease-out]">
                          <div className="text-[15px] font-medium text-[#F5F3EC]">Copy it now</div>
                          <div className="text-[12.5px] text-[#9A9892]">
                            This is the only time you will see this secret key. We cannot show it again.
                          </div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-[13px] bg-[#161616] border border-white/20 px-3 py-1.5 rounded-full text-[#C7F26B] select-all">
                              {revealData.val}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(revealData.val, 'Secret key copied')}
                              className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] font-medium text-[12px] cursor-pointer hover:bg-white inline-flex items-center gap-1.5"
                            >
                              <i className="ti ti-copy"></i>
                              <span>Copy</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRevealData(null)}
                            className="text-[12px] text-[#B9B7AF] hover:text-white bg-transparent border-0 cursor-pointer pt-1"
                          >
                            I have saved it
                          </button>
                        </div>
                      )}

                      {/* Secret Keys Table */}
                      <div className="mt-3 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] overflow-hidden">
                        <div className="grid grid-cols-[1fr_1.5fr_36px] items-center px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] border-b border-[#1F1F1F]">
                          <span>Name</span>
                          <span>API key</span>
                          <span></span>
                        </div>

                        {secretKeys.length > 0 ? (
                          secretKeys.map((k) => (
                            <div
                              key={k.id}
                              className="grid grid-cols-[1fr_1.5fr_36px] items-center px-4 py-3 border-t border-[#1F1F1F] first:border-t-0 relative"
                            >
                              <div>
                                <div className="text-[13.5px] font-medium text-[#F5F3EC]">{k.name}</div>
                                <div className="text-[11.5px] text-[#9A9892]">{k.desc}</div>
                              </div>

                              <div>
                                <span className="font-mono text-[12px] bg-[#161616] border border-white/10 px-2.5 py-1 rounded-full text-[#9A9892]">
                                  {k.val}
                                </span>
                              </div>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(activeMenuId === k.id ? null : k.id)}
                                  className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 text-[#9A9892] hover:text-[#F5F3EC] bg-transparent cursor-pointer flex items-center justify-center"
                                >
                                  <i className="ti ti-dots-vertical text-[13px]"></i>
                                </button>

                                {activeMenuId === k.id && (
                                  <div className="absolute right-0 top-8 z-30 w-52 bg-[#000000] border border-[#2E2E2E] rounded-xl shadow-2xl p-2 animate-[fadeIn_0.1s_ease-out]">
                                    {confirmRevokeId === k.id ? (
                                      <div className="space-y-2 p-1">
                                        <div className="text-[11.5px] text-[#9A9892] leading-tight">
                                          Apps using this key stop within a minute.
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleRevoke(k.id)}
                                            className="h-7 px-3 rounded-full bg-[#FF8A80] text-[#000000] font-medium text-[11.5px] border-0 cursor-pointer"
                                          >
                                            Revoke
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmRevokeId(null)}
                                            className="h-7 px-2.5 rounded-full border border-white/20 text-[#B9B7AF] text-[11.5px] bg-transparent cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmRevokeId(k.id)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#FF8A80] hover:bg-[#FF8A80]/15 border-0 bg-transparent cursor-pointer flex items-center gap-2"
                                      >
                                        <i className="ti ti-trash"></i>
                                        <span>Revoke key</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-[13px] text-[#9A9892]">No secret keys yet.</div>
                        )}

                        <div className="p-3 px-4 border-t border-[#1F1F1F] text-[11.5px] text-[#6F6E69]">
                          A secret key is shown once when you create it. We cannot show it again.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Access Tokens Tab */
                  <div className="space-y-6">
                    {showBanner2 && (
                      <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#262626] flex items-start gap-3">
                        <i className="ti ti-info-circle text-[20px] text-[#388BFD] shrink-0 mt-0.5"></i>
                        <div className="flex-1">
                          <div className="text-[14px] font-medium text-[#F5F3EC]">Access tokens are scoped</div>
                          <div className="text-[12.5px] text-[#9A9892] mt-0.5">
                            Grant only what each integration needs. Every token expires, and you see it once when it is created.
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowBanner2(false)}
                            className="mt-2 text-[12px] text-[#B9B7AF] hover:text-[#F5F3EC] bg-transparent border-0 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filter and Actions Bar */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex-1 min-w-[200px] h-9 px-3 rounded-full bg-[#0B0B0B] border border-[#1F1F1F] flex items-center gap-2">
                        <i className="ti ti-search text-[#9A9892] text-[13px]"></i>
                        <input
                          type="text"
                          value={tokenFilter}
                          onChange={(e) => setTokenFilter(e.target.value)}
                          placeholder="Filter tokens"
                          className="bg-transparent border-0 outline-none text-[#F5F3EC] text-[13px] w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateDocs}
                        className="h-9 px-4 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-[#F5F3EC] text-[12.5px] font-medium cursor-pointer transition-colors"
                      >
                        API docs
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreationForm('tk');
                          setFormName('');
                          setFormError('');
                        }}
                        className="h-9 px-4 rounded-full bg-[#F5F3EC] hover:bg-white text-[#000000] text-[12.5px] font-medium cursor-pointer transition-all"
                      >
                        Generate new token
                      </button>
                    </div>

                    {/* Token Creation Form */}
                    {creationForm === 'tk' && (
                      <div className="p-4.5 rounded-2xl bg-[#0B0B0B] border border-white/20 space-y-4 animate-[fadeIn_0.1s_ease-out]">
                        <div className="text-[15px] font-medium text-[#F5F3EC]">Generate a token</div>

                        <div>
                          <label className="text-[11px] font-mono uppercase text-[#6F6E69] block mb-1">Name</label>
                          <input
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. analytics export"
                            className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] focus:border-white text-[13.5px] text-[#F5F3EC] outline-none"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono uppercase text-[#6F6E69] block mb-1.5">Scopes</label>
                          <div className="flex gap-2 flex-wrap">
                            {SCOPES_OPTIONS.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setFormScopes((prev) => ({ ...prev, [s]: !prev[s] }))}
                                className={`h-7 px-3 rounded-full text-[12px] font-mono border cursor-pointer transition-colors ${
                                  formScopes[s]
                                    ? 'bg-[#F5F3EC] text-[#000000] border-transparent font-medium'
                                    : 'bg-[#1C1C1C] text-[#B9B7AF] border-white/10 hover:border-white/30'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono uppercase text-[#6F6E69] block mb-1.5">Expires in</label>
                          <div className="flex gap-2">
                            {['30 days', '90 days', '1 year'].map((exp) => (
                              <button
                                key={exp}
                                type="button"
                                onClick={() => setFormExp(exp)}
                                className={`h-7 px-3 rounded-full text-[12px] border cursor-pointer transition-colors ${
                                  formExp === exp
                                    ? 'bg-[#F5F3EC] text-[#000000] border-transparent font-medium'
                                    : 'bg-[#1C1C1C] text-[#B9B7AF] border-white/10 hover:border-white/30'
                                }`}
                              >
                                {exp}
                              </button>
                            ))}
                          </div>
                        </div>

                        {formError && <div className="text-[12px] text-[#FF8A80]">{formError}</div>}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCreateKeyOrToken('tk')}
                            className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] font-medium text-[12.5px] cursor-pointer hover:bg-white"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreationForm(null)}
                            className="h-8 px-3.5 rounded-full border border-white/20 text-[#B9B7AF] hover:text-[#F5F3EC] text-[12.5px] bg-transparent cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Token Reveal Card */}
                    {revealData && revealData.kind === 'tk' && (
                      <div className="p-4.5 rounded-2xl bg-[#0B0B0B] border border-[#F5F3EC] shadow-xl space-y-3 animate-[fadeIn_0.15s_ease-out]">
                        <div className="text-[15px] font-medium text-[#F5F3EC]">Copy it now</div>
                        <div className="text-[12.5px] text-[#9A9892]">
                          This is the only time you will see this token. We cannot show it again.
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-[13px] bg-[#161616] border border-white/20 px-3 py-1.5 rounded-full text-[#C7F26B] select-all">
                            {revealData.val}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(revealData.val, 'Token copied')}
                            className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] font-medium text-[12px] cursor-pointer hover:bg-white inline-flex items-center gap-1.5"
                          >
                            <i className="ti ti-copy"></i>
                            <span>Copy</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRevealData(null)}
                          className="text-[12px] text-[#B9B7AF] hover:text-white bg-transparent border-0 cursor-pointer pt-1"
                        >
                          I have saved it
                        </button>
                      </div>
                    )}

                    {/* Tokens Table */}
                    <div className="rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] overflow-hidden">
                      <div className="grid grid-cols-[1.6fr_0.9fr_0.9fr_34px] items-center px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] border-b border-[#1F1F1F]">
                        <span>Token</span>
                        <span>Last used</span>
                        <span>Expires</span>
                        <span></span>
                      </div>

                      {filteredTokens.length > 0 ? (
                        filteredTokens.map((t) => (
                          <div
                            key={t.id}
                            className="grid grid-cols-[1.6fr_0.9fr_0.9fr_34px] items-center px-4 py-3 border-t border-[#1F1F1F] first:border-t-0 relative"
                          >
                            <div>
                              <div className="text-[13.5px] font-medium text-[#F5F3EC]">{t.name}</div>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {t.scopes.map((s) => (
                                  <span
                                    key={s}
                                    className="font-mono text-[10.5px] px-2 py-0.5 rounded-full border border-[#2E2E2E] text-[#B9B7AF]"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                              <div className="font-mono text-[11px] text-[#6F6E69] mt-1.5">{t.val}</div>
                            </div>

                            <div className="text-[12.5px] text-[#F5F3EC]">{t.last}</div>

                            <div
                              className={`text-[12.5px] ${
                                t.exp === 'Expired' ? 'text-[#FF8A80] font-medium' : 'text-[#F5F3EC]'
                              }`}
                            >
                              {t.exp}
                            </div>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setActiveMenuId(activeMenuId === `t${t.id}` ? null : `t${t.id}`)}
                                className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 text-[#9A9892] hover:text-[#F5F3EC] bg-transparent cursor-pointer flex items-center justify-center"
                              >
                                <i className="ti ti-dots-vertical text-[13px]"></i>
                              </button>

                              {activeMenuId === `t${t.id}` && (
                                <div className="absolute right-0 top-8 z-30 w-52 bg-[#000000] border border-[#2E2E2E] rounded-xl shadow-2xl p-2 animate-[fadeIn_0.1s_ease-out]">
                                  {confirmRevokeId === `t${t.id}` ? (
                                    <div className="space-y-2 p-1">
                                      <div className="text-[11.5px] text-[#9A9892] leading-tight">
                                        The token stops working right away.
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleRevoke(`t${t.id}`)}
                                          className="h-7 px-3 rounded-full bg-[#FF8A80] text-[#000000] font-medium text-[11.5px] border-0 cursor-pointer"
                                        >
                                          Revoke
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmRevokeId(null)}
                                          className="h-7 px-2.5 rounded-full border border-white/20 text-[#B9B7AF] text-[11.5px] bg-transparent cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmRevokeId(`t${t.id}`)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12.5px] text-[#FF8A80] hover:bg-[#FF8A80]/15 border-0 bg-transparent cursor-pointer flex items-center gap-2"
                                    >
                                      <i className="ti ti-trash"></i>
                                      <span>Revoke token</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-[13px] text-[#9A9892]">No tokens match filter.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : page === 'general' ? (
              /* General Configuration Screen */
              <div className="space-y-6 animate-[fadeIn_0.12s_ease-out]">
                <div>
                  <h1 className="text-[26px] font-medium tracking-tight text-[#F5F3EC]">App General Settings</h1>
                  <p className="text-[13px] text-[#9A9892] mt-1">Identifiers and platform configuration for {activeApp.name}.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-1">Apple Bundle Identifier</div>
                      <input
                        type="text"
                        readOnly
                        value={activeApp.bundleId}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] text-[13px] text-[#F5F3EC] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-1">Apple App Store ID</div>
                      <input
                        type="text"
                        readOnly
                        value="id1598234120"
                        className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] text-[13px] text-[#F5F3EC] font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-1">Apple Team ID</div>
                      <input
                        type="text"
                        readOnly
                        value="9Y82KA923B"
                        className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] text-[13px] text-[#F5F3EC] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-1">Android Package Name</div>
                      <input
                        type="text"
                        readOnly
                        value={activeApp.bundleId}
                        className="w-full h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] text-[13px] text-[#F5F3EC] font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#1F1F1F]">
                    <div className="text-[12px] text-[#9A9892]">Universal Links / AASA Verification: Verified</div>
                    <button
                      type="button"
                      onClick={() => showToast('App site association verified')}
                      className="h-8 px-3 rounded-full border border-white/20 text-[#F5F3EC] hover:border-white/40 text-[12px] bg-transparent cursor-pointer"
                    >
                      Re-verify AASA
                    </button>
                  </div>
                </div>
              </div>
            ) : page === 'hooks' ? (
              /* Webhooks Screen */
              <div className="space-y-6 animate-[fadeIn_0.12s_ease-out]">
                <div>
                  <h1 className="text-[26px] font-medium tracking-tight text-[#F5F3EC]">Webhooks</h1>
                  <p className="text-[13px] text-[#9A9892] mt-1">Receive cryptographically verified HTTP POST event streams on every install.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] space-y-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-1">Webhook Endpoint URL</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://api.umi.so/v1/attribution/events"
                        className="flex-1 h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] text-[13px] text-[#F5F3EC] font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyText('https://api.umi.so/v1/attribution/events')}
                        className="h-10 px-4 rounded-xl border border-white/20 text-[#F5F3EC] hover:bg-[#161616] text-[12.5px] cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#6F6E69] mb-1">Signing Secret (HMAC-SHA256)</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value="whsec_99af28c11e7492b49e18b"
                        className="flex-1 h-10 px-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E] text-[13px] text-[#F5F3EC] font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyText('whsec_99af28c11e7492b49e18b')}
                        className="h-10 px-4 rounded-xl border border-white/20 text-[#F5F3EC] hover:bg-[#161616] text-[12.5px] cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1F1F1F]">
                    <div className="text-[12px] text-[#9A9892]">Events dispatched: install.verified, dispute.raised, escrow.funded</div>
                    <button
                      type="button"
                      onClick={() => showToast('Simulated test webhook ping sent (200 OK)')}
                      className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] text-[12px] font-medium cursor-pointer"
                    >
                      Send test ping
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Integrations & Billing Placeholders */
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1F1F1F] space-y-4 animate-[fadeIn_0.12s_ease-out]">
                <div className="text-[20px] font-medium text-[#F5F3EC]">
                  {page === 'rc' ? 'RevenueCat Integration' : page === 'whop' ? 'Whop Payments Integration' : page === 'fund' ? 'Funding & Receipts' : 'Usage & Telemetry'}
                </div>
                <p className="text-[13px] text-[#9A9892]">
                  {page === 'rc'
                    ? 'Connect in-app purchases and subscription renewals to creator attribution automatically.'
                    : page === 'whop'
                    ? 'Automate instant payouts and settlement directly through Whop creator accounts.'
                    : 'Manage campaign escrow balance, past invoices, and verification telemetry.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (page === 'fund' && onNavigateBilling) onNavigateBilling();
                      else showToast(`${page.toUpperCase()} configuration updated`);
                    }}
                    className="h-8 px-4 rounded-full bg-[#F5F3EC] text-[#000000] font-medium text-[12.5px] cursor-pointer"
                  >
                    {page === 'fund' ? 'Open billing view' : 'Configure integration'}
                  </button>
                </div>
              </div>
            )}

            {/* Notification Toast Bar */}
            {toast && (
              <div className="min-h-[20px] mt-4 text-[12.5px] text-[#C7F26B] font-mono animate-[fadeIn_0.15s_ease-out]">
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

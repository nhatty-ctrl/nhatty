import React, { useState, useEffect, useRef } from 'react';
import { Campaign } from '../types/campaign';
import { CATS } from '../data/campaigns';
import { Breadcrumbs } from './Breadcrumbs';

interface CreateCampaignViewProps {
  onBack: () => void;
  onCreate: (campaign: Campaign) => void;
}

const PLATFORMS = {
  ios: {
    n: 'iOS',
    a: "pod 'Kred', '~> 1.0'",
    b: 'Kred.configure(appKey: "KEY")',
  },
  and: {
    n: 'Android',
    a: 'implementation("io.kred:sdk:1.0.0")',
    b: 'Kred.init(this, "KEY")',
  },
  rn: {
    n: 'React Native',
    a: 'npm install kred-react-native',
    b: 'Kred.configure({ appKey: "KEY" })',
  },
  uni: {
    n: 'Unity',
    a: 'Package Manager > Add by name > io.kred.sdk',
    b: 'Kred.Init("KEY");',
  },
};

const STEP_NAMES = ['Campaign', 'SDK', 'Payments', 'Review'];
const FEE = 0.1;

export const CreateCampaignView: React.FC<CreateCampaignViewProps> = ({
  onBack,
  onCreate,
}) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  // Step 0: Campaign form
  const [apple, setApple] = useState('');
  const [play, setPlay] = useState('');
  const [name, setName] = useState('');
  const [co, setCo] = useState('');
  const [tag, setTag] = useState('');
  const [cat, setCat] = useState('Games');
  const [catTouched, setCatTouched] = useState(false);
  const [pay, setPay] = useState(2.0);
  const [budget, setBudget] = useState(5000);
  const [days, setDays] = useState(30);
  const [ex, setEx] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  // Auto extraction flags
  const autoNameRef = useRef(false);
  const autoCoRef = useRef(false);
  const exTimerRef = useRef<any>(null);

  // Step 1: SDK
  const [plat, setPlat] = useState<'ios' | 'and' | 'rn' | 'uni'>('ios');
  const [sdk, setSdk] = useState<'idle' | 'testing' | 'ok' | 'later'>('idle');

  // Step 2: Payments
  const [method, setMethod] = useState<'card' | 'bank' | 'usdc'>('card');
  const [sched, setSched] = useState('Weekly');
  const [hold, setHold] = useState(14);
  const [refund, setRefund] = useState(true);

  // Helper functions
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  const isValidUrl = (u: string) => /^https:\/\/\S+\.\S+/.test(u);
  const toTitleCase = (s: string) =>
    s
      .replace(/[-_]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (m) => m.toUpperCase());

  const slugName = () => {
    const a = apple.match(/\/app\/([^/?]+)/);
    const p = play.match(/id=([^&]+)/);
    if (a) return toTitleCase(a[1]);
    if (p) return toTitleCase(p[1].split('.').pop() || 'app');
    return 'Your app';
  };

  const slugCo = () => {
    const p = play.match(/id=([^&]+)/);
    if (p) {
      const parts = p[1].split('.');
      if (parts.length > 2) return toTitleCase(parts[1]);
    }
    return '';
  };

  const slugCat = () => {
    const s = `${apple} ${play}`.toLowerCase();
    if (/game|puzzle|pop|play|quest/.test(s)) return 'Games';
    if (/fit|walk|step|health|stride|sleep|yoga/.test(s)) return 'Health';
    if (/focus|task|note|todo|work|plan/.test(s)) return 'Productivity';
    if (/pay|bank|money|coin|invest|budget/.test(s)) return 'Finance';
    if (/chat|social|friend|meet/.test(s)) return 'Social';
    if (/learn|study|lesson|course|language/.test(s)) return 'Education';
    return 'Lifestyle';
  };

  const appKey = () => {
    const clean = (name || 'app').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
    return `kred_live_${clean}7k2x`;
  };

  // Trigger link extraction
  const startExtraction = () => {
    setEx('loading');
    setTimeout(() => {
      if (!isValidUrl(apple) && !isValidUrl(play)) {
        setEx('idle');
        return;
      }
      const extractedName = slugName();
      const extractedCo = slugCo();
      if (!name || autoNameRef.current) {
        setName(extractedName);
        autoNameRef.current = true;
      }
      if (extractedCo && (!co || autoCoRef.current)) {
        setCo(extractedCo);
        autoCoRef.current = true;
      }
      if (!catTouched) {
        setCat(slugCat());
      }
      setEx('done');
    }, 900);
  };

  const handleLinkChange = (field: 'apple' | 'play', val: string) => {
    if (field === 'apple') setApple(val);
    else setPlay(val);

    clearTimeout(exTimerRef.current);
    if (isValidUrl(val)) {
      exTimerRef.current = setTimeout(startExtraction, 400);
    } else {
      setEx('idle');
    }
  };

  const copyCode = (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard?.writeText(text);
    const target = e.currentTarget;
    const oldText = target.innerText;
    target.innerText = 'Copied';
    setTimeout(() => {
      target.innerText = oldText;
    }, 1200);
  };

  const testSdkConnection = () => {
    setSdk('testing');
    setErr('');
    setTimeout(() => {
      setSdk('ok');
    }, 1600);
  };

  const totals = () => {
    const f = budget * FEE;
    return { f, t: budget + f };
  };

  // Step validation and transition
  const handleNext = () => {
    setErr('');
    if (step === 0) {
      if (!apple && !play) {
        setErr('Add an App Store or Google Play link.');
        return;
      }
      if ((apple && !isValidUrl(apple)) || (play && !isValidUrl(play))) {
        setErr('Links need to start with https://');
        return;
      }
      if (!name.trim()) {
        setErr('Enter your app name.');
        return;
      }
      if (!co.trim()) {
        setErr('Enter your company name.');
        return;
      }
    }
    if (step === 1 && sdk !== 'ok' && sdk !== 'later') {
      setErr('Connect the SDK or choose Do this later.');
      return;
    }
    if (step === 1 && sdk === 'testing') {
      setErr('Wait for the connection check to finish.');
      return;
    }

    if (step === 3) {
      // Publish campaign
      const catData = CATS[cat] || CATS.Games;
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app';
      const createdCampaign: Campaign = {
        id: `camp_${Date.now()}`,
        name: name.trim(),
        cat,
        by: co.trim(),
        host: co.trim(),
        tag: tag.trim(),
        desc: `${name} provides seamless mobile performance. Verified creators receive guaranteed attribution payouts per install.`,
        price: pay.toFixed(2),
        pay: `$${pay.toFixed(2)} per verified install`,
        days,
        creators: 1,
        rating: '5.0',
        installsVerified: '0',
        icon: catData.icon,
        bg: catData.bg,
        fg: catData.fg,
        slug: cleanSlug,
        joined: false,
        appleUrl: apple,
        playUrl: play,
        budget,
        sdkConnected: sdk === 'ok',
      };
      onCreate(createdCampaign);
      setDone(true);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErr('');
    if (step > 0) setStep((prev) => prev - 1);
    else onBack();
  };

  const resetForm = () => {
    setStep(0);
    setDone(false);
    setApple('');
    setPlay('');
    setName('');
    setCo('');
    setTag('');
    setCat('Games');
    setPay(2.0);
    setBudget(5000);
    setDays(30);
    setEx('idle');
    setSdk('idle');
    setMethod('card');
  };

  const currentCat = CATS[cat] || CATS.Games;
  const t = totals();

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: 'Create campaign', icon: 'ti-plus', active: true },
        ]}
      />

      {/* Header with Title and Step counter */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-medium tracking-[-0.4px] text-[#F5F3EC]">
          Create campaign
        </h1>
        <div className="text-[12px] text-[#9A9892]">
          {done ? 'Done' : `Step ${step + 1} of 4 · ${STEP_NAMES[step]}`}
        </div>
      </div>

      {/* 4-Segment Progress Bar */}
      <div className="flex gap-1.5 mb-3.5">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={`seg-${idx}`}
            className={`seg ${done || idx <= step ? 'on' : ''}`}
          />
        ))}
      </div>

      {/* Main Wizard Card */}
      <div className="card space-y-4">
        {done ? (
          /* Confirmation State */
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full inline-flex items-center justify-center text-[30px]"
              style={{
                backgroundColor: sdk === 'ok' ? '#C7F26B' : '#FFC857',
                color: '#16140F',
              }}
            >
              <i className={`ti ${sdk === 'ok' ? 'ti-check' : 'ti-clock'}`} aria-hidden="true"></i>
            </div>
            <div className="text-[22px] font-medium text-[#F5F3EC] mt-4">
              {name} {sdk === 'ok' ? 'is live' : 'is saved as a draft'}
            </div>
            <div className="sub mt-1.5">
              {sdk === 'ok'
                ? 'Creators can find it under Campaigns now.'
                : 'It goes live as soon as the SDK sends its first event.'}
            </div>
          </div>
        ) : step === 0 ? (
          /* Step 0: Set up campaign */
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">Set up your campaign</div>
            <div className="sub mt-1">Start with a store link. We pull the rest from it.</div>

            {/* Apple App Store */}
            <label className="fl" htmlFor="apple-link">
              App Store link
            </label>
            <div className="relative">
              <i
                className="ti ti-brand-apple absolute left-3.5 top-3.5 text-[18px] text-[#9A9892]"
                aria-hidden="true"
              ></i>
              <input
                id="apple-link"
                className="in pl-11"
                placeholder="https://apps.apple.com/app/pixel-pop/id123"
                value={apple}
                onChange={(e) => handleLinkChange('apple', e.target.value)}
              />
            </div>

            {/* Google Play */}
            <label className="fl" htmlFor="play-link">
              Google Play link
            </label>
            <div className="relative">
              <i
                className="ti ti-player-play absolute left-3.5 top-3.5 text-[18px] text-[#9A9892]"
                aria-hidden="true"
              ></i>
              <input
                id="play-link"
                className="in pl-11"
                placeholder="https://play.google.com/store/apps/details?id=com.nova.pixelpop"
                value={play}
                onChange={(e) => handleLinkChange('play', e.target.value)}
              />
            </div>

            {/* Extraction Banner */}
            <div className="mt-3">
              {ex === 'loading' ? (
                <div className="ex">
                  <i className="ti ti-loader-2 spin text-[20px]" aria-hidden="true"></i>
                  <span>Reading your link…</span>
                </div>
              ) : ex === 'done' ? (
                <div className="ex text-[#F5F3EC]">
                  <div
                    className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[24px] shrink-0"
                    style={{ backgroundColor: currentCat.bg, color: currentCat.fg }}
                  >
                    <i className={`ti ${currentCat.icon}`} aria-hidden="true"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium">{name || 'Your app'}</div>
                    <div className="text-[12px] text-[#9A9892] mt-0.5">
                      {co ? `By ${co}` : 'Company not found, add it below'} · {cat}
                    </div>
                  </div>
                  <span className="text-[12px] text-[#C7F26B] flex items-center gap-1 whitespace-nowrap">
                    <i className="ti ti-check" aria-hidden="true"></i>
                    <span>Pulled from link</span>
                  </span>
                </div>
              ) : ex === 'error' ? (
                <div className="ex border border-[#FF8A80]/30 text-[#F5F3EC]">
                  <i className="ti ti-info-circle text-[20px] text-[#FF8A80]" aria-hidden="true"></i>
                  <span className="text-[13px] text-[#B9B7AF]">
                    We could not read this store link. Enter your app name, company, and category manually below.
                  </span>
                </div>
              ) : (
                <div className="ex border border-dashed border-[#333] bg-transparent">
                  <i className="ti ti-wand text-[18px]" aria-hidden="true"></i>
                  <span>Paste a store link and we fill in the name, company, and category.</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="sec">Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="fl" htmlFor="app-name">
                  App name
                </label>
                <input
                  id="app-name"
                  className="in"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    autoNameRef.current = false;
                  }}
                  placeholder="Pixel Pop"
                />
              </div>
              <div>
                <label className="fl" htmlFor="company-name">
                  Company name
                </label>
                <input
                  id="company-name"
                  className="in"
                  placeholder="Nova Play Studio"
                  value={co}
                  onChange={(e) => {
                    setCo(e.target.value);
                    autoCoRef.current = false;
                  }}
                />
              </div>
            </div>

            {/* Tagline */}
            <label className="fl" htmlFor="tagline">
              Short tagline (optional)
            </label>
            <input
              id="tagline"
              className="in"
              maxLength={40}
              placeholder="Pop, match, repeat"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />

            {/* Category Chips */}
            <span className="fl">Category</span>
            <div className="flex gap-1.5 flex-wrap">
              {Object.keys(CATS).map((cKey) => (
                <button
                  key={cKey}
                  type="button"
                  onClick={() => {
                    setCat(cKey);
                    setCatTouched(true);
                  }}
                  className={`chip ${cat === cKey ? 'sel' : ''}`}
                >
                  {cKey}
                </button>
              ))}
            </div>

            {/* Payout Section */}
            <div className="sec">Payout</div>
            <div className="sub">Creators earn this on every verified install.</div>

            {/* Price slider */}
            <div className="flex justify-between items-baseline mt-3">
              <label className="fl m-0!" htmlFor="payout-slider">
                Per verified install
              </label>
              <span className="text-[20px] font-medium text-[#F5F3EC]">
                ${pay.toFixed(2)}
              </span>
            </div>
            <input
              id="payout-slider"
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={pay}
              onChange={(e) => setPay(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#F5F3EC' }}
            />

            {/* Total Budget slider */}
            <div className="flex justify-between items-baseline mt-2.5">
              <label className="fl m-0!" htmlFor="budget-slider">
                Total budget
              </label>
              <span className="text-[20px] font-medium text-[#F5F3EC]">
                ${fmt(budget)}
              </span>
            </div>
            <input
              id="budget-slider"
              type="range"
              min="500"
              max="20000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: '#F5F3EC' }}
            />

            {/* Runs for chips */}
            <span className="fl">Runs for</span>
            <div className="flex gap-1.5">
              {[14, 30, 45, 60].map((d) => (
                <button
                  key={`days-${d}`}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`chip ${days === d ? 'sel' : ''}`}
                >
                  {d} days
                </button>
              ))}
            </div>

            {/* Budget coverage estimate card */}
            <div className="bg-[#1C1C1C] rounded-[16px] p-3.5 px-4 mt-4 flex justify-between items-center border border-[#2A2A2A]/40">
              <span className="sub">Budget covers about</span>
              <span className="text-[20px] font-medium text-[#F5F3EC]">
                {fmt(budget / pay)} installs
              </span>
            </div>
          </div>
        ) : step === 1 ? (
          /* Step 1: Install SDK */
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">Install the SDK</div>
            <div className="sub mt-1">
              It verifies each install so creators get paid and you only pay for real ones.
            </div>

            <span className="fl">Your app is built with</span>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(PLATFORMS) as (keyof typeof PLATFORMS)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPlat(k)}
                  className={`chip ${plat === k ? 'sel' : ''}`}
                >
                  {PLATFORMS[k].n}
                </button>
              ))}
            </div>

            {/* Step 1: Add package */}
            <div className="sec mt-5">1. Add the package</div>
            <div className="code mt-2">
              <span>{PLATFORMS[plat].a}</span>
              <button
                type="button"
                onClick={(e) => copyCode(PLATFORMS[plat].a, e)}
                className="chip py-1 px-2.5 text-[12px] shrink-0"
              >
                Copy
              </button>
            </div>

            {/* Step 2: Initialize on launch */}
            <div className="sec">2. Start it when your app launches</div>
            <div className="code mt-2">
              <span>{PLATFORMS[plat].b.replace('KEY', appKey())}</span>
              <button
                type="button"
                onClick={(e) => copyCode(PLATFORMS[plat].b.replace('KEY', appKey()), e)}
                className="chip py-1 px-2.5 text-[12px] shrink-0"
              >
                Copy
              </button>
            </div>

            {/* Step 3: Check connection */}
            <div className="sec">3. Check the connection</div>
            <div className="sub">Open your app once on a test device, then check.</div>

            <div className="mt-2.5">
              {sdk === 'ok' ? (
                <div className="ex text-[#F5F3EC]">
                  <i
                    className="ti ti-circle-check text-[22px] text-[#C7F26B]"
                    aria-hidden="true"
                  ></i>
                  <div>
                    <div className="font-medium text-[14px]">Connected</div>
                    <div className="text-[12px] text-[#9A9892]">
                      First event received from {name || 'your app'}
                    </div>
                  </div>
                </div>
              ) : sdk === 'testing' ? (
                <div className="ex">
                  <i className="ti ti-loader-2 spin text-[20px]" aria-hidden="true"></i>
                  <span>Listening for your first event…</span>
                </div>
              ) : (
                <div className="ex">
                  <i className="ti ti-plug-off text-[20px]" aria-hidden="true"></i>
                  <span className="flex-1">
                    {sdk === 'later'
                      ? 'Skipped for now. The campaign stays a draft until it connects.'
                      : 'Not connected yet'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={testSdkConnection}
                className="pill on"
              >
                Test connection
              </button>
              {sdk !== 'ok' && (
                <button
                  type="button"
                  onClick={() => setSdk('later')}
                  className="pill"
                >
                  Do this later
                </button>
              )}
            </div>
          </div>
        ) : step === 2 ? (
          /* Step 2: Fund and settle */
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">Fund and settle</div>
            <div className="sub mt-1">
              Your budget is held until installs verify, then paid out to creators.
            </div>

            {/* Payment Method */}
            <div className="sec mt-4.5">Payment method</div>
            <div className="space-y-2 mt-2">
              {[
                { id: 'card', icon: 'ti-credit-card', label: 'Card ending 4242', sub: 'Charged today' },
                { id: 'bank', icon: 'ti-building-bank', label: 'Bank transfer', sub: 'Campaign starts when funds arrive' },
                { id: 'usdc', icon: 'ti-coin', label: 'USDC', sub: 'Pay from your wallet' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as any)}
                  className={`opt ${method === m.id ? 'sel' : ''}`}
                >
                  <i className={`ti ${m.icon} text-[20px]`} aria-hidden="true"></i>
                  <span className="flex-1">
                    <span className="block text-[14px] font-medium">{m.label}</span>
                    <span className="block text-[12px] text-[#9A9892]">{m.sub}</span>
                  </span>
                  {method === m.id && (
                    <i className="ti ti-check text-[#C7F26B] text-[18px]" aria-hidden="true"></i>
                  )}
                </button>
              ))}
            </div>

            {/* Creator Settlement */}
            <div className="sec">Creator settlement</div>

            <span className="fl">Pay creators</span>
            <div className="flex gap-1.5">
              {['Weekly', 'Every 2 weeks', 'Monthly'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSched(s)}
                  className={`chip ${sched === s ? 'sel' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="fl">Verification window before payout</span>
            <div className="flex gap-1.5">
              {[7, 14, 30].map((h) => (
                <button
                  key={`hold-${h}`}
                  type="button"
                  onClick={() => setHold(h)}
                  className={`chip ${hold === h ? 'sel' : ''}`}
                >
                  {h} days
                </button>
              ))}
            </div>

            {/* Refund unused budget switch toggle */}
            <div className="flex items-center gap-3 mt-4 bg-[#1C1C1C] rounded-[16px] p-3 px-3.5 border border-[#2A2A2A]/40">
              <span className="flex-1">
                <span className="block text-[14px] font-medium text-[#F5F3EC]">
                  Refund unused budget
                </span>
                <span className="block text-[12px] text-[#9A9892]">
                  Returned to you when the campaign ends
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={refund}
                onClick={() => setRefund(!refund)}
                className={`sw ${refund ? 'on' : ''}`}
              >
                <i></i>
              </button>
            </div>

            {/* Cost breakdown */}
            <div className="mt-4 pt-1">
              <div className="row2">
                <span>Campaign budget</span>
                <span>${fmt(budget)}</span>
              </div>
              <div className="row2">
                <span>Platform fee ({Math.round(FEE * 100)}%)</span>
                <span>${fmt(t.f)}</span>
              </div>
              <div className="row2 text-[15px] font-medium pt-2">
                <span className="text-[#F5F3EC]">Total</span>
                <span className="text-[#F5F3EC]">${fmt(t.t)}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Step 3: Review and publish */
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">Review and publish</div>
            <div className="sub mt-1 mb-3.5">This is how creators will see it.</div>

            {/* Preview Card as Creators See It */}
            <div className="bg-[#1C1C1C] rounded-[20px] p-4 flex justify-between gap-3 border border-[#2A2A2A]/40">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-[#9A9892]">
                  {cat} · {days} days left
                </div>
                <div className="text-[20px] font-medium text-[#F5F3EC] mt-0.5">
                  {name}
                </div>
                <div className="text-[12px] text-[#9A9892] mt-0.5 mb-2.5">
                  By {co} {tag ? `· ${tag}` : ''}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <span
                    className="chip"
                    style={{
                      backgroundColor: currentCat.bg,
                      color: currentCat.fg,
                      padding: '4px 10px',
                      fontSize: '12px',
                    }}
                  >
                    ${pay.toFixed(2)} per verified install
                  </span>
                  {apple && (
                    <span className="chip py-1 px-2.5 bg-[#242424] text-[#F5F3EC]">
                      <i className="ti ti-brand-apple" aria-hidden="true"></i>
                    </span>
                  )}
                  {play && (
                    <span className="chip py-1 px-2.5 bg-[#242424] text-[#F5F3EC]">
                      <i className="ti ti-player-play" aria-hidden="true"></i>
                    </span>
                  )}
                </div>
              </div>

              {/* Pastel Tile */}
              <div
                className="w-[84px] h-[84px] rounded-[20px] flex flex-col items-center justify-center gap-1 shrink-0"
                style={{ backgroundColor: currentCat.bg, color: currentCat.fg }}
              >
                <i className={`ti ${currentCat.icon} text-[24px]`} aria-hidden="true"></i>
                <span className="text-[11px] font-medium text-center px-1 truncate max-w-full">
                  {name}
                </span>
              </div>
            </div>

            {/* Review summary table */}
            <div className="mt-3.5">
              <div className="row2">
                <span>Installs funded</span>
                <span>about {fmt(budget / pay)}</span>
              </div>
              <div className="row2">
                <span>SDK</span>
                <span style={{ color: sdk === 'ok' ? '#C7F26B' : '#FFC857' }}>
                  {sdk === 'ok' ? 'Connected' : 'Pending'}
                </span>
              </div>
              <div className="row2">
                <span>Creator payouts</span>
                <span>
                  {sched}, after {hold} days
                </span>
              </div>
              <div className="row2">
                <span>Payment</span>
                <span>
                  {method === 'card'
                    ? 'Card ending 4242'
                    : method === 'bank'
                    ? 'Bank transfer'
                    : 'USDC'}
                </span>
              </div>
              <div className="row2">
                <span>Unused budget</span>
                <span>{refund ? 'Refunded' : 'Kept as credit'}</span>
              </div>
              <div className="row2 text-[15px] font-medium pt-2">
                <span className="text-[#F5F3EC]">Total</span>
                <span className="text-[#F5F3EC]">${fmt(t.t)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {err && <div className="text-[13px] text-[#FF8A80] min-h-[18px]">{err}</div>}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex justify-between items-center mt-3.5">
        {done ? (
          <>
            <span />
            <button type="button" onClick={resetForm} className="pill on">
              Create another
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="pill"
            >
              <i className="ti ti-arrow-left" aria-hidden="true"></i>
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="pill on"
            >
              <span>{step === 3 ? 'Publish campaign' : 'Continue'}</span>
              {step < 3 && <i className="ti ti-arrow-right" aria-hidden="true"></i>}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';

interface CreateCampaignViewProps {
  onBack: () => void;
  onCreate: (campaign: Campaign) => void;
  onNavigateDocs?: () => void;
}

const TH: Record<string, [string, string, string]> = {
  Games: ['#CECBF6', '#26215C', 'ti-device-gamepad-2'],
  Health: ['#F5C4B3', '#4A1B0C', 'ti-heart'],
  Productivity: ['#B5D4F4', '#042C53', 'ti-bolt'],
  Finance: ['#C0DD97', '#173404', 'ti-coin'],
  Social: ['#F4C0D1', '#4B1528', 'ti-messages'],
  Education: ['#FAC775', '#412402', 'ti-book'],
  Lifestyle: ['#9FE1CB', '#04342C', 'ti-leaf'],
};

const TODAY = new Date(2026, 9, 4);

function ymd(d: Date) {
  return (
    d.getFullYear() +
    '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + d.getDate()).slice(-2)
  );
}

function pd(s: string) {
  const a = s.split('-');
  return new Date(+a[0], +a[1] - 1, +a[2]);
}

function add(s: string, n: number) {
  const d = pd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

function diff(a: string, b: string) {
  return Math.round((pd(b).getTime() - pd(a).getTime()) / 864e5);
}

const TK = ymd(TODAY);

function fd(s: string) {
  const l = pd(s).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return s === TK ? 'Today · ' + l : l;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

function money(n: number) {
  return (
    '$' +
    n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function ok(u: string) {
  return /^https:\/\/\S+\.\S+/.test(u);
}

function tc(s: string) {
  return s
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export const CreateCampaignView: React.FC<CreateCampaignViewProps> = ({
  onBack,
  onCreate,
  onNavigateDocs,
}) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [apple, setApple] = useState('');
  const [play, setPlay] = useState('');
  const [ex, setEx] = useState<'idle' | 'loading' | 'done'>('idle');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [cat, setCat] = useState('Games');
  const [logo, setLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dates
  const [start, setStart] = useState(TK);
  const [end, setEnd] = useState(add(TK, 30));
  const [pick, setPick] = useState<'start' | 'end' | null>(null);
  const [calMonth, setCalMonth] = useState({ y: 2026, m: 9 });

  // Description
  const [desc, setDesc] = useState('');
  const [descOpen, setDescOpen] = useState(false);

  // Rewards
  const [reward, setReward] = useState<number>(0.5);
  const [budget, setBudget] = useState<number>(1000);
  const [approval, setApproval] = useState(false);
  const [sub, setSub] = useState(false);
  const [pct, setPct] = useState(10);
  const [months, setMonths] = useState(12);

  // Active inline editing
  const [editingField, setEditingField] = useState<'reward' | 'budget' | null>(null);
  const [editValue, setEditValue] = useState('');

  // Step 1: SDK
  const [plat, setPlat] = useState<'ios' | 'and'>('ios');
  const [sdkStatus, setSdkStatus] = useState<'idle' | 'testing' | 'ok' | 'later'>('idle');
  const [sdkKey] = useState<string>(() => {
    return 'pk_live_' + Math.random().toString(36).substring(2, 8) + '7k2x';
  });

  // Step 2: Funding & Done
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  // Guess app name and category from links
  const guessName = () => {
    const a = apple.match(/\/app\/([^\/?]+)/);
    const p = play.match(/id=([^&]+)/);
    if (a) return tc(a[1]);
    if (p) return tc(p[1].split('.').pop() || '');
    return '';
  };

  const guessCat = () => {
    const s = (apple + ' ' + play).toLowerCase();
    if (/game|puzzle|pop|quest/.test(s)) return 'Games';
    if (/fit|walk|step|health|stride/.test(s)) return 'Health';
    if (/focus|task|note|todo|work/.test(s)) return 'Productivity';
    if (/pay|bank|money|coin|cash/.test(s)) return 'Finance';
    if (/chat|social|friend/.test(s)) return 'Social';
    if (/learn|study|lingo|course/.test(s)) return 'Education';
    return 'Lifestyle';
  };

  // Link reading debounce
  useEffect(() => {
    if (ok(apple) || ok(play)) {
      setEx('loading');
      const timer = setTimeout(() => {
        const guessed = guessName();
        if (guessed && !nameTouched) {
          setName(guessed);
        }
        setCat(guessCat());
        setEx('done');
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setEx('idle');
    }
  }, [apple, play]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
        setLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    setErr('');
    if (step === 0) {
      if (!apple && !play) {
        setErr('Add an App Store or Google Play link.');
        return;
      }
      if ((apple && !ok(apple)) || (play && !ok(play))) {
        setErr('Links need to start with https://');
        return;
      }
      if (!name.trim()) {
        setErr('Enter a campaign name.');
        return;
      }
      if (budget < reward * 10) {
        setErr('Budget should cover at least 10 installs.');
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (sdkStatus === 'testing') {
        setErr('Wait for the connection check to finish.');
        return;
      }
      if (sdkStatus !== 'ok' && sdkStatus !== 'later') {
        setErr('Connect the SDK or choose Do this later.');
        return;
      }
      setStep(2);
    }
  };

  const handleCommitEdit = () => {
    const v = parseFloat(editValue);
    if (!isNaN(v) && v > 0) {
      if (editingField === 'reward') setReward(Math.max(0.1, v));
      else if (editingField === 'budget') setBudget(Math.max(50, v));
    }
    setEditingField(null);
  };

  const handlePublish = () => {
    const pal = TH[cat] || TH.Games;
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `app-${Date.now()}`;

    const newCampaign: Campaign = {
      id: slug,
      name: name.trim(),
      cat,
      by: 'Your Studio',
      host: 'Your Studio',
      tag: taglineSummary(cat),
      desc:
        desc.trim() ||
        `${name} performance acquisition campaign. Install, launch, and verify through RavenCore attribution.`,
      price: reward.toFixed(2),
      pay: `$${reward.toFixed(2)} per verified install`,
      days: diff(start, end),
      creators: 1,
      rating: '5.0',
      installsVerified: '0',
      icon: pal[2],
      bg: pal[0],
      fg: pal[1],
      slug,
      joined: false,
      appleUrl: apple,
      playUrl: play,
      platforms: ['ios', 'android'],
      posted: 'Just now',
      budget,
      sdkConnected: sdkStatus === 'ok',
      requiresApproval: approval,
      applicationStatus: 'none',
      isCreatedByMe: true,
      logoUrl: logoPreview || undefined,
      sdkKey,
      escrowBalance: budget,
      escrowSettled: 0,
    };

    setDone(true);
    onCreate(newCampaign);
  };

  function taglineSummary(c: string) {
    if (c === 'Games') return 'Casual mobile game for short breaks';
    if (c === 'Health') return 'Health & wellness tracking';
    if (c === 'Productivity') return 'Smart daily productivity';
    if (c === 'Finance') return 'Personal finance management';
    return 'Indie mobile app';
  }

  // Calendar click
  const pickDay = (s: string) => {
    if (s < TK) return;
    if (pick === 'start') {
      setStart(s);
      if (end <= s) setEnd(add(s, 30));
      setPick('end');
      const edDate = pd(add(s, 30));
      setCalMonth({ y: edDate.getFullYear(), m: edDate.getMonth() });
    } else {
      if (s <= start) {
        setStart(s);
        setEnd(add(s, 30));
      } else {
        setEnd(s);
        setPick(null);
      }
    }
  };

  const dur = diff(start, end);
  const currentPal = TH[cat] || TH.Games;
  const platformFee = budget * 0.1;
  const totalCharged = budget + platformFee;

  return (
    <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left select-none animate-[fade-in_0.2s_ease-out]">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: 'Create campaign', icon: 'ti-plus', active: true },
        ]}
      />

      {/* Main Container styled with .k and .edge */}
      <div className="k border border-[#1F1F1F] shadow-2xl p-5 sm:p-7">
        {/* Header with Title and Step Counter */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-[22px] font-medium tracking-[-0.4px] text-[#F5F3EC]">
            Create campaign
          </div>
          <div className="sub text-[13px] text-[#9A9892]">
            {done
              ? 'Done'
              : `Step ${step + 1} of 3 · ${['Details', 'SDK', 'Fund'][step]}`}
          </div>
        </div>

        {/* 3 Progress Segments */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`seg ${done || i <= step ? 'on' : ''}`}
            />
          ))}
        </div>

        {/* ================= STEP 0: DETAILS ================= */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] gap-8 items-start">
            {/* Left Column: Logo Card */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                className="aspect-square w-full rounded-[26px] flex flex-col items-center justify-center relative shadow-lg overflow-hidden transition-all group"
                style={{ backgroundColor: currentPal[0], color: currentPal[1] }}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <i
                      className={`ti ${name || logo ? currentPal[2] : 'ti-photo'} text-[64px]`}
                      aria-hidden="true"
                    ></i>
                    <div className="text-[20px] font-medium mt-2.5 text-center px-3.5 tracking-tight truncate max-w-full">
                      {name || 'Your logo'}
                    </div>
                  </>
                )}

                {/* Upload logo icon button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="edge ic absolute right-3 bottom-3 cursor-pointer shadow-md bg-black/60 hover:bg-black/80 text-white transition-all"
                  aria-label="Upload a square logo"
                >
                  {logo ? (
                    <i className="ti ti-check text-[#C7F26B]"></i>
                  ) : (
                    <i className="ti ti-photo-up"></i>
                  )}
                </button>
              </div>

              <div className="sub text-[12px] text-[#A8A69E] mt-2.5 leading-relaxed">
                {logo
                  ? 'Square logo added.'
                  : 'Square image, at least 512 px. Until you add one we use the store icon.'}
              </div>

              {/* Theme & Palette Selector (Image 3) */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="sub text-[12px] text-[#A8A69E] font-medium">Palette theme</span>
                  <button
                    type="button"
                    onClick={() => {
                      const categories = Object.keys(TH);
                      const currentIdx = categories.indexOf(cat);
                      const nextCat = categories[(currentIdx + 1) % categories.length];
                      setCat(nextCat);
                    }}
                    className="edge ic w-7 h-7 text-[12px] cursor-pointer hover:bg-[#1C1C1C] transition-colors"
                    title="Randomize theme"
                    aria-label="Randomize theme"
                  >
                    <i className="ti ti-arrows-shuffle"></i>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(TH).map(([cName, [bgCol, fgCol, iconName]]) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setCat(cName)}
                      className={`edge flex items-center gap-1.5 p-1.5 rounded-[12px] text-[11.5px] cursor-pointer text-left transition-all ${
                        cat === cName ? 'bg-[#1C1C1C] border-[#F5F3EC]/50 font-medium' : 'hover:bg-[#161616]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-[4px] flex items-center justify-center text-[10px] shrink-0 font-bold"
                        style={{ backgroundColor: bgCol, color: fgCol }}
                      >
                        <i className={`ti ${iconName}`}></i>
                      </span>
                      <span className="truncate text-[#F5F3EC]">{cName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Details Form */}
            <div className="min-w-0 space-y-4">
              {/* Campaign Name */}
              <input
                type="text"
                placeholder="Campaign name"
                maxLength={40}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameTouched(true);
                  if (err) setErr('');
                }}
                className="fi text-[34px] sm:text-[38px] font-medium tracking-tight text-[#F5F3EC] bg-transparent border-0 outline-none w-full placeholder:text-[#6F6E69] h-[64px]"
                aria-label="Campaign name"
              />

              {/* Category Chips Bar */}
              <div>
                <div className="lab text-[13px] text-[#B9B7AF] mb-2">Category</div>
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(TH).map(([cName, [bgCol, fgCol, iconName]]) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setCat(cName)}
                      className={`edge chip text-[12px] py-1 px-3 cursor-pointer flex items-center gap-1.5 ${
                        cat === cName ? 'sel font-medium' : ''
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-[2px]"
                        style={{ backgroundColor: bgCol }}
                      />
                      <span>{cName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Where is the app? */}
              <div className="lab text-[13px] text-[#B9B7AF] pt-1">
                Where is the app?
              </div>

              <div className="edge fld flex items-center gap-3 h-[54px] px-4 rounded-[16px]">
                <i className="ti ti-brand-apple text-[20px] text-[#A8A69E]" aria-hidden="true"></i>
                <input
                  type="text"
                  placeholder="App Store link"
                  value={apple}
                  onChange={(e) => setApple(e.target.value)}
                  className="fi text-[15px] bg-transparent border-0 text-[#F5F3EC] outline-none flex-1 placeholder:text-[#6F6E69]"
                  aria-label="App Store link"
                />
              </div>

              <div className="edge fld flex items-center gap-3 h-[54px] px-4 rounded-[16px]">
                <i className="ti ti-player-play text-[20px] text-[#A8A69E]" aria-hidden="true"></i>
                <input
                  type="text"
                  placeholder="Google Play link"
                  value={play}
                  onChange={(e) => setPlay(e.target.value)}
                  className="fi text-[15px] bg-transparent border-0 text-[#F5F3EC] outline-none flex-1 placeholder:text-[#6F6E69]"
                  aria-label="Google Play link"
                />
              </div>

              {/* Auto-read link message */}
              <div className="sub flex items-center gap-2 text-[12px] text-[#A8A69E] min-h-[20px]">
                {ex === 'loading' ? (
                  <>
                    <i className="ti ti-loader-2 spin text-[16px]" aria-hidden="true"></i>
                    <span>Reading your link…</span>
                  </>
                ) : ex === 'done' ? (
                  <>
                    <i className="ti ti-circle-check text-[16px] text-[#C7F26B]" aria-hidden="true"></i>
                    <span className="text-[#F5F3EC]">
                      Pulled from link: {name || 'your app'} · {cat}
                    </span>
                  </>
                ) : (
                  <span>Paste a link and we fill in the name, icon, and category.</span>
                )}
              </div>

              {/* When does it run? */}
              <div className="lab text-[13px] text-[#B9B7AF] pt-2">
                When does it run?
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPick(pick === 'start' ? null : 'start')}
                  className={`edge dt flex-1 rounded-[16px] p-3 text-left ${
                    pick === 'start' ? 'sel' : ''
                  }`}
                >
                  <span className="sub text-[11px] text-[#9A9892]">Starts</span>
                  <b className="text-[14.5px] font-medium text-[#F5F3EC] block mt-0.5">
                    {fd(start)}
                  </b>
                </button>

                <button
                  type="button"
                  onClick={() => setPick(pick === 'end' ? null : 'end')}
                  className={`edge dt flex-1 rounded-[16px] p-3 text-left ${
                    pick === 'end' ? 'sel' : ''
                  }`}
                >
                  <span className="sub text-[11px] text-[#9A9892]">Ends</span>
                  <b className="text-[14.5px] font-medium text-[#F5F3EC] block mt-0.5">
                    {fd(end)}
                  </b>
                </button>
              </div>

              {/* Duration Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {[14, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setEnd(add(start, d));
                      setPick(null);
                    }}
                    className={`edge chip text-[12px] py-1 px-3.5 cursor-pointer ${
                      dur === d ? 'sel' : ''
                    }`}
                  >
                    {d} days
                  </button>
                ))}
                <span className="sub text-[12px] text-[#9A9892] ml-1">
                  {[14, 30, 45, 60].includes(dur) ? '' : `${dur} days`}
                </span>
              </div>

              {/* Calendar Picker Dropdown */}
              {pick && (
                <div className="edge rounded-[18px] p-4 mt-3 bg-[#111113]">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      disabled={calMonth.y === 2026 && calMonth.m === 9}
                      onClick={() => {
                        let m = calMonth.m - 1;
                        let y = calMonth.y;
                        if (m < 0) {
                          m = 11;
                          y--;
                        }
                        setCalMonth({ y, m });
                      }}
                      className="edge ic disabled:opacity-35 disabled:cursor-default"
                      aria-label="Previous month"
                    >
                      <i className="ti ti-chevron-left text-[14px]"></i>
                    </button>

                    <div className="text-[14.5px] font-medium text-[#F5F3EC]">
                      {new Date(calMonth.y, calMonth.m, 1).toLocaleDateString(
                        'en-US',
                        { month: 'long', year: 'numeric' }
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        let m = calMonth.m + 1;
                        let y = calMonth.y;
                        if (m > 11) {
                          m = 0;
                          y++;
                        }
                        setCalMonth({ y, m });
                      }}
                      className="edge ic"
                      aria-label="Next month"
                    >
                      <i className="ti ti-chevron-right text-[14px]"></i>
                    </button>
                  </div>

                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#6F6E69] mb-1 font-mono">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, idx) => (
                      <div key={idx}>{l}</div>
                    ))}
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({
                      length: new Date(calMonth.y, calMonth.m, 1).getDay(),
                    }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {Array.from({
                      length: new Date(calMonth.y, calMonth.m + 1, 0).getDate(),
                    }).map((_, i) => {
                      const d = i + 1;
                      const s = `${calMonth.y}-${('0' + (calMonth.m + 1)).slice(
                        -2
                      )}-${('0' + d).slice(-2)}`;
                      let cls = 'cd';
                      if (s === start || s === end) cls += ' st';
                      else if (s > start && s < end) cls += ' rg';
                      else if (s === TK) cls += ' td';

                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={s < TK}
                          onClick={() => pickDay(s)}
                          className={cls}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>

                  <div className="sub text-[11.5px] text-[#9A9892] mt-3">
                    {pick === 'start'
                      ? 'Choose the start date.'
                      : 'Now choose the end date.'}{' '}
                    Dates run in UTC.
                  </div>
                </div>
              )}

              {/* Optional Description Collapsible */}
              <button
                type="button"
                onClick={() => setDescOpen(!descOpen)}
                className="edge fld flex items-center justify-between w-full h-[50px] px-4 rounded-[16px] text-[14.5px] cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-[#B9B7AF]">
                  <i className="ti ti-file-text text-[18px]"></i>
                  <span>{desc ? 'Description added' : 'Add description'}</span>
                </div>
                <i
                  className={`ti ti-chevron-${
                    descOpen ? 'up' : 'down'
                  } text-[#9A9892] text-[14px]`}
                ></i>
              </button>

              {descOpen && (
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What is the app, and what kind of content fits it?"
                  className="w-full bg-[#0B0B0B] border border-[#1F1F1F] rounded-[16px] p-3.5 text-[14px] text-[#F5F3EC] placeholder:text-[#6F6E69] outline-none focus:border-[#F5F3EC] resize-vertical leading-relaxed"
                />
              )}

              {/* Rewards Section */}
              <div className="lab text-[13px] text-[#B9B7AF] pt-2">
                Rewards
              </div>

              <div className="edge rounded-[18px] overflow-hidden bg-[#0A0A0A]">
                {/* Reward per verified install */}
                <div className="opt flex items-center justify-between p-4 border-b border-[#1F1F1F]">
                  <div className="flex items-center gap-3">
                    <i className="ti ti-coin text-[20px] text-[#9A9892]"></i>
                    <span className="text-[14.5px] text-[#F5F3EC]">
                      Reward per verified install
                    </span>
                  </div>

                  {editingField === 'reward' ? (
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCommitEdit}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommitEdit()}
                      autoFocus
                      className="di w-24 text-[14px] font-mono text-[#F5F3EC]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingField('reward');
                        setEditValue(reward.toString());
                      }}
                      className="flex items-center gap-2 text-[14.5px] font-mono text-[#C7F26B] hover:underline cursor-pointer bg-transparent border-0"
                    >
                      <span>{money(reward)}</span>
                      <i className="ti ti-pencil text-[15px] text-[#9A9892]"></i>
                    </button>
                  )}
                </div>

                {/* Subscription share switch */}
                <div className="opt flex items-center justify-between p-4 border-b border-[#1F1F1F]">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <i className="ti ti-receipt text-[20px] text-[#9A9892]"></i>
                    <div>
                      <div className="text-[14.5px] text-[#F5F3EC]">
                        Subscription share
                      </div>
                      <div className="sub text-[11.5px] text-[#9A9892] mt-0.5">
                        Creators also earn a cut of subscriptions they bring in
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSub(!sub)}
                    className={`sw ${sub ? 'on' : ''}`}
                    role="switch"
                    aria-checked={sub}
                    aria-label="Subscription share"
                  >
                    <i></i>
                  </button>
                </div>

                {/* Subscription share sub-options */}
                {sub && (
                  <div className="sbx p-4 pl-12 bg-[#0E0E10] border-b border-[#1F1F1F] space-y-3">
                    <div className="sub text-[12px] text-[#9A9892]">
                      Share of net revenue
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[5, 10, 15, 20].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPct(p)}
                          className={`edge chip text-[12px] py-1 px-3 ${
                            pct === p ? 'sel' : ''
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>

                    <div className="sub text-[12px] text-[#9A9892] pt-1">
                      For the first
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[6, 12, 24].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonths(m)}
                          className={`edge chip text-[12px] py-1 px-3 ${
                            months === m ? 'sel' : ''
                          }`}
                        >
                          {m} months
                        </button>
                      ))}
                    </div>

                    <div className="sub text-[11px] text-[#9A9892] leading-relaxed pt-1">
                      Paid on revenue after store fees and refunds. Your app must send purchase
                      events through the SDK or RevenueCat. It comes out of the same budget.
                    </div>
                  </div>
                )}

                {/* Require approval switch */}
                <div className="opt flex items-center justify-between p-4 border-b border-[#1F1F1F]">
                  <div className="flex items-center gap-3">
                    <i className="ti ti-lock text-[20px] text-[#9A9892]"></i>
                    <span className="text-[14.5px] text-[#F5F3EC]">
                      Require approval
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setApproval(!approval)}
                    className={`sw ${approval ? 'on' : ''}`}
                    role="switch"
                    aria-checked={approval}
                    aria-label="Require approval"
                  >
                    <i></i>
                  </button>
                </div>

                {/* Budget */}
                <div className="opt flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <i className="ti ti-wallet text-[20px] text-[#9A9892]"></i>
                    <span className="text-[14.5px] text-[#F5F3EC]">Budget</span>
                  </div>

                  {editingField === 'budget' ? (
                    <input
                      type="number"
                      step="100"
                      min="50"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCommitEdit}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommitEdit()}
                      autoFocus
                      className="di w-28 text-[14px] font-mono text-[#F5F3EC]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingField('budget');
                        setEditValue(budget.toString());
                      }}
                      className="flex items-center gap-2 text-[14.5px] font-mono text-[#F5F3EC] hover:underline cursor-pointer bg-transparent border-0"
                    >
                      <span>{money(budget).replace('.00', '')}</span>
                      <i className="ti ti-pencil text-[15px] text-[#9A9892]"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Estimate Note */}
              <div className="sub text-[12px] text-[#9A9892]">
                Your budget covers about {fmt(budget / reward)} verified installs
                {sub ? ', fewer if subscriptions pay out too.' : '.'}
              </div>

              {/* Error */}
              {err && (
                <div className="err text-[13px] text-[#FF8A80] min-h-[20px]">
                  {err}
                </div>
              )}

              {/* Continue to SDK Button */}
              <button
                type="button"
                onClick={handleNext}
                className="btn main w-full h-[50px] bg-[#F5F3EC] hover:bg-white text-black font-semibold rounded-full text-[15px] cursor-pointer transition-all shadow-md flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to SDK</span>
                <i className="ti ti-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 1: SDK ================= */}
        {step === 1 && (
          <div className="space-y-5 animate-[fade-in_0.2s_ease-out]">
            <div className="text-[20px] font-medium text-[#F5F3EC]">
              Install the SDK
            </div>
            <div className="sub text-[13px] text-[#9A9892]">
              It counts verified installs, so creators get paid and you only pay for real ones.
              {sub ? ' It also reports purchases for the subscription share.' : ''}
            </div>

            {/* Platform Selector */}
            <div className="flex gap-2 pt-1">
              {[
                ['ios', 'iOS'],
                ['and', 'Android'],
              ].map(([keyStr, label]) => (
                <button
                  key={keyStr}
                  type="button"
                  onClick={() => setPlat(keyStr as any)}
                  className={`edge btn sm ${plat === keyStr ? 'sel' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Code snippets */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="text-[14px] font-medium text-[#F5F3EC] mb-1.5">
                  1. Add the package
                </div>
                <div className="edge code">
                  {plat === 'ios'
                    ? "pod 'Umi', '~> 1.0'"
                    : 'implementation("io.umi:sdk:1.0.0")'}
                </div>
              </div>

              <div>
                <div className="text-[14px] font-medium text-[#F5F3EC] mb-1.5">
                  2. Start it when your app launches
                </div>
                <div className="edge code">
                  {plat === 'ios'
                    ? `Umi.configure(appKey: "${sdkKey}")`
                    : `Umi.init(this, "${sdkKey}")`}
                </div>
              </div>

              <div>
                <div className="text-[14px] font-medium text-[#F5F3EC] mb-1.5">
                  3. Check the connection
                </div>
                <div className="edge fld p-4 rounded-[16px] flex items-center gap-3">
                  {sdkStatus === 'ok' ? (
                    <>
                      <i className="ti ti-circle-check text-[22px] text-[#C7F26B]" aria-hidden="true"></i>
                      <div>
                        <div className="font-medium text-[14px] text-[#F5F3EC]">
                          Connected
                        </div>
                        <div className="sub text-[12px] text-[#9A9892]">
                          First test event received from {name || 'your app'}
                        </div>
                      </div>
                    </>
                  ) : sdkStatus === 'testing' ? (
                    <>
                      <i className="ti ti-loader-2 spin text-[20px] text-[#F5F3EC]" aria-hidden="true"></i>
                      <span className="sub text-[13px] text-[#9A9892]">
                        Listening for your first event…
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="ti ti-plug-off text-[20px] text-[#9A9892]" aria-hidden="true"></i>
                      <span className="sub text-[13px] text-[#9A9892]">
                        {sdkStatus === 'later'
                          ? 'Skipped for now. The campaign stays a draft until it connects.'
                          : 'Not connected yet'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSdkStatus('testing');
                  setErr('');
                  setTimeout(() => {
                    setSdkStatus('ok');
                  }, 1400);
                }}
                className="edge btn"
              >
                Test connection
              </button>

              {sdkStatus !== 'ok' && (
                <button
                  type="button"
                  onClick={() => setSdkStatus('later')}
                  className="btn bg-transparent border-0 text-[#B9B7AF] hover:text-[#F5F3EC] cursor-pointer"
                >
                  Do this later
                </button>
              )}
            </div>

            {err && <div className="err text-[13px] text-[#FF8A80]">{err}</div>}

            <div className="flex gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="edge btn h-[50px] px-6"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn main flex-1 h-[50px] bg-[#F5F3EC] hover:bg-white text-black font-semibold rounded-full text-[15px]"
              >
                Continue to funding
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: FUND ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-[fade-in_0.2s_ease-out]">
            {done ? (
              /* Success / Receipt View */
              <div className="text-center py-4 space-y-4">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  role="img"
                  aria-label="Done"
                  className="mx-auto"
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke={sdkStatus === 'ok' ? '#C7F26B' : '#FAC775'}
                    strokeWidth="3"
                  />
                  <path
                    d="M22 37 L32 47 L51 26"
                    fill="none"
                    stroke={sdkStatus === 'ok' ? '#C7F26B' : '#FAC775'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="48"
                    strokeDashoffset="0"
                  />
                </svg>

                <div>
                  <div className="text-[22px] font-medium text-[#F5F3EC]">
                    {name} {sdkStatus === 'ok' ? 'is live' : 'is saved as a draft'}
                  </div>
                  <div className="sub text-[13px] text-[#9A9892] mt-1">
                    {sdkStatus === 'ok'
                      ? 'Creators can find it under Campaigns now.'
                      : 'It goes live as soon as the SDK sends its first event.'}
                  </div>
                </div>

                {/* Receipt Card matching File 1 */}
                <div className="edge rounded-[18px] p-5 max-w-[420px] mx-auto space-y-2.5 text-left bg-[#111113]">
                  <div className="rl flex justify-between text-[14px]">
                    <span className="text-[#9A9892]">Receipt</span>
                    <span className="font-mono text-[#F5F3EC]">UMI-R-2026-000001</span>
                  </div>
                  <div className="rl flex justify-between text-[14px]">
                    <span className="text-[#9A9892]">Campaign budget</span>
                    <span className="font-mono text-[#F5F3EC]">{money(budget)}</span>
                  </div>
                  <div className="rl flex justify-between text-[14px]">
                    <span className="text-[#9A9892]">Platform fee (10%)</span>
                    <span className="font-mono text-[#F5F3EC]">{money(platformFee)}</span>
                  </div>
                  <div className="rl flex justify-between font-medium text-[16px] border-t border-[#1F1F1F] pt-2">
                    <span className="text-[#F5F3EC]">Total charged</span>
                    <span className="font-mono text-[#C7F26B]">{money(totalCharged)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onBack}
                    className="edge btn mx-auto"
                  >
                    View in Campaigns
                  </button>
                </div>
              </div>
            ) : (
              /* Funding Checkout Form */
              <div className="space-y-4">
                <div className="text-[19px] font-medium text-[#F5F3EC]">
                  Fund the campaign
                </div>
                <div className="sub text-[13px] text-[#9A9892]">
                  Your budget is held in escrow and paid to creators as installs are verified.
                </div>

                {/* Campaign Summary Card */}
                <div className="edge fld p-4 rounded-[16px] flex items-center gap-3.5 mt-3">
                  <span
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] shrink-0 font-bold"
                    style={{ backgroundColor: currentPal[0], color: currentPal[1] }}
                  >
                    <i className={`ti ${currentPal[2]}`} aria-hidden="true"></i>
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-[#F5F3EC] truncate">
                      {name}
                    </div>
                    <div className="sub text-[12px] text-[#9A9892]">
                      {approval ? 'Approval required' : 'Open to all'} · {money(reward)} per
                      install
                      {sub ? ` · ${pct}% subscription share for ${months} months` : ''}
                    </div>
                    <div className="sub text-[12px] text-[#9A9892]">
                      {fd(start)} to {fd(end)}
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="edge rounded-[16px] p-4 space-y-2 bg-[#0A0A0A]">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9892]">Campaign budget</span>
                    <span className="font-mono text-[#F5F3EC]">{money(budget)}</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#9A9892]">Platform fee (10%)</span>
                    <span className="font-mono text-[#F5F3EC]">{money(platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-medium border-t border-[#1F1F1F] pt-2">
                    <span className="text-[#F5F3EC]">Total today</span>
                    <span className="font-mono text-[#C7F26B]">{money(totalCharged)}</span>
                  </div>
                </div>

                {/* Card on file */}
                <div className="edge fld p-4 rounded-[16px] flex items-center gap-3">
                  <i className="ti ti-credit-card text-[20px] text-[#9A9892]" aria-hidden="true"></i>
                  <div className="flex-1 text-[14.5px] text-[#F5F3EC]">
                    Card ending 4242
                  </div>
                  <span className="sub text-[12px] text-[#9A9892]">Charged now</span>
                </div>

                <div className="sub text-[12px] text-[#9A9892]">
                  Unused budget is refunded when the campaign ends.{' '}
                  {sdkStatus === 'ok'
                    ? ''
                    : 'The SDK is not connected, so the campaign saves as a draft.'}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="edge btn h-[50px] px-6"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="btn main flex-1 h-[50px] bg-[#F5F3EC] hover:bg-white text-black font-semibold rounded-full text-[15px]"
                  >
                    Fund {money(totalCharged)} and publish
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { Campaign } from '../types/campaign';

interface KredAnalyticsEngineProps {
  campaigns?: Campaign[];
  initialCampaignId?: string | null;
  onNavigateCampaign?: (id: string) => void;
  onNavigateEarnings?: () => void;
  compact?: boolean;
}

const TODAY = new Date(2026, 9, 2);

interface InternalCampaign {
  id: string;
  n: string;
  p: number;
  b: number;
  ic: string;
  bg: string;
  fg: string;
}

const CA: InternalCampaign[] = [
  { id: 'pixelpop', n: 'Pixel Pop', p: 1.8, b: 640, ic: 'ti-device-gamepad-2', bg: '#CECBF6', fg: '#26215C' },
  { id: 'stride', n: 'Stride', p: 2.9, b: 350, ic: 'ti-heart', bg: '#F5C4B3', fg: '#4A1B0C' },
  { id: 'focusly', n: 'Focusly', p: 2.1, b: 210, ic: 'ti-bolt', bg: '#B5D4F4', fg: '#042C53' },
];

const IDX: Record<'creator' | 'founder', number[]> = {
  creator: [0, 1],
  founder: [0, 2],
};

type MetricKey = 'clicks' | 'conf' | 'ver' | 'money';

interface MetricDef {
  key: MetricKey;
  label: string;
  icon: string;
  bg: string;
  fg: string;
}

const METRICS: Record<'creator' | 'founder', MetricDef[]> = {
  creator: [
    { key: 'clicks', label: 'Clicks', icon: 'ti-pointer', bg: '#CECBF6', fg: '#26215C' },
    { key: 'conf', label: 'Confirmed', icon: 'ti-circle-dot', bg: '#B5D4F4', fg: '#042C53' },
    { key: 'ver', label: 'Verified installs', icon: 'ti-circle-check', bg: '#C7F26B', fg: '#16140F' },
    { key: 'money', label: 'Earnings', icon: 'ti-coin', bg: '#FAC775', fg: '#412402' },
  ],
  founder: [
    { key: 'clicks', label: 'Clicks', icon: 'ti-pointer', bg: '#CECBF6', fg: '#26215C' },
    { key: 'conf', label: 'Confirmed', icon: 'ti-circle-dot', bg: '#B5D4F4', fg: '#042C53' },
    { key: 'ver', label: 'Verified installs', icon: 'ti-circle-check', bg: '#C7F26B', fg: '#16140F' },
    { key: 'money', label: 'Spend', icon: 'ti-coin', bg: '#FAC775', fg: '#412402' },
  ],
};

function rnd(s: number) {
  s = (s + 0x6d2b79f5) | 0;
  const t = Math.imul(s ^ (s >>> 15), 1 | s);
  const t2 = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
}

function num(n: number) {
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

function dstr(a: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - a);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dayData(ci: number, a: number, role: 'creator' | 'founder') {
  const c = CA[ci];
  const sc = role === 'creator' ? 0.07 : 1;
  const f = 0.75 + 0.25 * (1 - a / 180);
  const clicks = Math.round(
    c.b * sc * f * (0.55 + 0.9 * rnd(ci * 977 + a * 31 + (role === 'creator' ? 5 : 9)))
  );
  const conf = Math.round(clicks * (0.28 + 0.12 * rnd(ci * 13 + a * 7 + 1)));
  const ver = Math.round(conf * (0.6 + 0.2 * rnd(ci * 17 + a * 5 + 2)));
  return { clicks, conf, ver, money: ver * c.p };
}

function nice(m: number) {
  if (m <= 0) return 10;
  const p = Math.pow(10, Math.floor(Math.log(m) / Math.LN10));
  const f = m / p;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * p;
}

function fk(v: number, isMo: boolean) {
  const s = v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'k' : String(Math.round(v));
  return isMo ? '$' + s : s;
}

export const KredAnalyticsEngine: React.FC<KredAnalyticsEngineProps> = ({
  initialCampaignId,
  onNavigateCampaign,
  onNavigateEarnings,
  compact = false,
}) => {
  const [role, setRole] = useState<'creator' | 'founder'>('creator');
  const [camp, setCamp] = useState<number>(() => {
    if (initialCampaignId) {
      const idx = CA.findIndex((c) => c.id === initialCampaignId.toLowerCase());
      return idx >= 0 ? idx : -1;
    }
    return -1;
  });
  const [R, setR] = useState<number>(30);
  const [metricIdx, setMetricIdx] = useState<number>(2); // Default to Verified installs
  const [hov, setHov] = useState<number | null>(null);
  const [testPing, setTestPing] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const currentMetricList = METRICS[role];
  const activeMetric = currentMetricList[metricIdx] || currentMetricList[0];
  const isMoney = activeMetric.key === 'money';

  // Compute 2 * R series (current + previous comparison)
  const getSeries = (key: MetricKey) => {
    const out: number[] = [];
    const activeIndices = IDX[role];
    for (let a = 2 * R - 1; a >= 0; a--) {
      let v = 0;
      activeIndices.forEach((ci) => {
        if (camp >= 0 && ci !== camp) return;
        v += dayData(ci, a, role)[key];
      });
      out.push(v);
    }
    return out;
  };

  const rawSeries = getSeries(activeMetric.key);
  const curSeries = rawSeries.slice(R);
  const prevSeries = rawSeries.slice(0, R);

  const sum = (arr: number[]) => arr.reduce((p, q) => p + q, 0);
  const totalVal = sum(curSeries);
  const prevVal = sum(prevSeries);
  const bestVal = Math.max(...curSeries, 1);
  const diffPct = prevVal ? Math.round(((totalVal - prevVal) / prevVal) * 100) : 0;

  // Chart dimensions & scaling
  const W = 640;
  const H = 250;
  const pl = isMoney ? 44 : 34;
  const pr = 8;
  const pt = 22;
  const pb = 26;
  const pw = W - pl - pr;
  const ph = H - pt - pb;
  const n = curSeries.length;
  const maxVal = nice(Math.max(...curSeries, 1) * 1.08);

  const ys = (v: number) => pt + ph * (1 - v / maxVal);
  const step = pw / n;
  const bw = Math.max(2, step * 0.72);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const rawI = Math.floor((vx - pl) / (pw / n));
    const clampedI = Math.max(0, Math.min(n - 1, rawI));
    if (clampedI !== hov) setHov(clampedI);
  };

  const handlePointerLeave = () => {
    setHov(null);
  };

  // Creator lower section calculations
  let creatorHold = 0;
  let creatorAw = 0;
  let creatorPaid = 0;
  let creatorTotal = 0;

  const creatorBreakdown = IDX.creator.map((ci) => {
    let v = 0;
    let m = 0;
    for (let a = 0; a < R; a++) {
      const x = dayData(ci, a, 'creator');
      v += x.ver;
      m += x.money;
    }
    creatorTotal += m;
    return { ci, v, m };
  });

  IDX.creator.forEach((ci) => {
    for (let a = 0; a < R + 21; a++) {
      const m = dayData(ci, a, 'creator').money;
      if (a < 14) creatorHold += m;
      else if (a < 21) creatorAw += m;
      else creatorPaid += m;
    }
  });

  // Founder lower section calculations
  let founderSpent = 0;
  IDX.founder.forEach((ci) => {
    if (camp >= 0 && ci !== camp) return;
    for (let a = 0; a < R; a++) {
      founderSpent += dayData(ci, a, 'founder').money;
    }
  });

  const founderBudget = camp >= 0 ? 5000 : 10000;
  const budgetUsedPct = Math.min(100, Math.round((founderSpent / founderBudget) * 100));

  const founderCreators = [
    { name: 'maya.makes', share: 31, bg: '#CECBF6', fg: '#26215C' },
    { name: 'devon', share: 24, bg: '#F5C4B3', fg: '#4A1B0C' },
    { name: 'luna_k', share: 19, bg: '#C0DD97', fg: '#173404' },
  ];

  return (
    <div className="w-full bg-transparent text-left select-none space-y-6 pt-2">
      {/* Top Header: Title & Role Switcher */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-[24px] sm:text-[26px] font-medium tracking-tight text-[#F5F3EC]">
            Analytics
          </h2>
          <div className="sub text-[12px] text-[#9A9892]">
            Daily verified telemetry, conversion, and escrow payouts
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="inline-flex rounded-full p-1 bg-[#161616] border border-white/5">
          {(['creator', 'founder'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setCamp(-1);
                setHov(null);
              }}
              className={`pill text-[12px] py-1 px-4 cursor-pointer font-medium transition-colors ${
                role === r ? 'on text-black bg-[#F5F3EC]' : 'text-[#B9B7AF] bg-transparent'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar: Campaigns & Ranges */}
      <div className="flex justify-between items-center gap-3 flex-wrap pt-1">
        {/* Campaign Filters */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setCamp(-1);
              setHov(null);
            }}
            className={`edge chip text-[12px] py-1 px-3.5 cursor-pointer ${
              camp < 0 ? 'sel' : ''
            }`}
          >
            All campaigns
          </button>

          {IDX[role].map((ci) => (
            <button
              key={ci}
              type="button"
              onClick={() => {
                setCamp(ci);
                setHov(null);
              }}
              className={`edge chip text-[12px] py-1 px-3.5 cursor-pointer ${
                camp === ci ? 'sel' : ''
              }`}
            >
              {CA[ci].n}
            </button>
          ))}
        </div>

        {/* Range Filters */}
        <div className="flex gap-1.5 shrink-0">
          {[14, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setR(d);
                setHov(null);
              }}
              className={`edge chip text-[12px] py-1 px-3 cursor-pointer ${
                R === d ? 'sel' : ''
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Main Metric Card */}
      <div className="rounded-[24px] p-5 sm:p-7 bg-[#141414] border border-white/5 space-y-5">
        {/* Carousel Pill Header */}
        <div className="rounded-full flex items-center gap-3 p-1.5 pl-3 pr-2 bg-[#1C1C1C] border border-white/5">
          <span
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[16px] shrink-0 font-bold shadow-xs"
            style={{ backgroundColor: activeMetric.bg, color: activeMetric.fg }}
          >
            <i className={`ti ${activeMetric.icon}`}></i>
          </span>

          <span className="flex-1 text-[13.5px] text-[#D4D2CD] truncate font-medium">
            Showing daily {activeMetric.label.toLowerCase()}, last {R} days
          </span>

          <button
            type="button"
            onClick={() => setMetricIdx((metricIdx + 1) % 4)}
            className="edge w-8 h-8 rounded-full p-0 flex items-center justify-center text-[14px] cursor-pointer hover:bg-[#2A2A30] transition-colors"
            aria-label="Next metric"
            title="Next metric"
          >
            <i className="ti ti-chevron-right"></i>
          </button>
        </div>

        {/* Metric Selector Chips */}
        <div className="flex gap-2 flex-wrap">
          {currentMetricList.map((m, i) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setMetricIdx(i);
                setHov(null);
              }}
              className={`edge chip text-[12px] py-1 px-3 cursor-pointer flex items-center gap-1.5 ${
                metricIdx === i ? 'sel' : ''
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: m.bg }}
              />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Daily Bar Chart (SVG) */}
        <div className="pt-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label={`Daily ${activeMetric.label} for the last ${R} days`}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="block touch-pan-y select-none"
          >
            {/* Grid horizontal guidelines */}
            {[0, 1, 2, 3, 4].map((t) => {
              const y = pt + (ph * t) / 4;
              return (
                <g key={t}>
                  <line
                    x1={pl}
                    x2={W - pr}
                    y1={y}
                    y2={y}
                    stroke="#1F1F1F"
                  />
                  <text
                    x={pl - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#6F6E69"
                  >
                    {fk((maxVal * (4 - t)) / 4, isMoney)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {curSeries.map((v, i) => {
              const x = pl + step * i + (step - bw) / 2;
              const y = ys(v);
              const isHovered = i === hov;

              return (
                <rect
                  key={i}
                  x={x.toFixed(1)}
                  y={y.toFixed(1)}
                  width={bw.toFixed(1)}
                  height={Math.max(1, pt + ph - y).toFixed(1)}
                  rx="1.5"
                  fill={isHovered ? '#F5F3EC' : activeMetric.bg}
                  className="transition-colors cursor-pointer"
                />
              );
            })}

            {/* X-axis date labels */}
            {(() => {
              const every = Math.max(1, Math.round(n / 7));
              const labels = [];
              for (let i = 0; i < n; i += every) {
                labels.push(
                  <text
                    key={i}
                    x={(pl + step * i + step / 2).toFixed(1)}
                    y={H - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="monospace"
                    fill="#6F6E69"
                  >
                    {dstr(n - 1 - i)}
                  </text>
                );
              }
              return labels;
            })()}

            {/* Floating Tooltip Pill */}
            {hov !== null && hov >= 0 && (
              (() => {
                const px = Math.max(
                  pl + 36,
                  Math.min(W - pr - 36, pl + step * hov + step / 2)
                );
                const py = Math.max(14, ys(curSeries[hov]) - 14);
                const txt = isMoney
                  ? money(curSeries[hov])
                  : num(curSeries[hov]);
                const boxW = Math.max(60, txt.length * 8 + 20);

                return (
                  <g>
                    <rect
                      x={(px - boxW / 2).toFixed(1)}
                      y={(py - 11).toFixed(1)}
                      width={boxW.toFixed(1)}
                      height="22"
                      rx="11"
                      fill="#F5F3EC"
                    />
                    <text
                      x={px.toFixed(1)}
                      y={(py + 4).toFixed(1)}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="600"
                      fill="#000000"
                    >
                      {txt}
                    </text>
                  </g>
                );
              })()
            )}
          </svg>

          {/* Interactive Scrub Status */}
          <div className="sub text-[12px] text-[#F5F3EC] mt-1 pl-1">
            {hov !== null && hov >= 0
              ? `${dstr(n - 1 - hov)} · ${
                  isMoney ? money(curSeries[hov]) : num(curSeries[hov])
                } ${activeMetric.label.toLowerCase()}`
              : 'Hover or drag over any bar to inspect date'}
          </div>
        </div>

        {/* 4 Summary Stat Columns */}
        <div className="nums grid grid-cols-2 sm:grid-cols-4 pt-3 border-t border-[#1F1F1F]">
          <div className="p-2 sm:p-3">
            <div className="sub text-[11.5px] text-[#9A9892]">Total</div>
            <div className="big text-[22px] font-medium text-[#F5F3EC] font-mono mt-0.5">
              {isMoney ? money(totalVal) : num(totalVal)}
            </div>
          </div>

          <div className="p-2 sm:p-3 border-l border-[#1F1F1F]">
            <div className="sub text-[11.5px] text-[#9A9892]">Daily average</div>
            <div className="big text-[22px] font-medium text-[#F5F3EC] font-mono mt-0.5">
              {isMoney ? money(totalVal / R) : num(totalVal / R)}
            </div>
          </div>

          <div className="p-2 sm:p-3 border-t sm:border-t-0 sm:border-l border-[#1F1F1F]">
            <div className="sub text-[11.5px] text-[#9A9892]">Best day</div>
            <div className="big text-[22px] font-medium text-[#F5F3EC] font-mono mt-0.5">
              {isMoney ? money(bestVal) : num(bestVal)}
            </div>
          </div>

          <div className="p-2 sm:p-3 border-t sm:border-t-0 border-l border-[#1F1F1F]">
            <div className="sub text-[11.5px] text-[#9A9892]">
              Vs previous {R} days
            </div>
            <div
              className={`big text-[22px] font-medium font-mono mt-0.5 ${
                diffPct >= 0 ? 'text-[#C7F26B]' : 'text-[#FF8A80]'
              }`}
            >
              {diffPct >= 0 ? '+' : ''}
              {diffPct}%
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOWER ROLE SPECIFIC SECTION ================= */}
      <div className="rounded-[24px] p-5 sm:p-7 bg-[#141414] border border-white/5 space-y-5">
        {role === 'creator' ? (
          /* Creator: Earnings Status & By Campaign */
          <div className="space-y-4">
            <div className="h text-[15px] font-medium text-[#F5F3EC]">
              Earnings status
            </div>

            <div className="nums grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                <div className="sub text-[12px] text-[#9A9892]">
                  In the 14 day check
                </div>
                <div className="big text-[22px] font-medium text-[#F5F3EC] font-mono mt-1">
                  {money(creatorHold)}
                </div>
              </div>

              <div className="p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                <div className="sub text-[12px] text-[#9A9892]">
                  Awaiting payout
                </div>
                <div className="big text-[22px] font-medium text-[#FAC775] font-mono mt-1">
                  {money(creatorAw)}
                </div>
              </div>

              <div className="p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                <div className="sub text-[12px] text-[#9A9892]">Paid out</div>
                <div className="big text-[22px] font-medium text-[#C7F26B] font-mono mt-1">
                  {money(creatorPaid)}
                </div>
              </div>
            </div>

            <div className="h text-[15px] font-medium text-[#F5F3EC] pt-3">
              By campaign
            </div>

            <div className="space-y-2">
              {creatorBreakdown.map((r) => {
                const c = CA[r.ci];
                const pct = Math.round((r.m / (creatorTotal || 1)) * 100);

                return (
                  <div
                    key={c.id}
                    onClick={() => onNavigateCampaign && onNavigateCampaign(c.id)}
                    className="rw flex items-center gap-3.5 p-3 rounded-[16px] bg-[#141416] border border-[#1F1F1F] hover:border-[#2E2E34] transition-colors cursor-pointer"
                  >
                    <span
                      className="tl w-10 h-10 rounded-[12px] flex items-center justify-center text-[18px] shrink-0 font-bold"
                      style={{ backgroundColor: c.bg, color: c.fg }}
                    >
                      <i className={`ti ${c.ic}`} aria-hidden="true"></i>
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-medium text-[#F5F3EC]">
                        {c.n}
                      </div>
                      <div className="sub text-[12px] text-[#9A9892] mt-0.5">
                        {num(r.v)} verified installs at {money(c.p)}
                      </div>
                      <div className="trk mt-2">
                        <div
                          style={{
                            width: `${Math.max(4, pct)}%`,
                            backgroundColor: c.bg,
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-[15px] font-semibold text-[#F5F3EC] font-mono">
                      {money(r.m)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Founder: SDK Health, Money/Settlement & Top Creators */
          <div className="space-y-5">
            {/* SDK Health */}
            <div>
              <div className="h text-[15px] font-medium text-[#F5F3EC] mb-2">
                SDK health
              </div>
              <div className="rw flex items-center gap-3 p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7F26B] shrink-0 shadow-[0_0_8px_#C7F26B]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#F5F3EC]">
                    Live
                  </div>
                  <div className="sub text-[12px] text-[#9A9892]">
                    {testPing
                      ? 'Test ping received successfully! Attestation active.'
                      : 'Last event 2 minutes ago · SDK 0.3.1 · iOS and Android'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTestPing(true);
                    setTimeout(() => setTestPing(false), 2500);
                  }}
                  className="edge chip text-[12px] py-1 px-3 cursor-pointer"
                >
                  {testPing ? 'Pinged' : 'Run test'}
                </button>
              </div>
            </div>

            {/* Money & Settlement */}
            <div>
              <div className="h text-[15px] font-medium text-[#F5F3EC] mb-2">
                Money and settlement
              </div>

              <div className="nums grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                  <div className="sub text-[12px] text-[#9A9892]">
                    Budget left in escrow
                  </div>
                  <div className="big text-[22px] font-medium text-[#F5F3EC] font-mono mt-1">
                    {money(Math.max(0, founderBudget - founderSpent))}
                  </div>
                </div>

                <div className="p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                  <div className="sub text-[12px] text-[#9A9892]">
                    Spent in range
                  </div>
                  <div className="big text-[22px] font-medium text-[#FAC775] font-mono mt-1">
                    {money(founderSpent)}
                  </div>
                </div>

                <div className="p-3 bg-[#141416] rounded-[16px] border border-[#1F1F1F]">
                  <div className="sub text-[12px] text-[#9A9892]">
                    Next settlement
                  </div>
                  <div className="big text-[22px] font-medium text-[#C7F26B] font-mono mt-1">
                    Fri, Oct 9
                  </div>
                </div>
              </div>

              <div className="trk mt-3">
                <div
                  style={{
                    width: `${budgetUsedPct}%`,
                    backgroundColor: '#C7F26B',
                  }}
                />
              </div>
              <div className="sub text-[12px] text-[#9A9892] mt-1.5">
                {budgetUsedPct}% of budget used
              </div>
            </div>

            {/* Top Creators Leaderboard */}
            <div>
              <div className="h text-[15px] font-medium text-[#F5F3EC] mb-2">
                Top creators
              </div>

              <div className="space-y-2">
                {founderCreators.map((t) => (
                  <div
                    key={t.name}
                    className="rw flex items-center gap-3 p-3 rounded-[16px] bg-[#141416] border border-[#1F1F1F]"
                  >
                    <span
                      className="tl w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                      style={{ backgroundColor: t.bg, color: t.fg }}
                    >
                      {t.name.charAt(0).toUpperCase()}
                    </span>

                    <div className="flex-1 text-[14px] font-medium text-[#F5F3EC]">
                      @{t.name}
                    </div>

                    <div className="trk w-36 max-w-[160px]">
                      <div
                        style={{
                          width: `${(t.share / 31) * 100}%`,
                          backgroundColor: '#C7F26B',
                        }}
                      />
                    </div>

                    <div className="sub w-12 text-right text-[12px] font-mono text-[#F5F3EC]">
                      {t.share}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

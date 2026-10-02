import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';

interface CampaignAnalyticsViewProps {
  campaigns?: Campaign[];
  initialCampaignId?: string | null;
  onBack?: () => void;
  onNavigateCampaign?: (id: string) => void;
  onCreateCampaign?: () => void;
}

const TODAY = new Date(2026, 9, 2);

const FOUNDER_CAMPAIGNS = [
  {
    id: 'pixelpop',
    n: 'Pixel Pop',
    cat: 'Games',
    bg: '#CECBF6',
    fg: '#26215C',
    ic: 'ti-device-gamepad-2',
    pay: 1.8,
    ab: 38,
    ver: 0.78,
    cv: 0.28,
    ios: 0.44,
  },
  {
    id: 'stride',
    n: 'Stride',
    cat: 'Health',
    bg: '#F5C4B3',
    fg: '#4A1B0C',
    ic: 'ti-heart',
    pay: 2.9,
    ab: 21,
    ver: 0.84,
    cv: 0.35,
    ios: 0.63,
  },
  {
    id: 'focusly',
    n: 'Focusly',
    cat: 'Productivity',
    bg: '#B5D4F4',
    fg: '#042C53',
    ic: 'ti-bolt',
    pay: 2.1,
    ab: 12,
    ver: 0.8,
    cv: 0.22,
    ios: 0.52,
  },
];

function rnd(s: number) {
  s = (s + 0x6d2b79f5) | 0;
  const t = Math.imul(s ^ (s >>> 15), 1 | s);
  const t2 = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
}

function master(ci: number, base: number, off: number) {
  const a: number[] = [];
  for (let d = 0; d < 90; d++) {
    const f = 0.7 + 0.3 * (1 - d / 90);
    a.push(
      Math.max(0, Math.round(base * f * (0.55 + 0.9 * rnd(ci * 977 + d * 31 + off))))
    );
  }
  return a;
}

const A = FOUNDER_CAMPAIGNS.map((c, i) => master(i, c.ab, 401));
const NB: Record<number, number> = { 7: 7, 30: 15, 90: 18 };

function sum(arr: number[], from: number, to: number) {
  let s = 0;
  for (let i = from; i <= to && i < arr.length; i++) s += arr[i];
  return s;
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

function num(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

function dstr(ago: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - ago);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CampaignAnalyticsView: React.FC<CampaignAnalyticsViewProps> = ({
  initialCampaignId,
  onNavigateCampaign,
  onCreateCampaign,
  onBack,
}) => {
  const [range, setRange] = useState<number>(30);
  const [selCamp, setSelCamp] = useState<number>(() => {
    if (initialCampaignId) {
      const idx = FOUNDER_CAMPAIGNS.findIndex((c) => c.id === initialCampaignId);
      return idx >= 0 ? idx : -1;
    }
    return -1;
  });
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  const getBuckets = () => {
    const nb = NB[range] || 15;
    const bs = range / nb;
    const out: { v: number; m: number; ago: number; bs: number; label: string }[] = [];

    for (let k = 0; k < nb; k++) {
      const newest = (nb - 1 - k) * bs;
      const oldest = newest + bs - 1;
      let v = 0;
      let m = 0;

      FOUNDER_CAMPAIGNS.forEach((c, i) => {
        if (selCamp >= 0 && i !== selCamp) return;
        const s = sum(A[i], newest, oldest);
        v += s;
        m += s * c.pay;
      });

      const label = bs > 1 ? `${dstr(newest + bs - 1)} to ${dstr(newest)}` : dstr(newest);
      out.push({ v, m, ago: newest, bs, label });
    }
    return out;
  };

  const buckets = getBuckets();
  let maxChartVal = 0;
  buckets.forEach((b) => {
    maxChartVal = Math.max(maxChartVal, b.v);
  });

  let totalVerInst = 0;
  let totalRawInst = 0;
  let totalClicks = 0;
  let totalSpend = 0;
  let totalIos = 0;

  FOUNDER_CAMPAIGNS.forEach((c, i) => {
    if (selCamp >= 0 && i !== selCamp) return;
    const v = sum(A[i], 0, range - 1);
    totalVerInst += v;
    totalRawInst += v / c.ver;
    totalClicks += v / c.ver / c.cv;
    totalSpend += v * c.pay;
    totalIos += v * c.ios;
  });

  const cr = totalRawInst / (totalClicks || 1);
  const vr = totalVerInst / (totalRawInst || 1);
  const ip = totalIos / (totalVerInst || 1);

  const hasData = totalVerInst > 0;

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      {/* Breadcrumbs with icons */}
      <Breadcrumbs
        items={[
          { label: 'Profile', icon: 'ti-user', onClick: onBack },
          ...(selCamp >= 0
            ? [
                {
                  label: FOUNDER_CAMPAIGNS[selCamp].n,
                  icon: FOUNDER_CAMPAIGNS[selCamp].ic,
                  onClick: onNavigateCampaign
                    ? () => onNavigateCampaign(FOUNDER_CAMPAIGNS[selCamp].id)
                    : undefined,
                },
              ]
            : []),
          { label: 'Campaign analytics', icon: 'ti-chart-bar', active: true },
        ]}
      />

      {/* Title & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="sub text-[12px] uppercase tracking-wider font-mono">
            Attribution telemetry
          </div>
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC] mt-0.5">
            {selCamp >= 0 ? `${FOUNDER_CAMPAIGNS[selCamp].n} analytics` : 'Campaign analytics'}
          </h1>
          <p className="text-[13px] text-[#9A9892] mt-1">
            Real-time attribution telemetry, verification rates, and creator spend.
          </p>
        </div>

        {/* Date range filter chips */}
        <div className="flex gap-1.5 self-start sm:self-auto shrink-0">
          {[7, 30, 90].map((d) => (
            <button
              key={`range-${d}`}
              onClick={() => setRange(d)}
              className={`chip min-h-[38px] px-3.5 cursor-pointer ${range === d ? 'sel' : ''}`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="card text-center py-14 px-6 space-y-3 bg-[#161616] border border-[#2A2A2A] rounded-[24px]">
          <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#9A9892] flex items-center justify-center text-[22px] mx-auto">
            <i className="ti ti-chart-bar"></i>
          </div>
          <div>
            <div className="text-[16px] font-medium text-[#F5F3EC]">No analytics data yet</div>
            <div className="text-[13px] text-[#9A9892] mt-1 max-w-[420px] mx-auto leading-relaxed">
              Create a campaign and integrate the SDK to see real-time install attribution.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onCreateCampaign}
              className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
            >
              Create campaign
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Campaign Selector Chips */}
          <div className="flex gap-1.5 flex-wrap pt-1">
            <button
              onClick={() => setSelCamp(-1)}
              className={`chip min-h-[36px] px-3 cursor-pointer ${selCamp < 0 ? 'sel' : ''}`}
            >
              All campaigns
            </button>
            {FOUNDER_CAMPAIGNS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelCamp(i)}
                className={`chip min-h-[36px] px-3 cursor-pointer ${selCamp === i ? 'sel' : ''}`}
              >
                {c.n}
              </button>
            ))}
          </div>

          {/* Big Installs Banner */}
          <div className="bg-[#161616] rounded-[20px] p-5 border border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="sub text-[12px]">Verified installs in the last {range} days</div>
              <div className="text-[36px] font-medium tracking-[-0.8px] text-[#F5F3EC] mt-0.5">
                {num(totalVerInst)}
              </div>
              <div className="text-[12px] text-[#C7F26B] flex items-center gap-1.5 mt-1 font-medium">
                <i className="ti ti-shield-check" aria-hidden="true"></i>
                <span>Fraud-shielded attribution SDK active</span>
              </div>
            </div>

            <div className="flex gap-2">
              {selCamp >= 0 && onNavigateCampaign && (
                <button
                  type="button"
                  onClick={() => onNavigateCampaign(FOUNDER_CAMPAIGNS[selCamp].id)}
                  className="pill on min-h-[44px] px-4 shadow-sm cursor-pointer"
                >
                  <span>View campaign page</span>
                  <i className="ti ti-arrow-right" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </div>

          {/* 4-Stat Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-[#161616] rounded-[20px] p-4 border border-[#2A2A2A]/40">
            <div className="p-2 sm:px-3 border-r border-[#2A2A2A]/60">
              <div className="sub text-[11px]">Clicks</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#F5F3EC] mt-0.5">
                {num(totalClicks)}
              </div>
            </div>
            <div className="p-2 sm:px-3 sm:border-r border-[#2A2A2A]/60">
              <div className="sub text-[11px]">Installs</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#B5D4F4] mt-0.5">
                {num(totalRawInst)}
              </div>
            </div>
            <div className="p-2 sm:px-3 border-r border-[#2A2A2A]/60">
              <div className="sub text-[11px]">Spend</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#F5F3EC] mt-0.5">
                {money(totalSpend)}
              </div>
            </div>
            <div className="p-2 sm:px-3">
              <div className="sub text-[11px]">Cost per install</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#C7F26B] mt-0.5">
                {money(totalSpend / (totalVerInst || 1))}
              </div>
            </div>
          </div>

          {/* Verified Installs Over Time Bar Chart Card with Tap & Data Table Toggle */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="font-medium text-[15px] text-[#F5F3EC]">
                Verified installs over time
              </div>
              <button
                type="button"
                onClick={() => setShowDataTable(!showDataTable)}
                className="pill gh text-[12px] py-1 px-2.5 text-[#9A9892] hover:text-[#F5F3EC] cursor-pointer min-h-[36px]"
              >
                <i className={`ti ${showDataTable ? 'ti-chart-bar' : 'ti-table'}`}></i>
                <span>{showDataTable ? 'Show chart' : 'Data table'}</span>
              </button>
            </div>

            {showDataTable ? (
              /* Accessible Table Alternative */
              <div className="mt-3 overflow-x-auto text-[13px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A2A2A] text-[#9A9892]">
                      <th className="py-2 px-2 font-normal">Period</th>
                      <th className="py-2 px-2 font-normal">Verified installs</th>
                      <th className="py-2 px-2 font-normal text-right">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buckets.map((b, idx) => (
                      <tr key={idx} className="border-b border-[#2A2A2A]/40 hover:bg-[#1C1C1C]">
                        <td className="py-2 px-2 text-[#F5F3EC]">{b.label}</td>
                        <td className="py-2 px-2 text-[#B9B7AF]">{num(b.v)}</td>
                        <td className="py-2 px-2 text-right font-medium text-[#F5F3EC]">{money(b.m)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <div className="flex items-end gap-1 sm:gap-1.5 h-[150px] mt-4">
                  {buckets.map((b, i) => {
                    const isLast = i === buckets.length - 1;
                    const pctHeight = Math.max(4, Math.round((b.v / (maxChartVal || 1)) * 100));
                    return (
                      <div
                        key={`ba-${i}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`${b.label}: ${num(b.v)} verified installs, ${money(b.m)} spend`}
                        onClick={() => setHoveredTip(`${b.label} · ${num(b.v)} verified installs · ${money(b.m)} spend`)}
                        onMouseEnter={() => setHoveredTip(`${b.label} · ${num(b.v)} verified installs · ${money(b.m)} spend`)}
                        onMouseLeave={() => setHoveredTip(null)}
                        className="flex-1 rounded-t-[6px] rounded-b-[2px] transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#F5F3EC]"
                        style={{
                          height: `${pctHeight}%`,
                          backgroundColor: isLast ? '#C7F26B' : '#3A3A37',
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between items-center sub mt-2.5">
                  <span>{dstr(range - 1)}</span>
                  <span className="text-[#F5F3EC] font-mono text-[12px] truncate px-2 text-center">
                    {hoveredTip || 'Tap or hover a bar for details'}
                  </span>
                  <span>Today</span>
                </div>
              </div>
            )}
          </div>

          {/* Funnel Card */}
          <div className="card">
            <div className="font-medium text-[15px] text-[#F5F3EC]">Conversion funnel</div>
            <div className="space-y-3 mt-3.5">
              {/* Clicks */}
              <div>
                <div className="flex justify-between text-[13px]">
                  <span>Clicks</span>
                  <span className="sub">{num(totalClicks)}</span>
                </div>
                <div className="h-[10px] rounded-[3px] bg-[#242424] overflow-hidden mt-1.5">
                  <div className="h-full bg-[#3A3A37] w-full" />
                </div>
              </div>

              {/* Installs */}
              <div>
                <div className="flex justify-between text-[13px]">
                  <span>Installs</span>
                  <span className="sub">
                    {num(totalRawInst)} · {(cr * 100).toFixed(1)}% of clicks
                  </span>
                </div>
                <div className="h-[10px] rounded-[3px] bg-[#242424] overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#B5D4F4]"
                    style={{ width: `${Math.min(100, Math.max(4, cr * 100))}%` }}
                  />
                </div>
              </div>

              {/* Verified */}
              <div>
                <div className="flex justify-between text-[13px]">
                  <span>Verified</span>
                  <span className="sub">
                    {num(totalVerInst)} · {(vr * 100).toFixed(0)}% of installs
                  </span>
                </div>
                <div className="h-[10px] rounded-[3px] bg-[#242424] overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#C7F26B]"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(4, (totalVerInst / (totalClicks || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sub mt-3 text-[12px]">
              {num(totalRawInst - totalVerInst)} installs rejected as unverified, so you were not charged for them.
            </div>
          </div>

          {/* Top Creators & Platforms Row */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-3">
            {/* Top Creators Card */}
            <div className="card">
              <div className="font-medium text-[15px] text-[#F5F3EC]">Top creators</div>
              <div className="space-y-1 mt-2">
                {[
                  { handle: 'maya.makes', pct: 0.31, bg: '#CECBF6', fg: '#26215C' },
                  { handle: 'devon', pct: 0.24, bg: '#F5C4B3', fg: '#4A1B0C' },
                  { handle: 'luna_k', pct: 0.19, bg: '#C0DD97', fg: '#173404' },
                  { handle: 'theo.tv', pct: 0.14, bg: '#B5D4F4', fg: '#042C53' },
                  { handle: 'ada', pct: 0.12, bg: '#FAC775', fg: '#412402' },
                ].map((tc) => (
                  <div
                    key={tc.handle}
                    className="flex items-center gap-2.5 py-2 border-t border-[#2A2A2A]"
                  >
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-medium"
                      style={{ backgroundColor: tc.bg, color: tc.fg }}
                    >
                      {tc.handle[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-[13px] font-medium text-[#F5F3EC]">
                      @{tc.handle}
                    </div>
                    <div className="sub text-[12px]">{num(totalVerInst * tc.pct)} installs</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platforms Card */}
            <div className="card">
              <div className="font-medium text-[15px] text-[#F5F3EC]">Platforms</div>
              <div className="h-[12px] rounded-[6px] overflow-hidden flex mt-4 bg-[#242424]">
                <div
                  className="h-full bg-[#F5F3EC]"
                  style={{ width: `${ip * 100}%` }}
                />
                <div
                  className="h-full bg-[#C7F26B]"
                  style={{ width: `${(1 - ip) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[13px] mt-3.5">
                <span className="flex items-center gap-1.5 text-[#F5F3EC]">
                  <i className="ti ti-brand-apple" aria-hidden="true"></i>
                  <span>iOS</span>
                </span>
                <span className="text-[#F5F3EC]">{Math.round(ip * 100)}%</span>
              </div>

              <div className="flex justify-between items-center text-[13px] mt-2">
                <span className="flex items-center gap-1.5 text-[#F5F3EC]">
                  <i className="ti ti-player-play" aria-hidden="true"></i>
                  <span>Android</span>
                </span>
                <span className="text-[#F5F3EC]">{Math.round((1 - ip) * 100)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

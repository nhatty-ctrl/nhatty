import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';

interface CampaignAnalyticsViewProps {
  campaigns?: Campaign[];
  initialCampaignId?: string | null;
  onBack?: () => void;
  onNavigateCampaign?: (id: string) => void;
  onCreateCampaign?: () => void;
  onNavigateEarnings?: () => void;
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
  campaigns = [],
  initialCampaignId,
  onNavigateCampaign,
  onCreateCampaign,
  onNavigateEarnings,
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
  const [hoveredTip, setHoveredTip] = useState<{ label: string; v: number; m: number } | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  // Check if requested campaign is a creator-joined app
  const requestedApp = initialCampaignId
    ? campaigns.find((c) => c.id === initialCampaignId)
    : null;
  const isJoinedCreatorApp = requestedApp && requestedApp.joined && !FOUNDER_CAMPAIGNS.some((c) => c.id === initialCampaignId);

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

  const costPerInstall = totalSpend / (totalVerInst || 1);
  const conversionRate = (totalVerInst / (totalClicks || 1)) * 100;
  const hasData = totalVerInst > 0;

  // Build SVG Path for modern area graph
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 20;
  const paddingY = 25;

  const points = buckets.map((b, idx) => {
    const x = paddingX + (idx / (buckets.length - 1 || 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (b.v / (maxChartVal || 1)) * (svgHeight - paddingY * 2);
    return { x, y, b };
  });

  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      linePath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = svgHeight - paddingY;
    areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
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

      {/* Role / Ownership Notice if accessing a creator-joined app */}
      {isJoinedCreatorApp && requestedApp && (
        <div className="p-4 bg-[#1C1C1C] border border-[#388BFD]/40 rounded-[18px] text-[13px] text-[#F5F3EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-start gap-2.5">
            <i className="ti ti-info-circle text-[#388BFD] text-[20px] shrink-0 mt-0.5"></i>
            <div>
              <div className="font-medium text-[#F5F3EC]">
                Creator attribution summary for {requestedApp.name}
              </div>
              <div className="text-[#A8A69E] text-[12px] mt-0.5 leading-snug">
                You participate in {requestedApp.name}. Real-time individual creator referral payouts are tracked in Earnings.
              </div>
            </div>
          </div>
          {onNavigateEarnings && (
            <button
              type="button"
              onClick={onNavigateEarnings}
              className="pill on text-[12px] py-1.5 px-3.5 shrink-0 whitespace-nowrap cursor-pointer font-medium self-end sm:self-auto"
            >
              <i className="ti ti-coin"></i>
              <span>Go to Earnings</span>
            </button>
          )}
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono tracking-wider uppercase text-[#388BFD]">
            CAMPAIGN TELEMETRY
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.6px] text-[#F5F3EC] mt-0.5">
            {selCamp >= 0 ? `${FOUNDER_CAMPAIGNS[selCamp].n} analytics` : 'Campaign analytics'}
          </h1>
          <p className="text-[13.5px] text-[#A8A69E] mt-1">
            Real-time attribution telemetry, verification rates, and creator spend.
          </p>
        </div>

        {/* Date Range Chips */}
        <div className="flex gap-1.5 self-start sm:self-auto shrink-0 bg-[#161616] p-1 rounded-full border border-[#2A2A2A]">
          {[7, 30, 90].map((d) => (
            <button
              key={`range-${d}`}
              onClick={() => setRange(d)}
              className={`pill text-[12px] py-1.5 px-3.5 cursor-pointer border-0 ${
                range === d ? 'on font-medium' : 'bg-transparent text-[#A8A69E] hover:text-[#F5F3EC]'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Selector Pills */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setSelCamp(-1)}
          className={`chip text-[12px] py-1.5 px-3.5 cursor-pointer ${selCamp < 0 ? 'sel font-medium' : ''}`}
        >
          All campaigns
        </button>
        {FOUNDER_CAMPAIGNS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setSelCamp(i)}
            className={`chip text-[12px] py-1.5 px-3.5 cursor-pointer ${selCamp === i ? 'sel font-medium' : ''}`}
          >
            {c.n}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="card text-center py-16 px-6 bg-[#161616] border border-[#2A2A2A] rounded-[24px]">
          <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#A8A69E] flex items-center justify-center text-[22px] mx-auto mb-3">
            <i className="ti ti-chart-bar"></i>
          </div>
          <div className="text-[16px] font-medium text-[#F5F3EC]">No analytics data yet</div>
          <div className="text-[13px] text-[#A8A69E] mt-1 max-w-[420px] mx-auto">
            Create a campaign and distribute links to see verified install activity.
          </div>
          {onCreateCampaign && (
            <button
              type="button"
              onClick={onCreateCampaign}
              className="pill on mt-4 px-6 min-h-[42px] cursor-pointer font-medium"
            >
              Create campaign
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 4 INDEPENDENT TOP KPI CARDS TAKING UP FULL WIDTH (Like Earnings page cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Verified installs (Long block with highlight) */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                  <i className="ti ti-shield-check text-[16px] text-[#C7F26B]"></i>
                  <span className="font-medium text-[#F5F3EC]">Verified installs</span>
                </div>
                <span className="chip text-[11px] py-0.5 px-2 bg-[#C7F26B]/20 text-[#C7F26B] font-medium">
                  Active
                </span>
              </div>
              <div className="my-3">
                <div className="text-[34px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {num(totalVerInst)}
                </div>
              </div>
              <div className="text-[12px] text-[#C7F26B] leading-snug flex items-center gap-1 font-medium">
                <i className="ti ti-check text-[13px]"></i>
                <span>Fraud-shielded attribution SDK</span>
              </div>
            </div>

            {/* Card 2: Clicks */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                <i className="ti ti-pointer text-[16px] text-[#B5D4F4]"></i>
                <span className="font-medium text-[#F5F3EC]">Attribution clicks</span>
              </div>
              <div className="my-3">
                <div className="text-[34px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {num(totalClicks)}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                {conversionRate.toFixed(1)}% verified conversion rate
              </div>
            </div>

            {/* Card 3: Spend */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                <i className="ti ti-currency-dollar text-[16px] text-[#FAC775]"></i>
                <span className="font-medium text-[#F5F3EC]">Total creator spend</span>
              </div>
              <div className="my-3">
                <div className="text-[34px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {money(totalSpend)}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                Across {selCamp >= 0 ? FOUNDER_CAMPAIGNS[selCamp].n : 'all active campaigns'}
              </div>
            </div>

            {/* Card 4: Cost per install (Clean block without icon as requested) */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="text-[13px] text-[#A8A69E] font-medium text-[#F5F3EC]">
                Cost per verified install
              </div>
              <div className="my-3">
                <div className="text-[34px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {money(costPerInstall)}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                Average guaranteed creator bounty
              </div>
            </div>
          </div>

          {/* HIGH-END ELEGANT AREA CHART (Replacing clunky bar graph) */}
          <div className="card p-5 sm:p-6 bg-[#161616] border border-[#2A2A2A] rounded-[20px] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A2A]">
              <div>
                <h2 className="text-[17px] font-medium text-[#F5F3EC]">Verified Installs Over Time</h2>
                <p className="text-[12px] text-[#A8A69E] mt-0.5">
                  Smoothed attribution volume matching your selected {range}-day telemetry period.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDataTable(!showDataTable)}
                  className="pill text-[12px] py-1 px-3 cursor-pointer text-[#A8A69E] hover:text-[#F5F3EC] flex items-center gap-1.5"
                >
                  <i className={`ti ${showDataTable ? 'ti-chart-area-line' : 'ti-table'}`}></i>
                  <span>{showDataTable ? 'Show area graph' : 'Show data table'}</span>
                </button>
              </div>
            </div>

            {!showDataTable ? (
              <div className="relative pt-2">
                {/* Chart Header Meta */}
                <div className="flex items-center justify-between text-[12px] text-[#A8A69E] mb-2 px-1">
                  <span>Volume Curve</span>
                  <span className="font-mono text-[#F5F3EC]">Peak bucket: {num(maxChartVal)} installs</span>
                </div>

                {/* SVG Area Graph */}
                <div className="w-full bg-[#121212] rounded-[16px] p-3 sm:p-5 border border-[#222] overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-[220px] overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#388BFD" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#388BFD" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#388BFD" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Subtle Horizontal Grid lines */}
                    {[0.25, 0.5, 0.75].map((factor, i) => {
                      const yVal = svgHeight - paddingY - factor * (svgHeight - paddingY * 2);
                      return (
                        <line
                          key={i}
                          x1={paddingX}
                          y1={yVal}
                          x2={svgWidth - paddingX}
                          y2={yVal}
                          stroke="#2A2A2A"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Gradient Fill Area */}
                    {areaPath && <path d={areaPath} fill="url(#analyticsGradient)" />}

                    {/* Glowing Stroke Line */}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#388BFD"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Interactive Data Points */}
                    {points.map((pt, idx) => (
                      <g key={idx} className="cursor-pointer group">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#0E0E0E"
                          stroke="#388BFD"
                          strokeWidth="2"
                          className="transition-all duration-150 group-hover:r-6 group-hover:fill-[#388BFD]"
                          onMouseEnter={() => setHoveredTip({ label: pt.b.label, v: pt.b.v, m: pt.b.m })}
                          onMouseLeave={() => setHoveredTip(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Hover Tooltip display */}
                  <div className="h-6 flex items-center justify-center mt-2 text-[12.5px] font-mono text-[#F5F3EC]">
                    {hoveredTip ? (
                      <span className="bg-[#1C1C1C] px-3 py-1 rounded-full border border-[#333] shadow-md animate-[fade-in_0.1s_ease-out]">
                        {hoveredTip.label} · <strong className="text-[#388BFD]">{num(hoveredTip.v)} installs</strong> ({money(hoveredTip.m)} spend)
                      </span>
                    ) : (
                      <span className="text-[#666]">Hover over data points to inspect attribution details</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Data Table View */
              <div className="overflow-x-auto pt-1">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#2A2A2A] text-[#A8A69E]">
                      <th className="pb-2 font-medium">Interval Window</th>
                      <th className="pb-2 font-medium">Verified Installs</th>
                      <th className="pb-2 font-medium">Attribution Spend</th>
                      <th className="pb-2 font-medium text-right">Avg Bounty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {buckets.map((b, i) => (
                      <tr key={i} className="hover:bg-[#1C1C1C]/40">
                        <td className="py-2.5 font-mono text-[#F5F3EC]">{b.label}</td>
                        <td className="py-2.5 font-medium text-[#F5F3EC]">{num(b.v)}</td>
                        <td className="py-2.5 font-mono text-[#388BFD]">{money(b.m)}</td>
                        <td className="py-2.5 font-mono text-right text-[#A8A69E]">
                          {money(b.m / (b.v || 1))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

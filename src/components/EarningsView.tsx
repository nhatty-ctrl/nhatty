import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';

interface EarningsViewProps {
  campaigns?: Campaign[];
  onNavigateCampaign?: (id: string) => void;
  onBack?: () => void;
  onWithdraw?: () => void;
  onBrowseCampaigns?: () => void;
}

const TODAY = new Date(2026, 9, 2);

const CREATOR_CAMPAIGN_DATA = [
  {
    id: 'pixelpop',
    n: 'Pixel Pop',
    cat: 'Games',
    bg: '#CECBF6',
    fg: '#26215C',
    ic: 'ti-device-gamepad-2',
    pay: 1.8,
    eb: 6,
  },
  {
    id: 'stride',
    n: 'Stride',
    cat: 'Health',
    bg: '#F5C4B3',
    fg: '#4A1B0C',
    ic: 'ti-heart',
    pay: 2.9,
    eb: 3,
  },
  {
    id: 'focusly',
    n: 'Focusly',
    cat: 'Productivity',
    bg: '#B5D4F4',
    fg: '#042C53',
    ic: 'ti-bolt',
    pay: 2.1,
    eb: 2,
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

const E = CREATOR_CAMPAIGN_DATA.map((c, i) => master(i, c.eb, 7));
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

export const EarningsView: React.FC<EarningsViewProps> = ({
  onNavigateCampaign,
  onWithdraw,
  onBrowseCampaigns,
  onBack,
}) => {
  const [range, setRange] = useState<number>(30);
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  // Available accumulated balance state
  const [availableBalance, setAvailableBalance] = useState<number>(248.60);

  // In-page Withdrawal Flow states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<number>(1);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('248.60');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'card' | 'usdc'>('bank');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<any | null>(null);

  const [payoutsHistory, setPayoutsHistory] = useState([
    { id: 'PO-2026-1002', date: 'Oct 9, 2026', status: 'Awaiting payout', val: 78.4, bg: '#FAC775', fg: '#412402', icon: 'ti-clock' },
    { id: 'PO-2026-0925', date: 'Oct 2, 2026', status: 'Paid', val: 142.2, bg: '#C0DD97', fg: '#173404', icon: 'ti-check' },
    { id: 'PO-2026-0918', date: 'Sep 25, 2026', status: 'Paid', val: 189.5, bg: '#C0DD97', fg: '#173404', icon: 'ti-check' },
    { id: 'PO-2026-0911', date: 'Sep 18, 2026', status: 'Paid', val: 112.0, bg: '#C0DD97', fg: '#173404', icon: 'ti-check' },
  ]);

  const getBuckets = () => {
    const nb = NB[range] || 15;
    const bs = range / nb;
    const out: { v: number; m: number; ago: number; bs: number; label: string }[] = [];

    for (let k = 0; k < nb; k++) {
      const newest = (nb - 1 - k) * bs;
      const oldest = newest + bs - 1;
      let v = 0;
      let m = 0;

      CREATOR_CAMPAIGN_DATA.forEach((c, i) => {
        const s = sum(E[i], newest, oldest);
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
    maxChartVal = Math.max(maxChartVal, b.m);
  });

  let totEarnings = 0;
  let paidEarnings = 0;
  let pendEarnings = 0;
  let verEarnings = 0;

  CREATOR_CAMPAIGN_DATA.forEach((c, i) => {
    totEarnings += sum(E[i], 0, range - 1) * c.pay;
    verEarnings += sum(E[i], 0, Math.min(6, range - 1)) * c.pay;
    if (range > 7) pendEarnings += sum(E[i], 7, Math.min(13, range - 1)) * c.pay;
    if (range > 14) paidEarnings += sum(E[i], 14, range - 1) * c.pay;
  });

  const hasEarnings = totEarnings > 0 || availableBalance > 0;
  const canWithdraw = availableBalance >= 20;

  // Start withdrawal flow
  const handleStartWithdrawFlow = () => {
    setWithdrawAmount(availableBalance.toFixed(2));
    setWithdrawStep(1);
    setWithdrawalSuccess(null);
    setIsWithdrawOpen(true);
  };

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount) || availableBalance;
    if (amountNum < 20 || amountNum > availableBalance) return;

    setIsProcessingWithdraw(true);
    setTimeout(() => {
      setIsProcessingWithdraw(false);
      const newBalance = Math.max(0, availableBalance - amountNum);
      setAvailableBalance(newBalance);

      const newRecord = {
        id: `PO-${Date.now().toString().slice(-6)}`,
        date: 'Oct 9, 2026',
        status: 'Awaiting payout',
        val: amountNum,
        bg: '#FAC775',
        fg: '#412402',
        icon: 'ti-clock',
      };
      setPayoutsHistory((prev) => [newRecord, ...prev]);

      setWithdrawalSuccess({
        id: newRecord.id,
        amount: amountNum,
        method:
          withdrawMethod === 'bank'
            ? 'Chase Checking (••••5821)'
            : withdrawMethod === 'card'
            ? 'Visa Debit (••••4242)'
            : 'Polygon USDC (0x71C...4e8B)',
        settleDate: 'Friday, Oct 9, 2026 at 17:00 UTC',
      });
      setWithdrawStep(3);
    }, 800);
  };

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: 'Earnings', icon: 'ti-coin', active: true },
        ]}
      />

      {/* Title & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="sub text-[12px] uppercase tracking-wider font-mono">
            Settlement dashboard
          </div>
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC] mt-0.5">
            Earnings
          </h1>
          <p className="text-[13px] text-[#9A9892] mt-1">
            Understand money owed, pending verification holds, and execute withdrawals as earnings accumulate.
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

      {!hasEarnings ? (
        /* Empty State */
        <div className="card text-center py-14 px-6 space-y-3 bg-[#161616] border border-[#2A2A2A] rounded-[24px]">
          <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#9A9892] flex items-center justify-center text-[22px] mx-auto">
            <i className="ti ti-coin"></i>
          </div>
          <div>
            <div className="text-[16px] font-medium text-[#F5F3EC]">No earnings yet</div>
            <div className="text-[13px] text-[#9A9892] mt-1 max-w-[420px] mx-auto leading-relaxed">
              Join an open campaign to get your tracking link and start earning per verified install.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBrowseCampaigns}
              className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
            >
              Browse campaigns
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Main Accrued Earnings Banner with Live Accumulated Balance & Start Withdrawal Flow */}
          <div className="bg-[#161616] rounded-[20px] p-5 border border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="sub text-[12px]">Available balance to withdraw</div>
              <div className="text-[36px] font-medium tracking-[-0.8px] text-[#F5F3EC] mt-0.5">
                ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[12px] text-[#C7F26B] flex items-center gap-1.5 mt-1 font-medium">
                <i className="ti ti-calendar" aria-hidden="true"></i>
                <span>Weekly settlement every Friday at 17:00 UTC · Minimum $20</span>
              </div>
            </div>

            {/* WITHDRAW ACTION BUTTON (Triggers the multi-step withdrawal flow) */}
            <div className="flex flex-col sm:items-end gap-1.5">
              {canWithdraw ? (
                <button
                  type="button"
                  onClick={handleStartWithdrawFlow}
                  className="pill on min-h-[44px] px-5 shadow-sm cursor-pointer font-medium"
                >
                  <i className="ti ti-arrow-down-right" aria-hidden="true"></i>
                  <span>Withdraw funds</span>
                </button>
              ) : (
                <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-full px-4 py-2 text-[12px] text-[#9A9892] flex items-center gap-2">
                  <i className="ti ti-lock text-[13px]"></i>
                  <span>${availableBalance.toFixed(2)} / $20.00 minimum required</span>
                </div>
              )}
              <span className="sub text-[11px]">Direct transfer to default payout method</span>
            </div>
          </div>

          {/* IN-PAGE EMBEDDED WITHDRAWAL FLOW */}
          {isWithdrawOpen && (
            <div className="card border border-[#C7F26B]/50 bg-[#161616] rounded-[24px] p-5 sm:p-6 space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#C7F26B] text-[#16140F] flex items-center justify-center font-medium text-[14px]">
                    <i className="ti ti-arrow-down-right"></i>
                  </span>
                  <div>
                    <h2 className="text-[17px] font-medium text-[#F5F3EC]">Withdrawal flow</h2>
                    <p className="sub text-[11px]">Transfer verified creator earnings to your account.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
                  aria-label="Close withdrawal flow"
                >
                  <i className="ti ti-x text-[14px]"></i>
                </button>
              </div>

              {withdrawStep === 1 && (
                /* Step 1: Amount & Destination */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setWithdrawStep(2);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="fl" htmlFor="withdraw-amt">Amount to withdraw (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9892] font-mono text-[14px]">
                        $
                      </span>
                      <input
                        id="withdraw-amt"
                        type="number"
                        min="20"
                        max={availableBalance}
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="in pl-8 min-h-[44px]"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount('20.00')}
                        className="pill text-[11px] py-1 px-2.5"
                      >
                        Min ($20)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount((availableBalance / 2).toFixed(2))}
                        className="pill text-[11px] py-1 px-2.5"
                      >
                        50% (${(availableBalance / 2).toFixed(2)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                        className="pill text-[11px] py-1 px-2.5"
                      >
                        100% (${availableBalance.toFixed(2)})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="fl">Select payout destination</label>
                    <div className="space-y-2 pt-1">
                      {[
                        { id: 'bank', name: 'Chase Bank · Checking •••• 5821', desc: 'ACH transfer · 1 to 2 business days', icon: 'ti-building-bank', bg: '#B5D4F4', fg: '#042C53' },
                        { id: 'card', name: 'Visa Debit •••• 4242', desc: 'Instant transfer on Friday settlement', icon: 'ti-credit-card', bg: '#FAC775', fg: '#412402' },
                        { id: 'usdc', name: 'Polygon USDC Wallet · 0x71C...4e8B', desc: 'Direct on-chain payout with zero fees', icon: 'ti-coin', bg: '#C0DD97', fg: '#173404' },
                      ].map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setWithdrawMethod(m.id as any)}
                          className={`p-3 rounded-[16px] border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            withdrawMethod === m.id
                              ? 'border-[#C7F26B] bg-[#1E1E1E]'
                              : 'border-[#2A2A2A] bg-[#181818] hover:bg-[#1C1C1C]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] shrink-0"
                              style={{ backgroundColor: m.bg, color: m.fg }}
                            >
                              <i className={`ti ${m.icon}`}></i>
                            </span>
                            <div>
                              <div className="text-[14px] font-medium text-[#F5F3EC]">{m.name}</div>
                              <div className="text-[12px] text-[#9A9892]">{m.desc}</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            withdrawMethod === m.id ? 'border-[#C7F26B] bg-[#C7F26B]' : 'border-[#444]'
                          }`}>
                            {withdrawMethod === m.id && <i className="ti ti-check text-[11px] text-[#16140F]"></i>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawOpen(false)}
                      className="pill min-h-[40px] px-4 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="pill on min-h-[40px] px-5 cursor-pointer font-medium"
                    >
                      Review withdrawal
                    </button>
                  </div>
                </form>
              )}

              {withdrawStep === 2 && (
                /* Step 2: Review and Schedule */
                <div className="space-y-4">
                  <div className="bg-[#1C1C1C] rounded-[16px] p-4 border border-[#2A2A2A]/40 space-y-2 text-[13px]">
                    <div className="flex justify-between text-[#9A9892]">
                      <span>Amount requested</span>
                      <span className="font-mono text-[#F5F3EC]">${parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#9A9892]">
                      <span>Transfer fee</span>
                      <span className="font-mono text-[#C7F26B]">$0.00 (Zero fee)</span>
                    </div>
                    <div className="flex justify-between text-[#9A9892]">
                      <span>Destination</span>
                      <span className="text-[#F5F3EC]">
                        {withdrawMethod === 'bank'
                          ? 'Chase Checking (••••5821)'
                          : withdrawMethod === 'card'
                          ? 'Visa Debit (••••4242)'
                          : 'Polygon USDC (0x71C...4e8B)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#9A9892]">
                      <span>Release schedule</span>
                      <span className="text-[#F5F3EC]">Friday, Oct 9 at 17:00 UTC</span>
                    </div>
                    <div className="border-t border-[#2A2A2A] pt-2 flex justify-between font-medium text-[15px] text-[#F5F3EC]">
                      <span>Net withdrawal</span>
                      <span className="font-mono text-[#C7F26B]">${parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawStep(1)}
                      className="pill min-h-[40px] px-4 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmWithdraw}
                      disabled={isProcessingWithdraw}
                      className="pill on min-h-[40px] px-5 cursor-pointer font-medium disabled:opacity-50"
                    >
                      <i className={`ti ${isProcessingWithdraw ? 'ti-loader-2 spin' : 'ti-check'}`}></i>
                      <span>{isProcessingWithdraw ? 'Authorizing transfer...' : 'Confirm withdrawal'}</span>
                    </button>
                  </div>
                </div>
              )}

              {withdrawStep === 3 && withdrawalSuccess && (
                /* Step 3: Success Confirmation Ticket */
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#C7F26B] text-[#16140F] inline-flex items-center justify-center text-[24px]">
                    <i className="ti ti-check"></i>
                  </div>
                  <div>
                    <h3 className="text-[18px] font-medium text-[#F5F3EC]">Withdrawal initiated</h3>
                    <p className="text-[13px] text-[#9A9892] mt-1 max-w-[380px] mx-auto">
                      ${withdrawalSuccess.amount.toFixed(2)} is scheduled for release to {withdrawalSuccess.method} on {withdrawalSuccess.settleDate}.
                    </p>
                  </div>

                  <div className="bg-[#1C1C1C] rounded-[14px] p-3 text-[12px] font-mono text-[#9A9892] inline-block">
                    Reference ID: {withdrawalSuccess.id}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawOpen(false)}
                      className="pill on min-h-[40px] px-6 cursor-pointer font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4-Stat Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-[#161616] rounded-[20px] p-4 border border-[#2A2A2A]/40">
            <div className="p-2 sm:px-3 border-r border-[#2A2A2A]/60">
              <div className="sub text-[11px]">Paid out</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#F5F3EC] mt-0.5">
                {money(paidEarnings)}
              </div>
            </div>
            <div className="p-2 sm:px-3 sm:border-r border-[#2A2A2A]/60">
              <div className="sub text-[11px]">Awaiting payout</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#FAC775] mt-0.5">
                {money(pendEarnings)}
              </div>
            </div>
            <div className="p-2 sm:px-3 border-r border-[#2A2A2A]/60">
              <div className="sub text-[11px]">Verifying hold</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#B9B7AF] mt-0.5">
                {money(verEarnings)}
              </div>
            </div>
            <div className="p-2 sm:px-3">
              <div className="sub text-[11px]">Next settlement</div>
              <div className="text-[22px] font-medium tracking-[-0.4px] text-[#C7F26B] mt-0.5">
                Friday, Oct 9
              </div>
            </div>
          </div>

          {/* Earnings Over Time Bar Chart Card */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="font-medium text-[15px] text-[#F5F3EC]">Earnings over time</div>
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
                      <th className="py-2 px-2 font-normal text-right">Earnings</th>
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
                    const pctHeight = Math.max(4, Math.round((b.m / (maxChartVal || 1)) * 100));
                    return (
                      <div
                        key={`b-${i}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`${b.label}: ${num(b.v)} installs, ${money(b.m)}`}
                        onClick={() => setHoveredTip(`${b.label} · ${num(b.v)} installs · ${money(b.m)}`)}
                        onMouseEnter={() => setHoveredTip(`${b.label} · ${num(b.v)} installs · ${money(b.m)}`)}
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

          {/* By Campaign Breakdown Card */}
          <div className="card">
            <div className="font-medium text-[15px] text-[#F5F3EC]">By campaign</div>
            <div className="space-y-1 mt-2">
              {CREATOR_CAMPAIGN_DATA.map((c, i) => {
                const inst = sum(E[i], 0, range - 1);
                const e = inst * c.pay;
                const pct = Math.round((e / (totEarnings || 1)) * 100);
                return (
                  <div
                    key={c.id}
                    onClick={() => onNavigateCampaign && onNavigateCampaign(c.id)}
                    className="flex items-center gap-3 py-3 border-t border-[#2A2A2A] hover:bg-[#1C1C1C] rounded-[14px] px-2 -mx-2 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center text-[18px] shrink-0"
                      style={{ backgroundColor: c.bg, color: c.fg }}
                    >
                      <i className={`ti ${c.ic}`} aria-hidden="true"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[#F5F3EC]">{c.n}</div>
                      <div className="sub text-[12px]">
                        {num(inst)} verified installs at {money(c.pay)}
                      </div>
                      <div className="h-[6px] rounded-[3px] bg-[#242424] overflow-hidden mt-1.5 w-full">
                        <div
                          className="h-full rounded-[3px]"
                          style={{ width: `${pct}%`, backgroundColor: c.bg }}
                        />
                      </div>
                    </div>
                    <div className="text-[15px] font-medium text-[#F5F3EC]">{money(e)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payouts Table Card */}
          <div className="card">
            <div className="font-medium text-[15px] text-[#F5F3EC]">Payout history</div>
            <div className="space-y-1 mt-2">
              {payoutsHistory.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5 border-t border-[#2A2A2A]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#F5F3EC]">{p.date}</div>
                    <div className="sub text-[12px]">Weekly settlement at 17:00 UTC · {p.id}</div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[12px] font-medium flex items-center gap-1 shrink-0"
                    style={{ backgroundColor: p.bg, color: p.fg }}
                  >
                    <i className={`ti ${p.icon}`} aria-hidden="true"></i>
                    <span>{p.status}</span>
                  </span>
                  <div className="text-[15px] font-medium text-[#F5F3EC] min-w-[84px] text-right">
                    {money(p.val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

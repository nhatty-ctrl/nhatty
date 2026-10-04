import React, { useState } from 'react';
import { Campaign, WithdrawalReceipt, SettlementReceipt } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import { ReceiptModal } from './ReceiptModal';
import { KredTelemetryBarChart } from './KredTelemetryBarChart';

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

  // Payout method tab toggle in Payouts card (matching image.png)
  const [payoutTab, setPayoutTab] = useState<'email' | 'wallet'>('email');

  // In-page Withdrawal Flow states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<number>(1);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('248.60');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'card' | 'usdc'>('bank');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<any | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<WithdrawalReceipt | SettlementReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [payoutsHistory, setPayoutsHistory] = useState([
    { id: 'PO-2026-1009', date: 'Oct 9, 2026', daysAgo: -7, status: 'Awaiting payout', val: 78.4, bg: '#FAC775', fg: '#412402', icon: 'ti-clock' },
    { id: 'PO-2026-1002', date: 'Oct 2, 2026', daysAgo: 0, status: 'Paid', val: 142.2, bg: '#C0DD97', fg: '#173404', icon: 'ti-check' },
    { id: 'PO-2026-0925', date: 'Sep 25, 2026', daysAgo: 7, status: 'Paid', val: 189.5, bg: '#C0DD97', fg: '#173404', icon: 'ti-check' },
    { id: 'PO-2026-0918', date: 'Sep 18, 2026', daysAgo: 14, status: 'Paid', val: 112.0, bg: '#C0DD97', fg: '#173404', icon: 'ti-check' },
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
  let verEarnings = 0;

  CREATOR_CAMPAIGN_DATA.forEach((c, i) => {
    totEarnings += sum(E[i], 0, range - 1) * c.pay;
    verEarnings += sum(E[i], 0, Math.min(6, range - 1)) * c.pay;
  });

  // Calculate Paid Out directly and consistently from the payouts ledger for the selected date range
  const paidEarnings = payoutsHistory
    .filter((p) => p.status === 'Paid' && (p.daysAgo === undefined || p.daysAgo <= range - 1))
    .reduce((acc, p) => acc + p.val, 0);

  const pendEarnings = payoutsHistory
    .filter((p) => p.status === 'Awaiting payout')
    .reduce((acc, p) => acc + p.val, 0);

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
        daysAgo: -7,
        status: 'Awaiting payout',
        val: amountNum,
        bg: '#FAC775',
        fg: '#412402',
        icon: 'ti-clock',
      };
      setPayoutsHistory((prev) => [newRecord, ...prev]);

      const destLabel =
        withdrawMethod === 'bank'
          ? 'Chase Checking (••••5821)'
          : withdrawMethod === 'card'
          ? 'Visa Debit (••••4242)'
          : 'Polygon USDC (0x71C...4e8B)';

      setWithdrawalSuccess({
        id: newRecord.id,
        amount: amountNum,
        method: destLabel,
        settleDate: 'Friday, Oct 9, 2026 at 17:00 UTC',
      });

      const receiptObj: WithdrawalReceipt = {
        id: newRecord.id,
        amount: amountNum,
        fee: 0,
        net: amountNum,
        destination: destLabel,
        methodType: withdrawMethod,
        timestamp: new Date().toISOString(),
        status: 'completed',
        hash: `0x${Array.from({ length: 40 })
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`,
        creatorHandle: 'alex',
        settlementBatch: 'Friday Oct 09, 17:00 UTC',
      };
      setActiveReceipt(receiptObj);
      setWithdrawStep(3);
    }, 800);
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: 'Earnings', icon: 'ti-coin', active: true },
        ]}
      />

      {/* Title & Date Range Filter (Matching image.png layout) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] sm:text-[34px] font-semibold tracking-[-0.6px] text-[#F5F3EC]">
            Earnings
          </h1>
          <p className="text-[13.5px] text-[#A8A69E] mt-1">
            What your links brought in, what's on hold, and where payouts go.
          </p>
        </div>

        {/* Date range filter segmented controls */}
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

      {!hasEarnings ? (
        /* Empty State */
        <div className="card text-center py-14 px-6 space-y-3 bg-[#161616] border border-[#2A2A2A] rounded-[24px]">
          <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#A8A69E] flex items-center justify-center text-[22px] mx-auto">
            <i className="ti ti-coin"></i>
          </div>
          <div>
            <div className="text-[16px] font-medium text-[#F5F3EC]">No earnings yet</div>
            <div className="text-[13px] text-[#A8A69E] mt-1 max-w-[420px] mx-auto leading-relaxed">
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
          {/* Top 4 Stat Cards in a spacious Grid (Exact visual match to image.png) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Earned */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                <i className="ti ti-coin text-[16px] text-[#C0DD97]"></i>
                <span className="font-medium text-[#F5F3EC]">Earned</span>
                <span className="text-[11px] text-[#A8A69E]">({range}d)</span>
              </div>
              <div className="my-3">
                <div className="text-[32px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {money(totEarnings)}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                your verified install bounty in this period
              </div>
            </div>

            {/* Card 2: Available */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                  <i className="ti ti-wallet text-[16px] text-[#C7F26B]"></i>
                  <span className="font-medium text-[#F5F3EC]">Available</span>
                </div>
                {canWithdraw && (
                  <span className="w-2 h-2 rounded-full bg-[#C7F26B]" title="Ready to withdraw" />
                )}
              </div>
              <div className="my-3">
                <div className="text-[32px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                paid out once you clear $20.00
              </div>
            </div>

            {/* Card 3: On hold */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                <i className="ti ti-clock text-[16px] text-[#FAC775]"></i>
                <span className="font-medium text-[#F5F3EC]">On hold</span>
              </div>
              <div className="my-3">
                <div className="text-[32px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {money(verEarnings)}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                clears 14 days after each install
              </div>
            </div>

            {/* Card 4: Sent / Paid */}
            <div className="card p-5 bg-[#161616] border border-[#2A2A2A] rounded-[18px] flex flex-col justify-between transition-colors hover:border-[#383838]">
              <div className="flex items-center gap-2 text-[13px] text-[#A8A69E]">
                <i className="ti ti-circle-check text-[16px] text-[#B5D4F4]"></i>
                <span className="font-medium text-[#F5F3EC]">Sent</span>
                <span className="text-[11px] text-[#A8A69E]">({range}d)</span>
              </div>
              <div className="my-3">
                <div className="text-[32px] font-semibold tracking-[-0.8px] text-[#F5F3EC] font-mono">
                  {money(paidEarnings)}
                </div>
              </div>
              <div className="text-[12px] text-[#A8A69E] leading-snug">
                transfers submitted or confirmed
              </div>
            </div>
          </div>

          {/* Image 1 Graph: Telemetry & Verified Install Runs */}
          <KredTelemetryBarChart
            title="Let’s look at your latest runs and verified earnings across campaigns."
            pillLabel="Read attribution telemetry · Verified runs"
            icon="ti-heart-filled"
            barColor="#F4C0D1"
            badgeBg="#F4C0D1"
            badgeFg="#4B1528"
            bountyPrice={2.5}
          />

          {/* IN-PAGE EMBEDDED WITHDRAWAL FLOW MODAL / BANNER */}
          {isWithdrawOpen && (
            <div className="card border border-[#C7F26B]/50 bg-[#161616] rounded-[24px] p-5 sm:p-6 space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#C7F26B] text-[#16140F] flex items-center justify-center font-medium text-[14px]">
                    <i className="ti ti-arrow-down-right"></i>
                  </span>
                  <div>
                    <h2 className="text-[17px] font-medium text-[#F5F3EC]">Withdrawal flow</h2>
                    <p className="sub text-[11px] text-[#A8A69E]">Transfer verified creator earnings to your destination.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#A8A69E] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
                  aria-label="Close withdrawal flow"
                >
                  <i className="ti ti-x text-[14px]"></i>
                </button>
              </div>

              {withdrawStep === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setWithdrawStep(2);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="fl text-[#A8A69E]" htmlFor="withdraw-amt">Amount to withdraw (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A69E] font-mono text-[14px]">
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
                        Half (${(availableBalance / 2).toFixed(2)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                        className="pill text-[11px] py-1 px-2.5 on"
                      >
                        Max (${availableBalance.toFixed(2)})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="fl text-[#A8A69E]">Destination payout rail</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('bank')}
                        className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                          withdrawMethod === 'bank'
                            ? 'border-[#C7F26B] bg-[#1C1C1C]'
                            : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                        }`}
                      >
                        <div>
                          <div className="text-[13px] font-medium text-[#F5F3EC]">Chase Checking</div>
                          <div className="text-[11px] text-[#A8A69E]">••••5821</div>
                        </div>
                        <i className="ti ti-building-bank text-[18px] text-[#A8A69E]"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('card')}
                        className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                          withdrawMethod === 'card'
                            ? 'border-[#C7F26B] bg-[#1C1C1C]'
                            : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                        }`}
                      >
                        <div>
                          <div className="text-[13px] font-medium text-[#F5F3EC]">Visa Debit</div>
                          <div className="text-[11px] text-[#A8A69E]">••••4242</div>
                        </div>
                        <i className="ti ti-credit-card text-[18px] text-[#A8A69E]"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawMethod('usdc')}
                        className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                          withdrawMethod === 'usdc'
                            ? 'border-[#C7F26B] bg-[#1C1C1C]'
                            : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                        }`}
                      >
                        <div>
                          <div className="text-[13px] font-medium text-[#F5F3EC]">Polygon USDC</div>
                          <div className="text-[11px] text-[#A8A69E]">0x71C...4e8B</div>
                        </div>
                        <i className="ti ti-currency-dollar text-[18px] text-[#C7F26B]"></i>
                      </button>
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
                <div className="space-y-4">
                  <div className="bg-[#1C1C1C] rounded-[16px] p-4 border border-[#2A2A2A]/40 space-y-2 text-[13px]">
                    <div className="flex justify-between text-[#A8A69E]">
                      <span>Amount requested</span>
                      <span className="font-mono text-[#F5F3EC]">${parseFloat(withdrawAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#A8A69E]">
                      <span>Transfer fee</span>
                      <span className="font-mono text-[#C7F26B]">$0.00 (Zero fee)</span>
                    </div>
                    <div className="flex justify-between text-[#A8A69E]">
                      <span>Destination</span>
                      <span className="text-[#F5F3EC]">
                        {withdrawMethod === 'bank'
                          ? 'Chase Checking (••••5821)'
                          : withdrawMethod === 'card'
                          ? 'Visa Debit (••••4242)'
                          : 'Polygon USDC (0x71C...4e8B)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#A8A69E]">
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
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#C7F26B] text-[#16140F] inline-flex items-center justify-center text-[24px]">
                    <i className="ti ti-check"></i>
                  </div>
                  <div className="text-[20px] font-medium text-[#F5F3EC]">
                    ${withdrawalSuccess.amount.toFixed(2)} withdrawal requested
                  </div>
                  <div className="text-[13px] text-[#A8A69E] max-w-[420px] mx-auto">
                    Settlement {withdrawalSuccess.id} sent to {withdrawalSuccess.method}. Releases on {withdrawalSuccess.settleDate}.
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="pill on min-h-[40px] px-5 cursor-pointer font-medium flex items-center gap-1.5"
                    >
                      <i className="ti ti-receipt"></i>
                      <span>View animated receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWithdrawOpen(false)}
                      className="pill min-h-[40px] px-5 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Middle Two-Card Row (Exact visual architecture of Products & Payouts in image.png) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card: Campaigns & Bounties (Matching "Products" card) */}
            <div className="lg:col-span-7 card p-5 sm:p-6 bg-[#161616] border border-[#2A2A2A] rounded-[20px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
                  <div>
                    <h2 className="text-[17px] font-medium text-[#F5F3EC]">Campaigns & Bounties</h2>
                    <p className="text-[12px] text-[#A8A69E] mt-0.5">Verified install revenue by participating app</p>
                  </div>
                  <button
                    type="button"
                    onClick={onBrowseCampaigns}
                    className="pill text-[12px] py-1 px-3 cursor-pointer text-[#A8A69E] hover:text-[#F5F3EC]"
                  >
                    Browse open
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  {CREATOR_CAMPAIGN_DATA.map((c, i) => {
                    const inst = sum(E[i], 0, range - 1);
                    const e = inst * c.pay;
                    const pct = Math.round((e / (totEarnings || 1)) * 100);

                    return (
                      <div
                        key={c.id}
                        onClick={() => onNavigateCampaign && onNavigateCampaign(c.id)}
                        className="flex items-center gap-3.5 p-3 rounded-[14px] bg-[#1C1C1C] border border-[#2A2A2A]/40 hover:border-[#383838] transition-colors cursor-pointer"
                      >
                        <div
                          className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-[20px] shrink-0"
                          style={{ backgroundColor: c.bg, color: c.fg }}
                        >
                          <i className={`ti ${c.ic}`} aria-hidden="true"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-[#F5F3EC] truncate">{c.n}</span>
                            <span className="text-[14px] font-mono font-medium text-[#F5F3EC]">{money(e)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[12px] text-[#A8A69E] mt-0.5">
                            <span>{num(inst)} installs · {c.cat}</span>
                            <span>${c.pay.toFixed(2)}/install</span>
                          </div>
                          <div className="h-[4px] rounded-full bg-[#242424] overflow-hidden mt-2 w-full">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.max(4, pct)}%`, backgroundColor: c.bg }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] mt-4 flex items-center justify-between text-[12px] text-[#A8A69E]">
                <span>Total funded installs: {num(CREATOR_CAMPAIGN_DATA.reduce((acc, c, i) => acc + sum(E[i], 0, range - 1), 0))}</span>
                <span className="text-[#C7F26B] font-medium font-mono">${money(totEarnings)} total</span>
              </div>
            </div>

            {/* Right Card: Payouts (Matching "Payouts" card in image.png) */}
            <div className="lg:col-span-5 card p-5 sm:p-6 bg-[#161616] border border-[#2A2A2A] rounded-[20px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
                  <h2 className="text-[17px] font-medium text-[#F5F3EC]">Payouts</h2>
                  <span className="chip text-[11px] py-0.5 px-2.5 bg-[#C7F26B]/20 text-[#C7F26B] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C7F26B]" />
                    <span>USDC · paid once you clear $20</span>
                  </span>
                </div>

                {/* Segmented Control for Payout Mode (matching image.png) */}
                <div className="mt-4">
                  <div className="inline-flex bg-[#1C1C1C] p-1 rounded-[12px] border border-[#2A2A2A]">
                    <button
                      type="button"
                      onClick={() => setPayoutTab('email')}
                      className={`text-[12px] font-medium py-1 px-3 rounded-[9px] cursor-pointer border-0 transition-colors ${
                        payoutTab === 'email' ? 'bg-[#F5F3EC] text-[#0B0B0B]' : 'bg-transparent text-[#A8A69E] hover:text-[#F5F3EC]'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutTab('wallet')}
                      className={`text-[12px] font-medium py-1 px-3 rounded-[9px] cursor-pointer border-0 transition-colors ${
                        payoutTab === 'wallet' ? 'bg-[#F5F3EC] text-[#0B0B0B]' : 'bg-transparent text-[#A8A69E] hover:text-[#F5F3EC]'
                      }`}
                    >
                      Wallet address
                    </button>
                  </div>
                </div>

                {/* Destination Display Input (matching image.png) */}
                <div className="mt-4 space-y-1.5">
                  <label className="text-[12px] text-[#A8A69E] block">
                    {payoutTab === 'email' ? 'Payout email' : 'Polygon USDC wallet address'}
                  </label>
                  <div className="p-3 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A] flex items-center justify-between">
                    <span className="text-[13.5px] font-mono text-[#F5F3EC]">
                      {payoutTab === 'email' ? 'alex.rivera@creator.io' : '0x71C...4e8B (Polygon)'}
                    </span>
                    <i className={`ti ${payoutTab === 'email' ? 'ti-mail' : 'ti-wallet'} text-[#A8A69E]`}></i>
                  </div>
                </div>

                <div className="text-[12px] text-[#A8A69E] mt-3 leading-relaxed">
                  Coinbase / Circle sends the money here, onboards you, and cashes out in your local currency. Nothing to install.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#2A2A2A] mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onWithdraw}
                  className="pill text-[12px] py-1.5 px-3 cursor-pointer text-[#A8A69E] hover:text-[#F5F3EC]"
                >
                  Configure methods
                </button>

                {canWithdraw ? (
                  <button
                    type="button"
                    onClick={handleStartWithdrawFlow}
                    className="pill on text-[12px] py-1.5 px-4 cursor-pointer font-medium"
                  >
                    Withdraw ${availableBalance.toFixed(2)}
                  </button>
                ) : (
                  <span className="text-[11px] text-[#A8A69E]">
                    ${availableBalance.toFixed(2)} / $20 min
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Card: Settlements & Sales Activity (Matching "Sales" section in image.png) */}
          <div className="card p-5 sm:p-6 bg-[#161616] border border-[#2A2A2A] rounded-[20px] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2A2A2A]">
              <div>
                <h2 className="text-[17px] font-medium text-[#F5F3EC]">Settlements & Sales History</h2>
                <p className="text-[12px] text-[#A8A69E] mt-0.5">
                  Verified settlements matching your selected {range}-day period ({money(paidEarnings)} settled).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDataTable(!showDataTable)}
                  className="pill gh text-[12px] py-1 px-3 cursor-pointer text-[#A8A69E] hover:text-[#F5F3EC] flex items-center gap-1.5"
                >
                  <i className={`ti ${showDataTable ? 'ti-chart-bar' : 'ti-table'}`}></i>
                  <span>{showDataTable ? 'Show timeline chart' : 'Show data table'}</span>
                </button>
              </div>
            </div>

            {/* Sleek SVG Area Graph */}
            {!showDataTable && (
              <div className="p-4 sm:p-5 bg-[#121212] rounded-[16px] border border-[#222]">
                <div className="flex items-center justify-between text-[12px] text-[#A8A69E] mb-2 px-1">
                  <span>Settlement Volume Trend</span>
                  <span className="font-mono text-[#F5F3EC]">Peak bucket: {money(maxChartVal)}</span>
                </div>
                <div className="w-full overflow-hidden">
                  <svg
                    viewBox="0 0 800 160"
                    className="w-full h-[150px] overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C7F26B" stopOpacity="0.4" />
                        <stop offset="60%" stopColor="#C7F26B" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#C7F26B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Subtle grid lines */}
                    <line x1="20" y1="40" x2="780" y2="40" stroke="#222" strokeDasharray="3 3" />
                    <line x1="20" y1="85" x2="780" y2="85" stroke="#222" strokeDasharray="3 3" />
                    <line x1="20" y1="130" x2="780" y2="130" stroke="#222" strokeDasharray="3 3" />

                    {/* Generate Smooth Area Path */}
                    {(() => {
                      const pts = buckets.map((b, idx) => {
                        const x = 20 + (idx / (buckets.length - 1 || 1)) * 760;
                        const y = 140 - (b.m / (maxChartVal || 1)) * 115;
                        return { x, y, b };
                      });
                      if (pts.length === 0) return null;
                      let lPath = `M ${pts[0].x} ${pts[0].y}`;
                      for (let i = 1; i < pts.length; i++) {
                        const prev = pts[i - 1];
                        const curr = pts[i];
                        const cx1 = prev.x + (curr.x - prev.x) / 2;
                        const cy1 = prev.y;
                        const cx2 = prev.x + (curr.x - prev.x) / 2;
                        const cy2 = curr.y;
                        lPath += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
                      }
                      const aPath = `${lPath} L ${pts[pts.length - 1].x} 145 L ${pts[0].x} 145 Z`;
                      return (
                        <>
                          <path d={aPath} fill="url(#earningsGradient)" />
                          <path
                            d={lPath}
                            fill="none"
                            stroke="#C7F26B"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {pts.map((pt, idx) => (
                            <circle
                              key={idx}
                              cx={pt.x}
                              cy={pt.y}
                              r="3.5"
                              fill="#0E0E0E"
                              stroke="#C7F26B"
                              strokeWidth="2"
                              className="cursor-pointer transition-all hover:r-5"
                              onMouseEnter={() =>
                                setHoveredTip(`${pt.b.label} · ${money(pt.b.m)} (${num(pt.b.v)} installs)`)
                              }
                              onMouseLeave={() => setHoveredTip(null)}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                {hoveredTip && (
                  <div className="mt-2 text-center text-[12px] text-[#F5F3EC] font-mono animate-[fade-in_0.1s_ease-out]">
                    <span className="bg-[#1C1C1C] px-3 py-1 rounded-full border border-[#333]">
                      {hoveredTip}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Settlements Ledger Rows */}
            <div className="space-y-1.5 pt-1">
              {payoutsHistory.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveReceipt({
                      id: p.id,
                      amount: p.val,
                      fee: 0,
                      net: p.val,
                      destination: 'Chase Checking (••••5821)',
                      methodType: 'bank',
                      timestamp: '2026-10-02T17:00:00Z',
                      status: 'completed',
                      hash: `0x${Array.from({ length: 40 })
                        .map(() => Math.floor(Math.random() * 16).toString(16))
                        .join('')}`,
                      creatorHandle: 'alex',
                      settlementBatch: `${p.date} · 17:00 UTC`,
                    });
                    setIsReceiptModalOpen(true);
                  }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A]/30 hover:border-[#C7F26B]/50 transition-colors cursor-pointer"
                  title="Click to view digital settlement receipt"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[15px] shrink-0"
                      style={{ backgroundColor: p.bg, color: p.fg }}
                    >
                      <i className={`ti ${p.icon}`} aria-hidden="true"></i>
                    </span>
                    <div>
                      <div className="text-[13.5px] font-medium text-[#F5F3EC]">{p.date}</div>
                      <div className="text-[11px] text-[#A8A69E]">Weekly settlement at 17:00 UTC · {p.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                    <span
                      className="chip text-[11px] py-0.5 px-2.5 font-medium flex items-center gap-1"
                      style={{ backgroundColor: p.bg, color: p.fg }}
                    >
                      <i className={`ti ${p.icon}`}></i>
                      <span>{p.status}</span>
                    </span>
                    <span className="font-mono text-[15px] font-medium text-[#F5F3EC] min-w-[70px] text-right">
                      {money(p.val)}
                    </span>
                    <i className="ti ti-receipt text-[14px] text-[#A8A69E] hover:text-[#C7F26B]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Digital Paper Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        type="withdrawal"
      />
    </div>
  );
};

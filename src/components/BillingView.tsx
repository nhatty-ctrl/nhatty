import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface BillingViewProps {
  onBack: () => void;
  balance?: number;
  onAddFunds?: (amount: number) => void;
}

interface InvoiceRecord {
  id: string;
  date: string;
  period: string;
  amount: number;
  status: 'paid' | 'processing';
  method: string;
  methodType: 'card' | 'bank' | 'wire';
}

export const BillingView: React.FC<BillingViewProps> = ({
  onBack,
  balance = 3420.0,
  onAddFunds,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card_4242' | 'bank_5821' | 'usdc'>('card_4242');
  const [autoReload, setAutoReload] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [filterInvoice, setFilterInvoice] = useState<'all' | 'paid'>('all');
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: 'INV-2026-09',
      date: 'Sep 28, 2026',
      period: 'Sep 1 - Sep 28, 2026',
      amount: 2500.0,
      status: 'paid',
      method: 'Visa ending in 4242',
      methodType: 'card',
    },
    {
      id: 'INV-2026-08',
      date: 'Sep 14, 2026',
      period: 'Aug 15 - Aug 31, 2026',
      amount: 1500.0,
      status: 'paid',
      method: 'Chase Bank •••• 5821',
      methodType: 'bank',
    },
    {
      id: 'INV-2026-07',
      date: 'Aug 30, 2026',
      period: 'Aug 1 - Aug 14, 2026',
      amount: 3000.0,
      status: 'paid',
      method: 'Chase Bank •••• 5821',
      methodType: 'bank',
    },
    {
      id: 'INV-2026-06',
      date: 'Aug 12, 2026',
      period: 'Jul 15 - Jul 31, 2026',
      amount: 2000.0,
      status: 'paid',
      method: 'Visa ending in 4242',
      methodType: 'card',
    },
  ]);

  const activeAmount = selectedPreset > 0 ? selectedPreset : (parseFloat(customAmount) || 0);
  const platformFee = Math.round(activeAmount * 0.1 * 100) / 100;
  const totalBilled = activeAmount + platformFee;

  const handleSelectPreset = (amt: number) => {
    setSelectedPreset(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setSelectedPreset(0);
  };

  const handleExecuteAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount < 100) {
      setNotification('Minimum deposit amount is $100.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      if (onAddFunds) {
        onAddFunds(activeAmount);
      }

      const newInv: InvoiceRecord = {
        id: `INV-2026-${Date.now().toString().slice(-2)}`,
        date: 'Oct 2, 2026',
        period: 'Oct 1 - Oct 31, 2026',
        amount: totalBilled,
        status: 'paid',
        method: selectedPaymentMethod === 'card_4242' ? 'Visa ending in 4242' : 'Chase Bank •••• 5821',
        methodType: selectedPaymentMethod === 'card_4242' ? 'card' : 'bank',
      };

      setInvoices((prev) => [newInv, ...prev]);
      setIsProcessing(false);
      setNotification(`Added $${activeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to campaign balance.`);
      setTimeout(() => setNotification(null), 4000);
    }, 800);
  };

  const visibleInvoices = invoices.filter((inv) => {
    if (filterInvoice === 'paid') return inv.status === 'paid';
    return true;
  });

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Profile', icon: 'ti-user', onClick: onBack },
          { label: 'Billing and invoices', icon: 'ti-receipt', active: true },
        ]}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC]">
            Billing and invoices
          </h1>
          <p className="text-[13px] text-[#9A9892] mt-1">
            Manage campaign budget escrow, add funds, and view tax-compliant settlement receipts.
          </p>
        </div>

        {/* Auto reload quick toggle */}
        <div className="flex items-center gap-2.5 bg-[#161616] border border-[#2A2A2A] rounded-full px-3.5 py-1.5 self-start sm:self-auto select-none">
          <span className="text-[12px] text-[#9A9892]">Auto-reload below $500</span>
          <button
            type="button"
            role="switch"
            aria-checked={autoReload}
            onClick={() => setAutoReload(!autoReload)}
            className={`sw ${autoReload ? 'on' : ''}`}
            aria-label="Auto reload below $500"
          >
            <i></i>
          </button>
        </div>
      </div>

      {/* Financial Overview 3-Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Available Active Balance */}
        <div className="bg-[#161616] rounded-[20px] p-5 border border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="sub text-[11px] uppercase tracking-wider font-mono">Available balance</span>
            <span className="w-2 h-2 rounded-full bg-[#C7F26B]"></span>
          </div>
          <div className="text-[32px] font-medium tracking-[-0.6px] text-[#F5F3EC]">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[12px] text-[#C7F26B] flex items-center gap-1 font-medium">
            <i className="ti ti-shield-check"></i>
            <span>Active for install payouts</span>
          </div>
        </div>

        {/* Escrow on 14-day hold */}
        <div className="bg-[#161616] rounded-[20px] p-5 border border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="sub text-[11px] uppercase tracking-wider font-mono">Reserved escrow</span>
            <span className="w-2 h-2 rounded-full bg-[#FAC775]"></span>
          </div>
          <div className="text-[32px] font-medium tracking-[-0.6px] text-[#FAC775]">
            $840.00
          </div>
          <div className="text-[12px] text-[#9A9892] flex items-center gap-1">
            <i className="ti ti-clock"></i>
            <span>Attribution 14-day hold</span>
          </div>
        </div>

        {/* Lifetime Spend */}
        <div className="bg-[#161616] rounded-[20px] p-5 border border-[#2A2A2A] space-y-2">
          <div className="flex items-center justify-between">
            <span className="sub text-[11px] uppercase tracking-wider font-mono">Total spend to date</span>
            <span className="w-2 h-2 rounded-full bg-[#B5D4F4]"></span>
          </div>
          <div className="text-[32px] font-medium tracking-[-0.6px] text-[#F5F3EC]">
            $18,240.00
          </div>
          <div className="text-[12px] text-[#9A9892] flex items-center gap-1">
            <i className="ti ti-calendar"></i>
            <span>Across 4 mobile campaigns</span>
          </div>
        </div>
      </div>

      {/* Interactive Add Funds Card */}
      <div className="card space-y-4 border border-[#2A2A2A]">
        <div>
          <h2 className="text-[17px] font-medium text-[#F5F3EC]">Add campaign funds</h2>
          <p className="sub text-[12px] mt-0.5">
            Deposit funds to power creator bounties. Unused balance can be refunded anytime.
          </p>
        </div>

        {notification && (
          <div className="p-3 bg-[#1C1C1C] border border-[#C7F26B]/50 rounded-[14px] text-[13px] text-[#C7F26B] flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
            <i className="ti ti-check text-[16px]"></i>
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleExecuteAddFunds} className="space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="fl">Select deposit amount</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[500, 1000, 2500, 5000].map((amt) => {
                const isSelected = selectedPreset === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`pill justify-center min-h-[44px] cursor-pointer font-medium text-[14px] ${
                      isSelected ? 'on' : 'bg-[#1C1C1C] text-[#B9B7AF] hover:text-[#F5F3EC]'
                    }`}
                  >
                    +${amt.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="fl" htmlFor="custom-deposit">Custom amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9892] font-mono text-[14px]">
                  $
                </span>
                <input
                  id="custom-deposit"
                  type="number"
                  min="100"
                  step="50"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="in pl-8 min-h-[44px]"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="fl" htmlFor="deposit-method">Charge payment method</label>
              <select
                id="deposit-method"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                className="in min-h-[44px]"
              >
                <option value="card_4242">Visa ending in 4242 (Default)</option>
                <option value="bank_5821">JPMorgan Chase •••• 5821 (ACH)</option>
                <option value="usdc">USDC Wallet on Polygon</option>
              </select>
            </div>
          </div>

          {/* Transparent Fee Summary Box */}
          <div className="bg-[#1C1C1C] rounded-[16px] p-4 border border-[#2A2A2A]/40 space-y-2 text-[13px]">
            <div className="flex justify-between text-[#B9B7AF]">
              <span>Deposit to active balance</span>
              <span className="font-mono text-[#F5F3EC]">${activeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[#9A9892]">
              <span className="flex items-center gap-1">
                <span>Platform attribution & escrow fee (10%)</span>
                <i className="ti ti-info-circle text-[13px]" title="Covers verification window forensics and fraud shielding"></i>
              </span>
              <span className="font-mono">${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-[#2A2A2A] pt-2 flex justify-between font-medium text-[15px] text-[#F5F3EC]">
              <span>Total charged today</span>
              <span className="font-mono text-[#C7F26B]">${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isProcessing || activeAmount < 100}
              className="pill on min-h-[44px] px-6 cursor-pointer font-medium disabled:opacity-40"
            >
              <i className={`ti ${isProcessing ? 'ti-loader-2 spin' : 'ti-credit-card'}`}></i>
              <span>{isProcessing ? 'Processing deposit...' : `Pay $${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Invoices and Statements Section */}
      <div className="card space-y-4 border border-[#2A2A2A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-medium text-[#F5F3EC]">Invoices and receipts</h2>
            <p className="sub text-[12px] mt-0.5">Download monthly billing statements and payment receipts for tax records.</p>
          </div>

          <div className="inline-flex bg-[#1C1C1C] rounded-full p-0.5 border border-[#2A2A2A]/40 self-start sm:self-auto">
            <button
              onClick={() => setFilterInvoice('all')}
              className={`pill text-[12px] min-h-[32px] px-3 cursor-pointer ${filterInvoice === 'all' ? 'on' : ''}`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setFilterInvoice('paid')}
              className={`pill text-[12px] min-h-[32px] px-3 cursor-pointer ${filterInvoice === 'paid' ? 'on' : ''}`}
            >
              Paid
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-[13px]">
          {visibleInvoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40 gap-3 hover:bg-[#222] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[18px] shrink-0"
                  style={{
                    backgroundColor: inv.methodType === 'card' ? '#FAC775' : '#B5D4F4',
                    color: inv.methodType === 'card' ? '#412402' : '#042C53',
                  }}
                >
                  <i className={`ti ${inv.methodType === 'card' ? 'ti-credit-card' : 'ti-building-bank'}`}></i>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-[#F5F3EC] flex items-center gap-2">
                    <span>{inv.id}</span>
                    <span className="chip text-[11px] py-0.5 px-2 bg-[#121212] text-[#C7F26B] font-semibold flex items-center gap-1">
                      <i className="ti ti-check"></i>
                      <span>Paid</span>
                    </span>
                  </div>
                  <div className="text-[12px] text-[#9A9892] mt-0.5">
                    {inv.date} · {inv.period} · {inv.method}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="font-mono text-[15px] font-medium text-[#F5F3EC]">
                  ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <button
                  type="button"
                  onClick={() => setViewInvoice(inv)}
                  className="ol min-h-[34px] px-3 text-[12px] cursor-pointer flex items-center gap-1.5"
                >
                  <i className="ti ti-download text-[13px]"></i>
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax & Billing Details Card */}
      <div className="card border border-[#2A2A2A] space-y-3 text-[13px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-[#F5F3EC]">Billing address and tax info</h2>
          <button
            type="button"
            onClick={() => alert('Billing details updated.')}
            className="ol text-[11px] py-1 px-3 cursor-pointer"
          >
            Edit info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[#9A9892]">
          <div className="p-3 bg-[#1C1C1C] rounded-[14px]">
            <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">Company entity</span>
            <span className="mt-1 block text-[#B9B7AF]">Nova Play Studio Inc.</span>
          </div>
          <div className="p-3 bg-[#1C1C1C] rounded-[14px]">
            <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">Tax ID / EIN</span>
            <span className="mt-1 block text-[#B9B7AF]">US-EIN 84-2918402</span>
          </div>
          <div className="p-3 bg-[#1C1C1C] rounded-[14px]">
            <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">Billing jurisdiction</span>
            <span className="mt-1 block text-[#B9B7AF]">San Francisco, California, USA</span>
          </div>
        </div>
      </div>

      {/* View Receipt Modal */}
      {viewInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
          onClick={() => setViewInvoice(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-[440px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <div>
                <div className="text-[18px] font-medium text-[#F5F3EC]">{viewInvoice.id}</div>
                <div className="sub text-[12px]">{viewInvoice.date}</div>
              </div>
              <span className="chip text-[12px] py-0.5 px-2 bg-[#C7F26B] text-[#16140F] font-semibold">
                Paid
              </span>
            </div>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-[#9A9892]">
                <span>Billed to</span>
                <span className="text-[#F5F3EC]">Nova Play Studio Inc.</span>
              </div>
              <div className="flex justify-between text-[#9A9892]">
                <span>Payment method</span>
                <span className="text-[#F5F3EC]">{viewInvoice.method}</span>
              </div>
              <div className="flex justify-between text-[#9A9892]">
                <span>Billing cycle</span>
                <span className="text-[#F5F3EC]">{viewInvoice.period}</span>
              </div>
              <div className="border-t border-[#2A2A2A] pt-2 flex justify-between font-medium text-[16px] text-[#F5F3EC]">
                <span>Total amount</span>
                <span className="font-mono text-[#C7F26B]">
                  ${viewInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="pill min-h-[40px] px-4 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Receipt ${viewInvoice.id} PDF downloaded.`);
                  setViewInvoice(null);
                }}
                className="pill on min-h-[40px] px-4 cursor-pointer font-medium"
              >
                <i className="ti ti-download"></i>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
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

interface BillingInfo {
  company: string;
  taxId: string;
  jurisdiction: string;
  email: string;
}

const DEFAULT_BILLING_INFO: BillingInfo = {
  company: 'Nova Play Studio Inc.',
  taxId: 'US-EIN 84-2918402',
  jurisdiction: 'San Francisco, California, USA',
  email: 'billing@novaplay.io',
};

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
  const [filterInvoice, setFilterInvoice] = useState<'all' | 'paid' | 'processing'>('all');
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Billing address and tax details state (Finding 6)
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(() => {
    try {
      const stored = localStorage.getItem('kred_billing_info');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_BILLING_INFO;
  });

  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [editCompany, setEditCompany] = useState<string>(billingInfo.company);
  const [editTaxId, setEditTaxId] = useState<string>(billingInfo.taxId);
  const [editJurisdiction, setEditJurisdiction] = useState<string>(billingInfo.jurisdiction);
  const [editEmail, setEditEmail] = useState<string>(billingInfo.email);
  const [editErr, setEditErr] = useState<string>('');

  // Seeded invoices with distinct statuses (Finding 15)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([
    {
      id: 'INV-2026-10',
      date: 'Oct 2, 2026',
      period: 'Oct 1 - Oct 31, 2026',
      amount: 1100.0,
      status: 'processing',
      method: 'Polygon USDC (0x71C...4e8B)',
      methodType: 'wire',
    },
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
  // 0% cut on creator pay! $0.02 verification infra fee per outcome
  const networkInfraFee = Math.max(10, Math.round((activeAmount / 0.5) * 0.02 * 100) / 100);
  const totalBilled = activeAmount + networkInfraFee;

  const handleSelectPreset = (amt: number) => {
    setSelectedPreset(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    setSelectedPreset(0);
  };

  // Exhaustive Payment Method Mapping (Finding 5)
  const getMethodDetails = (methodKey: 'card_4242' | 'bank_5821' | 'usdc'): { label: string; type: 'card' | 'bank' | 'wire' } => {
    switch (methodKey) {
      case 'card_4242':
        return { label: 'Visa ending in 4242', type: 'card' };
      case 'bank_5821':
        return { label: 'Chase Bank •••• 5821', type: 'bank' };
      case 'usdc':
        return { label: 'Polygon USDC (0x71C...4e8B)', type: 'wire' };
      default:
        return { label: 'Card payment', type: 'card' };
    }
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

      const methodDetails = getMethodDetails(selectedPaymentMethod);
      const newInv: InvoiceRecord = {
        id: `INV-2026-${Date.now().toString().slice(-4)}`,
        date: 'Oct 2, 2026',
        period: 'Oct 1 - Oct 31, 2026',
        amount: totalBilled,
        status: 'paid',
        method: methodDetails.label,
        methodType: methodDetails.type,
      };

      setInvoices((prev) => [newInv, ...prev]);
      setIsProcessing(false);
      setNotification(`Added $${activeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} to campaign balance via ${methodDetails.label}.`);
      setTimeout(() => setNotification(null), 5000);
    }, 800);
  };

  // Real Receipt File Download (Finding 7 & 19)
  const handleDownloadReceipt = (inv: InvoiceRecord) => {
    setDownloadingId(inv.id);

    try {
      const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>KRED Receipt - ${inv.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #000000; color: #F4F2EC; padding: 40px; margin: 0; }
    .box { max-width: 580px; margin: 0 auto; background: #0E0E0E; border: 1px solid #222222; border-radius: 16px; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222222; padding-bottom: 20px; }
    .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #C9B8FF; }
    .badge { background: #C9B8FF; color: #000000; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; font-size: 14px; }
    .label { color: #9C9A92; }
    .val { font-weight: 500; }
    .total { font-size: 20px; color: #C9B8FF; font-weight: 700; border-bottom: none; padding-top: 16px; }
    .footer { margin-top: 28px; text-align: center; font-size: 11px; color: #777; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <div>
        <div class="logo">KRED Escrow Receipt</div>
        <div style="font-size: 13px; color: #9C9A92; margin-top: 4px;">Receipt ${inv.id} · ${inv.date}</div>
      </div>
      <div class="badge">${inv.status}</div>
    </div>
    <div style="margin-top: 20px;">
      <div class="row"><span class="label">Billed To Entity</span><span class="val">${billingInfo.company}</span></div>
      <div class="row"><span class="label">Tax ID / EIN</span><span class="val">${billingInfo.taxId}</span></div>
      <div class="row"><span class="label">Jurisdiction</span><span class="val">${billingInfo.jurisdiction}</span></div>
      <div class="row"><span class="label">Billing Email</span><span class="val">${billingInfo.email}</span></div>
      <div class="row"><span class="label">Payment Rail</span><span class="val">${inv.method}</span></div>
      <div class="row"><span class="label">Billing Cycle</span><span class="val">${inv.period}</span></div>
      <div class="row total"><span class="label" style="color: #F4F2EC;">Total Paid (Escrow + 10% Fee)</span><span class="val">$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    </div>
    <div class="footer">KRED Inc. · Real-time attribution & creator campaign escrow platform · All funds held in audited smart contract escrow until verification.</div>
  </div>
</body>
</html>`;

      const blob = new Blob([receiptHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KRED_Invoice_${inv.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setNotification(`Receipt ${inv.id} downloaded successfully.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (e) {
      console.error('Download error:', e);
      setNotification('Failed to generate receipt file.');
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
        setViewInvoice(null);
      }, 600);
    }
  };

  // Save Billing Info Handler (Finding 6)
  const handleSaveBillingInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany.trim() || !editTaxId.trim() || !editJurisdiction.trim()) {
      setEditErr('Please complete all required billing fields.');
      return;
    }

    const updated: BillingInfo = {
      company: editCompany.trim(),
      taxId: editTaxId.trim(),
      jurisdiction: editJurisdiction.trim(),
      email: editEmail.trim() || 'billing@novaplay.io',
    };

    setBillingInfo(updated);
    try {
      localStorage.setItem('kred_billing_info', JSON.stringify(updated));
    } catch {}

    setIsEditingInfo(false);
    setEditErr('');
    setNotification('Billing details and tax entity updated.');
    setTimeout(() => setNotification(null), 4000);
  };

  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const processingCount = invoices.filter((i) => i.status === 'processing').length;

  const visibleInvoices = invoices.filter((inv) => {
    if (filterInvoice === 'paid') return inv.status === 'paid';
    if (filterInvoice === 'processing') return inv.status === 'processing';
    return true;
  });

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
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
          <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.6px] text-[#F4F2EC]">
            Billing and invoices
          </h1>
          <p className="text-[13.5px] text-[#9C9A92] mt-1">
            Manage campaign budget escrow, add funds, and view tax-compliant settlement receipts.
          </p>
        </div>

        {/* Current Balance Badge */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-[16px] px-4 py-2.5 flex items-center gap-3">
          <div className="text-[12px] text-[#9C9A92]">Escrow balance:</div>
          <div className="text-[20px] font-medium font-mono text-[#C9B8FF]">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-3 bg-[#141414] border border-[#C9B8FF]/50 rounded-[14px] text-[13px] text-[#F4F2EC] flex items-center justify-between animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center gap-2">
            <i className="ti ti-circle-check text-[#C9B8FF] text-[16px]"></i>
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#9C9A92] hover:text-[#F4F2EC] border-0 bg-transparent cursor-pointer"
          >
            <i className="ti ti-x text-[13px]"></i>
          </button>
        </div>
      )}

      {/* Founder Subscription Plan Status Card (Point 1 & Point 2) */}
      <div className="p-5 sm:p-6 bg-[#0E0E0E] border border-[#222222] rounded-[20px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[12px] uppercase font-bold tracking-wider text-[#C9B8FF] bg-[#C9B8FF]/10 px-2.5 py-0.5 rounded-full border border-[#C9B8FF]/20">
              Active Founder Plan
            </span>
            <span className="text-[12px] text-[#C0DD97] font-medium flex items-center gap-1">
              <i className="ti ti-circle-check"></i>
              <span>0% Creator Fee Guarantee</span>
            </span>
          </div>
          <h2 className="text-[19px] font-semibold text-[#F4F2EC]">Founder Starter Plan · $199 / month</h2>
          <p className="text-[12.5px] text-[#9C9A92] leading-relaxed max-w-[640px]">
            Umi charges a predictable SaaS subscription rather than taking a cut from creators. 100% of your prefunded escrow bounty goes directly to creators, driving maximum creator trust.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-[#9C9A92]">Next billing cycle</div>
            <div className="text-[13px] font-medium text-[#F4F2EC]">November 1, 2026</div>
          </div>
        </div>
      </div>

      {/* Plan Tiers & The Fee Math Breakdown (Point 1, Point 2, Point 6) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#C9B8FF]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#F4F2EC]">Starter Plan</span>
            <span className="text-[11px] font-mono text-[#C9B8FF] bg-[#C9B8FF]/15 px-2 py-0.5 rounded-full font-medium">Current</span>
          </div>
          <div className="text-[22px] font-bold font-mono text-[#C9B8FF]">$199<span className="text-[12px] text-[#888] font-normal">/mo</span></div>
          <p className="text-[12px] text-[#9C9A92] leading-relaxed">
            For early beta founders. Up to 3 live campaigns. 0% cut taken on creator pay. Real-time RavenCore SDK hardware attestation.
          </p>
        </div>

        <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] hover:border-[#333333] transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#F4F2EC]">Scale Plan</span>
            <span className="text-[11px] font-mono text-[#777]">$0.03/event</span>
          </div>
          <div className="text-[22px] font-bold font-mono text-[#F4F2EC]">$399<span className="text-[12px] text-[#888] font-normal">/mo</span></div>
          <p className="text-[12px] text-[#9C9A92] leading-relaxed">
            Unlimited campaigns, automated anti-fraud queuing, prioritized attribution webhooks, and multi-seat founder access.
          </p>
        </div>

        <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] hover:border-[#333333] transition-colors space-y-2 relative">
          <span className="absolute -top-2 right-3 text-[9.5px] uppercase font-bold tracking-wider bg-[#C9B8FF] text-black px-2 py-0.5 rounded-full">Design Partner</span>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#F4F2EC]">Managed Launch</span>
            <span className="text-[11px] font-mono text-[#FAC775]">Concierge</span>
          </div>
          <div className="text-[22px] font-bold font-mono text-[#F4F2EC]">$1,499<span className="text-[12px] text-[#888] font-normal">/mo</span></div>
          <p className="text-[12px] text-[#9C9A92] leading-relaxed">
            White-glove launch for your first 3 to 5 campaigns: Umi team sources and vets 30+ creators, writes high-converting briefs, and audits #ad FTC compliance.
          </p>
        </div>
      </div>

      {/* The Fee Math Callout Card */}
      <div className="p-4 sm:p-5 rounded-[18px] bg-[#121215] border border-[#26262A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-[760px]">
          <div className="flex items-center gap-2">
            <i className="ti ti-calculator text-[#C9B8FF] text-[17px]"></i>
            <span className="text-[14px] font-semibold text-[#F4F2EC]">The Fee Math: Why SaaS Subscriptions Win</span>
          </div>
          <p className="text-[12px] text-[#9C9A92] leading-relaxed">
            Under a traditional volume-cut model (e.g. 7% on founder and 3% on creator on a $0.50 install bounty), Umi grossed $0.05. After Stripe processor fees (2.9% + $0.30), Umi nets only <b>$0.036 per outcome</b>. Covering $199/month under volume cuts would require roughly <b>5,500 qualified outcomes</b>—an unrealistic hurdle for early betas. A predictable $199 subscription plus a small $0.05 verification fee provides stable revenue independent of volume and keeps fees <b>100% off creator payouts (0% creator fee)</b> for unbeatable creator trust.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-xl bg-[#18181C] border border-[#27272A] text-center min-w-[120px]">
            <div className="text-[10px] text-[#71717A] uppercase font-mono">Net under cut</div>
            <div className="text-[13px] font-mono font-medium text-[#FF8A80] mt-0.5">$0.036 / inst.</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-[#18181C] border border-[#27272A] text-center min-w-[120px]">
            <div className="text-[10px] text-[#71717A] uppercase font-mono">Creator Cut</div>
            <div className="text-[13px] font-mono font-semibold text-[#C0DD97] mt-0.5">0% (Keep 100%)</div>
          </div>
        </div>
      </div>

      {/* Two Column Grid for Add Funds and Tax Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Add Funds Form Card (7 cols) */}
        <div className="lg:col-span-7 card p-5 sm:p-6 bg-[#0E0E0E] border border-[#222222] rounded-[20px] space-y-5">
          <div>
            <h2 className="text-[17px] font-medium text-[#F4F2EC]">Prefund campaign escrow</h2>
            <p className="sub text-[12px] text-[#9C9A92] mt-0.5">
              Prefunded escrow is our trust mechanism. Creators only produce content when bounties are locked in Stripe escrow.
            </p>
          </div>

          <form onSubmit={handleExecuteAddFunds} className="space-y-4">
            {/* Preset Buttons */}
            <div>
              <label className="fl text-[12px] text-[#9C9A92] mb-2 block">Quick deposit amount</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`pill text-[13px] py-2 px-3 justify-center min-h-[42px] cursor-pointer ${
                      selectedPreset === amt ? 'on font-medium' : 'out hover:bg-[#1B1B1B]'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="fl text-[12px] text-[#9C9A92] mb-1.5 block" htmlFor="custom-amt">
                Or enter custom deposit (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9A92] font-mono text-[14px]">
                  $
                </span>
                <input
                  id="custom-amt"
                  type="number"
                  min="100"
                  step="50"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="in pl-8"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Payment Method Selector (Finding 5) */}
            <div>
              <label className="fl text-[12px] text-[#9C9A92] mb-2 block">Payment method rail</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('card_4242')}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    selectedPaymentMethod === 'card_4242'
                      ? 'border-[#C9B8FF] bg-[#141414]'
                      : 'border-[#222222] bg-[#0E0E0E] hover:bg-[#141414]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F4F2EC]">Visa •••• 4242</div>
                    <div className="text-[11px] text-[#9C9A92]">Instant debit/credit</div>
                  </div>
                  <i className="ti ti-credit-card text-[18px] text-[#9C9A92]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('bank_5821')}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    selectedPaymentMethod === 'bank_5821'
                      ? 'border-[#C9B8FF] bg-[#141414]'
                      : 'border-[#222222] bg-[#0E0E0E] hover:bg-[#141414]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F4F2EC]">Chase •••• 5821</div>
                    <div className="text-[11px] text-[#9C9A92]">ACH bank transfer</div>
                  </div>
                  <i className="ti ti-building-bank text-[18px] text-[#9C9A92]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('usdc')}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    selectedPaymentMethod === 'usdc'
                      ? 'border-[#C9B8FF] bg-[#141414]'
                      : 'border-[#222222] bg-[#0E0E0E] hover:bg-[#141414]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F4F2EC]">USDC on Polygon</div>
                    <div className="text-[11px] text-[#9C9A92]">Web3 wallet deposit</div>
                  </div>
                  <i className="ti ti-currency-dollar text-[18px] text-[#C9B8FF]"></i>
                </button>
              </div>
            </div>

            {/* Fee Calculation Breakdown */}
            <div className="p-3.5 bg-[#141414] rounded-[16px] border border-[#222222]/40 space-y-2 text-[13px]">
              <div className="flex justify-between text-[#9C9A92]">
                <span>Prefunded creator bounty escrow (100% to creators)</span>
                <span className="font-mono text-[#F4F2EC]">${activeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#9C9A92]">
                <span>Platform cut on creator pay</span>
                <span className="font-medium text-[#C9B8FF]">0% ($0.00 fee)</span>
              </div>
              <div className="flex justify-between text-[#9C9A92]">
                <span>Outcome network infra fee ($0.02 / install)</span>
                <span className="font-mono text-[#F4F2EC]">${networkInfraFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-[#222222] pt-2 flex justify-between font-medium text-[15px] text-[#F4F2EC]">
                <span>Total charged</span>
                <span className="font-mono text-[#C9B8FF]">${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isProcessing || activeAmount < 100}
                className="pill on min-h-[44px] px-6 cursor-pointer font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <i className={`ti ${isProcessing ? 'ti-loader-2 spin' : 'ti-plus'}`}></i>
                <span>{isProcessing ? 'Processing deposit...' : `Fund $${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tax & Billing Details Card (5 cols) */}
        <div className="lg:col-span-5 card p-5 sm:p-6 bg-[#0E0E0E] border border-[#222222] rounded-[20px] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <div>
              <h2 className="text-[17px] font-medium text-[#F4F2EC]">Billing and Tax Info</h2>
              <p className="text-[12px] text-[#9C9A92] mt-0.5">Used for invoice receipts and compliance</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditCompany(billingInfo.company);
                setEditTaxId(billingInfo.taxId);
                setEditJurisdiction(billingInfo.jurisdiction);
                setEditEmail(billingInfo.email);
                setEditErr('');
                setIsEditingInfo(true);
              }}
              className="ol text-[12px] py-1.5 px-3 cursor-pointer flex items-center gap-1.5"
            >
              <i className="ti ti-edit text-[13px]"></i>
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 text-[#9C9A92] text-[13px]">
            <div className="p-3.5 bg-[#141414] rounded-[14px] border border-[#222222]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F4F2EC]">Company entity</span>
              <span className="mt-1 block text-[#B8B6AE] font-medium">{billingInfo.company}</span>
            </div>
            <div className="p-3.5 bg-[#141414] rounded-[14px] border border-[#222222]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F4F2EC]">Tax ID / EIN / VAT</span>
              <span className="mt-1 block text-[#B8B6AE] font-mono">{billingInfo.taxId}</span>
            </div>
            <div className="p-3.5 bg-[#141414] rounded-[14px] border border-[#222222]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F4F2EC]">Billing jurisdiction</span>
              <span className="mt-1 block text-[#B8B6AE]">{billingInfo.jurisdiction}</span>
            </div>
            <div className="p-3.5 bg-[#141414] rounded-[14px] border border-[#222222]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F4F2EC]">AP Contact Email</span>
              <span className="mt-1 block text-[#B8B6AE] font-mono">{billingInfo.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List Card with Distinct Status Filters (Finding 15) */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-medium text-[#F4F2EC]">Invoice & receipt history</h2>
            <p className="text-[12px] text-[#9C9A92] mt-0.5">Download verifiable receipts for accounting and tax write-offs.</p>
          </div>

          {/* Filter Tabs with Live Record Counts */}
          <div className="flex gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterInvoice('all')}
              className={`pill text-[12px] py-1 px-3 border-0 cursor-pointer ${
                filterInvoice === 'all' ? 'on font-medium' : 'bg-[#141414] text-[#9C9A92]'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterInvoice('paid')}
              className={`pill text-[12px] py-1 px-3 border-0 cursor-pointer ${
                filterInvoice === 'paid' ? 'on font-medium' : 'bg-[#141414] text-[#9C9A92]'
              }`}
            >
              Paid ({paidCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterInvoice('processing')}
              className={`pill text-[12px] py-1 px-3 border-0 cursor-pointer ${
                filterInvoice === 'processing' ? 'on font-medium' : 'bg-[#141414] text-[#9C9A92]'
              }`}
            >
              Processing ({processingCount})
            </button>
          </div>
        </div>

        {/* Invoices Table / Rows */}
        <div className="space-y-2 pt-1">
          {visibleInvoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#141414] rounded-[16px] border border-[#222222]/40 hover:border-[#222222] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[16px] shrink-0"
                  style={{
                    backgroundColor: inv.status === 'paid' ? '#C0DD97' : '#FAC775',
                    color: inv.status === 'paid' ? '#173404' : '#412402',
                  }}
                >
                  <i className={`ti ${inv.status === 'paid' ? 'ti-check' : 'ti-clock'}`}></i>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[#F4F2EC]">{inv.id}</span>
                    <span
                      className={`chip text-[10px] py-0.5 px-2 font-medium capitalize ${
                        inv.status === 'paid'
                          ? 'bg-[#C9B8FF]/20 text-[#C9B8FF]'
                          : 'bg-[#FAC775]/20 text-[#FAC775]'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#9C9A92] mt-0.5">
                    {inv.date} · {inv.method}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#222222]/40">
                <div className="font-mono text-[15px] font-medium text-[#F4F2EC]">
                  ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewInvoice(inv)}
                    className="pill text-[12px] py-1 px-2.5 text-[#B8B6AE] hover:text-[#F4F2EC] hover:bg-[#1B1B1B] cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(inv)}
                    disabled={downloadingId === inv.id}
                    className="pill out text-[12px] py-1 px-3 cursor-pointer flex items-center gap-1"
                    title="Download receipt file"
                  >
                    <i className={`ti ${downloadingId === inv.id ? 'ti-loader-2 spin' : 'ti-download'}`}></i>
                    <span>{downloadingId === inv.id ? 'Saving…' : 'PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Billing Info Modal (Finding 6) */}
      {isEditingInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
          onClick={() => setIsEditingInfo(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-[480px] bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div>
                <h3 className="text-[18px] font-medium text-[#F4F2EC]">Edit billing details</h3>
                <p className="text-[12px] text-[#9C9A92]">Information used for invoice generation and tax compliance.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="w-7 h-7 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC] flex items-center justify-center border-0 cursor-pointer"
                aria-label="Close"
              >
                <i className="ti ti-x text-[13px]"></i>
              </button>
            </div>

            <form onSubmit={handleSaveBillingInfo} className="space-y-3.5">
              <div>
                <label className="fl text-[12px] text-[#9C9A92] mb-1 block" htmlFor="edit-company">
                  Legal company entity *
                </label>
                <input
                  id="edit-company"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="in"
                  placeholder="Nova Play Studio Inc."
                  required
                />
              </div>

              <div>
                <label className="fl text-[12px] text-[#9C9A92] mb-1 block" htmlFor="edit-tax-id">
                  Tax ID / EIN / VAT *
                </label>
                <input
                  id="edit-tax-id"
                  value={editTaxId}
                  onChange={(e) => setEditTaxId(e.target.value)}
                  className="in"
                  placeholder="US-EIN 84-2918402"
                  required
                />
              </div>

              <div>
                <label className="fl text-[12px] text-[#9C9A92] mb-1 block" htmlFor="edit-jurisdiction">
                  Billing address & jurisdiction *
                </label>
                <input
                  id="edit-jurisdiction"
                  value={editJurisdiction}
                  onChange={(e) => setEditJurisdiction(e.target.value)}
                  className="in"
                  placeholder="San Francisco, California, USA"
                  required
                />
              </div>

              <div>
                <label className="fl text-[12px] text-[#9C9A92] mb-1 block" htmlFor="edit-email">
                  Accounts payable email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="in"
                  placeholder="billing@novaplay.io"
                />
              </div>

              {editErr && (
                <div className="text-[12px] text-[#FF8A80] flex items-center gap-1">
                  <i className="ti ti-alert-circle"></i>
                  <span>{editErr}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="pill min-h-[40px] px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pill on min-h-[40px] px-5 cursor-pointer font-medium"
                >
                  Save billing info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Receipt Modal (Finding 7 & 19) */}
      {viewInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
          onClick={() => setViewInvoice(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-[460px] bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div>
                <div className="text-[18px] font-medium text-[#F4F2EC]">{viewInvoice.id}</div>
                <div className="sub text-[12px] text-[#9C9A92]">{viewInvoice.date}</div>
              </div>
              <span
                className={`chip text-[12px] py-0.5 px-2.5 font-semibold capitalize ${
                  viewInvoice.status === 'paid'
                    ? 'bg-[#C9B8FF] text-[#000000]'
                    : 'bg-[#FAC775] text-[#412402]'
                }`}
              >
                {viewInvoice.status}
              </span>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-[#9C9A92]">
                <span>Billed to entity</span>
                <span className="text-[#F4F2EC] font-medium">{billingInfo.company}</span>
              </div>
              <div className="flex justify-between text-[#9C9A92]">
                <span>Tax ID / EIN</span>
                <span className="text-[#F4F2EC] font-mono">{billingInfo.taxId}</span>
              </div>
              <div className="flex justify-between text-[#9C9A92]">
                <span>Payment rail</span>
                <span className="text-[#F4F2EC] font-medium">{viewInvoice.method}</span>
              </div>
              <div className="flex justify-between text-[#9C9A92]">
                <span>Billing cycle</span>
                <span className="text-[#F4F2EC]">{viewInvoice.period}</span>
              </div>
              <div className="border-t border-[#222222] pt-2.5 flex justify-between font-medium text-[16px] text-[#F4F2EC]">
                <span>Total amount</span>
                <span className="font-mono text-[#C9B8FF]">
                  ${viewInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="pill min-h-[40px] px-4 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(viewInvoice)}
                disabled={downloadingId === viewInvoice.id}
                className="pill on min-h-[40px] px-4 cursor-pointer font-medium flex items-center gap-1.5"
              >
                <i className={`ti ${downloadingId === viewInvoice.id ? 'ti-loader-2 spin' : 'ti-download'}`}></i>
                <span>{downloadingId === viewInvoice.id ? 'Generating...' : 'Download PDF / Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

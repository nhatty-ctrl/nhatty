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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0B0B0B; color: #F5F3EC; padding: 40px; margin: 0; }
    .box { max-width: 580px; margin: 0 auto; background: #161616; border: 1px solid #2A2A2A; border-radius: 16px; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2A2A2A; padding-bottom: 20px; }
    .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #C7F26B; }
    .badge { background: #C7F26B; color: #16140F; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #222; font-size: 14px; }
    .label { color: #A8A69E; }
    .val { font-weight: 500; }
    .total { font-size: 20px; color: #C7F26B; font-weight: 700; border-bottom: none; padding-top: 16px; }
    .footer { margin-top: 28px; text-align: center; font-size: 11px; color: #777; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <div>
        <div class="logo">KRED Escrow Receipt</div>
        <div style="font-size: 13px; color: #A8A69E; margin-top: 4px;">Receipt ${inv.id} · ${inv.date}</div>
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
      <div class="row total"><span class="label" style="color: #F5F3EC;">Total Paid (Escrow + 10% Fee)</span><span class="val">$${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
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
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
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
          <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.6px] text-[#F5F3EC]">
            Billing and invoices
          </h1>
          <p className="text-[13.5px] text-[#A8A69E] mt-1">
            Manage campaign budget escrow, add funds, and view tax-compliant settlement receipts.
          </p>
        </div>

        {/* Current Balance Badge */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-[16px] px-4 py-2.5 flex items-center gap-3">
          <div className="text-[12px] text-[#A8A69E]">Escrow balance:</div>
          <div className="text-[20px] font-medium font-mono text-[#C7F26B]">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-3 bg-[#1C1C1C] border border-[#C7F26B]/50 rounded-[14px] text-[13px] text-[#F5F3EC] flex items-center justify-between animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center gap-2">
            <i className="ti ti-circle-check text-[#C7F26B] text-[16px]"></i>
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#A8A69E] hover:text-[#F5F3EC] border-0 bg-transparent cursor-pointer"
          >
            <i className="ti ti-x text-[13px]"></i>
          </button>
        </div>
      )}

      {/* Two Column Grid for Add Funds and Tax Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Add Funds Form Card (7 cols) */}
        <div className="lg:col-span-7 card p-5 sm:p-6 bg-[#161616] border border-[#2A2A2A] rounded-[20px] space-y-5">
          <div>
            <h2 className="text-[17px] font-medium text-[#F5F3EC]">Add funds to escrow</h2>
            <p className="sub text-[12px] text-[#A8A69E] mt-0.5">
              Escrow deposits cover verified install bounties. 10% platform fee applied at deposit.
            </p>
          </div>

          <form onSubmit={handleExecuteAddFunds} className="space-y-4">
            {/* Preset Buttons */}
            <div>
              <label className="fl text-[12px] text-[#A8A69E] mb-2 block">Quick deposit amount</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`pill text-[13px] py-2 px-3 justify-center min-h-[42px] cursor-pointer ${
                      selectedPreset === amt ? 'on font-medium' : 'out hover:bg-[#242424]'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="fl text-[12px] text-[#A8A69E] mb-1.5 block" htmlFor="custom-amt">
                Or enter custom deposit (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A69E] font-mono text-[14px]">
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
              <label className="fl text-[12px] text-[#A8A69E] mb-2 block">Payment method rail</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('card_4242')}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    selectedPaymentMethod === 'card_4242'
                      ? 'border-[#C7F26B] bg-[#1C1C1C]'
                      : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F5F3EC]">Visa •••• 4242</div>
                    <div className="text-[11px] text-[#A8A69E]">Instant debit/credit</div>
                  </div>
                  <i className="ti ti-credit-card text-[18px] text-[#A8A69E]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('bank_5821')}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    selectedPaymentMethod === 'bank_5821'
                      ? 'border-[#C7F26B] bg-[#1C1C1C]'
                      : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F5F3EC]">Chase •••• 5821</div>
                    <div className="text-[11px] text-[#A8A69E]">ACH bank transfer</div>
                  </div>
                  <i className="ti ti-building-bank text-[18px] text-[#A8A69E]"></i>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('usdc')}
                  className={`p-3 rounded-[14px] border text-left cursor-pointer transition-colors flex items-center justify-between ${
                    selectedPaymentMethod === 'usdc'
                      ? 'border-[#C7F26B] bg-[#1C1C1C]'
                      : 'border-[#2A2A2A] bg-[#161616] hover:bg-[#1C1C1C]'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-medium text-[#F5F3EC]">USDC on Polygon</div>
                    <div className="text-[11px] text-[#A8A69E]">Web3 wallet deposit</div>
                  </div>
                  <i className="ti ti-currency-dollar text-[18px] text-[#C7F26B]"></i>
                </button>
              </div>
            </div>

            {/* Fee Calculation Breakdown */}
            <div className="p-3.5 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40 space-y-2 text-[13px]">
              <div className="flex justify-between text-[#A8A69E]">
                <span>Deposit into campaign escrow</span>
                <span className="font-mono text-[#F5F3EC]">${activeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#A8A69E]">
                <span>KRED 10% platform fee</span>
                <span className="font-mono text-[#F5F3EC]">${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-[#2A2A2A] pt-2 flex justify-between font-medium text-[15px] text-[#F5F3EC]">
                <span>Total charged</span>
                <span className="font-mono text-[#C7F26B]">${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
        <div className="lg:col-span-5 card p-5 sm:p-6 bg-[#161616] border border-[#2A2A2A] rounded-[20px] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div>
              <h2 className="text-[17px] font-medium text-[#F5F3EC]">Billing and Tax Info</h2>
              <p className="text-[12px] text-[#A8A69E] mt-0.5">Used for invoice receipts and compliance</p>
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

          <div className="space-y-3 text-[#A8A69E] text-[13px]">
            <div className="p-3.5 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">Company entity</span>
              <span className="mt-1 block text-[#B9B7AF] font-medium">{billingInfo.company}</span>
            </div>
            <div className="p-3.5 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">Tax ID / EIN / VAT</span>
              <span className="mt-1 block text-[#B9B7AF] font-mono">{billingInfo.taxId}</span>
            </div>
            <div className="p-3.5 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">Billing jurisdiction</span>
              <span className="mt-1 block text-[#B9B7AF]">{billingInfo.jurisdiction}</span>
            </div>
            <div className="p-3.5 bg-[#1C1C1C] rounded-[14px] border border-[#2A2A2A]/40">
              <span className="text-[11px] uppercase tracking-wider block font-medium text-[#F5F3EC]">AP Contact Email</span>
              <span className="mt-1 block text-[#B9B7AF] font-mono">{billingInfo.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List Card with Distinct Status Filters (Finding 15) */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-medium text-[#F5F3EC]">Invoice & receipt history</h2>
            <p className="text-[12px] text-[#A8A69E] mt-0.5">Download verifiable receipts for accounting and tax write-offs.</p>
          </div>

          {/* Filter Tabs with Live Record Counts */}
          <div className="flex gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterInvoice('all')}
              className={`pill text-[12px] py-1 px-3 border-0 cursor-pointer ${
                filterInvoice === 'all' ? 'on font-medium' : 'bg-[#1C1C1C] text-[#A8A69E]'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterInvoice('paid')}
              className={`pill text-[12px] py-1 px-3 border-0 cursor-pointer ${
                filterInvoice === 'paid' ? 'on font-medium' : 'bg-[#1C1C1C] text-[#A8A69E]'
              }`}
            >
              Paid ({paidCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterInvoice('processing')}
              className={`pill text-[12px] py-1 px-3 border-0 cursor-pointer ${
                filterInvoice === 'processing' ? 'on font-medium' : 'bg-[#1C1C1C] text-[#A8A69E]'
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
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40 hover:border-[#2A2A2A] transition-colors"
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
                    <span className="text-[14px] font-medium text-[#F5F3EC]">{inv.id}</span>
                    <span
                      className={`chip text-[10px] py-0.5 px-2 font-medium capitalize ${
                        inv.status === 'paid'
                          ? 'bg-[#C7F26B]/20 text-[#C7F26B]'
                          : 'bg-[#FAC775]/20 text-[#FAC775]'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#A8A69E] mt-0.5">
                    {inv.date} · {inv.method}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#2A2A2A]/40">
                <div className="font-mono text-[15px] font-medium text-[#F5F3EC]">
                  ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewInvoice(inv)}
                    className="pill text-[12px] py-1 px-2.5 text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#242424] cursor-pointer"
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
            className="card w-full max-w-[480px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <div>
                <h3 className="text-[18px] font-medium text-[#F5F3EC]">Edit billing details</h3>
                <p className="text-[12px] text-[#A8A69E]">Information used for invoice generation and tax compliance.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#A8A69E] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
                aria-label="Close"
              >
                <i className="ti ti-x text-[13px]"></i>
              </button>
            </div>

            <form onSubmit={handleSaveBillingInfo} className="space-y-3.5">
              <div>
                <label className="fl text-[12px] text-[#A8A69E] mb-1 block" htmlFor="edit-company">
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
                <label className="fl text-[12px] text-[#A8A69E] mb-1 block" htmlFor="edit-tax-id">
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
                <label className="fl text-[12px] text-[#A8A69E] mb-1 block" htmlFor="edit-jurisdiction">
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
                <label className="fl text-[12px] text-[#A8A69E] mb-1 block" htmlFor="edit-email">
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

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2A2A2A]">
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
            className="card w-full max-w-[460px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <div>
                <div className="text-[18px] font-medium text-[#F5F3EC]">{viewInvoice.id}</div>
                <div className="sub text-[12px] text-[#A8A69E]">{viewInvoice.date}</div>
              </div>
              <span
                className={`chip text-[12px] py-0.5 px-2.5 font-semibold capitalize ${
                  viewInvoice.status === 'paid'
                    ? 'bg-[#C7F26B] text-[#16140F]'
                    : 'bg-[#FAC775] text-[#412402]'
                }`}
              >
                {viewInvoice.status}
              </span>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-[#A8A69E]">
                <span>Billed to entity</span>
                <span className="text-[#F5F3EC] font-medium">{billingInfo.company}</span>
              </div>
              <div className="flex justify-between text-[#A8A69E]">
                <span>Tax ID / EIN</span>
                <span className="text-[#F5F3EC] font-mono">{billingInfo.taxId}</span>
              </div>
              <div className="flex justify-between text-[#A8A69E]">
                <span>Payment rail</span>
                <span className="text-[#F5F3EC] font-medium">{viewInvoice.method}</span>
              </div>
              <div className="flex justify-between text-[#A8A69E]">
                <span>Billing cycle</span>
                <span className="text-[#F5F3EC]">{viewInvoice.period}</span>
              </div>
              <div className="border-t border-[#2A2A2A] pt-2.5 flex justify-between font-medium text-[16px] text-[#F5F3EC]">
                <span>Total amount</span>
                <span className="font-mono text-[#C7F26B]">
                  ${viewInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2A2A2A]">
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

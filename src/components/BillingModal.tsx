import React, { useState } from 'react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onAddFunds: (amount: number) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  balance,
  onAddFunds,
}) => {
  const [amount, setAmount] = useState('1000');

  if (!isOpen) return null;

  const handleAdd = () => {
    const val = parseFloat(amount) || 1000;
    onAddFunds(val);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[460px] bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left relative space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[18px] font-medium text-[#F4F2EC]">Billing and invoices</div>
            <div className="sub mt-0.5">Manage campaign funding and download settlement receipts.</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9A9892] hover:text-[#F4F2EC] flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>

        {/* Current Balance */}
        <div className="bg-[#141414] rounded-[18px] p-4 border border-[#222222]/50 flex items-center justify-between">
          <div>
            <div className="sub text-[12px]">Available campaign balance</div>
            <div className="text-[26px] font-medium text-[#F4F2EC] mt-0.5">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="chip" style={{ backgroundColor: '#C0DD97', color: '#173404' }}>
            Active
          </span>
        </div>

        {/* Add Funds Input */}
        <div>
          <label className="fl" htmlFor="fund-amount">
            Add campaign funds (USD)
          </label>
          <div className="flex gap-2">
            <input
              id="fund-amount"
              className="in flex-1"
              type="number"
              min="100"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="pill on px-4 shrink-0"
            >
              Add funds
            </button>
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <div className="text-[13px] font-medium text-[#F4F2EC] mb-2">Recent invoices</div>
          <div className="space-y-1.5 text-[12px]">
            {[
              { id: 'INV-2026-09', date: 'Sep 28, 2026', amount: '$2,500.00', status: 'Paid' },
              { id: 'INV-2026-08', date: 'Sep 14, 2026', amount: '$1,500.00', status: 'Paid' },
              { id: 'INV-2026-07', date: 'Aug 30, 2026', amount: '$3,000.00', status: 'Paid' },
            ].map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2.5 bg-[#141414] rounded-[12px] border border-[#222222]/40"
              >
                <div>
                  <span className="font-medium text-[#F4F2EC] block">{inv.id}</span>
                  <span className="text-[#9A9892] text-[11px]">{inv.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#F4F2EC] font-medium">{inv.amount}</span>
                  <span className="text-[#C9B8FF] font-medium">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Fee Notice */}
        <div className="sub text-[12px] pt-1 leading-relaxed">
          <span className="text-[#C9B8FF] font-medium">Founder SaaS plan:</span> $199/mo Starter · 0% fee on creator pay (creators keep 100%) · $0.05 verification fee per outcome · 100% prefunded into Stripe Escrow. Unused budget refunded upon campaign close.
        </div>
      </div>
    </div>
  );
};

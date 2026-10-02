import React, { useState } from 'react';

interface PayoutMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (method: string) => void;
}

export const PayoutMethodsModal: React.FC<PayoutMethodsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'card' | 'usdc'>('bank');

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSaved) onSaved(selectedMethod);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[440px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left relative space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">Payout methods</div>
            <div className="sub mt-0.5">Choose how you receive your weekly creator settlements.</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>

        {/* Methods List */}
        <div className="space-y-2 pt-1">
          {[
            {
              id: 'bank',
              icon: 'ti-building-bank',
              title: 'Bank account (ACH)',
              detail: 'Checking ending in 5821 · Chase Bank',
              timing: 'Transfers arrive on Fridays',
            },
            {
              id: 'card',
              icon: 'ti-credit-card',
              title: 'Debit card',
              detail: 'Visa ending in 4242',
              timing: 'Instant transfer on settlement',
            },
            {
              id: 'usdc',
              icon: 'ti-coin',
              title: 'USDC wallet',
              detail: '0x71C...4e8B on Polygon',
              timing: 'Direct on-chain payout',
            },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMethod(m.id as any)}
              className={`opt ${selectedMethod === m.id ? 'sel' : ''}`}
            >
              <i className={`ti ${m.icon} text-[20px] text-[#F5F3EC]`}></i>
              <span className="flex-1">
                <span className="block text-[14px] font-medium text-[#F5F3EC]">{m.title}</span>
                <span className="block text-[12px] text-[#9A9892]">{m.detail}</span>
                <span className="block text-[11px] text-[#C7F26B] mt-0.5">{m.timing}</span>
              </span>
              {selectedMethod === m.id && (
                <i className="ti ti-check text-[#C7F26B] text-[18px]"></i>
              )}
            </button>
          ))}
        </div>

        {/* Rules Box from UX Spec */}
        <div className="bg-[#1C1C1C] rounded-[16px] p-3.5 border border-[#2A2A2A]/50 space-y-1.5 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[#9A9892]">Settlement schedule</span>
            <span className="text-[#F5F3EC] font-medium">Weekly, on Fridays</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9A9892]">Verification window</span>
            <span className="text-[#F5F3EC] font-medium">14 days per install</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9A9892]">Minimum payout</span>
            <span className="text-[#F5F3EC] font-medium">$20.00</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="pill py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="pill on py-2 px-5"
          >
            Save method
          </button>
        </div>
      </div>
    </div>
  );
};

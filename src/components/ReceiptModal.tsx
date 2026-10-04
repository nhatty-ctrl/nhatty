import React, { useRef } from 'react';
import { WithdrawalReceipt, SettlementReceipt } from '../types/campaign';

interface ReceiptModalProps {
  receipt: WithdrawalReceipt | SettlementReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  type?: 'withdrawal' | 'settlement';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  type = 'withdrawal',
}) => {
  const receiptRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !receipt) return null;

  const isWithdrawal = type === 'withdrawal' && 'destination' in receipt;
  const withdrawReceipt = isWithdrawal ? (receipt as WithdrawalReceipt) : null;
  const settleReceipt = !isWithdrawal ? (receipt as SettlementReceipt) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    const hash = isWithdrawal ? withdrawReceipt?.hash : settleReceipt?.settlementHash;
    if (hash) {
      navigator.clipboard?.writeText(hash);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] relative select-none animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-11 right-0 w-8 h-8 rounded-full bg-[#1C1C1F] hover:bg-[#27272A] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border border-[#2A2A2A] cursor-pointer transition-colors z-20"
          aria-label="Close receipt"
        >
          <i className="ti ti-x text-[14px]"></i>
        </button>

        {/* Paper Receipt Body with animated tear-off top & jagged perforation bottom */}
        <div
          ref={receiptRef}
          className="bg-[#FAFAF9] text-[#1C1917] rounded-t-[16px] shadow-2xl overflow-hidden relative border border-[#E7E5E4]"
          style={{
            backgroundImage: 'radial-gradient(#E7E5E4 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          {/* Top Paper Tear Decoration */}
          <div className="h-2.5 bg-[#E7E5E4] flex items-center justify-around overflow-hidden">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#FAFAF9] inline-block -mt-1" />
            ))}
          </div>

          <div className="p-6 sm:p-7 space-y-5 text-left">
            {/* Header: KRED Seal & Status */}
            <div className="flex items-start justify-between border-b border-dashed border-[#D6D3D1] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#1C1917] text-[#FAFAF9] flex items-center justify-center text-[16px]">
                  <i className="ti ti-asterisk"></i>
                </div>
                <div>
                  <div className="font-bold text-[16px] tracking-tight text-[#1C1917]">
                    KRED ESCROW RECEIPT
                  </div>
                  <div className="text-[11px] font-mono text-[#78716C] uppercase">
                    Attestation: Verified
                  </div>
                </div>
              </div>

              <div className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[11px] font-mono font-bold flex items-center gap-1">
                <i className="ti ti-circle-check text-[12px]"></i>
                <span>CLEARED</span>
              </div>
            </div>

            {/* Big Amount */}
            <div className="text-center py-2">
              <div className="text-[12px] font-mono uppercase tracking-wider text-[#78716C]">
                {isWithdrawal ? 'Total Creator Payout' : 'Escrow Deposit'}
              </div>
              <div className="text-[38px] font-extrabold font-mono tracking-tight text-[#1C1917] mt-0.5">
                ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11.5px] text-[#78716C] mt-1 font-mono">
                {new Date(receipt.timestamp).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-2.5 text-[13px] border-t border-b border-dashed border-[#D6D3D1] py-3.5 font-mono">
              <div className="flex justify-between text-[#44403C]">
                <span>Transaction Ref</span>
                <span className="font-semibold text-[#1C1917]">{receipt.id}</span>
              </div>

              {isWithdrawal && withdrawReceipt && (
                <>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Beneficiary Handle</span>
                    <span className="text-[#1C1917]">@{withdrawReceipt.creatorHandle}</span>
                  </div>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Payout Rail</span>
                    <span className="text-[#1C1917] capitalize">{withdrawReceipt.methodType} (Whoop Verified)</span>
                  </div>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Destination Account</span>
                    <span className="text-[#1C1917] truncate max-w-[200px]">{withdrawReceipt.destination}</span>
                  </div>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Network Fee (Covered by Escrow)</span>
                    <span className="text-[#16A34A]">$0.00</span>
                  </div>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Settlement Batch</span>
                    <span className="text-[#1C1917]">{withdrawReceipt.settlementBatch}</span>
                  </div>
                </>
              )}

              {!isWithdrawal && settleReceipt && (
                <>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Campaign</span>
                    <span className="text-[#1C1917]">{settleReceipt.campaignName}</span>
                  </div>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Remaining Escrow</span>
                    <span className="text-[#1C1917]">${settleReceipt.escrowRemaining.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between text-[#44403C]">
                    <span>Disbursement Protocol</span>
                    <span className="text-[#1C1917]">RavenCore Attested</span>
                  </div>
                </>
              )}
            </div>

            {/* Cryptographic Hash & Barcode Visual */}
            <div className="pt-1 text-center space-y-2">
              <div
                onClick={handleCopyHash}
                className="cursor-pointer group flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#78716C] hover:text-[#1C1917] bg-[#F5F5F4] p-1.5 rounded-[8px]"
                title="Click to copy cryptographic verification signature"
              >
                <i className="ti ti-fingerprint text-[14px]"></i>
                <span className="truncate max-w-[280px]">
                  {isWithdrawal ? withdrawReceipt?.hash : settleReceipt?.settlementHash}
                </span>
                <i className="ti ti-copy text-[12px] opacity-70 group-hover:opacity-100"></i>
              </div>

              {/* Decorative Barcode */}
              <div className="h-9 flex items-center justify-center gap-[3px] opacity-75 px-4 pt-1">
                {Array.from({ length: 44 }).map((_, i) => (
                  <span
                    key={i}
                    className="bg-[#1C1917] h-full inline-block"
                    style={{
                      width: i % 4 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px',
                    }}
                  />
                ))}
              </div>
              <div className="text-[9.5px] font-mono tracking-widest text-[#78716C]">
                WHOOP-ESCROW-256 · RAVENCORE AUDITED
              </div>
            </div>
          </div>

          {/* Jagged Bottom Paper Edge */}
          <div className="flex items-end justify-between overflow-hidden h-3 bg-[#FAFAF9]">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#FAFAF9] -mb-[1px]"
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions Outside Receipt */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={handlePrint}
            className="pill flex-1 justify-center bg-[#1C1C1F] hover:bg-[#27272A] text-[#F5F3EC] py-2 text-[12.5px] cursor-pointer"
          >
            <i className="ti ti-printer text-[14px]"></i>
            <span>Print receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="pill on flex-1 justify-center py-2 text-[12.5px] cursor-pointer font-medium"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

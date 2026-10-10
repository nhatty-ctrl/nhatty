import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import { PayoutIntent, LedgerAccount } from '../../types/umi';

interface CreatorWalletViewProps {
  ledgerAccounts: LedgerAccount[];
  payouts: PayoutIntent[];
  onBack: () => void;
}

export const CreatorWalletView: React.FC<CreatorWalletViewProps> = ({
  ledgerAccounts,
  payouts,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableAcc = ledgerAccounts.find((a) => a.kind === 'creator_payable_available');
  const pendingAcc = ledgerAccounts.find((a) => a.kind === 'creator_payable_pending');
  const availableDollars = (availableAcc?.balanceMinor || 0) / 100;
  const pendingDollars = (pendingAcc?.balanceMinor || 0) / 100;

  const handleWithdraw = () => {
    if (availableDollars < 20) {
      alert('Minimum withdrawal amount is $20.00');
      return;
    }

    setIsProcessing(true);
    setSuccessMsg(null);
    try {
      const intent = umiStore.requestWhopPayout();
      setSuccessMsg(`Withdrawal of $${availableDollars.toFixed(2)} scheduled via Whop. Idempotency key: ${intent.idempotencyKey.slice(0, 16)}...`);
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-[#9C9A92] hover:text-[#F4F2EC] mb-1.5 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <i className="ti ti-arrow-left"></i>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-[20px] font-semibold text-[#F4F2EC]">Creator Wallet & Whop Payouts</h1>
          <p className="text-[13px] text-[#9C9A92] mt-0.5">
            Transparent double-entry ledger settlement via Whop Banking
          </p>
        </div>

        {/* Payout Trigger */}
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={isProcessing || availableDollars < 20}
          className="px-5 py-2.5 rounded-xl bg-[#C9B8FF] hover:bg-[#ba9bf7] text-[#000000] text-[13px] font-semibold transition-all shadow-sm cursor-pointer border-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ti ti-wallet text-[15px]"></i>
          <span>{isProcessing ? 'Processing...' : `Withdraw $${availableDollars.toFixed(2)}`}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] flex items-center gap-2 animate-[fadeIn_0.1s_ease-out]">
          <i className="ti ti-check text-[16px]"></i>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Next Settlement Batch Banner & 0% Fee Guarantee */}
      <div className="p-4 bg-[#141414] rounded-2xl border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C9B8FF]/15 text-[#C9B8FF] flex items-center justify-center text-[18px] shrink-0">
            <i className="ti ti-calendar-event"></i>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#F4F2EC]">
              Next Weekly Batch: <span className="text-[#C9B8FF]">Friday, Oct 16 at 17:00 UTC</span>
            </div>
            <div className="text-[12px] text-[#9C9A92] mt-0.5">
              Available balance ≥ $20.00 transfers automatically. 0% fee deducted (you keep 100% of your earnings).
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#303030] text-[11.5px] text-[#C0DD97] shrink-0 self-start sm:self-auto font-medium">
          <i className="ti ti-lock text-[12px]"></i>
          <span>100% Prefunded Escrow</span>
        </div>
      </div>

      {/* Regulatory & FTC Earnings Claim Notice */}
      <div className="p-3 bg-[#111113] rounded-xl border border-[#222222] flex items-start gap-2.5 text-[11.5px] text-[#9C9A92] leading-relaxed">
        <i className="ti ti-info-circle text-[15px] text-[#FAC775] shrink-0 mt-0.5"></i>
        <span>
          <b className="text-[#F4F2EC]">FTC Notice on Telemetry Projections:</b> In-app live earnings and projected campaign milestones are estimates based on incoming device telemetry. Final payouts require RavenCore SDK cryptographic hardware attestation and completion of the safety hold.
        </span>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#9C9A92] mb-1">Available for Withdrawal</div>
          <div className="text-[26px] font-mono font-bold text-[#C9B8FF]">
            ${availableDollars.toFixed(2)}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1.5">
            Safety hold complete · Ready for instant Whop transfer
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#9C9A92] mb-1">In Active Safety Holds</div>
          <div className="text-[26px] font-mono font-bold text-[#F4F2EC]">
            ${pendingDollars.toFixed(2)}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1.5">
            Automatic release upon hold window completion
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#9C9A92] mb-1">Total Payouts Settled</div>
          <div className="text-[26px] font-mono font-bold text-[#F4F2EC]">
            ${(payouts.reduce((sum, p) => sum + (p.status === 'settled' ? p.amountMinor : 0), 0) / 100).toFixed(2)}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1.5">
            Directly transferred to Chase Checking (••4821)
          </div>
        </div>
      </div>

      {/* Whop Payout Destination Card */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#202020] text-[#C9B8FF] flex items-center justify-center text-[22px] shrink-0">
            <i className="ti ti-building-bank"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium text-[#F4F2EC]">Chase Premier Checking (••4821)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Whop Verified
              </span>
            </div>
            <div className="text-[12px] text-[#9C9A92] mt-0.5">
              ACH Direct Deposit · Daily transfers settle by 5:00 PM EST
            </div>
          </div>
        </div>

        <button
          type="button"
          className="px-3.5 py-1.5 rounded-lg bg-[#202020] hover:bg-[#222222] text-[#F4F2EC] text-[12px] font-medium transition-colors border border-[#333] cursor-pointer"
        >
          Manage in Whop
        </button>
      </div>

      {/* Payout History Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
        <h3 className="text-[15px] font-semibold text-[#F4F2EC] mb-3">Payout Transfer History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#222] text-[#777] text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-medium">Transfer Reference</th>
                <th className="pb-2.5 font-medium">Provider</th>
                <th className="pb-2.5 font-medium">Destination</th>
                <th className="pb-2.5 font-medium">Initiated</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020]">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="py-3 font-mono text-[12px] text-[#F4F2EC]">
                    {p.providerPayoutId || p.id}
                  </td>
                  <td className="py-3 capitalize text-[#9C9A92] flex items-center gap-1.5">
                    <i className="ti ti-brand-stripe text-[14px] text-[#C9B8FF]"></i>
                    <span>{p.provider}</span>
                  </td>
                  <td className="py-3 text-[#9C9A92]">Chase Checking (••4821)</td>
                  <td className="py-3 font-mono text-[12px] text-[#777]">
                    {new Date(p.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'settled'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {p.status === 'settled' ? 'Settled' : 'In Transit'}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-right font-medium text-[#F4F2EC]">
                    ${(p.amountMinor / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

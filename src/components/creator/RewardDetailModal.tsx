import React, { useState } from 'react';
import { RewardEntitlement, REWARD_STATUS_LABELS } from '../../types/umi';

interface RewardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: RewardEntitlement | null;
}

export const RewardDetailModal: React.FC<RewardDetailModalProps> = ({
  isOpen,
  onClose,
  reward,
}) => {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen || !reward) return null;

  const statusMeta = REWARD_STATUS_LABELS[reward.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C7F26B] flex items-center justify-center text-[19px]">
              <i className="ti ti-receipt"></i>
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#F5F3EC]">Reward Entitlement Details</h2>
              <div className="text-[12px] text-[#A8A69E] font-mono">{reward.id}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#A8A69E] hover:text-[#F5F3EC] flex items-center justify-center transition-colors border-0 cursor-pointer"
          >
            <i className="ti ti-x text-[16px]"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border ${statusMeta.badgeColor}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] font-semibold uppercase tracking-wider">
                Status: {statusMeta.label}
              </span>
              <span className="text-[18px] font-mono font-bold">
                ${(reward.amountMinor / 100).toFixed(2)} USD
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed opacity-90 mt-1">
              {statusMeta.meaning}
            </p>
            {reward.frozenReason && (
              <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 text-[11.5px] font-mono text-rose-300">
                Rule note: {reward.frozenReason}
              </div>
            )}
          </div>

          {/* Key Properties */}
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
              <div className="text-[#777] mb-0.5">Campaign</div>
              <div className="text-[#F5F3EC] font-medium">{reward.campaignName}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
              <div className="text-[#777] mb-0.5">Attribution Record</div>
              <div className="font-mono text-[#C7F26B]">{reward.attributionId}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
              <div className="text-[#777] mb-0.5">Hold Expiration Window</div>
              <div className="text-[#F5F3EC] font-mono">
                {new Date(reward.holdUntil).toLocaleDateString()} ({reward.status === 'available' || reward.status === 'paid' ? 'Completed' : 'Active'})
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
              <div className="text-[#777] mb-0.5">Double-Entry Journal TX</div>
              <div className="font-mono text-[#888] truncate">{reward.ledgerTransactionId}</div>
            </div>
          </div>

          {/* Evidence Timeline */}
          <div>
            <h4 className="text-[12.5px] font-medium text-[#A8A69E] mb-3 uppercase tracking-wider">
              Verification Lifecycle Timeline
            </h4>
            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#2A2A2A]">
              <div className="flex items-start gap-3 relative pl-1">
                <span className="w-5 h-5 rounded-full bg-[#222] border border-[#333] text-[#C7F26B] flex items-center justify-center text-[10px] shrink-0 mt-0.5 z-10">
                  <i className="ti ti-check"></i>
                </span>
                <div>
                  <div className="text-[13px] font-medium text-[#F5F3EC]">Referral Click Handled</div>
                  <div className="text-[11.5px] text-[#777]">Edge redirect worker confirmed non-bot iOS user</div>
                </div>
              </div>

              <div className="flex items-start gap-3 relative pl-1">
                <span className="w-5 h-5 rounded-full bg-[#222] border border-[#333] text-[#C7F26B] flex items-center justify-center text-[10px] shrink-0 mt-0.5 z-10">
                  <i className="ti ti-check"></i>
                </span>
                <div>
                  <div className="text-[13px] font-medium text-[#F5F3EC]">Source Confirmation Matched</div>
                  <div className="text-[11.5px] text-[#777]">Umi SDK matched unique install token to creator code</div>
                </div>
              </div>

              <div className="flex items-start gap-3 relative pl-1">
                <span className="w-5 h-5 rounded-full bg-[#222] border border-[#333] text-[#C7F26B] flex items-center justify-center text-[10px] shrink-0 mt-0.5 z-10">
                  <i className="ti ti-check"></i>
                </span>
                <div>
                  <div className="text-[13px] font-medium text-[#F5F3EC]">Milestone Event Telemetry Received</div>
                  <div className="text-[11.5px] text-[#777]">Convex HTTP action ingested event and reserved escrow</div>
                </div>
              </div>

              <div className="flex items-start gap-3 relative pl-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 z-10 ${
                  reward.status === 'paid' ? 'bg-[#C7F26B] text-[#0B0B0B]' : 'bg-[#222] text-[#888]'
                }`}>
                  <i className="ti ti-coin"></i>
                </span>
                <div>
                  <div className="text-[13px] font-medium text-[#F5F3EC]">Whop Settlement</div>
                  <div className="text-[11.5px] text-[#777]">
                    {reward.status === 'paid' ? 'Settled to creator banking' : 'Scheduled upon hold release'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support / Appeal Ticket Action */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#222] flex items-center justify-between">
            <div>
              <div className="text-[12.5px] font-medium text-[#F5F3EC]">Questions regarding attribution?</div>
              <div className="text-[11.5px] text-[#777]">
                Submit a review request to our trust & safety audit desk.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTicketSubmitted(true)}
              disabled={ticketSubmitted}
              className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#F5F3EC] text-[12px] font-medium transition-colors border-0 cursor-pointer disabled:opacity-50"
            >
              {ticketSubmitted ? 'Review Ticket #8192 Opened' : 'Request Review'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[13px] font-semibold transition-all border-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

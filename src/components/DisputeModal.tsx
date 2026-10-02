import React, { useState } from 'react';
import { UserRole } from '../types/campaign';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onDisputeSubmitted?: (id: string, reason: string) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  role,
  onDisputeSubmitted,
}) => {
  const isFounder = role === 'founder';
  const [targetId, setTargetId] = useState('inst_9a8f2');
  const [reason, setReason] = useState('vpn_mismatch');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onDisputeSubmitted) {
      onDisputeSubmitted(targetId, notes || reason);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[460px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left relative space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">
              {isFounder ? 'Flag suspicious traffic' : 'Contest rejected install'}
            </div>
            <div className="sub mt-0.5">
              {isFounder
                ? 'Flag duplicate or emulator events for forensic attribution audit.'
                : 'Contest an install rejected by the verification window.'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#C7F26B] text-[#16140F] inline-flex items-center justify-center text-[24px]">
              <i className="ti ti-check" aria-hidden="true"></i>
            </div>
            <div className="text-[16px] font-medium text-[#F5F3EC]">
              Dispute ticket submitted
            </div>
            <div className="sub text-[13px]">
              Both parties will see an updated status while telemetry logs are reviewed.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="fl" htmlFor="target-ref">
                {isFounder ? 'Attribution reference ID' : 'Tracking event reference'}
              </label>
              <input
                id="target-ref"
                className="in font-mono text-[13px]"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="inst_9a8f2"
                required
              />
            </div>

            <div>
              <label className="fl" htmlFor="dispute-reason">Reason</label>
              <select
                id="dispute-reason"
                className="in"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {isFounder ? (
                  <>
                    <option value="bot_traffic">Automated device farm pattern</option>
                    <option value="vpn_mismatch">VPN / proxy geolocation spoofing</option>
                    <option value="duplicate_id">Duplicate hardware identifier</option>
                    <option value="other">Other attribution anomaly</option>
                  </>
                ) : (
                  <>
                    <option value="first_launch_done">User completed first session and tutorial</option>
                    <option value="genuine_device">Genuine iOS / Android physical device</option>
                    <option value="valid_region">Target country matching campaign requirements</option>
                    <option value="other">Other verification evidence</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="fl" htmlFor="dispute-notes">Additional details (optional)</label>
              <textarea
                id="dispute-notes"
                className="in h-[80px] py-2 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context or telemetry references"
              />
            </div>

            <div className="bg-[#1C1C1C] rounded-[16px] p-3 text-[12px] text-[#9A9892]">
              Status is displayed on the analytics ledger until resolved. Settlement holds are suspended during active dispute review.
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="pill min-h-[44px] px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pill on min-h-[44px] px-5 cursor-pointer font-medium"
              >
                Submit dispute
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React from 'react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDispute?: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  onOpenDispute,
}) => {
  if (!isOpen) return null;

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
            <div className="text-[18px] font-medium text-[#F5F3EC]">Help and support</div>
            <div className="sub mt-0.5">Answers to common questions about attribution and payouts.</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>

        {/* FAQs */}
        <div className="space-y-3 pt-1 text-[13px]">
          <div className="p-3 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40 space-y-1">
            <div className="font-medium text-[#F5F3EC]">How are installs verified?</div>
            <div className="text-[#9A9892] leading-relaxed">
              When a user opens the app through your link, the lightweight SDK verifies the device hardware and country origin over a 14-day attribution window.
            </div>
          </div>

          <div className="p-3 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40 space-y-1">
            <div className="font-medium text-[#F5F3EC]">When do creator settlements pay out?</div>
            <div className="text-[#9A9892] leading-relaxed">
              Settlements occur weekly on Fridays at 17:00 UTC for all installs that have finished their 14-day hold, provided the $20 minimum balance is met.
            </div>
          </div>

          <div className="p-3 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40 space-y-1">
            <div className="font-medium text-[#F5F3EC]">Have an attribution issue?</div>
            <div className="text-[#9A9892] leading-relaxed">
              Creators can contest rejected installs and founders can flag invalid traffic.
            </div>
            {onOpenDispute && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDispute();
                }}
                className="ol mt-2 text-[12px] py-1 px-3 cursor-pointer"
              >
                <span>Open dispute flow</span>
                <i className="ti ti-arrow-right text-[11px]" aria-hidden="true"></i>
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="pill on min-h-[44px] px-5 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

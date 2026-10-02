import React, { useState } from 'react';
import { Campaign } from '../types/campaign';

interface CampaignManagementModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCampaign: (updated: Campaign) => void;
}

export const CampaignManagementModal: React.FC<CampaignManagementModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onUpdateCampaign,
}) => {
  const [budgetVal, setBudgetVal] = useState(campaign?.budget ? String(campaign.budget) : '5000');
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleTogglePause = () => {
    // We can model paused by days === 0 or custom flag
    const isPaused = (campaign as any).isPaused;
    onUpdateCampaign({
      ...campaign,
      ...{ isPaused: !isPaused },
    });
    onClose();
  };

  const handleSaveBudget = () => {
    const b = parseFloat(budgetVal) || campaign.budget || 5000;
    onUpdateCampaign({
      ...campaign,
      budget: b,
    });
    onClose();
  };

  const handleEndEarly = () => {
    onUpdateCampaign({
      ...campaign,
      days: 0,
      ...{ isEnded: true },
    });
    setConfirmEnd(false);
    onClose();
  };

  const isPaused = (campaign as any).isPaused;
  const isEnded = campaign.days <= 0 || (campaign as any).isEnded;

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
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] shrink-0"
              style={{ backgroundColor: campaign.bg, color: campaign.fg }}
            >
              <i className={`ti ${campaign.icon}`}></i>
            </span>
            <div>
              <div className="text-[17px] font-medium text-[#F5F3EC]">{campaign.name}</div>
              <div className="sub text-[12px]">Campaign management</div>
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

        {confirmEnd ? (
          /* Confirm End Early */
          <div className="space-y-3 pt-2">
            <div className="text-[15px] font-medium text-[#FF8A80]">
              End campaign early?
            </div>
            <p className="text-[13px] text-[#9A9892] leading-relaxed">
              This will stop new attribution events immediately. Installs currently inside the 14-day verification window will finish verifying and settle. Unused budget will be refunded to your balance.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEnd(false)}
                className="pill min-h-[44px] px-4 cursor-pointer"
              >
                Keep running
              </button>
              <button
                type="button"
                onClick={handleEndEarly}
                className="pill on min-h-[44px] px-4 cursor-pointer bg-[#FF8A80]! text-[#16140F]!"
              >
                Confirm end campaign
              </button>
            </div>
          </div>
        ) : (
          /* Controls */
          <div className="space-y-4 pt-1">
            {/* Status overview */}
            <div className="bg-[#1C1C1C] rounded-[16px] p-3.5 border border-[#2A2A2A]/40 flex items-center justify-between">
              <div>
                <div className="sub text-[11px]">Campaign status</div>
                <div className="text-[15px] font-medium text-[#F5F3EC] mt-0.5">
                  {isEnded ? 'Ended' : isPaused ? 'Paused' : 'Active and funding'}
                </div>
              </div>

              {!isEnded && (
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className={`pill min-h-[38px] px-3.5 text-[12px] cursor-pointer ${
                    isPaused ? 'on' : 'out'
                  }`}
                >
                  <i className={`ti ${isPaused ? 'ti-player-play' : 'ti-player-pause'}`}></i>
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}
            </div>

            {/* Edit Budget */}
            <div>
              <label className="fl" htmlFor="edit-budget">Total campaign budget (USD)</label>
              <div className="flex gap-2">
                <input
                  id="edit-budget"
                  className="in"
                  type="number"
                  min="500"
                  step="500"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  disabled={isEnded}
                />
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  disabled={isEnded}
                  className="pill on min-h-[44px] px-4 shrink-0 cursor-pointer font-medium disabled:opacity-40"
                >
                  Save
                </button>
              </div>
              <span className="sub mt-1 block text-[11px]">
                Platform fee of 10% applies to net additions.
              </span>
            </div>

            {/* End Campaign Early Trigger */}
            {!isEnded && (
              <div className="pt-2 border-t border-[#2A2A2A] flex justify-between items-center">
                <div>
                  <div className="text-[13px] font-medium text-[#F5F3EC]">End campaign</div>
                  <div className="sub text-[11px]">Refund remaining funds to account balance.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(true)}
                  className="ol min-h-[38px] px-3 text-[12px] text-[#FF8A80] border-[#FF8A80]/40 hover:border-[#FF8A80] cursor-pointer"
                >
                  End early
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

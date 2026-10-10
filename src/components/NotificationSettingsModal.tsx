import React, { useState } from 'react';
import { UserRole } from '../types/campaign';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  const isFounder = role === 'founder';

  const [settings, setSettings] = useState<Record<string, boolean>>({
    // Creator
    installs_verified: true,
    payout_sent: true,
    campaign_ending: true,
    new_in_category: false,
    // Founder
    sdk_connected: true,
    creator_milestone: true,
    budget_warning: true,
    installs_rejected: true,
  });

  if (!isOpen) return null;

  const toggle = (k: string) => {
    setSettings((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const creatorItems = [
    { k: 'installs_verified', title: 'Installs verified', desc: 'When installs from your link pass the verification window.' },
    { k: 'payout_sent', title: 'Payout sent', desc: 'Weekly settlement credited to your payout method on Fridays.' },
    { k: 'campaign_ending', title: 'Campaign ending soon', desc: 'Alerts 3 days before a campaign you joined closes.' },
    { k: 'new_in_category', title: 'New campaign in a category', desc: 'When new apps launch in categories you promote.' },
  ];

  const founderItems = [
    { k: 'sdk_connected', title: 'SDK connected', desc: 'When your mobile app sends its first attribution event.' },
    { k: 'creator_milestone', title: 'Creator milestone', desc: 'When creator participation hits major thresholds.' },
    { k: 'budget_warning', title: 'Budget 80% used', desc: 'Reminders when campaign balance reaches 20% remaining.' },
    { k: 'installs_rejected', title: 'Installs rejected', desc: 'When suspicious or duplicate traffic is discarded fraud-free.' },
  ];

  const activeItems = isFounder ? founderItems : creatorItems;

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
            <div className="text-[18px] font-medium text-[#F4F2EC]">Notification settings</div>
            <div className="sub mt-0.5">
              Customize alerts for your {isFounder ? 'founder' : 'creator'} workspace.
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9A9892] hover:text-[#F4F2EC] flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>

        {/* Toggles List */}
        <div className="space-y-2.5 pt-1">
          {activeItems.map((item) => {
            const on = !!settings[item.k];
            return (
              <div
                key={item.k}
                className="flex items-center justify-between gap-3 p-3 bg-[#141414] rounded-[16px] border border-[#222222]/40"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[14px] font-medium text-[#F4F2EC]">{item.title}</div>
                  <div className="text-[12px] text-[#9A9892] mt-0.5 leading-snug">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(item.k)}
                  className={`sw ${on ? 'on' : ''}`}
                >
                  <i></i>
                </button>
              </div>
            );
          })}
        </div>

        {/* Done Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="pill on py-2 px-5"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

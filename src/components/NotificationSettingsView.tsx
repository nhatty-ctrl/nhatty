import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface NotificationSettingsViewProps {
  onBack: () => void;
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    installs_verified: true,
    payout_sent: true,
    campaign_ending: true,
    new_in_category: false,
    sdk_connected: true,
    creator_milestone: true,
    budget_warning: true,
    installs_rejected: true,
  });

  const toggle = (k: string) => {
    setSettings((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const notificationItems = [
    { k: 'installs_verified', title: 'Installs verified', desc: 'When installs from your link pass the 14-day verification window.' },
    { k: 'payout_sent', title: 'Payout sent', desc: 'When your weekly settlement is released to your payout method on Fridays.' },
    { k: 'campaign_ending', title: 'Campaign ending soon', desc: 'Alerts 3 days before a campaign you participate in closes.' },
    { k: 'new_in_category', title: 'New campaign in a category', desc: 'When new apps launch in categories matching your interests.' },
    { k: 'sdk_connected', title: 'SDK connected', desc: 'When your mobile app sends its first install attribution event.' },
    { k: 'creator_milestone', title: 'Creator milestone', desc: 'When creators join and hit major verified install milestones.' },
    { k: 'budget_warning', title: 'Budget 80% used', desc: 'Alerts when your campaign balance has 20% remaining.' },
    { k: 'installs_rejected', title: 'Installs rejected', desc: 'When suspicious or duplicate traffic is discarded fraud-free.' },
  ];

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Profile', icon: 'ti-user', onClick: onBack },
          { label: 'Notification settings', icon: 'ti-bell', active: true },
        ]}
      />

      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-1">
          <div>
            <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC]">
              Notification settings
            </h1>
            <p className="text-[13px] text-[#9A9892] mt-1">
              Control the activity and financial alerts you receive.
            </p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="card space-y-3">
        <div className="text-[16px] font-medium text-[#F5F3EC]">Activity notifications</div>

        <div className="space-y-2 pt-1">
          {notificationItems.map((item) => {
            const on = !!settings[item.k];
            return (
              <div
                key={item.k}
                className="flex items-center justify-between gap-3 p-3 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[14px] font-medium text-[#F5F3EC]">{item.title}</div>
                  <div className="text-[12px] text-[#9A9892] mt-0.5 leading-snug">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(item.k)}
                  className={`sw ${on ? 'on' : ''}`}
                  aria-label={item.title}
                >
                  <i></i>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

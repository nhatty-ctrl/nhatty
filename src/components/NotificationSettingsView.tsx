import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface NotificationSettingsViewProps {
  onBack: () => void;
}

const DEFAULT_SETTINGS: Record<string, boolean> = {
  installs_verified: true,
  payout_sent: true,
  campaign_ending: true,
  new_in_category: false,
  sdk_connected: true,
  creator_milestone: true,
  budget_warning: true,
  installs_rejected: true,
};

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('kred_notification_settings');
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const toggle = (k: string, title: string) => {
    setSettings((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      try {
        localStorage.setItem('kred_notification_settings', JSON.stringify(next));
      } catch {}
      setSavedBanner(`Updated preference for "${title}"`);
      setTimeout(() => setSavedBanner(null), 3000);
      return next;
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem('kred_notification_settings', JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
    setSavedBanner('Reset notification preferences to defaults');
    setTimeout(() => setSavedBanner(null), 3000);
  };

  const creatorItems = [
    { k: 'installs_verified', title: 'Installs verified', desc: 'When installs from your link pass the 14-day attribution hold.' },
    { k: 'payout_sent', title: 'Payout sent', desc: 'When your weekly settlement is released to your payout method on Fridays.' },
    { k: 'campaign_ending', title: 'Campaign ending soon', desc: 'Alerts 3 days before a campaign you participate in closes.' },
    { k: 'new_in_category', title: 'New campaign in a category', desc: 'When new apps launch in categories matching your interests.' },
  ];

  const founderItems = [
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F4F2EC]">
            Notification settings
          </h1>
          <p className="text-[13px] text-[#9C9A92] mt-1">
            Control the activity and financial alerts you receive. Changes are saved to your account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="pill text-[12px] py-1.5 px-3 self-start sm:self-auto cursor-pointer"
        >
          <i className="ti ti-refresh text-[13px]"></i>
          <span>Reset defaults</span>
        </button>
      </div>

      {/* Real-time Save Feedback Notification */}
      {savedBanner && (
        <div className="p-3 bg-[#141414] border border-[#C9B8FF]/50 rounded-[14px] text-[13px] text-[#F4F2EC] flex items-center justify-between animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center gap-2">
            <i className="ti ti-check text-[#C9B8FF]"></i>
            <span>{savedBanner} (saved locally)</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedBanner(null)}
            className="text-[#9C9A92] hover:text-[#F4F2EC] border-0 bg-transparent cursor-pointer"
          >
            <i className="ti ti-x text-[12px]"></i>
          </button>
        </div>
      )}

      {/* Creator Category Notifications (Finding 9 & 10) */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#222222]/60">
          <div>
            <div className="text-[16px] font-medium text-[#F4F2EC]">Creator activity alerts</div>
            <div className="text-[12px] text-[#9C9A92]">Install tracking, weekly Friday payouts, and campaign announcements.</div>
          </div>
          <span className="chip py-0.5 px-2 text-[10px] bg-[#C9B8FF]/20 text-[#C9B8FF] font-semibold uppercase tracking-wider">
            Creator role
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {creatorItems.map((item) => {
            const on = !!settings[item.k];
            return (
              <div
                key={item.k}
                className="flex items-center justify-between gap-3 p-3 bg-[#141414] rounded-[16px] border border-[#222222]/40"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[14px] font-medium text-[#F4F2EC]">{item.title}</div>
                  <div className="text-[12px] text-[#9C9A92] mt-0.5 leading-snug">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(item.k, item.title)}
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

      {/* Founder Category Notifications (Finding 9 & 10) */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#222222]/60">
          <div>
            <div className="text-[16px] font-medium text-[#F4F2EC]">App owner & advertiser alerts</div>
            <div className="text-[12px] text-[#9C9A92]">SDK telemetry, budget thresholds, fraud prevention, and milestones.</div>
          </div>
          <span className="chip py-0.5 px-2 text-[10px] bg-[#B5D4F4]/20 text-[#B5D4F4] font-semibold uppercase tracking-wider">
            Founder role
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {founderItems.map((item) => {
            const on = !!settings[item.k];
            return (
              <div
                key={item.k}
                className="flex items-center justify-between gap-3 p-3 bg-[#141414] rounded-[16px] border border-[#222222]/40"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[14px] font-medium text-[#F4F2EC]">{item.title}</div>
                  <div className="text-[12px] text-[#9C9A92] mt-0.5 leading-snug">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(item.k, item.title)}
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

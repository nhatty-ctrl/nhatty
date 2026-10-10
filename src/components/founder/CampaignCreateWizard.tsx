import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import { FounderApp } from '../../types/umi';

interface CampaignCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  apps: FounderApp[];
  onCreated: () => void;
}

export const CampaignCreateWizard: React.FC<CampaignCreateWizardProps> = ({
  isOpen,
  onClose,
  apps,
  onCreated,
}) => {
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id || '');
  const [name, setName] = useState('');
  const [rewardDollars, setRewardDollars] = useState('2.50');
  const [qualifyingEvent, setQualifyingEvent] = useState('level_3_completed');
  const [qualifyingEventLabel, setQualifyingEventLabel] = useState('Complete Level 3 in-game');
  const [budgetDollars, setBudgetDollars] = useState('5000');
  const [holdDays, setHoldDays] = useState(7);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];
  const rewardMinor = Math.round(parseFloat(rewardDollars || '0') * 100);
  const budgetMinor = Math.round(parseFloat(budgetDollars || '0') * 100);
  const estimatedInstalls = rewardMinor > 0 ? Math.floor(budgetMinor / rewardMinor) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      umiStore.createCampaign({
        appId: selectedApp.id,
        name: name.trim(),
        rewardMinor,
        qualifyingEvent,
        qualifyingEventLabel: qualifyingEventLabel.trim() || 'Complete required in-app milestone',
        totalBudgetMinor: budgetMinor,
        holdDays,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#262626]">
          <div>
            <h2 className="text-[17px] font-semibold text-[#F4F2EC]">Create Performance Campaign</h2>
            <p className="text-[12.5px] text-[#9C9A92] mt-0.5">
              Convex-managed campaign with automated iOS source confirmation & escrow
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1F1F1F] hover:bg-[#222222] text-[#9C9A92] hover:text-[#F4F2EC] flex items-center justify-center transition-colors border-0 cursor-pointer"
          >
            <i className="ti ti-x text-[16px]"></i>
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Select App */}
          <div>
            <label className="block text-[12px] font-medium text-[#9C9A92] mb-2 uppercase tracking-wider">
              1. Choose Registered iOS App
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {apps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    setSelectedAppId(app.id);
                    if (!name) setName(`${app.name} Verified Growth`);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    selectedAppId === app.id
                      ? 'bg-[#141414] border-[#C9B8FF] ring-1 ring-[#C9B8FF]/30'
                      : 'bg-[#181818] border-[#222222] hover:border-[#383838]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#222222] flex items-center justify-center text-[18px] text-[#C9B8FF] shrink-0">
                    <i className={`ti ${app.icon}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-[#F4F2EC] truncate">{app.name}</div>
                    <div className="text-[11px] text-[#9C9A92] truncate font-mono">{app.bundleId}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Title */}
          <div>
            <label className="block text-[12px] font-medium text-[#9C9A92] mb-1.5 uppercase tracking-wider">
              2. Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pixel Pop Level 3 Acquisition"
              required
              className="w-full h-11 px-3.5 bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] rounded-xl text-[14px] text-[#F4F2EC] placeholder-[#555] outline-none transition-colors"
            />
          </div>

          {/* Qualifying Event */}
          <div>
            <label className="block text-[12px] font-medium text-[#9C9A92] mb-1.5 uppercase tracking-wider">
              3. Required Qualifying Event (SDK Milestone)
            </label>
            <div className="space-y-2">
              <select
                value={qualifyingEvent}
                onChange={(e) => {
                  setQualifyingEvent(e.target.value);
                  if (e.target.value === 'level_3_completed') {
                    setQualifyingEventLabel('Complete Level 3 (In-Game Milestone)');
                  } else if (e.target.value === 'first_1000_steps_logged') {
                    setQualifyingEventLabel('Log First 1,000 Steps in HealthKit');
                  } else if (e.target.value === 'first_focus_session_25m') {
                    setQualifyingEventLabel('Finish 25-Min Deep Work Session');
                  } else if (e.target.value === 'iap_subscription_started') {
                    setQualifyingEventLabel('Start Monthly Subscription (RevenueCat)');
                  }
                }}
                className="w-full h-11 px-3.5 bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] rounded-xl text-[13.5px] text-[#F4F2EC] outline-none transition-colors cursor-pointer"
              >
                <option value="level_3_completed">level_3_completed (Games: Anti-Bot Level Progress)</option>
                <option value="first_1000_steps_logged">first_1000_steps_logged (Health: HealthKit Sync)</option>
                <option value="first_focus_session_25m">first_focus_session_25m (Productivity: Core Action)</option>
                <option value="account_created">account_created (Sign Up / Onboarding Finished)</option>
                <option value="iap_subscription_started">iap_subscription_started (RevenueCat Purchase)</option>
              </select>

              <input
                type="text"
                value={qualifyingEventLabel}
                onChange={(e) => setQualifyingEventLabel(e.target.value)}
                placeholder="Human-readable instructions for creators"
                className="w-full h-10 px-3.5 bg-[#181818] border border-[#222222] rounded-lg text-[13px] text-[#B8B6AE] outline-none focus:border-[#555]"
              />
            </div>
            <p className="text-[11.5px] text-[#777] mt-1.5">
              Attribution is only granted after the iOS SDK records this event alongside creator source confirmation.
            </p>
          </div>

          {/* Reward & Hold Period */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-medium text-[#9C9A92] mb-1.5 uppercase tracking-wider">
                Reward per Install (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#777]">$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0.50"
                  value={rewardDollars}
                  onChange={(e) => setRewardDollars(e.target.value)}
                  className="w-full h-11 pl-8 pr-3.5 bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] rounded-xl text-[14px] font-mono text-[#F4F2EC] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#9C9A92] mb-1.5 uppercase tracking-wider">
                Safety Hold Period
              </label>
              <select
                value={holdDays}
                onChange={(e) => setHoldDays(parseInt(e.target.value, 10))}
                className="w-full h-11 px-3 bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] rounded-xl text-[13.5px] text-[#F4F2EC] outline-none cursor-pointer"
              >
                <option value={7}>7 Days (Standard hold)</option>
                <option value={14}>14 Days (Recommended for trials)</option>
                <option value={21}>21 Days (Subscription retention)</option>
              </select>
            </div>
          </div>

          {/* Budget & Escrow Funding */}
          <div>
            <label className="block text-[12px] font-medium text-[#9C9A92] mb-1.5 uppercase tracking-wider">
              Total Campaign Escrow Budget (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#777]">$</span>
              <input
                type="number"
                step="500"
                min="500"
                value={budgetDollars}
                onChange={(e) => setBudgetDollars(e.target.value)}
                className="w-full h-11 pl-8 pr-3.5 bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] rounded-xl text-[14px] font-mono text-[#F4F2EC] outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#9C9A92] mt-2 px-1">
              <span>Estimated target verified installs:</span>
              <span className="font-mono text-[#C9B8FF] font-medium">~{estimatedInstalls.toLocaleString()} installs</span>
            </div>
          </div>

          {/* Whop Escrow Booking Notice */}
          <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-[#222222] flex items-start gap-3">
            <i className="ti ti-shield-check text-[18px] text-[#C9B8FF] shrink-0 mt-0.5"></i>
            <div className="text-[12px] text-[#B8B6AE] leading-relaxed">
              <span className="text-[#F4F2EC] font-medium">Umi Double-Entry Escrow:</span> Upon publishing, funds are reserved in your dedicated campaign account (<span className="font-mono text-[11px] text-[#C9B8FF]">founder_escrow</span>). Rewards are atomically committed as creators verify genuine users.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-[#222] text-[#9C9A92] hover:text-[#F4F2EC] text-[13px] font-medium transition-colors border-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#C9B8FF] hover:bg-[#bbf055] text-[#000000] text-[13px] font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Publishing...</span>
              ) : (
                <>
                  <i className="ti ti-plus"></i>
                  <span>Publish & Fund Campaign</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

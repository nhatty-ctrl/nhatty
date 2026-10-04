import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import {
  Campaign,
  ReferralCode,
  RewardEntitlement,
  LedgerAccount,
  PayoutIntent,
  REWARD_STATUS_LABELS,
} from '../../types/umi';
import { CreatorLinkQrModal } from './CreatorLinkQrModal';
import { RewardDetailModal } from './RewardDetailModal';
import { CampaignDiscoveryView } from './CampaignDiscoveryView';
import { CreatorWalletView } from './CreatorWalletView';

interface CreatorDashboardViewProps {
  campaigns: Campaign[];
  referralCodes: ReferralCode[];
  rewards: RewardEntitlement[];
  ledgerAccounts: LedgerAccount[];
  payouts: PayoutIntent[];
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({
  campaigns,
  referralCodes,
  rewards,
  ledgerAccounts,
  payouts,
}) => {
  const [subView, setSubView] = useState<'home' | 'discover' | 'wallet'>('home');
  const [activeQrKit, setActiveQrKit] = useState<{
    code: ReferralCode;
    campaign: Campaign;
  } | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardEntitlement | null>(null);

  const availableAcc = ledgerAccounts.find((a) => a.kind === 'creator_payable_available');
  const pendingAcc = ledgerAccounts.find((a) => a.kind === 'creator_payable_pending');
  const availableDollars = (availableAcc?.balanceMinor || 0) / 100;
  const pendingDollars = (pendingAcc?.balanceMinor || 0) / 100;

  const joinedCampaignIds = new Set(referralCodes.map((r) => r.campaignId));
  const joinedCampaigns = campaigns.filter((c) => joinedCampaignIds.has(c.id));

  const handleJoinCampaign = (campaignId: string) => {
    const code = umiStore.joinCampaign(campaignId);
    const camp = campaigns.find((c) => c.id === campaignId);
    if (camp) {
      setActiveQrKit({ code, campaign: camp });
    }
  };

  if (subView === 'discover') {
    return (
      <CampaignDiscoveryView
        campaigns={campaigns}
        referralCodes={referralCodes}
        onJoinCampaign={handleJoinCampaign}
        onOpenKit={(code, campaign) => setActiveQrKit({ code, campaign })}
        onBack={() => setSubView('home')}
      />
    );
  }

  if (subView === 'wallet') {
    return (
      <CreatorWalletView
        ledgerAccounts={ledgerAccounts}
        payouts={payouts}
        onBack={() => setSubView('home')}
      />
    );
  }

  return (
    <div className="space-y-7 animate-[fadeIn_0.15s_ease-out]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-medium text-[#A8A69E] uppercase tracking-wider">
              Creator Studio
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7F26B]"></span>
              Whop Payouts Ready
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#F5F3EC]">My Campaigns & Verified Earnings</h1>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSubView('discover')}
            className="px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#F5F3EC] text-[12.5px] font-medium border border-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-compass text-[14px] text-[#A8A69E]"></i>
            <span>Discover Campaigns</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('wallet')}
            className="px-4 py-2 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[12.5px] font-semibold transition-all shadow-sm cursor-pointer border-0 flex items-center gap-1.5"
          >
            <i className="ti ti-wallet text-[14px]"></i>
            <span>Wallet (${availableDollars.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Balances Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSubView('wallet')}
          className="p-4 rounded-2xl bg-[#141414] border border-[#262626] hover:border-[#383838] transition-colors cursor-pointer"
        >
          <div className="text-[12px] text-[#A8A69E] mb-1">Available for Payout</div>
          <div className="text-[22px] font-mono font-semibold text-[#C7F26B] tracking-tight">
            ${availableDollars.toFixed(2)}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1 flex items-center gap-1">
            <span>Whop direct deposit</span>
            <i className="ti ti-arrow-right text-[11px]"></i>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">In Active Safety Holds</div>
          <div className="text-[22px] font-mono font-semibold text-[#F5F3EC] tracking-tight">
            ${pendingDollars.toFixed(2)}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1">Releases to Available automatically</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">Total Verified Conversions</div>
          <div className="text-[22px] font-mono font-semibold text-[#F5F3EC] tracking-tight">
            {rewards.length}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1">Attributed & validated</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">Joined Campaigns</div>
          <div className="text-[22px] font-mono font-semibold text-[#F5F3EC] tracking-tight">
            {joinedCampaigns.length}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1">Active referral links</div>
        </div>
      </div>

      {/* Joined Campaigns Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[16px] font-semibold text-[#F5F3EC]">My Active Referral Links</h2>
          <button
            type="button"
            onClick={() => setSubView('discover')}
            className="text-[12.5px] text-[#C7F26B] hover:underline bg-transparent border-0 cursor-pointer flex items-center gap-1"
          >
            <span>Browse More Apps</span>
            <i className="ti ti-arrow-right text-[12px]"></i>
          </button>
        </div>

        {joinedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedCampaigns.map((camp) => {
              const code = referralCodes.find((r) => r.campaignId === camp.id)!;
              return (
                <div
                  key={camp.id}
                  className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C7F26B] flex items-center justify-center text-[19px] shrink-0">
                          <i className={`ti ${camp.icon}`}></i>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-medium text-[#F5F3EC]">{camp.appName}</h3>
                          <div className="text-[12px] text-[#A8A69E]">{camp.category}</div>
                        </div>
                      </div>

                      <span className="font-mono text-[15px] font-semibold text-[#C7F26B]">
                        ${(camp.rewardMinor / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#181818] border border-[#222] mb-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#777] uppercase tracking-wider block">
                          Creator Code
                        </span>
                        <span className="font-mono font-bold text-[14px] text-[#F5F3EC] tracking-wider">
                          {code.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#888] font-mono">
                        {code.clicks} clicks · {code.installs} opens
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveQrKit({ code, campaign: camp })}
                    className="w-full py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#242424] text-[#F5F3EC] text-[12.5px] font-medium transition-colors border border-[#303030] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="ti ti-qrcode text-[15px] text-[#C7F26B]"></i>
                    <span>Share Link & QR Kit</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#141414] border border-[#262626] text-center">
            <p className="text-[14px] text-[#A8A69E] mb-3">You haven't joined any campaigns yet.</p>
            <button
              type="button"
              onClick={() => setSubView('discover')}
              className="px-4 py-2 rounded-xl bg-[#C7F26B] text-[#0B0B0B] text-[12.5px] font-semibold cursor-pointer border-0"
            >
              Discover Apps to Promote
            </button>
          </div>
        )}
      </div>

      {/* Recent Rewards Table */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[#F5F3EC]">Recent Verified Rewards Activity</h3>
            <p className="text-[12px] text-[#A8A69E]">
              Click any reward to view the full verification timeline and double-entry ledger reference
            </p>
          </div>
          <span className="text-[11px] text-[#777]">Updated in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#222] text-[#777] text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-medium">Campaign</th>
                <th className="pb-2.5 font-medium">Attribution ID</th>
                <th className="pb-2.5 font-medium">Status & Safety Window</th>
                <th className="pb-2.5 font-medium">Date</th>
                <th className="pb-2.5 font-medium text-right">Bounty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020]">
              {rewards.map((r) => {
                const meta = REWARD_STATUS_LABELS[r.status];
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReward(r)}
                    className="hover:bg-[#181818] cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-medium text-[#F5F3EC]">
                      {r.campaignName}
                    </td>
                    <td className="py-3 font-mono text-[12px] text-[#A8A69E]">
                      {r.attributionId}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${meta.badgeColor}`}
                        title={meta.meaning}
                      >
                        <span>{meta.label}</span>
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[12px] text-[#777]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-mono text-right font-medium text-[#C7F26B]">
                      ${(r.amountMinor / 100).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeQrKit && (
        <CreatorLinkQrModal
          isOpen={!!activeQrKit}
          onClose={() => setActiveQrKit(null)}
          referralCode={activeQrKit.code}
          campaign={activeQrKit.campaign}
        />
      )}

      {selectedReward && (
        <RewardDetailModal
          isOpen={!!selectedReward}
          onClose={() => setSelectedReward(null)}
          reward={selectedReward}
        />
      )}
    </div>
  );
};

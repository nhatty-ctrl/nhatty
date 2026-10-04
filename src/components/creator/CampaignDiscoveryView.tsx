import React, { useState } from 'react';
import { Campaign, ReferralCode } from '../../types/umi';

interface CampaignDiscoveryViewProps {
  campaigns: Campaign[];
  referralCodes: ReferralCode[];
  onJoinCampaign: (campaignId: string) => void;
  onOpenKit: (referralCode: ReferralCode, campaign: Campaign) => void;
  onBack: () => void;
}

export const CampaignDiscoveryView: React.FC<CampaignDiscoveryViewProps> = ({
  campaigns,
  referralCodes,
  onJoinCampaign,
  onOpenKit,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.appName.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || c.category.toLowerCase() === selectedCat.toLowerCase();
    return matchesSearch && matchesCat && c.status === 'active';
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-[#A8A69E] hover:text-[#F5F3EC] mb-1.5 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <i className="ti ti-arrow-left"></i>
            <span>Back to Joined Campaigns</span>
          </button>
          <h1 className="text-[20px] font-semibold text-[#F5F3EC]">Discover Verified Install Campaigns</h1>
          <p className="text-[13px] text-[#A8A69E] mt-0.5">
            Partner with top mobile iOS apps and earn guaranteed bounties for genuine engaged users
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#777]"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps or categories..."
            className="w-full h-10 pl-9 pr-3.5 bg-[#161616] border border-[#262626] focus:border-[#C7F26B] rounded-xl text-[13px] text-[#F5F3EC] outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'games', 'health & fitness', 'productivity'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer border-0 capitalize whitespace-nowrap ${
              selectedCat === cat
                ? 'bg-[#F5F3EC] text-[#0B0B0B]'
                : 'bg-[#161616] text-[#888] hover:text-[#F5F3EC]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((camp) => {
          const joinedCode = referralCodes.find((r) => r.campaignId === camp.id);
          return (
            <div
              key={camp.id}
              className="bg-[#141414] border border-[#262626] hover:border-[#383838] transition-all rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                {/* App icon & name */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#202020] text-[#C7F26B] flex items-center justify-center text-[21px] shrink-0">
                      <i className={`ti ${camp.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="text-[15.5px] font-medium text-[#F5F3EC]">{camp.appName}</h3>
                      <div className="text-[12px] text-[#A8A69E]">{camp.category}</div>
                    </div>
                  </div>

                  <span className="font-mono text-[16px] font-bold text-[#C7F26B]">
                    ${(camp.rewardMinor / 100).toFixed(2)}
                  </span>
                </div>

                {/* Milestone Requirement */}
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222] text-[12px] text-[#B9B7AF] mb-4">
                  <span className="text-[#777] block text-[10.5px] uppercase tracking-wider mb-0.5">
                    Qualification Event:
                  </span>
                  <span className="text-[#F5F3EC] font-medium">{camp.qualifyingEventLabel}</span>
                </div>

                {/* Terms Summary */}
                <div className="space-y-1.5 text-[12px] text-[#888] mb-4">
                  <div className="flex items-center justify-between">
                    <span>Safety Hold:</span>
                    <span className="font-mono text-[#DDD]">{camp.holdDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Creators:</span>
                    <span className="font-mono text-[#DDD]">{camp.creatorsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Attribution Method:</span>
                    <span className="text-[#DDD]">Universal Links + In-App Code</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {joinedCode ? (
                <button
                  type="button"
                  onClick={() => onOpenKit(joinedCode, camp)}
                  className="w-full py-2.5 rounded-xl bg-[#202020] hover:bg-[#2A2A2A] text-[#F5F3EC] text-[12.5px] font-medium transition-colors border border-[#333] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="ti ti-qrcode text-[#C7F26B]"></i>
                  <span>View Link & QR Code</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onJoinCampaign(camp.id)}
                  className="w-full py-2.5 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[12.5px] font-semibold transition-all shadow-sm cursor-pointer border-0 flex items-center justify-center gap-1.5"
                >
                  <i className="ti ti-plus"></i>
                  <span>Join Campaign & Get Link</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

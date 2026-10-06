import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { CampaignCard } from './CampaignCard';
import { CampaignCardSkeleton } from './SkeletonLoader';

interface CampaignsListProps {
  campaigns: Campaign[];
  filterTab: 'open' | 'joined';
  setFilterTab: (tab: 'open' | 'joined') => void;
  onJoin: (campaign: Campaign, targetEl?: HTMLElement) => void;
  onOpenQr: (campaign: Campaign) => void;
  onCopyLink: (campaign: Campaign) => void;
  onShare: (campaign: Campaign) => void;
  onNavigateDetail: (id: string) => void;
  onNavigateAnalytics: (id: string) => void;
  onManage?: (campaign: Campaign) => void;
  isFounder?: boolean;
  onNavigateSdk?: () => void;
  onNavigateDocs?: () => void;
}

export const CampaignsList: React.FC<CampaignsListProps> = ({
  campaigns,
  filterTab,
  setFilterTab,
  onJoin,
  onOpenQr,
  onCopyLink,
  onShare,
  onNavigateDetail,
  onNavigateAnalytics,
  onManage,
  isFounder = false,
  onNavigateSdk,
  onNavigateDocs,
}) => {
  const [isLoading] = useState(false);

  const openCampaigns = campaigns.filter((c) => !c.joined);
  const joinedCampaigns = campaigns.filter((c) => c.joined);
  const visibleCampaigns = filterTab === 'open' ? openCampaigns : joinedCampaigns;

  return (
    <div className="w-full flex justify-center py-6 sm:py-8 px-4 sm:px-6">
      <div className="w-full max-w-[836px] space-y-6">
        {/* Title & Filter bar: symmetrically flush with right edge of 720px card */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC]">
              Campaigns
            </h1>
            <p className="text-[13px] text-[#9A9892] mt-1">
              Vetted mobile apps with real-time attribution and guaranteed creator bounties.
            </p>
          </div>

          {/* Filter Capsule: [ Open | Joined ] */}
          <div className="inline-flex bg-[#161616] rounded-full p-1 self-start sm:self-auto shrink-0 border border-[#2A2A2A]/40">
            <button
              onClick={() => setFilterTab('open')}
              className={`pill min-h-[36px] px-4 cursor-pointer ${filterTab === 'open' ? 'on' : ''}`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterTab('joined')}
              className={`pill min-h-[36px] px-4 cursor-pointer ${filterTab === 'joined' ? 'on' : ''}`}
            >
              Joined
            </button>
          </div>
        </div>

      {/* Campaigns list */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <>
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
          </>
        ) : visibleCampaigns.length > 0 ? (
          visibleCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onJoin={onJoin}
              onOpenQr={onOpenQr}
              onCopyLink={onCopyLink}
              onShare={onShare}
              onNavigateDetail={onNavigateDetail}
              onNavigateAnalytics={onNavigateAnalytics}
              onManage={onManage}
              isFounder={isFounder}
            />
          ))
        ) : (
          /* Empty States with Short Invitation and One Primary Action */
          <div className="card text-center py-14 px-6 space-y-3 bg-[#161616] border border-[#2A2A2A] rounded-[24px]">
            <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#9A9892] flex items-center justify-center text-[22px] mx-auto">
              <i className={`ti ${filterTab === 'joined' ? 'ti-link' : 'ti-speakerphone'}`}></i>
            </div>
            <div>
              <div className="text-[16px] font-medium text-[#F5F3EC]">
                {filterTab === 'joined' ? 'No joined campaigns yet' : 'No open campaigns'}
              </div>
              <div className="text-[13px] text-[#9A9892] mt-1 max-w-[420px] mx-auto leading-relaxed">
                {filterTab === 'joined'
                  ? 'Join a campaign to generate your personal creator tracking link and start earning per verified install.'
                  : 'All campaigns are currently filled. New mobile apps enter the marketplace weekly.'}
              </div>
            </div>

            {filterTab === 'joined' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFilterTab('open')}
                  className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
                >
                  Browse open campaigns
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

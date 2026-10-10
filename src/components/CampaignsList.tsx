import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { CampaignCard } from './CampaignCard';
import { CampaignCardSkeleton } from './SkeletonLoader';
import { EmptyStateCard } from './ui/EnterpriseStates';

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
            <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F4F2EC]">
              Campaigns
            </h1>
            <p className="text-[13px] text-[#9C9A92] mt-1">
              Vetted mobile apps with real-time attribution and guaranteed creator bounties.
            </p>
          </div>

          {/* Filter Capsule: [ Open | Joined ] (sleek pill track) */}
          <div className="inline-flex bg-[#141414] rounded-full p-1 self-start sm:self-auto shrink-0 border border-[#222222] gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setFilterTab('open')}
              className={`text-[13px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 ${
                filterTab === 'open'
                  ? 'bg-[#F4F2EC] text-[#000000] shadow-sm'
                  : 'text-[#9C9A92] hover:text-[#F4F2EC] hover:bg-[#1B1B1B]'
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('joined')}
              className={`text-[13px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 ${
                filterTab === 'joined'
                  ? 'bg-[#F4F2EC] text-[#000000] shadow-sm'
                  : 'text-[#9C9A92] hover:text-[#F4F2EC] hover:bg-[#1B1B1B]'
              }`}
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
          /* Enterprise Empty States */
          filterTab === 'joined' ? (
            <EmptyStateCard
              icon="ti-link"
              tone="neutral"
              title="No joined campaigns yet"
              body="Join a campaign to get your tracked shortlink and personal attribution QR code."
              primary={{
                label: 'Browse open campaigns',
                icon: 'ti-speakerphone',
                onClick: () => setFilterTab('open'),
              }}
            />
          ) : (
            <EmptyStateCard
              icon="ti-speakerphone"
              tone="neutral"
              title="No open campaigns"
              body="All campaigns are currently filled. New mobile apps enter the performance marketplace weekly."
            />
          )
        )}
      </div>
    </div>
  </div>
  );
};

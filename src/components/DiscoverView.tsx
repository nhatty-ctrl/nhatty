import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { CATS } from '../data/campaigns';
import { CampaignCard } from './CampaignCard';
import { Breadcrumbs } from './Breadcrumbs';
import { PullToRefresh } from './ui/PullToRefresh';

interface DiscoverViewProps {
  campaigns: Campaign[];
  onJoin: (campaign: Campaign, targetEl?: HTMLElement) => void;
  onNavigateDetail: (id: string) => void;
  onOpenQr?: (campaign: Campaign) => void;
  onCopyLink?: (campaign: Campaign) => void;
  onShare?: (campaign: Campaign) => void;
  onSelectCategory?: (cat: string) => void;
  onRefresh?: () => Promise<void> | void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  campaigns,
  onJoin,
  onNavigateDetail,
  onOpenQr,
  onCopyLink,
  onShare,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const categories = ['All', ...Object.keys(CATS)];

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeCat !== 'All' && c.cat !== activeCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchBy = (c.by || c.host || '').toLowerCase().includes(q);
      const matchDesc = c.desc.toLowerCase().includes(q);
      const matchCat = c.cat.toLowerCase().includes(q);
      return matchName || matchBy || matchDesc || matchCat;
    }
    return true;
  });

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* Mobile X.com Explore Search Header (Sticky top) */}
      <div className="sm:hidden sticky top-[40px] z-30 bg-black/90 backdrop-blur-md px-4 py-2 border-b border-[#2f3336]">
        <div className="relative w-full">
          <i
            className="ti ti-search absolute left-3.5 top-2.5 text-[#71767b] text-[16px]"
            aria-hidden="true"
          ></i>
          <input
            type="text"
            placeholder="Search apps, studios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202327] text-white placeholder-[#71767b] text-[14px] rounded-full pl-10 pr-9 py-2 border-0 outline-none focus:ring-1 focus:ring-[#C9B8FF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-[#71767b] hover:text-white p-1 cursor-pointer bg-transparent border-0"
              aria-label="Clear search"
            >
              <i className="ti ti-x text-[14px]"></i>
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-[836px] mx-auto px-0 sm:px-6 py-0 sm:py-8 sm:space-y-6">
        {/* Breadcrumb with icons (Desktop) */}
        <div className="hidden sm:block">
          <Breadcrumbs
            items={[
              { label: 'Campaigns', icon: 'ti-speakerphone', onClick: () => (window.location.hash = '#/') },
              { label: 'Discover', icon: 'ti-compass', active: true },
            ]}
          />
        </div>

        {/* Title & Search bar (Desktop) */}
        <div className="hidden sm:flex sm:flex-row sm:items-end justify-between gap-4 text-left">
          <div>
            <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F4F2EC]">
              Discover
            </h1>
            <p className="text-[13px] text-[#9C9A92] mt-1">
              Explore verified mobile install campaigns across top app categories.
            </p>
          </div>

          {/* Search input (Desktop) */}
          <div className="relative w-full sm:w-64">
            <i
              className="ti ti-search absolute left-3.5 top-3.5 text-[#9C9A92] text-[16px]"
              aria-hidden="true"
            ></i>
            <input
              type="text"
              placeholder="Search apps, studios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="in pl-10 text-[13px] h-[44px] sm:h-[40px]!"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#9C9A92] hover:text-white p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <i className="ti ti-x text-[14px]"></i>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider (X Explore Trends style) */}
        <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 py-2 sm:py-0.5 scrollbar-none items-center border-b sm:border-b-0 border-[#2f3336]">
          {categories.map((catName) => {
            const isSelected = activeCat === catName;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => setActiveCat(catName)}
                className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-1.5 px-3.5 rounded-full cursor-pointer transition-all duration-150 shrink-0 select-none shadow-xs ${
                  isSelected
                    ? 'bg-[#F4F2EC] text-[#000000] shadow-sm'
                    : 'bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC] border border-[#222222]'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

      {/* Categories Grid (when on 'All' with no query) */}
      {activeCat === 'All' && !searchQuery && (
        <div className="pt-1 text-left">
          <div className="font-medium text-[15px] text-[#F4F2EC] mb-2.5">
            Browse by Category
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(CATS).slice(0, 8).map(([name, catData]) => (
              <button
                key={name}
                type="button"
                onClick={() => setActiveCat(name)}
                className="rounded-[18px] p-3.5 flex flex-col gap-3 text-left transition-transform hover:scale-[1.02] cursor-pointer border-0"
                style={{ backgroundColor: catData.bg, color: catData.fg }}
              >
                <i className={`ti ${catData.icon} text-[22px]`} aria-hidden="true"></i>
                <span className="text-[13px] font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtered Campaigns list */}
      <div className="space-y-4 pt-2 text-left">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[15px] text-[#F4F2EC]">
            {activeCat === 'All' ? 'All Campaigns' : `${activeCat} Campaigns`}
          </span>
          <span className="text-[12px] text-[#9C9A92]">
            {filteredCampaigns.length} available
          </span>
        </div>

        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onJoin={onJoin}
              onNavigateDetail={onNavigateDetail}
              onOpenQr={onOpenQr}
              onCopyLink={onCopyLink}
              onShare={onShare}
            />
          ))
        ) : (
          <div className="card text-center text-[#9C9A92] text-[13px] py-12">
            No campaigns found matching your criteria.
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
};

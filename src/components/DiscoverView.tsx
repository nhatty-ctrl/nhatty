import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { CATS } from '../data/campaigns';
import { CampaignCard } from './CampaignCard';
import { Breadcrumbs } from './Breadcrumbs';

interface DiscoverViewProps {
  campaigns: Campaign[];
  onJoin: (campaign: Campaign, targetEl?: HTMLElement) => void;
  onNavigateDetail: (id: string) => void;
  onOpenQr?: (campaign: Campaign) => void;
  onCopyLink?: (campaign: Campaign) => void;
  onShare?: (campaign: Campaign) => void;
  onSelectCategory?: (cat: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  campaigns,
  onJoin,
  onNavigateDetail,
  onOpenQr,
  onCopyLink,
  onShare,
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

  return (
    <div className="w-full max-w-[836px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: () => window.location.hash = '#/' },
          { label: 'Discover', icon: 'ti-compass', active: true },
        ]}
      />

      {/* Title & Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#F5F3EC]">
            Discover
          </h1>
          <p className="text-[13px] text-[#9A9892] mt-1">
            Explore verified mobile install campaigns across top app categories.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <i
            className="ti ti-search absolute left-3.5 top-3.5 text-[#9A9892] text-[16px]"
            aria-hidden="true"
          ></i>
          <input
            type="text"
            placeholder="Search apps, studios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="in pl-10 text-[13px] h-[40px]!"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#9A9892] hover:text-white"
            >
              <i className="ti ti-x text-[14px]"></i>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((catName) => {
          const isSelected = activeCat === catName;
          return (
            <button
              key={catName}
              onClick={() => setActiveCat(catName)}
              className={`chip shrink-0 ${isSelected ? 'sel' : ''}`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Categories Grid (when on 'All' with no query) */}
      {activeCat === 'All' && !searchQuery && (
        <div className="pt-1">
          <div className="font-medium text-[15px] text-[#F5F3EC] mb-2.5">
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
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[15px] text-[#F5F3EC]">
            {activeCat === 'All' ? 'All Campaigns' : `${activeCat} Campaigns`}
          </span>
          <span className="text-[12px] text-[#9A9892]">
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
            />
          ))
        ) : (
          <div className="card text-center text-[#9A9892] text-[13px] py-12">
            No campaigns found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

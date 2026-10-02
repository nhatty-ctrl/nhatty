import React, { useState } from 'react';
import { Campaign } from '../types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
  onJoin: (campaign: Campaign, targetEl?: HTMLElement) => void;
  onNavigateDetail: (id: string) => void;
  onOpenQr?: (campaign: Campaign) => void;
  onCopyLink?: (campaign: Campaign) => void;
  onShare?: (campaign: Campaign) => void;
  onNavigateAnalytics?: (id: string) => void;
  onManage?: (campaign: Campaign) => void;
  isFounder?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onJoin,
  onNavigateDetail,
  onCopyLink,
  onManage,
  isFounder = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onJoin(campaign, e.currentTarget);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleViewDetailPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateDetail(campaign.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopyLink) {
      onCopyLink(campaign);
    } else {
      navigator.clipboard?.writeText(`https://kred.link/${campaign.slug || campaign.id}/you`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Pastel styling
  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';
  const icon = campaign.icon || 'ti-device-gamepad-2';
  const priceDisplay = campaign.price ? `$${campaign.price}` : campaign.pay;
  const slug = campaign.slug || campaign.id;

  // Status Edge Cases
  const isEnded = campaign.days <= 0 || (campaign as any).isEnded;
  const isPaused = (campaign as any).isPaused;
  const isOutOfBudget = campaign.budget !== undefined && campaign.budget <= 0;
  const isDraft = (campaign as any).isDraft || !campaign.sdkConnected;

  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] sm:grid-cols-[100px_minmax(0,1fr)] gap-3 sm:gap-4 items-start">
      {/* Left Column: Category and Days left */}
      <div className="pt-1.5 select-none">
        <div className="text-[14px] font-medium text-[#F5F3EC]">{campaign.cat}</div>
        <div className="text-[12px] text-[#9A9892] mt-0.5">
          {isEnded ? 'Campaign ended' : `${campaign.days} days left`}
        </div>
      </div>

      {/* Right Column: Expandable Card */}
      <div
        onClick={handleToggleExpand}
        className={`card cursor-pointer transition-all duration-200 relative group border ${
          isExpanded ? 'border-[#F5F3EC]/30 bg-[#191919]' : 'border-transparent hover:bg-[#1a1a1a]'
        }`}
      >
        {/* Main Card Header */}
        <div className="flex gap-3 sm:gap-4 justify-between items-start">
          <div className="min-w-0 flex-1">
            {/* App name & Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[20px] font-medium tracking-[-0.3px] text-[#F5F3EC] group-hover:text-white transition-colors">
                {campaign.name}
              </div>

              {/* Status Chips with Word + Icon */}
              {isEnded ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C1C] text-[#FF8A80] flex items-center gap-1 font-medium">
                  <i className="ti ti-clock-x" aria-hidden="true"></i>
                  <span>Ended</span>
                </span>
              ) : isPaused ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C1C] text-[#FAC775] flex items-center gap-1 font-medium">
                  <i className="ti ti-player-pause" aria-hidden="true"></i>
                  <span>Paused</span>
                </span>
              ) : isOutOfBudget ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C1C] text-[#FF8A80] flex items-center gap-1 font-medium">
                  <i className="ti ti-alert-circle" aria-hidden="true"></i>
                  <span>Out of budget</span>
                </span>
              ) : isDraft ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#1C1C1C] text-[#FAC775] flex items-center gap-1 font-medium">
                  <i className="ti ti-clock" aria-hidden="true"></i>
                  <span>Draft</span>
                </span>
              ) : null}
            </div>

            {/* By company */}
            <div className="text-[12px] text-[#9A9892] mt-0.5 mb-2.5">
              By {campaign.by || campaign.host}
            </div>

            {/* Chips row */}
            <div className="flex gap-1.5 flex-wrap items-center">
              <span
                className="chip font-medium"
                style={{ backgroundColor: bg, color: fg, padding: '4px 10px', fontSize: '12px' }}
              >
                {priceDisplay} per verified install
              </span>
              <span
                className="chip"
                style={{ backgroundColor: '#242424', color: '#F5F3EC', padding: '4px 8px' }}
                title="iOS supported"
              >
                <i className="ti ti-brand-apple text-[14px]" aria-hidden="true"></i>
              </span>
              <span
                className="chip"
                style={{ backgroundColor: '#242424', color: '#F5F3EC', padding: '4px 8px' }}
                title="Android supported"
              >
                <i className="ti ti-player-play text-[14px]" aria-hidden="true"></i>
              </span>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
              {!isEnded && !isPaused && (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className={`pill text-[12px] py-1 px-3 min-h-[32px] h-[32px] font-medium ${
                    campaign.joined ? 'out' : 'on'
                  }`}
                >
                  {campaign.joined ? (
                    <>
                      <i className="ti ti-check text-[#C7F26B]" aria-hidden="true"></i>
                      <span>Joined</span>
                    </>
                  ) : (
                    <span>Join campaign</span>
                  )}
                </button>
              )}

              {/* Creator Avatars Cluster */}
              <span className="inline-flex pl-1 select-none">
                <span
                  className="w-[22px] h-[22px] rounded-full border-2 border-[#161616] inline-flex items-center justify-center text-[10px] font-medium"
                  style={{ backgroundColor: '#CECBF6', color: '#26215C' }}
                >
                  H
                </span>
                <span
                  className="w-[22px] h-[22px] rounded-full border-2 border-[#161616] -ml-1.5 inline-flex items-center justify-center text-[10px] font-medium"
                  style={{ backgroundColor: '#F5C4B3', color: '#4A1B0C' }}
                >
                  C
                </span>
                <span
                  className="w-[22px] h-[22px] rounded-full border-2 border-[#161616] -ml-1.5 inline-flex items-center justify-center text-[10px] font-medium"
                  style={{ backgroundColor: '#C0DD97', color: '#173404' }}
                >
                  F
                </span>
              </span>
              <span className="text-[12px] text-[#9A9892]">+{campaign.creators}</span>

              {/* Founder management shortcut if founder */}
              {isFounder && onManage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManage(campaign);
                  }}
                  className="ol min-h-[36px] px-3 text-[12px] cursor-pointer"
                >
                  <i className="ti ti-adjustments text-[14px]"></i>
                  <span>Manage</span>
                </button>
              )}

              {/* Expand/Collapse Chevron Button */}
              <button
                type="button"
                onClick={handleToggleExpand}
                className="pill gh p-2! hover:bg-[#242424] rounded-full ml-auto sm:ml-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
              >
                <i
                  className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} text-[18px] text-[#9A9892]`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </div>

          {/* Right Logo Tile */}
          <div
            className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-[20px] flex flex-col items-center justify-center gap-1.5 shrink-0 select-none shadow-xs"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${icon} text-[26px]`} aria-hidden="true"></i>
            <span className="text-[11px] sm:text-[12px] font-medium text-center px-1 truncate max-w-full">
              {campaign.name}
            </span>
          </div>
        </div>

        {/* EXPANDABLE SECTION */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-4 animate-[fade-in_0.2s_ease-out]">
            {/* Description */}
            <div>
              <div className="text-[12px] text-[#9A9892] uppercase font-mono tracking-wider mb-1">
                About campaign
              </div>
              <p className="text-[13.5px] text-[#B9B7AF] leading-relaxed">
                {campaign.desc}
              </p>
            </div>

            {/* Campaign specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#1C1C1C] rounded-[16px] p-3 border border-[#2A2A2A]/40 text-left">
              <div>
                <span className="block text-[11px] text-[#9A9892]">Bounty</span>
                <span className="block text-[13px] font-medium text-[#F5F3EC]">
                  ${campaign.price} / install
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9A9892]">Settlement</span>
                <span className="block text-[13px] font-medium text-[#F5F3EC]">
                  Weekly (Fridays)
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9A9892]">Attribution hold</span>
                <span className="block text-[13px] font-medium text-[#C7F26B]">
                  14 days
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9A9892]">Rating</span>
                <span className="block text-[13px] font-medium text-[#F5F3EC]">
                  ★ {campaign.rating} ({campaign.installsVerified || '12.4k'})
                </span>
              </div>
            </div>

            {/* If Joined: Tracking link in expanded card */}
            {campaign.joined && (
              <div className="bg-[#1C1C1C] rounded-[16px] p-3 border border-[#2A2A2A]/40 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-[#9A9892]">Your tracking link</div>
                  <div className="font-mono text-[12px] text-[#F5F3EC] truncate">
                    kred.link/{slug}/you
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="pill on text-[12px] py-1.5 px-3 shrink-0 min-h-[38px]"
                >
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            )}

            {/* Bottom expanded buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={handleViewDetailPage}
                className="ol min-h-[44px] px-4 hover:bg-[#242424] text-[#F5F3EC] cursor-pointer"
              >
                <span>View full campaign page</span>
                <i className="ti ti-arrow-right text-[12px]" aria-hidden="true"></i>
              </button>

              <button
                type="button"
                onClick={handleToggleExpand}
                className="pill gh min-h-[44px] px-3 text-[#9A9892] hover:text-[#F5F3EC] cursor-pointer"
              >
                <span>Collapse</span>
                <i className="ti ti-chevron-up text-[14px]"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

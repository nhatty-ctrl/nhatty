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
  onOpenQr,
  onCopyLink,
  onShare,
  onNavigateAnalytics,
  onManage,
  isFounder = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Direct directly to the campaign page so creators read terms and details first
    onNavigateDetail(campaign.id);
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
    const handle = localStorage.getItem(`kred_handle_${slug}`) || 'you';
    const fullUrl = `https://kred.link/${slug}/${handle}`;
    if (onCopyLink) {
      onCopyLink(campaign);
    }
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleOpenQrClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenQr) {
      onOpenQr(campaign);
    }
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
    <div className="flex flex-col sm:grid sm:grid-cols-[100px_minmax(0,1fr)] gap-2 sm:gap-4 items-start w-full">
      {/* Mobile-only compact metadata line (saves ~100px vertical height on phone) */}
      <div className="sm:hidden flex items-center justify-between text-[12px] px-1 text-[#9C9A92] select-none w-full">
        <span className="font-medium text-[#F4F2EC]">{campaign.cat}</span>
        <span>{isEnded ? 'Campaign ended' : `${campaign.days} days left`}</span>
      </div>

      {/* Desktop Left Column: Category and Days left */}
      <div className="hidden sm:block pt-1.5 select-none text-left">
        <div className="text-[14px] font-medium text-[#F4F2EC]">{campaign.cat}</div>
        <div className="text-[12px] text-[#9C9A92] mt-0.5">
          {isEnded ? 'Campaign ended' : `${campaign.days} days left`}
        </div>
      </div>

      {/* Right Column: Expandable Card */}
      <div
        onClick={handleToggleExpand}
        style={{ width: '720px' }}
        className={`card cursor-pointer transition-all duration-200 relative group border max-w-full text-left p-4 sm:p-5 ${
          isExpanded ? 'border-[#F4F2EC]/30 bg-[#141414]' : 'border-transparent hover:bg-[#121212]'
        }`}
      >
        {/* Main Card Header */}
        <div className="flex gap-3 sm:gap-4 justify-between items-start">
          <div className="min-w-0 flex-1">
            {/* App name & Status Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[18px] sm:text-[20px] font-medium tracking-[-0.3px] text-[#F4F2EC] group-hover:text-white transition-colors">
                {campaign.name}
              </div>

              {/* Status Chips with Word + Icon */}
              {isEnded ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#141414] text-[#FF8A80] flex items-center gap-1 font-medium">
                  <i className="ti ti-clock-x" aria-hidden="true"></i>
                  <span>Ended</span>
                </span>
              ) : isPaused ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#141414] text-[#FAC775] flex items-center gap-1 font-medium">
                  <i className="ti ti-player-pause" aria-hidden="true"></i>
                  <span>Paused</span>
                </span>
              ) : isOutOfBudget ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#141414] text-[#FF8A80] flex items-center gap-1 font-medium">
                  <i className="ti ti-alert-circle" aria-hidden="true"></i>
                  <span>Out of budget</span>
                </span>
              ) : isDraft ? (
                <span className="chip text-[11px] py-0.5 px-2 bg-[#141414] text-[#FAC775] flex items-center gap-1 font-medium">
                  <i className="ti ti-clock" aria-hidden="true"></i>
                  <span>Draft</span>
                </span>
              ) : null}
            </div>

            {/* By company */}
            <div className="text-[12px] text-[#9C9A92] mt-0.5 mb-2">
              By {campaign.by || campaign.host}
            </div>

            {/* Chips row */}
            <div className="flex gap-1.5 flex-wrap items-center">
              <span
                className="chip font-medium rounded-full shadow-xs"
                style={{ backgroundColor: bg, color: fg, padding: '4px 11px', fontSize: '12px' }}
              >
                {priceDisplay} per verified install
              </span>
              <span
                className="chip rounded-full text-[11.5px] font-medium bg-[#141414] text-[#F4F2EC] border border-[#222222]"
                style={{ padding: '3px 9px' }}
              >
                <span>{campaign.cat}</span>
              </span>
              <span
                className="chip rounded-full"
                style={{ backgroundColor: '#1B1B1B', color: '#F4F2EC', padding: '4px 8px' }}
                title="iOS supported"
              >
                <i className="ti ti-brand-apple text-[14px]" aria-hidden="true"></i>
              </span>
              <span
                className="chip rounded-full"
                style={{ backgroundColor: '#1B1B1B', color: '#F4F2EC', padding: '4px 8px' }}
                title="Android supported"
              >
                <i className="ti ti-player-play text-[14px]" aria-hidden="true"></i>
              </span>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {!isEnded && !isPaused && (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 active:scale-95 shadow-sm ${
                    campaign.joined
                      ? 'bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] border border-[#C9B8FF]/40'
                      : 'bg-[#F4F2EC] hover:bg-white text-[#000000] hover:shadow-[0_0_12px_rgba(244,242,236,0.3)]'
                  }`}
                >
                  {campaign.joined ? (
                    <>
                      <i className="ti ti-circle-check text-[#C9B8FF] text-[14px]" aria-hidden="true"></i>
                      <span>Joined</span>
                    </>
                  ) : (
                    <>
                      <span>Join campaign</span>
                      <i className="ti ti-arrow-right text-[12px] stroke-[2.5]" aria-hidden="true"></i>
                    </>
                  )}
                </button>
              )}

              {/* QR Code Action Button (Finding 2) */}
              {campaign.joined && onOpenQr && (
                <button
                  type="button"
                  onClick={handleOpenQrClick}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium py-1.5 px-3 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors shadow-xs"
                  title="Show scannable tracking QR code"
                >
                  <i className="ti ti-qrcode text-[14px] text-[#C9B8FF]"></i>
                  <span className="hidden sm:inline">QR code</span>
                </button>
              )}

              {/* Creator Avatars Cluster */}
              <span className="inline-flex pl-1 select-none">
                <span
                  className="w-[20px] h-[20px] rounded-full border-2 border-[#0E0E0E] inline-flex items-center justify-center text-[9px] font-medium"
                  style={{ backgroundColor: '#CECBF6', color: '#26215C' }}
                >
                  H
                </span>
                <span
                  className="w-[20px] h-[20px] rounded-full border-2 border-[#0E0E0E] -ml-1 inline-flex items-center justify-center text-[9px] font-medium"
                  style={{ backgroundColor: '#F5C4B3', color: '#4A1B0C' }}
                >
                  C
                </span>
                <span
                  className="w-[20px] h-[20px] rounded-full border-2 border-[#0E0E0E] -ml-1 inline-flex items-center justify-center text-[9px] font-medium"
                  style={{ backgroundColor: '#C0DD97', color: '#173404' }}
                >
                  F
                </span>
              </span>
              <span className="text-[12px] text-[#9C9A92]">+{campaign.creators}</span>

              {/* Founder management shortcut if founder */}
              {isFounder && onManage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManage(campaign);
                  }}
                  className="ol min-h-[34px] px-3 text-[12px] cursor-pointer"
                >
                  <i className="ti ti-adjustments text-[14px]"></i>
                  <span>Manage</span>
                </button>
              )}

              {/* Expand/Collapse Chevron Button */}
              <button
                type="button"
                onClick={handleToggleExpand}
                className="pill gh p-2! hover:bg-[#1B1B1B] rounded-full ml-auto min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
              >
                <i
                  className={`ti ti-chevron-${isExpanded ? 'up' : 'down'} text-[16px] text-[#9C9A92]`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>
          </div>

          {/* Right Logo Tile: Responsive size (56px on mobile, 84px on desktop) */}
          <div
            className="w-[56px] h-[56px] sm:w-[84px] sm:h-[84px] rounded-[14px] sm:rounded-[20px] flex flex-col items-center justify-center gap-1 shrink-0 select-none shadow-xs"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${icon} text-[20px] sm:text-[26px]`} aria-hidden="true"></i>
            <span className="text-[10px] sm:text-[11px] font-medium text-center px-1 truncate max-w-full">
              {campaign.name}
            </span>
          </div>
        </div>

        {/* EXPANDABLE SECTION */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[#222222] space-y-4 animate-[fade-in_0.2s_ease-out]">
            {/* Description & Store Badges */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-[11px] text-[#9C9A92] uppercase font-mono tracking-wider mb-1">
                  About campaign
                </div>
                <p className="text-[13.5px] text-[#B8B6AE] leading-relaxed">
                  {campaign.desc}
                </p>
              </div>

              {/* Store Links */}
              <div className="flex items-center gap-1.5 shrink-0 self-start">
                {campaign.appleUrl && (
                  <a
                    href={campaign.appleUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-medium py-1 px-3 rounded-full bg-[#1B1B1B] hover:bg-[#242424] text-[#F4F2EC] border border-[#2A2A2A] transition-colors"
                  >
                    <i className="ti ti-brand-apple text-[13px]"></i>
                    <span>App Store</span>
                  </a>
                )}
                {campaign.playUrl && (
                  <a
                    href={campaign.playUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-medium py-1 px-3 rounded-full bg-[#1B1B1B] hover:bg-[#242424] text-[#F4F2EC] border border-[#2A2A2A] transition-colors"
                  >
                    <i className="ti ti-player-play text-[13px]"></i>
                    <span>Google Play</span>
                  </a>
                )}
              </div>
            </div>

            {/* Campaign specs grid: 4 Enterprise Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#141414] rounded-[18px] p-3.5 border border-[#222222] text-left">
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Bounty Rate</span>
                <span className="block text-[13.5px] font-semibold text-[#F4F2EC] mt-0.5">
                  ${campaign.price} / install
                </span>
                <span className="block text-[10.5px] text-[#C9B8FF] mt-0.5 font-medium">
                  0% creator fee
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Attestation</span>
                <span className="block text-[13.5px] font-semibold text-[#F4F2EC] mt-0.5">
                  SDK Verified
                </span>
                <span className="block text-[10.5px] text-[#9C9A92] mt-0.5">
                  Real device installs
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Settlement</span>
                <span className="block text-[13.5px] font-semibold text-[#F4F2EC] mt-0.5">
                  Weekly
                </span>
                <span className="block text-[10.5px] text-[#9C9A92] mt-0.5">
                  Fridays, automated
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Attribution Hold</span>
                <span className="block text-[13.5px] font-semibold text-[#C9B8FF] mt-0.5">
                  14 days
                </span>
                <span className="block text-[10.5px] text-[#9C9A92] mt-0.5">
                  Deferred deep link
                </span>
              </div>
            </div>

            {/* If Joined: Tracking link & QR Code command strip */}
            {campaign.joined ? (
              <div className="space-y-2 pt-1">
                <div className="bg-[#141414] rounded-[16px] p-3.5 border border-[#C9B8FF]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-[#9C9A92]">Your Attribution Link</span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] text-[#C9B8FF] font-medium bg-[#C9B8FF]/10 px-2 py-0.2 rounded-full">
                        <i className="ti ti-circle-check text-[10px]"></i>
                        <span>Tracking active</span>
                      </span>
                    </div>
                    <div className="font-mono text-[12.5px] text-[#F4F2EC] truncate select-all bg-[#0A0A0A] px-2.5 py-1.5 rounded-[10px] border border-[#222222]">
                      https://kred.link/{slug}/{localStorage.getItem(`kred_handle_${slug}`) || 'you'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {onOpenQr && (
                      <button
                        type="button"
                        onClick={handleOpenQrClick}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium py-2 px-3.5 rounded-full bg-[#1B1B1B] hover:bg-[#222222] text-[#F4F2EC] border border-[#262626] cursor-pointer transition-colors shadow-xs"
                      >
                        <i className="ti ti-qrcode text-[#C9B8FF]"></i>
                        <span>QR Code</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-2 px-4 rounded-full bg-[#C9B8FF] hover:bg-[#ba9bf7] text-[#000000] cursor-pointer transition-all shadow-xs active:scale-95"
                    >
                      <i className={copied ? "ti ti-check font-bold" : "ti ti-copy"}></i>
                      <span>{copied ? 'Copied' : 'Copy link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : !isEnded && !isPaused ? (
              /* If Not Joined: Quick In-Card Join Prompt */
              <div className="bg-[#141414] rounded-[16px] p-3.5 border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-[13px] text-[#9C9A92]">
                  Join this campaign to generate your personal tracked link and access in-app install bounties.
                </div>
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold py-1.5 px-4 rounded-full bg-[#F4F2EC] hover:bg-white text-[#000000] cursor-pointer transition-all shadow-sm shrink-0"
                >
                  <i className="ti ti-plus text-[12px] stroke-[2.5]" aria-hidden="true"></i>
                  <span>Join now</span>
                </button>
              </div>
            ) : null}

            {/* Bottom expanded buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleViewDetailPage}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium py-1.5 px-4 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors"
                >
                  <span>View full campaign details</span>
                  <i className="ti ti-arrow-right text-[12px]" aria-hidden="true"></i>
                </button>

                {onNavigateAnalytics && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateAnalytics(campaign.id);
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-medium py-1.5 px-3.5 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors"
                  >
                    <i className="ti ti-chart-bar text-[13px]"></i>
                    <span>Telemetry</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleToggleExpand}
                className="pill gh min-h-[38px] px-3 text-[#9C9A92] hover:text-[#F4F2EC] cursor-pointer text-[12.5px]"
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

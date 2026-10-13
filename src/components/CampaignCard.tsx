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
  onJoin: _onJoin,
  onNavigateDetail,
  onOpenQr,
  onCopyLink,
  onShare: _onShare,
  onNavigateAnalytics: _onNavigateAnalytics,
  onManage,
  isFounder = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const slug = campaign.slug || campaign.id;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const handle = localStorage.getItem(`kred_handle_${slug}`) || 'you';
    const link = `https://kred.link/${slug}/${handle}`;
    if (onCopyLink) onCopyLink(campaign);
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleOpenQrClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenQr) onOpenQr(campaign);
  };

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';
  const icon = campaign.icon || 'ti-device-gamepad-2';
  const priceDisplay = campaign.price ? `$${campaign.price}` : campaign.pay;
  const isEnded = campaign.days <= 0 || (campaign as any).isEnded;
  const isPaused = (campaign as any).isPaused;
  const isOutOfBudget = campaign.budget !== undefined && campaign.budget <= 0;
  const isDraft = (campaign as any).isDraft || !campaign.sdkConnected;

  return (
    <>
      {/* Mobile X.com Feed Item (sm:hidden) */}
      <article
        onClick={handleViewDetailPage}
        className="sm:hidden w-full bg-black hover:bg-[#080808] active:bg-[#101010] transition-colors p-3.5 sm:p-4 text-left cursor-pointer border-b border-[#2f3336]"
      >
        <div className="flex items-start gap-3">
          {/* Left: App Icon / Avatar (X.com mobile tweet avatar) */}
          <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-[#2f3336]"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${icon} text-[22px]`}></i>
          </div>

          {/* Right: Tweet Body */}
          <div className="min-w-0 flex-1">
            {/* Header row: Name + Verified + @handle + time left + options */}
            <div className="flex items-center justify-between gap-1 leading-tight">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-bold text-[15px] text-[#e7e9ea] truncate hover:underline">
                  {campaign.name}
                </span>
                <i className="ti ti-circle-check-filled text-[#C9B8FF] text-[14px] shrink-0" aria-label="Verified"></i>
                <span className="text-[13px] text-[#71767b] truncate">
                  @{campaign.slug || campaign.cat.toLowerCase().replace(/\s+/g, '')}
                </span>
                <span className="text-[13px] text-[#71767b] shrink-0">·</span>
                <span className="text-[13px] text-[#71767b] shrink-0">
                  {isEnded ? 'Ended' : `${campaign.days}d`}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleExpand(e);
                }}
                className="text-[#71767b] hover:text-[#e7e9ea] p-1 -mr-1 cursor-pointer bg-transparent border-0"
                aria-label="More options"
              >
                <i className="ti ti-dots text-[16px]"></i>
              </button>
            </div>

            {/* Sub-header: By host + category */}
            <div className="text-[12.5px] text-[#71767b] mt-0.5">
              By {campaign.by || campaign.host} · {campaign.cat}
            </div>

            {/* Post text / pitch */}
            <p className="text-[14px] text-[#e7e9ea] mt-1.5 leading-snug line-clamp-2">
              {campaign.desc || campaign.tag || 'Casual mobile app with verified install attribution and instant creator bounties.'}
            </p>

            {/* Embedded Quote Box (Bounty pill card) */}
            <div className="mt-2.5 p-2.5 rounded-xl border border-[#2f3336] bg-[#0e1013] flex items-center justify-between gap-2">
              <div>
                <div className="text-[13px] font-bold text-[#F4F2EC] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9B8FF]"></span>
                  {priceDisplay} / verified install
                </div>
                <div className="text-[11px] text-[#71767b] mt-0.5">
                  Real-time attribution · Escrow funded
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="w-6 h-6 rounded-full bg-[#1c1f24] text-[#e7e9ea] flex items-center justify-center text-[12px]">
                  <i className="ti ti-brand-apple"></i>
                </span>
                <span className="w-6 h-6 rounded-full bg-[#1c1f24] text-[#e7e9ea] flex items-center justify-center text-[12px]">
                  <i className="ti ti-player-play"></i>
                </span>
              </div>
            </div>

            {/* X Tweet Action Row */}
            <div className="flex items-center justify-between mt-3 pt-1">
              {/* Sleek Join Button (same size as create campaign) */}
              {!isEnded && !isPaused ? (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className={`inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 active:scale-95 shadow-sm min-h-[34px] ${
                    campaign.joined
                      ? 'bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] border border-[#2f3336]'
                      : 'bg-[#F4F2EC] hover:bg-white text-[#000000]'
                  }`}
                >
                  {campaign.joined ? (
                    <>
                      <i className="ti ti-circle-check text-[#C9B8FF] text-[14px]"></i>
                      <span>Joined</span>
                    </>
                  ) : (
                    <>
                      <span>Join campaign</span>
                      <i className="ti ti-arrow-right text-[12px] stroke-[2.5]"></i>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[12px] text-[#71767b] font-medium">Inactive</span>
              )}

              {/* Action icons like X metrics & actions */}
              <div className="flex items-center gap-3 text-[#71767b]">
                {campaign.joined && onOpenQr && (
                  <button
                    type="button"
                    onClick={handleOpenQrClick}
                    className="p-1.5 rounded-full hover:bg-neutral-800 hover:text-[#C9B8FF] transition-colors cursor-pointer border-0 bg-transparent"
                    title="QR Code"
                  >
                    <i className="ti ti-qrcode text-[17px]"></i>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-full hover:bg-neutral-800 hover:text-[#C9B8FF] transition-colors cursor-pointer border-0 bg-transparent"
                  title="Copy Link"
                >
                  <i className={`ti ${copied ? 'ti-check text-[#C9B8FF]' : 'ti-share'} text-[17px]`}></i>
                </button>

                {/* Avatar stack without numbers (Rule strictly enforced) */}
                <span className="inline-flex select-none">
                  <span
                    className="w-[18px] h-[18px] rounded-full border border-black inline-flex items-center justify-center text-[8px] font-medium"
                    style={{ backgroundColor: '#CECBF6', color: '#26215C' }}
                  >
                    H
                  </span>
                  <span
                    className="w-[18px] h-[18px] rounded-full border border-black -ml-1 inline-flex items-center justify-center text-[8px] font-medium"
                    style={{ backgroundColor: '#F5C4B3', color: '#4A1B0C' }}
                  >
                    C
                  </span>
                  <span
                    className="w-[18px] h-[18px] rounded-full border border-black -ml-1 inline-flex items-center justify-center text-[8px] font-medium"
                    style={{ backgroundColor: '#C0DD97', color: '#173404' }}
                  >
                    F
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Desktop Grid Layout (100% Unchanged) */}
      <div className="hidden sm:grid sm:grid-cols-[100px_minmax(0,1fr)] gap-4 items-start w-full">
        <div className="pt-1.5 select-none text-left">
          <div className="text-[14px] font-medium text-[#F4F2EC]">{campaign.cat}</div>
          <div className="text-[12px] text-[#9C9A92] mt-0.5">
            {isEnded ? 'Campaign ended' : `${campaign.days} days left`}
          </div>
        </div>

        <div
          onClick={handleToggleExpand}
          style={{ width: '720px' }}
          className={`card cursor-pointer transition-all duration-200 relative group border max-w-full text-left p-4 sm:p-5 ${
            isExpanded ? 'border-[#F4F2EC]/30 bg-[#141414]' : 'border-transparent hover:bg-[#121212]'
          }`}
        >
        <div className="flex gap-3 sm:gap-4 justify-between items-start">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[18px] sm:text-[20px] font-medium tracking-[-0.3px] text-[#F4F2EC] group-hover:text-white transition-colors">
                {campaign.name}
              </div>
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

            <div className="text-[12px] text-[#9C9A92] mt-0.5 mb-2">
              By {campaign.by || campaign.host}
            </div>

            <div className="flex gap-1.5 flex-wrap items-center">
              <span
                className="chip font-medium rounded-full shadow-xs"
                style={{ backgroundColor: bg, color: fg, padding: '4px 11px', fontSize: '12px' }}
              >
                {priceDisplay} per verified install
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

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {!isEnded && !isPaused && (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className={`inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 active:scale-95 shadow-sm min-h-[34px] ${
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

          <div
            className="w-[56px] h-[56px] sm:w-[84px] sm:h-[84px] rounded-[14px] sm:rounded-[20px] flex flex-col items-center justify-center gap-1 shrink-0 select-none shadow-xs"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${icon} text-[20px] sm:text-[26px]`}></i>
            <span className="text-[10px] sm:text-[11px] font-medium text-center px-1 truncate max-w-full">
              {campaign.name}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[#222222] space-y-3.5 animate-[fade-in_0.2s_ease-out]">
            <div>
              <div className="text-[11px] text-[#9C9A92] uppercase font-mono tracking-wider mb-1">
                About campaign
              </div>
              <p className="text-[13.5px] text-[#B8B6AE] leading-relaxed">{campaign.desc}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#141414] rounded-[16px] p-3 border border-[#222222]/60 text-left">
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Bounty</span>
                <span className="block text-[13px] font-medium text-[#F4F2EC]">
                  ${campaign.price} / install
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Settlement</span>
                <span className="block text-[13px] font-medium text-[#F4F2EC]">
                  Weekly (Fridays)
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Attribution hold</span>
                <span className="block text-[13px] font-medium text-[#C9B8FF]">14 days</span>
              </div>
              <div>
                <span className="block text-[11px] text-[#9C9A92]">Rating</span>
                <span className="block text-[13px] font-medium text-[#F4F2EC]">
                  ★ {campaign.rating} ({campaign.installsVerified || '12.4k'})
                </span>
              </div>
            </div>

            {campaign.joined && (
              <div className="space-y-3 pt-1">
                <div className="bg-[#141414] rounded-[16px] p-3 border border-[#222222]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-[#9C9A92]">Your attribution link</div>
                    <div className="font-mono text-[12px] text-[#F4F2EC] truncate select-all">
                      kred.link/{slug}/{localStorage.getItem(`kred_handle_${slug}`) || 'you'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenQr && (
                      <button
                        type="button"
                        onClick={handleOpenQrClick}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium py-1.5 px-3.5 rounded-full bg-[#1B1B1B] hover:bg-[#222222] text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors shadow-xs"
                      >
                        <i className="ti ti-qrcode text-[#C9B8FF]"></i>
                        <span>QR Code</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold py-1.5 px-4 rounded-full bg-[#C9B8FF] hover:bg-[#ba9bf7] text-[#000000] cursor-pointer transition-all shadow-xs active:scale-95"
                    >
                      <i className={copied ? 'ti ti-check font-bold' : 'ti ti-copy'}></i>
                      <span>{copied ? 'Copied' : 'Copy link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={handleViewDetailPage}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium py-1.5 px-4 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors"
              >
                <span>View full campaign page</span>
                <i className="ti ti-arrow-right text-[12px]" aria-hidden="true"></i>
              </button>

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
    </>
  );
};

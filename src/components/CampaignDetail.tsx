import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { CATS } from '../data/campaigns';
import { Breadcrumbs } from './Breadcrumbs';
import { TrackingQrCode } from './TrackingQrCode';

interface CampaignDetailProps {
  campaign: Campaign;
  allCampaigns?: Campaign[];
  onJoin: (campaign: Campaign, targetEl?: HTMLElement) => void;
  onOpenQr: (campaign: Campaign) => void;
  onCopyLink: (campaign: Campaign) => void;
  onShare: (campaign: Campaign) => void;
  onNavigateDetail?: (id: string) => void;
  onNavigateAnalytics?: (id: string) => void;
  onNavigateEarnings?: () => void;
  onBack: () => void;
  isOwner?: boolean;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  allCampaigns = [],
  onJoin,
  onCopyLink,
  onNavigateDetail,
  onNavigateAnalytics,
  onNavigateEarnings,
  onBack,
  isOwner = false,
}) => {
  const [showTerms, setShowTerms] = useState(false);
  const [copied, setCopied] = useState(false);

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';
  const icon = campaign.icon || 'ti-device-gamepad-2';
  const slug = campaign.slug || campaign.id;
  const linkText = `kred.link/${slug}/you`;

  const handleCopy = () => {
    onCopyLink(campaign);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleJoin = (e: React.MouseEvent<HTMLButtonElement>) => {
    onJoin(campaign, e.currentTarget);
  };

  const otherCampaigns = allCampaigns.filter((c) => c.id !== campaign.id).slice(0, 2);

  // Phone Mockup Renderer
  const renderPhoneMockup = (k: number) => {
    const hh = [150, 172, 150][k];
    const isCenter = k === 1;
    return (
      <div
        key={`phone-${k}`}
        className="ph block shrink-0"
        style={{
          height: `${hh + 18}px`,
          marginTop: isCenter ? 0 : '14px',
        }}
      >
        {/* Notch */}
        <div className="w-[22px] h-[4px] rounded-[2px] bg-[#2A2A2A] mx-auto mb-2" />
        {/* Header Widget */}
        <div
          className="rounded-[10px] flex items-center justify-center"
          style={{
            height: isCenter ? '44px' : '30px',
            backgroundColor: bg,
            color: fg,
            fontSize: isCenter ? '20px' : '15px',
          }}
        >
          <i className={`ti ${icon}`} aria-hidden="true"></i>
        </div>
        {/* Text bars */}
        <div className="h-[8px] rounded-[4px] bg-[#242424] mt-2 w-[80%]" />
        <div className="h-[8px] rounded-[4px] bg-[#242424] mt-1.5 w-[55%]" />
        {/* Grid widgets */}
        <div className="grid grid-cols-2 gap-1 mt-2">
          <div
            className="rounded-[7px] bg-[#1C1C1C]"
            style={{ height: isCenter ? '34px' : '24px' }}
          />
          <div
            className="rounded-[7px]"
            style={{ height: isCenter ? '34px' : '24px', backgroundColor: bg }}
          />
          <div
            className="rounded-[7px] bg-[#1C1C1C]"
            style={{ height: isCenter ? '34px' : '24px' }}
          />
          <div
            className="rounded-[7px] bg-[#1C1C1C]"
            style={{ height: isCenter ? '34px' : '24px' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      {/* Breadcrumb with icons */}
      <Breadcrumbs
        items={[
          { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
          { label: campaign.cat, icon: 'ti-tag' },
          { label: campaign.name, icon: campaign.icon, active: true },
        ]}
      />

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_252px] gap-6 items-center">
        {/* Left Info Column */}
        <div className="min-w-0">
          {/* Creator / Host badge & Analytics Link */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-[13px] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C7F26B]" />
              <span>{campaign.by || campaign.host}</span>
              {campaign.tag && (
                <span className="font-serif italic font-normal text-[#9A9892] ml-1">
                  · {campaign.tag}
                </span>
              )}
            </div>

            {isOwner && onNavigateAnalytics ? (
              <button
                type="button"
                onClick={() => onNavigateAnalytics(campaign.id)}
                className="pill text-[12px] min-h-[34px] px-3 cursor-pointer"
                title="View founder attribution dashboard"
              >
                <i className="ti ti-chart-bar text-[13px] text-[#B5D4F4]"></i>
                <span>App analytics (Owner)</span>
              </button>
            ) : campaign.joined && onNavigateEarnings ? (
              <button
                type="button"
                onClick={onNavigateEarnings}
                className="pill text-[12px] min-h-[34px] px-3 cursor-pointer"
                title="View your creator link performance and payouts"
              >
                <i className="ti ti-coin text-[13px] text-[#C7F26B]"></i>
                <span>My link earnings</span>
              </button>
            ) : null}
          </div>

          {/* Big App Title */}
          <h1 className="font-serif text-[38px] sm:text-[46px] font-normal tracking-[-1.2px] leading-[1.05] mt-3 text-[#F5F3EC]">
            {campaign.name}
          </h1>

          {/* Description */}
          <p className="text-[14px] text-[#B9B7AF] leading-[1.6] mt-3">
            {campaign.desc}
          </p>

          {/* Social Proof Row */}
          <div className="flex items-center gap-3.5 mt-3.5 text-[13px] flex-wrap">
            <span className="flex items-center gap-1">
              <i className="ti ti-star text-[#C7F26B]" aria-hidden="true"></i>
              <span>{campaign.rating}</span>
            </span>
            <span className="flex items-center gap-1 text-[#B9B7AF]">
              <i className="ti ti-users" aria-hidden="true"></i>
              <span>{campaign.creators} creators</span>
            </span>
            <span className="flex items-center gap-1 text-[#B9B7AF]">
              <i className="ti ti-circle-check" aria-hidden="true"></i>
              <span>{campaign.installsVerified || '12.4k'} verified installs</span>
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2 mt-4.5">
            <span className="text-[30px] font-medium tracking-[-0.6px] text-[#F5F3EC]">
              ${campaign.price}
            </span>
            <span className="sub">per verified install</span>
            <span className="w-1.5" />
            <span className="ol ci" aria-label="App Store">
              <i className="ti ti-brand-apple" aria-hidden="true"></i>
            </span>
            <span className="ol ci" aria-label="Google Play">
              <i className="ti ti-player-play" aria-hidden="true"></i>
            </span>
          </div>

          {/* Join Actions row */}
          <div className="flex items-center gap-2.5 mt-4 flex-wrap">
            {/* Split Join Button */}
            <div className={`split text-[13px] h-[36px] ${campaign.joined ? 'j' : ''}`}>
              <button onClick={handleJoin} className="m text-[13px] py-1 px-3.5 font-medium">
                {campaign.joined ? (
                  <>
                    <i className="ti ti-check" aria-hidden="true"></i>
                    <span>Joined</span>
                  </>
                ) : (
                  <span>Join campaign</span>
                )}
              </button>
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="c px-2"
                aria-label="Toggle terms"
              >
                <i
                  className={`ti ti-chevron-${showTerms ? 'up' : 'down'} text-[14px]`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>

            <span className="ol">
              <i className="ti ti-clock" aria-hidden="true"></i>
              <span>{campaign.days} days left</span>
            </span>
          </div>
        </div>

        {/* Right Phone Mockups Column: Stacks on mobile with horizontal scroll */}
        <div className="flex gap-2.5 items-center justify-start md:justify-end overflow-x-auto pb-2 scrollbar-none w-full md:w-auto shrink-0">
          {renderPhoneMockup(0)}
          {renderPhoneMockup(1)}
          {renderPhoneMockup(2)}
        </div>
      </div>

      {/* Sponsored Content Disclosure per UX Spec */}
      <div className="card p-3.5 flex items-start gap-3 bg-[#161616] border border-[#2A2A2A]/40 text-[12px] text-[#9A9892]">
        <i className="ti ti-info-circle text-[18px] text-[#B9B7AF] shrink-0 mt-0.5" aria-hidden="true"></i>
        <div className="leading-relaxed">
          <span className="text-[#F5F3EC] font-medium block mb-0.5">Sponsored content disclosure</span>
          When sharing your tracking link in videos, bios, or streams, you must disclose your partnership clearly using tags like <span className="text-[#F5F3EC]">#ad</span> or platform sponsorship labels in accordance with advertising guidelines.
        </div>
      </div>

      {/* Campaign Terms Card (when opened via split button) */}
      {showTerms && (
        <div className="card animate-[rise_0.2s_ease-out]">
          <div className="font-medium text-[15px] text-[#F5F3EC]">Campaign terms</div>
          <div className="mt-1.5">
            <div className="row2">
              <span>Verification window</span>
              <span>14 days</span>
            </div>
            <div className="row2">
              <span>Settlement</span>
              <span>Weekly, on Fridays</span>
            </div>
            <div className="row2">
              <span>Minimum payout</span>
              <span>$20.00</span>
            </div>
            <div className="row2">
              <span>Platforms</span>
              <span>iOS and Android</span>
            </div>
          </div>
        </div>
      )}

      {/* Your Creator Link Card (when joined) */}
      {campaign.joined && (
        <div className="card flex flex-col sm:flex-row gap-4 items-center animate-[pop_0.2s_ease-out]">
          <div className="flex-1 min-w-0 w-full">
            <div className="font-medium text-[15px] text-[#F5F3EC]">Your creator link</div>
            <div className="sub mt-0.5">
              Every install through this link counts toward your earnings.
            </div>

            <div className="flex items-center gap-2 mt-3.5 bg-[#1C1C1C] rounded-full p-1.5 pl-4 border border-[#2A2A2A]/40">
              <span className="flex-1 font-mono text-[12px] text-[#F5F3EC] overflow-hidden text-ellipsis whitespace-nowrap">
                {linkText}
              </span>
              <button
                onClick={handleCopy}
                className="pill on text-[12px] py-1.5 px-3.5"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Scannable Tracking QR Code */}
          <div className="shrink-0 flex flex-col items-center">
            <TrackingQrCode
              url={`https://${linkText}`}
              size={120}
              showDownload={true}
              downloadFileName={`kred_qr_${slug}.png`}
            />
          </div>
        </div>
      )}

      {/* How you earn Card */}
      <div className="card">
        <div className="font-medium text-[15px] text-[#F5F3EC]">How you earn</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
          {[
            {
              ic: 'ti-link',
              title: 'Join and get your link',
              desc: 'Your personal link is ready as soon as you join.',
            },
            {
              ic: 'ti-share',
              title: 'Share it your way',
              desc: 'Post it in videos, stories, or your bio.',
            },
            {
              ic: 'ti-coin',
              title: 'Earn per verified install',
              desc: 'Paid weekly once installs are verified.',
            },
          ].map((step, idx) => (
            <div key={step.title} className="p-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[16px]"
                  style={{ backgroundColor: bg, color: fg }}
                >
                  <i className={`ti ${step.ic}`} aria-hidden="true"></i>
                </span>
                <span className="sub">Step {idx + 1}</span>
              </div>
              <div className="text-[14px] font-medium text-[#F5F3EC] mt-2.5">
                {step.title}
              </div>
              <div className="sub mt-1 leading-[1.5]">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Up next section */}
      {otherCampaigns.length > 0 && (
        <div className="pt-2">
          <div className="font-medium text-[15px] text-[#F5F3EC] mb-2.5">Up next</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {otherCampaigns.map((other) => (
              <button
                key={other.id}
                onClick={() => onNavigateDetail && onNavigateDetail(other.id)}
                className="card p-3.5! flex items-center gap-3 text-left w-full hover:bg-[#1C1C1C] transition-colors cursor-pointer border-0"
              >
                <span
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] shrink-0"
                  style={{ backgroundColor: other.bg, color: other.fg }}
                >
                  <i className={`ti ${other.icon}`} aria-hidden="true"></i>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-medium text-[#F5F3EC]">
                    {other.name}
                  </span>
                  <span className="block text-[12px] text-[#9A9892]">
                    ${other.price} per verified install
                  </span>
                </span>
                <i className="ti ti-arrow-right text-[#9A9892]" aria-hidden="true"></i>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="pt-2">
        <div className="font-medium text-[15px] text-[#F5F3EC] mb-2.5">Categories</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(CATS).slice(0, 8).map(([name, catData]) => (
            <div
              key={name}
              className="rounded-[18px] p-3 flex flex-col gap-3.5 transition-transform hover:scale-[1.02] cursor-default"
              style={{ backgroundColor: catData.bg, color: catData.fg }}
            >
              <i className={`ti ${catData.icon} text-[20px]`} aria-hidden="true"></i>
              <span className="text-[13px] font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

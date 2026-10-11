import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { ShareOverlayModal } from './ShareOverlayModal';
import { Breadcrumbs } from './Breadcrumbs';

interface ShareOverlayShowcaseViewProps {
  campaigns: Campaign[];
  onBack?: () => void;
  onNavigateCampaign?: (id: string) => void;
  onCopyLink?: (campaign: Campaign) => void;
}

export const ShareOverlayShowcaseView: React.FC<ShareOverlayShowcaseViewProps> = ({
  campaigns,
  onBack,
  onNavigateCampaign = () => {},
  onCopyLink = () => {},
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => {
    const found = campaigns.find((c) => c.slug === 'pixelpop' || c.id === 'pixelpop');
    return found ? found.id : campaigns[0]?.id || 'atelier';
  });
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const handleCopy = (c: Campaign) => {
    onCopyLink(c);
    setToastMessage(`Copied attribution link for ${c.name}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const MobilePhoneFrame: React.FC<{ label: string; tab: 'link' | 'qr' | 'caption' }> = ({
    label,
    tab,
  }) => (
    <div className="flex-1 min-w-[320px] max-w-[390px]">
      <div className="text-[12px] tracking-[0.12em] uppercase text-[#9C9A92] font-semibold mb-3 flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono text-[10.5px] text-[#6F6D66] bg-[#141414] px-2 py-0.5 rounded-full">
          390 × 780
        </span>
      </div>

      <div className="relative w-full h-[780px] rounded-[44px] border border-[#222222] bg-[#080808] overflow-hidden shadow-2xl flex flex-col justify-end">
        {/* Dynamic Island / Speaker Notch Simulation */}
        <div className="absolute top-3 inset-x-0 flex justify-center z-20 pointer-events-none">
          <div className="w-24 h-4 rounded-full bg-[#1A1A1A] border border-[#262626]/80" />
        </div>

        {/* Ambient background app page underneath the bottom sheet */}
        <div className="absolute inset-0 p-5 pt-12 space-y-3 opacity-40 select-none" aria-hidden="true">
          <div className="h-3 w-24 bg-[#1B1B1B] rounded" />
          <div className="h-8 w-48 bg-[#161616] rounded" />
          <div className="h-24 bg-[#111111] rounded-[18px] border border-[#222222]/30" />
          <div className="h-24 bg-[#111111] rounded-[18px] border border-[#222222]/30" />
          <div className="h-24 bg-[#111111] rounded-[18px] border border-[#222222]/30" />
        </div>

        {/* Backdrop tint */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none" />

        {/* Sheet docked cleanly at the bottom */}
        <div className="relative z-10 w-full flex">
          <ShareOverlayModal
            campaign={selectedCampaign}
            isOpen={true}
            onClose={() => {}}
            onCopyLink={handleCopy}
            onViewCampaign={onNavigateCampaign}
            layout="sheet"
            inline={true}
            initialTab={tab}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-[#F4F2EC] px-4 sm:px-8 py-8 sm:py-10 select-none text-left">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#141414] border border-[#C9B8FF] text-[#F4F2EC] px-4 py-2.5 rounded-full text-[13px] shadow-2xl flex items-center gap-2 animate-[fade-in_0.15s_ease-out]">
          <i className="ti ti-circle-check text-[#C9B8FF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1320px] mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            {
              label: 'Campaigns',
              icon: 'ti-speakerphone',
              onClick: onBack || (() => (window.location.hash = '#/')),
            },
            {
              label: 'Share Overlay Showcase',
              icon: 'ti-share',
              active: true,
            },
          ]}
        />

        {/* Headline Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#222222] pb-6">
          <div>
            <p className="text-[12px] tracking-[0.12em] uppercase text-[#9C9A92] font-semibold m-0">
              Creator · After joining
            </p>
            <h1 className="font-serif font-medium tracking-[-1px] text-[38px] sm:text-[44px] leading-[1.05] mt-2 mb-2">
              Share overlay
            </h1>
            <p className="text-[15px] text-[#B8B6AE] max-w-[660px] m-0 leading-relaxed">
              Shown the moment a creator joins a campaign. Features native social media sharing buttons (X, Instagram, TikTok), attribution link copying, and high-resolution QR code generation with direct download and printing.
            </p>
          </div>

          {/* Campaign Selector & Live Test Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-[#141414] border border-[#222222] rounded-full">
              <span className="text-[11.5px] text-[#9C9A92] pl-2.5 pr-1 font-medium">Campaign:</span>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="bg-transparent text-[#F4F2EC] text-[12.5px] font-medium border-0 py-1 pr-3 pl-1 outline-none cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141414] text-[#F4F2EC]">
                    {c.name} (${c.price})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsLiveModalOpen(true)}
              className="pill on text-[13px] py-2 px-4 cursor-pointer font-medium inline-flex items-center gap-1.5"
            >
              <i className="ti ti-player-play text-[14px]" />
              <span>Trigger live overlay</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Desktop Overlay */}
        <div>
          <div className="text-[12px] tracking-[0.12em] uppercase text-[#9C9A92] font-semibold mb-3">
            1 · Desktop overlay
          </div>

          <div className="relative rounded-[28px] border border-[#222222] bg-[#080808] overflow-hidden min-h-[760px] flex items-center justify-center p-4 sm:p-8">
            {/* Background Simulated App Grid */}
            <div className="absolute inset-0 p-8 opacity-40 select-none pointer-events-none" aria-hidden="true">
              <div className="h-3 w-32 bg-[#1B1B1B] rounded mb-4" />
              <div className="h-10 w-72 bg-[#161616] rounded mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="h-48 bg-[#111111] rounded-[20px] border border-[#222222]/30" />
                <div className="h-48 bg-[#111111] rounded-[20px] border border-[#222222]/30" />
                <div className="h-48 bg-[#111111] rounded-[20px] border border-[#222222]/30" />
              </div>
            </div>

            {/* Backdrop Darkening Layer */}
            <div className="absolute inset-0 bg-black/70 pointer-events-none" />

            {/* Desktop Center Modal */}
            <div className="relative z-10 w-full flex justify-center">
              <ShareOverlayModal
                campaign={selectedCampaign}
                isOpen={true}
                onClose={() => {}}
                onCopyLink={handleCopy}
                onViewCampaign={onNavigateCampaign}
                layout="modal"
                inline={true}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Mobile Views */}
        <div className="pt-6">
          <div className="text-[12px] tracking-[0.12em] uppercase text-[#C9B8FF] font-semibold mb-6">
            2 · Mobile views
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-10 justify-start items-start">
            <MobilePhoneFrame label="Link" tab="link" />
            <MobilePhoneFrame label="QR code" tab="qr" />
            <MobilePhoneFrame label="Caption" tab="caption" />
          </div>
        </div>
      </div>

      {/* Live Interactive Modal on Current Viewport */}
      {isLiveModalOpen && (
        <ShareOverlayModal
          campaign={selectedCampaign}
          isOpen={isLiveModalOpen}
          onClose={() => setIsLiveModalOpen(false)}
          onCopyLink={handleCopy}
          onViewCampaign={(id) => {
            setIsLiveModalOpen(false);
            onNavigateCampaign(id);
          }}
          layout="auto"
        />
      )}
    </div>
  );
};

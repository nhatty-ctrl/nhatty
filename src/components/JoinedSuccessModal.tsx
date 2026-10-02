import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { linkOf } from '../data/campaigns';
import { TrackingQrCode } from './TrackingQrCode';

interface JoinedSuccessModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: (campaign: Campaign) => void;
  onViewCampaign: (id: string) => void;
}

export const JoinedSuccessModal: React.FC<JoinedSuccessModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onCopyLink,
  onViewCampaign,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !campaign) return null;

  const url = `https://${linkOf(campaign)}`;
  const bg = campaign.bg || '#C7F26B';
  const fg = campaign.fg || '#16140F';

  const handleCopy = () => {
    onCopyLink(campaign);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleView = () => {
    onClose();
    onViewCampaign(campaign.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[460px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] relative select-none text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <i className="ti ti-x text-[14px]"></i>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] shrink-0"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${campaign.icon || 'ti-device-gamepad-2'}`} aria-hidden="true"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-medium text-[#F5F3EC]">
                Joined {campaign.name}
              </span>
              <span className="chip py-0.5 px-2 bg-[#C7F26B]/20 text-[#C7F26B] text-[11px] font-semibold flex items-center gap-1">
                <i className="ti ti-check text-[11px]"></i>
                <span>Active</span>
              </span>
            </div>
            <div className="text-[12px] text-[#A8A69E] mt-0.5">
              ${campaign.price} bounty per verified install · 14-day hold
            </div>
          </div>
        </div>

        {/* Tracking URL Box */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#F5F3EC]">Your attribution tracking link</span>
            <span className="text-[#A8A69E]">Ready to share</span>
          </div>

          <div className="flex items-center gap-2 bg-[#1C1C1C] rounded-[14px] p-2 pl-3.5 border border-[#2A2A2A]">
            <i className="ti ti-link text-[#C7F26B] text-[16px] shrink-0"></i>
            <span className="flex-1 font-mono text-[12px] text-[#F5F3EC] truncate select-all">
              {linkOf(campaign)}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="pill on text-[12px] py-1.5 px-3.5 shrink-0 font-medium"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* QR Code toggle section */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="pill text-[12px] py-1 px-2.5 text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#1C1C1C] cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-qrcode"></i>
            <span>{showQr ? 'Hide scannable QR' : 'Show scannable QR code'}</span>
            <i className={`ti ti-chevron-${showQr ? 'up' : 'down'} text-[11px]`}></i>
          </button>

          {showQr && (
            <div className="mt-3 p-4 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A] flex flex-col items-center animate-[fade-in_0.15s_ease-out]">
              <TrackingQrCode
                url={url}
                size={160}
                showDownload={true}
                downloadFileName={`kred_qr_${campaign.slug || campaign.id}.png`}
              />
              <span className="text-[11px] text-[#A8A69E] mt-2">
                Standards-compliant QR encoded to {url}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2.5 pt-4 mt-2 border-t border-[#2A2A2A]">
          <button
            type="button"
            onClick={handleView}
            className="pill text-[13px] py-2 px-3 text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#1C1C1C] cursor-pointer flex items-center gap-1.5"
          >
            <span>View campaign page</span>
            <i className="ti ti-arrow-right text-[12px]"></i>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="pill on text-[13px] py-2 px-4 cursor-pointer font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

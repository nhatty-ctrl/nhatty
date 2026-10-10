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
  const bg = campaign.bg || '#C9B8FF';
  const fg = campaign.fg || '#000000';

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
        className="card w-full max-w-[460px] bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] relative select-none text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9A9892] hover:text-[#F4F2EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
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
              <span className="text-[18px] font-medium text-[#F4F2EC]">
                Joined {campaign.name}
              </span>
              <span className="chip py-0.5 px-2 bg-[#C9B8FF]/20 text-[#C9B8FF] text-[11px] font-semibold flex items-center gap-1">
                <i className="ti ti-check text-[11px]"></i>
                <span>Active</span>
              </span>
            </div>
            <div className="text-[12px] text-[#9C9A92] mt-0.5">
              ${campaign.price} bounty per verified install · 14-day hold
            </div>
          </div>
        </div>

        {/* Tracking URL Box */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#F4F2EC]">Your attribution tracking link</span>
            <span className="text-[#9C9A92]">Ready to share</span>
          </div>

          <div className="flex items-center gap-2 bg-[#141414] rounded-[14px] p-2 pl-3.5 border border-[#222222]">
            <i className="ti ti-link text-[#C9B8FF] text-[16px] shrink-0"></i>
            <span className="flex-1 font-mono text-[12px] text-[#F4F2EC] truncate select-all">
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
            className="pill text-[12px] py-1 px-2.5 text-[#B8B6AE] hover:text-[#F4F2EC] hover:bg-[#141414] cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-qrcode"></i>
            <span>{showQr ? 'Hide scannable QR' : 'Show scannable QR code'}</span>
            <i className={`ti ti-chevron-${showQr ? 'up' : 'down'} text-[11px]`}></i>
          </button>

          {showQr && (
            <div className="mt-3 p-4 bg-[#141414] rounded-[16px] border border-[#222222] flex flex-col items-center animate-[fade-in_0.15s_ease-out]">
              <TrackingQrCode
                url={url}
                size={160}
                showDownload={true}
                downloadFileName={`kred_qr_${campaign.slug || campaign.id}.png`}
              />
              <span className="text-[11px] text-[#9C9A92] mt-2">
                Standards-compliant QR encoded to {url}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2.5 pt-4 mt-2 border-t border-[#222222]">
          <button
            type="button"
            onClick={handleView}
            className="pill text-[13px] py-2 px-3 text-[#B8B6AE] hover:text-[#F4F2EC] hover:bg-[#141414] cursor-pointer flex items-center gap-1.5"
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

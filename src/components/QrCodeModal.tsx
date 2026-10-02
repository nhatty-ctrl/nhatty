import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { linkOf } from '../data/campaigns';
import { TrackingQrCode } from './TrackingQrCode';

interface QrCodeModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (c: Campaign) => void;
  onShare: (c: Campaign) => void;
  isFreshJoin?: boolean;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onCopy,
  onShare,
  isFreshJoin = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleCopy = () => {
    onCopy(campaign);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';
  const exactUrl = `https://${linkOf(campaign)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[420px] bg-[#161616] border border-[#2A2A2A] rounded-[20px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] relative select-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <i className="ti ti-x text-[14px]"></i>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] shrink-0"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${campaign.icon || 'ti-device-gamepad-2'}`} aria-hidden="true"></i>
          </div>
          <div>
            <div className="text-[16px] font-medium text-[#F5F3EC]">
              {isFreshJoin ? 'Joined' : campaign.name}
            </div>
            <div className="text-[12px] text-[#A8A69E]">
              ${campaign.price} per verified install · Real attribution QR
            </div>
          </div>
        </div>

        {/* QR Code container with true URL encoding */}
        <div className="flex flex-col items-center justify-center my-4 p-4 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40">
          <TrackingQrCode
            url={exactUrl}
            size={180}
            showDownload={true}
            downloadFileName={`kred_qr_${campaign.slug || campaign.id}.png`}
          />
          <span className="text-[11px] text-[#A8A69E] mt-2 text-center">
            Standards-compliant QR encoded to {exactUrl}
          </span>
        </div>

        {/* Link Box */}
        <div className="flex items-center gap-2 bg-[#1C1C1C] rounded-full p-1.5 pl-4 border border-[#2A2A2A]/40">
          <span className="flex-1 font-mono text-[12px] text-[#F5F3EC] truncate">
            {linkOf(campaign)}
          </span>
          <button
            onClick={handleCopy}
            className="pill on text-[12px] py-1 px-3.5"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onShare(campaign)}
            className="pill flex-1 justify-center bg-[#1C1C1C] hover:bg-[#242424] text-[#F5F3EC]"
          >
            <i className="ti ti-share text-[14px]" aria-hidden="true"></i>
            <span>Share Link</span>
          </button>
          <button
            onClick={onClose}
            className="pill on flex-1 justify-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

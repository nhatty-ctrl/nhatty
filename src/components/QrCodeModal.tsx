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
  const [qrFormat, setQrFormat] = useState<'digital' | 'print' | 'simulate'>('digital');
  const [simulatedScan, setSimulatedScan] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleCopy = () => {
    onCopy(campaign);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';
  const exactUrl = `https://${linkOf(campaign)}`;
  const slug = campaign.slug || campaign.id;

  const handleShareToTwitter = () => {
    const text = encodeURIComponent(
      `Check out ${campaign.name}! Download and experience it here: ${exactUrl} #ad`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[460px] bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] relative select-none text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9A9892] hover:text-[#F4F2EC] flex items-center justify-center border-0 cursor-pointer transition-colors"
          aria-label="Close"
        >
          <i className="ti ti-x text-[15px]"></i>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[22px] shrink-0 shadow-sm"
            style={{ backgroundColor: bg, color: fg }}
          >
            <i className={`ti ${campaign.icon || 'ti-device-gamepad-2'}`} aria-hidden="true"></i>
          </div>
          <div>
            <div className="text-[17px] font-medium text-[#F4F2EC]">
              {isFreshJoin ? `Joined ${campaign.name}` : `${campaign.name} QR Card`}
            </div>
            <div className="text-[12px] text-[#9C9A92]">
              ${campaign.price} per verified install · Guaranteed escrow
            </div>
          </div>
        </div>

        {/* View Mode Pills: Digital | Print Flyer | Test Scanner */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-[#141414] rounded-full border border-[#222222]/40">
          <button
            type="button"
            onClick={() => {
              setQrFormat('digital');
              setSimulatedScan(false);
            }}
            className={`pill flex-1 justify-center text-[12px] py-1 border-0 ${
              qrFormat === 'digital' ? 'on font-medium' : 'gh text-[#9A9892]'
            }`}
          >
            <i className="ti ti-qrcode text-[13px]"></i>
            <span>Digital</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setQrFormat('print');
              setSimulatedScan(false);
            }}
            className={`pill flex-1 justify-center text-[12px] py-1 border-0 ${
              qrFormat === 'print' ? 'on font-medium' : 'gh text-[#9A9892]'
            }`}
          >
            <i className="ti ti-printer text-[13px]"></i>
            <span>Flyer / Badge</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setQrFormat('simulate');
              setSimulatedScan(true);
            }}
            className={`pill flex-1 justify-center text-[12px] py-1 border-0 ${
              qrFormat === 'simulate' ? 'on font-medium' : 'gh text-[#9A9892]'
            }`}
          >
            <i className="ti ti-device-mobile text-[13px]"></i>
            <span>Scan test</span>
          </button>
        </div>

        {/* Card Body by Format */}
        {qrFormat === 'digital' && (
          <div className="flex flex-col items-center justify-center my-4 p-5 bg-[#141414] rounded-[20px] border border-[#222222]/40 animate-[fade-in_0.15s_ease-out]">
            <TrackingQrCode
              url={exactUrl}
              size={180}
              showDownload={true}
              downloadFileName={`kred_qr_${slug}.png`}
            />
            <span className="text-[11.5px] text-[#9C9A92] mt-2.5 text-center font-mono">
              {exactUrl}
            </span>
          </div>
        )}

        {qrFormat === 'print' && (
          <div className="my-4 p-6 bg-white text-[#000000] rounded-[20px] shadow-lg flex flex-col items-center text-center animate-[fade-in_0.15s_ease-out]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#388BFD]">
              <i className="ti ti-asterisk"></i>
              <span>KRED PARTNER VERIFIED</span>
            </div>
            <div className="text-[19px] font-bold mt-1 text-[#000000]">
              Scan to install {campaign.name}
            </div>
            <div className="text-[12px] text-[#555] mb-3">
              Official sponsor link · Direct to App Store & Google Play
            </div>

            <TrackingQrCode
              url={exactUrl}
              size={160}
              showDownload={true}
              downloadFileName={`kred_flyer_qr_${slug}.png`}
            />

            <div className="mt-3 text-[11px] font-mono text-[#444] bg-[#F0F0EB] px-3 py-1 rounded-full">
              {linkOf(campaign)}
            </div>
          </div>
        )}

        {qrFormat === 'simulate' && (
          <div className="my-4 p-5 bg-[#141414] rounded-[20px] border border-[#222222]/40 animate-[fade-in_0.15s_ease-out]">
            <div className="flex items-center gap-2.5 text-[#C9B8FF] text-[13px] font-medium pb-2 border-b border-[#222222]">
              <i className="ti ti-circle-check text-[16px]"></i>
              <span>Live attribution scanner simulator</span>
            </div>

            <div className="space-y-3 mt-3 text-[12.5px] text-[#B8B6AE]">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#222222] text-[#F4F2EC] flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                  1
                </span>
                <span>User scans code on iOS or Android Camera</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#222222] text-[#F4F2EC] flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                  2
                </span>
                <span>
                  Redirects to <span className="font-mono text-[#F4F2EC]">{exactUrl}</span> (instant device fingerprint token stored)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#222222] text-[#F4F2EC] flex items-center justify-center text-[10px] shrink-0 font-mono mt-0.5">
                  3
                </span>
                <span>
                  Opens {campaign.name} in App Store / Google Play and awards creator bounty upon first verified launch.
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#222222] flex justify-between items-center text-[11.5px] text-[#9A9892]">
              <span>Status: Ready for audience sharing</span>
              <span className="chip py-0.5 px-2 bg-[#C9B8FF]/20 text-[#C9B8FF] font-mono text-[10.5px]">
                Escrow verified
              </span>
            </div>
          </div>
        )}

        {/* Link Box */}
        <div className="flex items-center gap-2 bg-[#141414] rounded-full p-1.5 pl-4 border border-[#222222]/40 mt-3">
          <span className="flex-1 font-mono text-[12px] text-[#F4F2EC] truncate">
            {linkOf(campaign)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="pill on text-[12px] py-1 px-3.5"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Action Share Presets */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handleShareToTwitter}
            className="pill justify-center out text-[12.5px] py-2"
          >
            <i className="ti ti-brand-x text-[13px]" aria-hidden="true"></i>
            <span>Post to X (#ad)</span>
          </button>

          <button
            type="button"
            onClick={() => onShare(campaign)}
            className="pill justify-center on text-[12.5px] py-2"
          >
            <i className="ti ti-share text-[13px]" aria-hidden="true"></i>
            <span>Share Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

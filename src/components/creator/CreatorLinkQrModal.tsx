import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ReferralCode, Campaign } from '../../types/umi';

interface CreatorLinkQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: ReferralCode;
  campaign?: Campaign;
}

export const CreatorLinkQrModal: React.FC<CreatorLinkQrModalProps> = ({
  isOpen,
  onClose,
  referralCode,
  campaign,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrColor, setQrColor] = useState('#C7F26B'); // Lime default

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      referralCode.shortUrl,
      {
        width: 240,
        margin: 1.5,
        color: {
          dark: qrColor,
          light: '#141414',
        },
      },
      (err) => {
        if (err) console.error('Failed to generate QR code', err);
      }
    );
  }, [isOpen, referralCode.shortUrl, qrColor]);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `umi-qr-${referralCode.code.toLowerCase()}.png`;
    a.href = url;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            {campaign && (
              <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C7F26B] flex items-center justify-center text-[20px] shrink-0">
                <i className={`ti ${campaign.icon}`}></i>
              </div>
            )}
            <div>
              <h2 className="text-[17px] font-semibold text-[#F5F3EC]">
                {campaign ? campaign.appName : 'Campaign'} Referral Kit
              </h2>
              <p className="text-[12.5px] text-[#A8A69E] mt-0.5">
                Share with your audience to earn ${(campaign ? (campaign.rewardMinor / 100).toFixed(2) : '2.00')} per verified install
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#A8A69E] hover:text-[#F5F3EC] flex items-center justify-center transition-colors border-0 cursor-pointer"
          >
            <i className="ti ti-x text-[16px]"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* QR Code Canvas Card */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0F0F0F] border border-[#222]">
            <canvas ref={canvasRef} className="rounded-xl shadow-lg"></canvas>

            {/* QR Customization Colors */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[11.5px] text-[#777] mr-1">QR Style:</span>
              {[
                { hex: '#C7F26B', label: 'Lime' },
                { hex: '#F5F3EC', label: 'Cream' },
                { hex: '#7FB2FF', label: 'Sky' },
                { hex: '#CECBF6', label: 'Lilac' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setQrColor(c.hex)}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                    qrColor === c.hex ? 'ring-2 ring-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                ></button>
              ))}

              <button
                type="button"
                onClick={handleDownloadQr}
                className="ml-3 px-3 py-1 rounded-lg bg-[#222] hover:bg-[#2A2A2A] text-[#F5F3EC] text-[11.5px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-1.5"
              >
                <i className="ti ti-download text-[13px]"></i>
                <span>Download PNG</span>
              </button>
            </div>
          </div>

          {/* Short Link Card */}
          <div>
            <label className="block text-[12px] font-medium text-[#A8A69E] mb-1.5 uppercase tracking-wider">
              Smart Edge Redirect Link (iOS & Android)
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
              <span className="font-mono text-[13.5px] text-[#C7F26B] px-2 flex-1 truncate">
                {referralCode.shortUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralCode.shortUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333] text-[#F5F3EC] text-[12px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-1.5"
              >
                <i className={`ti ${copiedLink ? 'ti-check text-[#C7F26B]' : 'ti-copy'}`}></i>
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Human Creator Code */}
          <div>
            <label className="block text-[12px] font-medium text-[#A8A69E] mb-1.5 uppercase tracking-wider">
              Creator Code (In-App Backup)
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A]">
              <div>
                <span className="text-[20px] font-mono font-bold tracking-wider text-[#F5F3EC]">
                  {referralCode.code}
                </span>
                <p className="text-[11.5px] text-[#888] mt-0.5">
                  Users can enter this code in the app to claim bonus items & credit you
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralCode.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#2A2A2A] hover:bg-[#333] text-[#F5F3EC] text-[12px] font-medium transition-colors border-0 cursor-pointer"
              >
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* How Attribution Works */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#242424] space-y-2">
            <div className="text-[12.5px] font-medium text-[#F5F3EC] flex items-center gap-1.5">
              <i className="ti ti-shield-check text-[#C7F26B]"></i>
              <span>How Umi Verified Attribution Works</span>
            </div>
            <ul className="text-[12px] text-[#A8A69E] space-y-1.5 pl-5 list-disc leading-relaxed">
              <li>
                <strong className="text-[#DDD]">Universal App Links:</strong> Users tapping your link are seamlessly routed to the App Store.
              </li>
              <li>
                <strong className="text-[#DDD]">Source Confirmation:</strong> The Umi iOS SDK detects your creator code upon app launch.
              </li>
              <li>
                <strong className="text-[#DDD]">Required Milestone:</strong> {campaign ? campaign.qualifyingEventLabel : 'Complete required in-game or productivity action'}.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[13px] font-semibold transition-all border-0 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

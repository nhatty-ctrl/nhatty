import React, { useEffect, useRef, useState } from 'react';
import { Campaign } from '../types/campaign';
import { linkOf } from '../data/campaigns';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !campaign || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 180;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.scale(2, 2);
    ctx.fillStyle = '#F5F3EC';
    ctx.fillRect(0, 0, size, size);

    const url = `https://${linkOf(campaign)}`;
    const grid = 21;
    const cellSize = (size - 24) / grid;
    const offset = 12;

    ctx.fillStyle = '#0B0B0B';

    const drawFinder = (gx: number, gy: number) => {
      ctx.fillStyle = '#0B0B0B';
      ctx.fillRect(offset + gx * cellSize, offset + gy * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#F5F3EC';
      ctx.fillRect(offset + (gx + 1) * cellSize, offset + (gy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#0B0B0B';
      ctx.fillRect(offset + (gx + 2) * cellSize, offset + (gy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(grid - 7, 0);
    drawFinder(0, grid - 7);

    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#0B0B0B';
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= grid - 8) ||
          (r >= grid - 8 && c < 8)
        ) {
          continue;
        }

        const bit = ((hash ^ (r * 33 + c * 47)) & (1 << ((r + c) % 8))) !== 0;
        if (bit) {
          ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }, [isOpen, campaign]);

  if (!isOpen || !campaign) return null;

  const handleCopy = () => {
    onCopy(campaign);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const bg = campaign.bg || '#CECBF6';
  const fg = campaign.fg || '#26215C';

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
            <div className="text-[12px] text-[#9A9892]">
              ${campaign.price} per verified install
            </div>
          </div>
        </div>

        {/* QR Code container */}
        <div className="flex flex-col items-center justify-center my-5 p-4 bg-[#1C1C1C] rounded-[16px] border border-[#2A2A2A]/40">
          <canvas ref={canvasRef} className="rounded-[10px]" />
          <span className="text-[12px] text-[#9A9892] mt-3">
            Scan to test your creator tracking link
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

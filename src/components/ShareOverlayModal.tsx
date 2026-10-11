import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Campaign } from '../types/campaign';
import { linkOf } from '../data/campaigns';

export interface ShareOverlayModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: (campaign: Campaign) => void;
  onViewCampaign: (id: string) => void;
  creatorCode?: string;
  layout?: 'auto' | 'sheet' | 'modal';
  inline?: boolean;
  initialTab?: 'link' | 'qr' | 'caption';
}

const DISCLOSURE_REGEX = /#ad\b|#sponsored|paid partnership|commission/i;

type QrTheme = 'cream' | 'lavender' | 'white' | 'dark';

export const ShareOverlayModal: React.FC<ShareOverlayModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onCopyLink,
  onViewCampaign,
  creatorCode = 'ALEX24',
  layout = 'auto',
  inline = false,
  initialTab = 'link',
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'caption'>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // QR Code Generation state
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flyerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrTheme, setQrTheme] = useState<QrTheme>('cream');
  const [qrEcc, setQrEcc] = useState<'M' | 'H'>('M');
  const [qrMode, setQrMode] = useState<'digital' | 'flyer' | 'simulate'>('digital');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const trackingUrl = campaign ? `https://${linkOf(campaign)}` : '';
  const [captionInput, setCaptionInput] = useState<string>('');

  const defaultCaption = campaign
    ? `#ad I earn a commission when people complete an action in ${campaign.name} with my link: ${trackingUrl}`
    : '';
  const effectiveCaption = captionInput || defaultCaption;

  const bg = campaign?.bg || '#C9B8FF';
  const fg = campaign?.fg || '#000000';
  const hasDisclosure = DISCLOSURE_REGEX.test(effectiveCaption);
  const slug = campaign?.slug || campaign?.id || 'app';

  const showNotification = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 2400);
  };

  // Re-render QR code on canvas whenever parameters change
  useEffect(() => {
    if (!isOpen || !campaign || !trackingUrl) return;

    const themeColors: Record<QrTheme, { dark: string; light: string }> = {
      cream: { dark: '#000000', light: '#F4F2EC' },
      lavender: { dark: '#C9B8FF', light: '#0E0E0E' },
      white: { dark: '#000000', light: '#FFFFFF' },
      dark: { dark: '#F4F2EC', light: '#141414' },
    };

    const selectedColors = themeColors[qrTheme];

    // Digital Canvas
    if (qrCanvasRef.current) {
      setIsGeneratingQr(true);
      QRCode.toCanvas(
        qrCanvasRef.current,
        trackingUrl,
        {
          width: 220,
          margin: 2,
          color: selectedColors,
          errorCorrectionLevel: qrEcc,
        },
        (err) => {
          setIsGeneratingQr(false);
          if (err) console.error('Failed to generate tracking QR:', err);
        }
      );
    }

    // Flyer Canvas (high-contrast white/black for printing)
    if (flyerCanvasRef.current) {
      QRCode.toCanvas(
        flyerCanvasRef.current,
        trackingUrl,
        {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: 'H',
        },
        (err) => {
          if (err) console.error('Failed to generate flyer QR:', err);
        }
      );
    }
  }, [isOpen, campaign, trackingUrl, qrTheme, qrEcc, activeTab, qrMode]);

  if (!isOpen || !campaign) return null;

  const copyToClipboard = async (field: string, text: string, isLinkAction = false) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Fallback
    }
    if (isLinkAction) {
      onCopyLink(campaign);
    }
    setCopiedKey(field);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Social sharing dispatcher that triggers native sharing APIs
  const handleShareToPlatform = async (platformId: string) => {
    // 1. Copy the FTC-compliant caption and link to clipboard first
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(effectiveCaption);
      }
    } catch {}

    // 2. Handle platform-specific native sharing
    if (platformId === 'x') {
      if (canNativeShare) {
        try {
          await navigator.share({
            title: `${campaign.name} on Umi`,
            text: effectiveCaption,
            url: trackingUrl,
          });
          showNotification('Shared via native share sheet');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(effectiveCaption)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
      showNotification('Opening X composer (caption copied)');
    } else if (platformId === 'instagram') {
      // If Web Share API is available (especially on iOS/Android), it launches the native share sheet showing Instagram Stories/Chats!
      if (canNativeShare) {
        try {
          await navigator.share({
            title: `${campaign.name} Partner Campaign`,
            text: effectiveCaption,
            url: trackingUrl,
          });
          showNotification('Choose Instagram in your share sheet');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }
      showNotification('Caption & link copied! Opening Instagram...');
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }, 500);
    } else if (platformId === 'tiktok') {
      if (canNativeShare) {
        try {
          await navigator.share({
            title: `${campaign.name} Partner Campaign`,
            text: effectiveCaption,
            url: trackingUrl,
          });
          showNotification('Choose TikTok in your share sheet');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }
      showNotification('Caption & link copied! Opening TikTok...');
      setTimeout(() => {
        window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
      }, 500);
    } else if (platformId === 'whatsapp') {
      if (canNativeShare) {
        try {
          await navigator.share({
            title: campaign.name,
            text: effectiveCaption,
            url: trackingUrl,
          });
          showNotification('Shared to WhatsApp');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }
      const waUrl = `https://wa.me/?text=${encodeURIComponent(effectiveCaption)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showNotification('Opening WhatsApp composer');
    } else if (platformId === 'telegram') {
      if (canNativeShare) {
        try {
          await navigator.share({
            title: campaign.name,
            text: effectiveCaption,
            url: trackingUrl,
          });
          showNotification('Shared to Telegram');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(trackingUrl)}&text=${encodeURIComponent(
        effectiveCaption.replace(trackingUrl, '').trim()
      )}`;
      window.open(tgUrl, '_blank', 'noopener,noreferrer');
      showNotification('Opening Telegram composer');
    } else if (platformId === 'native') {
      if (canNativeShare) {
        try {
          await navigator.share({
            title: campaign.name,
            text: effectiveCaption,
            url: trackingUrl,
          });
          showNotification('Native share completed');
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      } else {
        await copyToClipboard('caption', effectiveCaption);
        showNotification('Full caption & tracking link copied');
      }
    }
  };

  // QR Code Direct Actions: Download, Print, Copy
  const handleDownloadQr = () => {
    const activeCanvas = qrMode === 'flyer' ? flyerCanvasRef.current : qrCanvasRef.current;
    if (!activeCanvas) return;

    setIsDownloading(true);
    try {
      // Generate a high-resolution export
      const offscreen = document.createElement('canvas');
      const exportSize = 600;
      offscreen.width = exportSize;
      offscreen.height = exportSize;

      QRCode.toCanvas(
        offscreen,
        trackingUrl,
        {
          width: exportSize,
          margin: 3,
          color:
            qrTheme === 'white' || qrMode === 'flyer'
              ? { dark: '#000000', light: '#FFFFFF' }
              : qrTheme === 'lavender'
              ? { dark: '#C9B8FF', light: '#0E0E0E' }
              : qrTheme === 'dark'
              ? { dark: '#F4F2EC', light: '#141414' }
              : { dark: '#000000', light: '#F4F2EC' },
          errorCorrectionLevel: 'H',
        },
        () => {
          const dataUrl = offscreen.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = dataUrl;
          downloadLink.download = `kred_qr_${slug}_${qrTheme}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          showNotification('High-res QR Code downloaded (600×600)');
          setIsDownloading(false);
        }
      );
    } catch (e) {
      console.error('Download QR failed', e);
      setIsDownloading(false);
    }
  };

  const handlePrintQr = () => {
    setIsPrinting(true);
    showNotification('Preparing printable flyer...');
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const handleCopyQrImage = async () => {
    const activeCanvas = qrCanvasRef.current;
    if (!activeCanvas) return;

    try {
      activeCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && (window as any).ClipboardItem) {
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ 'image/png': blob }),
            ]);
            showNotification('QR image copied to clipboard! Ready to paste in Canva or Figma');
          } else {
            await copyToClipboard('link', trackingUrl, true);
            showNotification('Tracking link copied to clipboard');
          }
        } catch {
          await copyToClipboard('link', trackingUrl, true);
          showNotification('Tracking link copied');
        }
      }, 'image/png');
    } catch {
      await copyToClipboard('link', trackingUrl, true);
    }
  };

  const outerContainerClass = inline
    ? 'w-full flex justify-center'
    : `fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm animate-[fade-in_0.15s_ease-out] ${
        layout === 'sheet'
          ? 'items-end'
          : layout === 'modal'
          ? 'items-center p-4'
          : 'items-end sm:items-center sm:p-4'
      }`;

  const cardContainerClass =
    layout === 'sheet'
      ? 'w-full rounded-t-[28px] max-h-[92dvh]'
      : layout === 'modal'
      ? 'w-full max-w-[490px] rounded-[24px]'
      : 'w-full sm:max-w-[490px] rounded-t-[28px] sm:rounded-[24px] max-h-[92dvh]';

  const grabHandleClass =
    layout === 'sheet' ? '' : layout === 'modal' ? 'hidden' : 'sm:hidden';

  const tabOptions: Array<['link' | 'qr' | 'caption', string, string]> = [
    ['link', 'Link', 'ti-link'],
    ['qr', 'Generate QR', 'ti-qrcode'],
    ['caption', 'Caption', 'ti-message-2'],
  ];

  const socialPlatforms = [
    {
      id: 'x',
      label: 'X',
      icon: 'ti-brand-x',
      tooltip: 'Share to X / Twitter',
      color: 'hover:text-[#F4F2EC] hover:border-[#388BFD]',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: 'ti-brand-instagram',
      tooltip: 'Share to Instagram Stories or Feed',
      color: 'hover:text-[#F4C0D1] hover:border-[#F4C0D1]',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      icon: 'ti-brand-tiktok',
      tooltip: 'Share to TikTok via Share Sheet',
      color: 'hover:text-[#9FE1CB] hover:border-[#9FE1CB]',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'ti-brand-whatsapp',
      tooltip: 'Send to WhatsApp contacts & groups',
      color: 'hover:text-[#C0DD97] hover:border-[#C0DD97]',
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: 'ti-brand-telegram',
      tooltip: 'Share in Telegram channels',
      color: 'hover:text-[#B5D4F4] hover:border-[#B5D4F4]',
    },
    {
      id: 'native',
      label: canNativeShare ? 'More' : 'Copy',
      icon: canNativeShare ? 'ti-share' : 'ti-copy',
      tooltip: canNativeShare ? 'Open OS native share sheet' : 'Copy full caption and link',
      color: 'hover:text-[#C9B8FF] hover:border-[#C9B8FF]',
    },
  ];

  return (
    <>
      <div className={outerContainerClass} onClick={inline ? undefined : onClose}>
        <div
          role="dialog"
          aria-modal={!inline}
          aria-label={`Share ${campaign.name}`}
          onClick={(e) => e.stopPropagation()}
          className={`${cardContainerClass} bg-[#0E0E0E] border border-[#222222] overflow-y-auto p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+20px)] text-left select-none shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] relative`}
        >
          {/* Subtle in-modal Toast Alert */}
          {statusFeedback && (
            <div className="absolute top-3 inset-x-0 mx-auto w-max max-w-[90%] z-30 bg-[#1A1A1A] border border-[#C9B8FF]/60 text-[#F4F2EC] px-3.5 py-1.5 rounded-full text-[12px] font-medium shadow-xl flex items-center gap-2 animate-[fade-in_0.15s_ease-out]">
              <i className="ti ti-circle-check text-[#C9B8FF] text-[14px]" />
              <span className="truncate">{statusFeedback}</span>
            </div>
          )}

          {/* Mobile Pull Handle */}
          <div
            className={`mx-auto mb-4 h-1 w-10 rounded-full bg-[#2A2A2A] ${grabHandleClass}`}
            aria-hidden="true"
          />

          {/* Campaign Header */}
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] shrink-0 shadow-sm"
              style={{ backgroundColor: bg, color: fg }}
            >
              <i className={`ti ${campaign.icon || 'ti-device-gamepad-2'}`} aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[18px] font-medium text-[#F4F2EC]">
                  You joined {campaign.name}
                </span>
                <span className="chip py-0.5 px-2 bg-[#C9B8FF]/20 text-[#C9B8FF] text-[11px] font-semibold inline-flex items-center gap-1">
                  <i className="ti ti-check text-[11px]" aria-hidden="true" />
                  Active
                </span>
              </div>
              <div className="text-[12.5px] text-[#9C9A92] mt-0.5">
                ${campaign.price} per qualified outcome · held 14 days, then ready to withdraw
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 -mt-2 -mr-2 rounded-full flex items-center justify-center text-[#9C9A92] hover:text-[#F4F2EC] hover:bg-[#141414] cursor-pointer shrink-0 transition-colors border-0 bg-transparent"
            >
              <i className="ti ti-x text-[16px]" aria-hidden="true" />
            </button>
          </div>

          {/* Tab Navigation Pill Bar */}
          <div
            className="mt-5 grid grid-cols-3 gap-1 p-1 rounded-full bg-[#141414] border border-[#222222]"
            role="tablist"
            aria-label="Share options"
          >
            {tabOptions.map(([tabKey, tabLabel, tabIcon]) => (
              <button
                key={tabKey}
                role="tab"
                aria-selected={activeTab === tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`min-h-[40px] rounded-full text-[13px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === tabKey
                    ? 'bg-[#0E0E0E] text-[#F4F2EC] border border-[#2A2A2A] shadow-xs'
                    : 'text-[#9C9A92] hover:text-[#F4F2EC] border border-transparent'
                }`}
              >
                <i className={`ti ${tabIcon} text-[14px]`} aria-hidden="true" />
                <span>{tabLabel}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: LINK & SOCIAL PLATFORM SHARING */}
          {activeTab === 'link' && (
            <div className="mt-4 space-y-4 animate-[fade-in_0.15s_ease-out]">
              {/* Attribution URL Box */}
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-medium text-[#F4F2EC]">Your tracked link</span>
                  <span className="text-[#9C9A92] font-mono text-[11px]">Instant attribution</span>
                </div>
                <div className="flex items-center gap-2 bg-[#141414] rounded-[14px] p-2 pl-3.5 border border-[#222222] hover:border-[#333333] transition-colors">
                  <i className="ti ti-link text-[#C9B8FF] text-[16px] shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0 font-mono text-[12.5px] text-[#F4F2EC] truncate select-all">
                    {linkOf(campaign)}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('link', trackingUrl, true)}
                    className="pill on text-[12.5px] min-h-[40px] px-4 shrink-0 font-medium cursor-pointer"
                  >
                    {copiedKey === 'link' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Creator Code in-app backup */}
              <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#222222] px-3.5 py-2.5 bg-[#101010]">
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-[#F4F2EC]">Creator code</div>
                  <div className="text-[11.5px] text-[#9C9A92]">
                    For audience members who download directly from app stores
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('code', creatorCode)}
                  className="font-mono text-[13px] min-h-[40px] px-3.5 rounded-full border border-[#2A2A2A] bg-[#141414] hover:bg-[#1B1B1B] text-[#F4F2EC] cursor-pointer shrink-0 transition-colors"
                >
                  {copiedKey === 'code' ? 'Copied' : creatorCode}
                </button>
              </div>

              {/* Native Social Platform Sharing Buttons (X, Instagram, TikTok, WhatsApp, Telegram, Native) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-[#F4F2EC]">
                    Share to social media (Native APIs)
                  </span>
                  <span className="text-[11px] text-[#9C9A92] flex items-center gap-1">
                    <i className="ti ti-bolt text-[#C9B8FF]" />
                    <span>Auto-copies disclosure</span>
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {socialPlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => handleShareToPlatform(platform.id)}
                      title={platform.tooltip}
                      className="flex flex-col items-center justify-center p-2 rounded-[16px] bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#383838] transition-all cursor-pointer group active:scale-95"
                    >
                      <span
                        className={`w-10 h-10 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[19px] text-[#F4F2EC] transition-colors ${platform.color}`}
                      >
                        <i className={`ti ${platform.icon}`} aria-hidden="true" />
                      </span>
                      <span className="text-[11px] text-[#9C9A92] group-hover:text-[#F4F2EC] mt-1.5 font-medium truncate max-w-full">
                        {platform.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="text-[11.5px] text-[#6F6D66] mt-2.5 leading-relaxed bg-[#101010] p-2.5 rounded-[12px] border border-[#1A1A1A]">
                  <strong className="text-[#9C9A92]">Pro Tip:</strong> Tapping <strong>X</strong>,{' '}
                  <strong>Instagram</strong>, or <strong>TikTok</strong> triggers native sharing with your FTC-compliant disclosure and attribution link pre-copied.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GENERATE QR CODE (ENCODED TRACKING LINK, DOWNLOAD & DIRECT PRINT) */}
          {activeTab === 'qr' && (
            <div className="mt-4 space-y-4 animate-[fade-in_0.15s_ease-out]">
              {/* Header Info */}
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 text-[#F4F2EC] font-medium">
                  <i className="ti ti-qrcode text-[#C9B8FF]" />
                  <span>Generate Attribution QR Code</span>
                </div>
                <span className="font-mono text-[11px] text-[#C9B8FF] bg-[#C9B8FF]/10 px-2 py-0.5 rounded-full border border-[#C9B8FF]/30">
                  ECC {qrEcc} · 300 DPI
                </span>
              </div>

              {/* Mode Switcher: Digital Card vs Print Flyer vs Scan Simulator */}
              <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-full border border-[#222222]">
                <button
                  type="button"
                  onClick={() => setQrMode('digital')}
                  className={`flex-1 py-1 px-2.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer border-0 ${
                    qrMode === 'digital' ? 'bg-[#0E0E0E] text-[#F4F2EC] shadow-xs' : 'text-[#9C9A92] hover:text-[#F4F2EC]'
                  }`}
                >
                  Digital Asset
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode('flyer')}
                  className={`flex-1 py-1 px-2.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer border-0 ${
                    qrMode === 'flyer' ? 'bg-[#0E0E0E] text-[#F4F2EC] shadow-xs' : 'text-[#9C9A92] hover:text-[#F4F2EC]'
                  }`}
                >
                  Printable Flyer
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode('simulate')}
                  className={`flex-1 py-1 px-2.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer border-0 ${
                    qrMode === 'simulate' ? 'bg-[#0E0E0E] text-[#F4F2EC] shadow-xs' : 'text-[#9C9A92] hover:text-[#F4F2EC]'
                  }`}
                >
                  Scan Test
                </button>
              </div>

              {/* Style & Error Correction Customizers (Digital Mode) */}
              {qrMode === 'digital' && (
                <div className="flex items-center justify-between gap-2 p-2 bg-[#121212] rounded-[14px] border border-[#202020]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] text-[#888] mr-1">Palette:</span>
                    {(
                      [
                        { id: 'cream', bg: '#F4F2EC', fg: '#000000', label: 'Cream' },
                        { id: 'lavender', bg: '#0E0E0E', fg: '#C9B8FF', label: 'Lavender' },
                        { id: 'white', bg: '#FFFFFF', fg: '#000000', label: 'Print White' },
                        { id: 'dark', bg: '#141414', fg: '#F4F2EC', label: 'Dark' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setQrTheme(t.id)}
                        title={t.label}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          qrTheme === t.id ? 'ring-2 ring-[#C9B8FF] scale-110' : 'border-[#333] opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: t.bg }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.fg }} />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#888]">Recovery:</span>
                    <button
                      type="button"
                      onClick={() => setQrEcc(qrEcc === 'M' ? 'H' : 'M')}
                      className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#1A1A1A] hover:bg-[#222] text-[#F4F2EC] border border-[#2E2E2E] cursor-pointer"
                      title="Toggle Error Correction Capacity (M = 15%, H = 30% for stickers & print)"
                    >
                      {qrEcc === 'H' ? 'Level H (30%)' : 'Level M (15%)'}
                    </button>
                  </div>
                </div>
              )}

              {/* DIGITAL MODE: Rendered Canvas Card */}
              {qrMode === 'digital' && (
                <div className="flex flex-col items-center justify-center p-4 bg-[#141414] rounded-[20px] border border-[#222222]">
                  <div
                    className="p-3.5 rounded-[18px] shadow-lg flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor:
                        qrTheme === 'white'
                          ? '#FFFFFF'
                          : qrTheme === 'lavender'
                          ? '#0E0E0E'
                          : qrTheme === 'dark'
                          ? '#141414'
                          : '#F4F2EC',
                    }}
                  >
                    <canvas
                      ref={qrCanvasRef}
                      width={220}
                      height={220}
                      className="rounded-[10px] block"
                      style={{ width: '200px', height: '200px' }}
                    />
                  </div>

                  <div className="font-mono text-[12px] text-[#9C9A92] mt-3 truncate max-w-full text-center">
                    {linkOf(campaign)}
                  </div>
                  <div className="text-[11.5px] text-[#6F6D66] mt-0.5 text-center">
                    Scannable by any mobile device camera without installing a third-party app.
                  </div>
                </div>
              )}

              {/* PRINTABLE FLYER MODE: Clean Badge Layout */}
              {qrMode === 'flyer' && (
                <div className="p-5 bg-white text-black rounded-[20px] border border-[#DDD] shadow-xl flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#388BFD]">
                    <i className="ti ti-circle-check text-[13px]" />
                    <span>Official Partner Acquisition</span>
                  </div>

                  <h3 className="text-[18px] font-bold text-black mt-1 mb-0.5">
                    Scan to Install {campaign.name}
                  </h3>
                  <p className="text-[11.5px] text-[#666] m-0 mb-3 max-w-[280px]">
                    Point your camera to download on the App Store or Google Play.
                  </p>

                  <div className="p-2.5 bg-white border border-[#E5E5E5] rounded-[14px] shadow-sm">
                    <canvas
                      ref={flyerCanvasRef}
                      width={200}
                      height={200}
                      className="rounded-[6px] block"
                      style={{ width: '180px', height: '180px' }}
                    />
                  </div>

                  <div className="mt-3 font-mono text-[11px] font-semibold text-[#333] bg-[#F4F4F0] px-3 py-1 rounded-full border border-[#E0E0DC]">
                    {linkOf(campaign)}
                  </div>
                </div>
              )}

              {/* SCAN TEST SIMULATOR */}
              {qrMode === 'simulate' && (
                <div className="p-4 bg-[#141414] rounded-[18px] border border-[#222222] space-y-3">
                  <div className="flex items-center gap-2 text-[#C9B8FF] text-[13px] font-medium pb-2 border-b border-[#222222]">
                    <i className="ti ti-device-mobile text-[16px]" />
                    <span>Attribution Telemetry Simulation</span>
                  </div>

                  <div className="space-y-2 text-[12px] text-[#B8B6AE]">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#202020] text-[#C9B8FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>Audience points phone camera at code; iOS/Android camera banner pops up.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#202020] text-[#C9B8FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Routes through smart edge proxy{' '}
                        <strong className="text-[#F4F2EC] font-mono">{trackingUrl}</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#202020] text-[#C9B8FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Opens {campaign.name} in App Store / Google Play and locks in your ${campaign.price} bounty.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[11px]">
                    <span className="text-[#9C9A92]">Attribution Engine: Active</span>
                    <span className="font-mono text-[#C9B8FF] bg-[#C9B8FF]/10 px-2 py-0.5 rounded-full">
                      Escrow Backed
                    </span>
                  </div>
                </div>
              )}

              {/* Direct QR Action Toolbar: Download PNG, Print Flyer, Copy Image */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={isDownloading}
                  className="pill on justify-center text-[12px] py-2.5 px-2 font-medium cursor-pointer flex items-center gap-1.5"
                >
                  <i className="ti ti-download text-[14px]" />
                  <span>{isDownloading ? 'Exporting…' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintQr}
                  disabled={isPrinting}
                  className="pill out justify-center text-[12px] py-2.5 px-2 font-medium cursor-pointer flex items-center gap-1.5 border border-[#2E2E2E]"
                >
                  <i className="ti ti-printer text-[14px] text-[#FAC775]" />
                  <span>{isPrinting ? 'Printing…' : 'Print Flyer'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyQrImage}
                  className="pill out justify-center text-[12px] py-2.5 px-2 font-medium cursor-pointer flex items-center gap-1.5 border border-[#2E2E2E]"
                >
                  <i className="ti ti-copy text-[14px] text-[#C9B8FF]" />
                  <span>Copy Image</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CAPTION & FTC DISCLOSURE COMPLIANCE */}
          {activeTab === 'caption' && (
            <div className="mt-4 space-y-3 animate-[fade-in_0.15s_ease-out]">
              <div className="flex items-center justify-between">
                <label htmlFor="share-caption" className="text-[12px] font-medium text-[#F4F2EC]">
                  Post Caption & Disclosure
                </label>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    hasDisclosure
                      ? 'text-[#C9B8FF] border-[#C9B8FF]/40 bg-[#C9B8FF]/10'
                      : 'text-[#FF8A80] border-[#FF8A80]/40 bg-[#FF8A80]/10'
                  }`}
                >
                  {hasDisclosure ? 'Disclosure included' : 'Add a disclosure (#ad)'}
                </span>
              </div>

              <textarea
                id="share-caption"
                value={effectiveCaption}
                onChange={(e) => setCaptionInput(e.target.value)}
                rows={4}
                className="w-full rounded-[14px] bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] outline-none p-3.5 text-[14px] leading-[1.5] text-[#F4F2EC] resize-none"
              />

              <ul className="m-0 pl-0 list-none space-y-1.5 text-[12px] text-[#B8B6AE]">
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>State that you earn a commission at the very start of the post.</span>
                </li>
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Never offer incentives, cash, or entries in exchange for installing.</span>
                </li>
                <li className="flex gap-2">
                  <i className="ti ti-check text-[#C9B8FF] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Earnings are audited via verified telemetry before payout settlement.</span>
                </li>
              </ul>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewCampaign(campaign.id);
              }}
              className="min-h-[44px] px-1 text-[13px] text-[#B8B6AE] hover:text-[#F4F2EC] cursor-pointer bg-transparent border-0 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View campaign page</span>
              <i className="ti ti-arrow-right text-[12px]" aria-hidden="true" />
            </button>

            {activeTab === 'caption' ? (
              <button
                type="button"
                onClick={() => copyToClipboard('caption', effectiveCaption)}
                className="pill on min-h-[44px] px-5 font-medium cursor-pointer"
              >
                {copiedKey === 'caption' ? 'Copied' : 'Copy caption'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="pill on min-h-[44px] px-6 font-medium cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Standalone Print Flyer Container (triggers on window.print()) */}
      <div id="qr-printable-flyer" style={{ display: 'none' }} aria-hidden="true">
        <div style={{ textAlign: 'center', maxWidth: '420px', margin: '0 auto', fontFamily: 'sans-serif' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#0055FF',
              marginBottom: '8px',
            }}
          >
            Verified App Sponsor · Scan to Install
          </div>
          <h1 style={{ fontSize: '28px', margin: '0 0 10px', color: '#000000', fontWeight: 800 }}>
            {campaign.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#555555', margin: '0 0 24px', lineHeight: '1.4' }}>
            {campaign.desc || 'Point your smartphone camera to download instantly on iOS or Android.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img
              src={qrCanvasRef.current ? qrCanvasRef.current.toDataURL('image/png') : ''}
              alt="Scan QR code"
              style={{ width: '260px', height: '260px', borderRadius: '12px' }}
            />
          </div>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 600,
              background: '#F0F0EB',
              padding: '8px 16px',
              borderRadius: '999px',
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            {trackingUrl}
          </div>

          <div style={{ fontSize: '11px', color: '#888888', marginTop: '16px' }}>
            Attribution Powered by Umi Partner Platform · Creator Code: {creatorCode}
          </div>
        </div>
      </div>
    </>
  );
};

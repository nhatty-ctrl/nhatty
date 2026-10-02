import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface TrackingQrCodeProps {
  url: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  downloadFileName?: string;
}

export const TrackingQrCode: React.FC<TrackingQrCodeProps> = ({
  url,
  size = 180,
  className = '',
  showDownload = false,
  downloadFileName = 'kred_tracking_qr.png',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: size,
        margin: 2, // Standard quiet zone for reliable mobile scanner recognition
        color: {
          dark: '#0B0B0B',
          light: '#F5F3EC',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          console.error('Failed to generate tracking QR code:', err);
          setError('Failed to generate QR code');
        } else {
          setError(null);
        }
      }
    );
  }, [url, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('QR download error:', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-[#1C1C1C] rounded-[14px] text-center text-[12px] text-[#FF8A80]">
        <i className="ti ti-alert-circle text-[22px] mb-1"></i>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="p-2 bg-[#F5F3EC] rounded-[14px] shadow-sm shrink-0">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-[8px] block"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </div>

      {showDownload && (
        <button
          type="button"
          onClick={handleDownload}
          className="pill text-[12px] py-1.5 px-3 mt-2.5 text-[#B9B7AF] hover:text-[#F5F3EC] hover:bg-[#1C1C1C] transition-colors cursor-pointer"
        >
          <i className="ti ti-download text-[14px]"></i>
          <span>{downloading ? 'Downloading…' : 'Download PNG'}</span>
        </button>
      )}
    </div>
  );
};

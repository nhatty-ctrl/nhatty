import React, { useState } from 'react';

export interface ActionConfig {
  label: string;
  icon?: string;
  onClick?: () => void;
}

export type StateTone = 'neutral' | 'accent' | 'warn' | 'error';

export interface EmptyStateCardProps {
  icon: string;
  tone?: StateTone;
  title: string;
  body: string;
  primary?: ActionConfig;
  secondary?: ActionConfig;
  requestId?: string;
  compact?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<StateTone, string> = {
  neutral: 'bg-[#141414] text-[#9C9A92]',
  accent: 'bg-[#C9B8FF]/15 text-[#C9B8FF]',
  warn: 'bg-[#FAC775]/15 text-[#FAC775]',
  error: 'bg-[#FF8A80]/15 text-[#FF8A80]',
};

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  tone = 'neutral',
  title,
  body,
  primary,
  secondary,
  requestId,
  compact = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRequestId = async () => {
    if (!requestId) return;
    try {
      await navigator.clipboard.writeText(requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div
      className={`card text-center bg-[#0E0E0E] border border-[#222222] rounded-[24px] ${
        compact ? 'py-8 px-5' : 'py-14 px-6'
      } space-y-3 ${className}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-[22px] mx-auto ${TONE_CLASSES[tone]}`}
      >
        <i className={`ti ${icon}`} aria-hidden="true"></i>
      </div>

      <div>
        <div className="text-[16px] font-medium text-[#F4F2EC]">{title}</div>
        <div className="text-[13px] text-[#9C9A92] mt-1 max-w-[420px] mx-auto leading-relaxed">
          {body}
        </div>
      </div>

      {(primary || secondary) && (
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {primary && (
            <button
              type="button"
              onClick={primary.onClick}
              className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
            >
              {primary.icon && <i className={`ti ${primary.icon}`} aria-hidden="true"></i>}
              <span>{primary.label}</span>
            </button>
          )}
          {secondary && (
            <button
              type="button"
              onClick={secondary.onClick}
              className="pill out min-h-[44px] px-5 cursor-pointer"
            >
              {secondary.icon && <i className={`ti ${secondary.icon}`} aria-hidden="true"></i>}
              <span>{secondary.label}</span>
            </button>
          )}
        </div>
      )}

      {requestId && (
        <button
          type="button"
          onClick={handleCopyRequestId}
          className="text-[11.5px] font-mono text-[#6F6D66] hover:text-[#B8B6AE] cursor-pointer pt-1 bg-transparent border-0 inline-flex items-center gap-1 mx-auto"
        >
          <span>{copied ? 'Copied' : `Request ID ${requestId} · copy`}</span>
        </button>
      )}
    </div>
  );
};

export interface SystemBannerProps {
  icon: string;
  tone?: StateTone;
  text: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export const SystemBanner: React.FC<SystemBannerProps> = ({
  icon,
  tone = 'warn',
  text,
  action,
  onDismiss,
  className = '',
}) => {
  const borderBg =
    tone === 'error'
      ? 'border-[#FF8A80]/40 bg-[#FF8A80]/10 text-[#FF8A80]'
      : tone === 'accent'
      ? 'border-[#C9B8FF]/40 bg-[#C9B8FF]/10 text-[#C9B8FF]'
      : tone === 'neutral'
      ? 'border-[#333333] bg-[#141414] text-[#9C9A92]'
      : 'border-[#FAC775]/40 bg-[#FAC775]/10 text-[#FAC775]';

  return (
    <div
      className={`flex items-center gap-3 rounded-[16px] border px-4 py-3 select-none text-left ${borderBg} ${className}`}
      role="status"
    >
      <i className={`ti ${icon} text-[18px] shrink-0`} aria-hidden="true"></i>
      <span className="flex-1 text-[13px] text-[#F4F2EC] leading-snug">{text}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-[12.5px] font-semibold text-[#F4F2EC] underline underline-offset-4 cursor-pointer bg-transparent border-0 hover:text-white shrink-0"
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#9C9A92] hover:text-[#F4F2EC] bg-transparent border-0 cursor-pointer p-1"
          aria-label="Dismiss banner"
        >
          <i className="ti ti-x text-[14px]"></i>
        </button>
      )}
    </div>
  );
};

export const MetricSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse" aria-busy="true" aria-label="Loading">
    {[0, 1, 2, 3].map((idx) => (
      <div key={idx} className="card bg-[#0E0E0E] border border-[#222222] rounded-[20px] p-4 space-y-3">
        <div className="h-3 bg-[#1B1B1B] rounded w-16" />
        <div className="h-7 bg-[#141414] rounded w-24" />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div
    className="card bg-[#0E0E0E] border border-[#222222] rounded-[20px] overflow-hidden animate-pulse"
    aria-busy="true"
    aria-label="Loading"
  >
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        className="flex items-center gap-4 px-4 py-4 border-b border-[#1B1B1B] last:border-0"
      >
        <div className="w-9 h-9 rounded-[12px] bg-[#141414]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-[#1B1B1B] rounded w-40" />
          <div className="h-3 bg-[#141414] rounded w-24" />
        </div>
        <div className="h-6 bg-[#141414] rounded-full w-16" />
      </div>
    ))}
  </div>
);

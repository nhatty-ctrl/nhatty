import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import { KredAnalyticsEngine } from './KredAnalyticsEngine';
import { KredTelemetryBarChart } from './KredTelemetryBarChart';

interface CampaignAnalyticsViewProps {
  campaigns?: Campaign[];
  initialCampaignId?: string | null;
  initialRole?: 'creator' | 'founder';
  onBack?: () => void;
  onNavigateCampaign?: (id: string) => void;
  onCreateCampaign?: () => void;
  onNavigateEarnings?: () => void;
}

export const CampaignAnalyticsView: React.FC<CampaignAnalyticsViewProps> = ({
  campaigns = [],
  initialCampaignId,
  initialRole = 'creator',
  onNavigateCampaign,
  onCreateCampaign,
  onNavigateEarnings,
  onBack,
}) => {
  const [activeSection, setActiveSection] = useState<'creator' | 'founder'>(initialRole);

  const activeCamp = initialCampaignId
    ? campaigns.find((c) => c.id === initialCampaignId)
    : null;

  const handleExportCsv = () => {
    const isCreator = activeSection === 'creator';
    const csvContent = isCreator
      ? 'data:text/csv;charset=utf-8,' +
        'Date,Campaign,Link Clicks,Confirmed Installs,Verified Installs,Bounty Rate,Earnings\n' +
        '2026-10-02,Pixel Pop,48,38,30,$1.80,$54.00\n' +
        '2026-10-01,Pixel Pop,52,41,33,$1.80,$59.40\n' +
        '2026-09-30,Stride,26,22,18,$2.90,$52.20\n' +
        '2026-09-29,Focusly,18,14,11,$2.10,$23.10\n'
      : 'data:text/csv;charset=utf-8,' +
        'Date,Campaign,Gross Installs,Verified Installs,Verification Rate,Escrow Spend,Budget Left\n' +
        '2026-10-02,Pixel Pop,48,38,79.1%,$68.40,$6140.00\n' +
        '2026-10-01,Pixel Pop,52,41,78.8%,$73.80,$6208.40\n' +
        '2026-09-30,Stride,26,22,84.6%,$63.80,$6282.20\n' +
        '2026-09-29,Focusly,18,14,77.7%,$29.40,$6346.00\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `umi_${activeSection}_attribution_${initialCampaignId || 'all'}_export.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8 text-left select-none animate-[fade-in_0.2s_ease-out]">
      {/* Top Header & Breadcrumbs bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#222222]/40">
        <Breadcrumbs
          items={[
            { label: 'Campaigns', icon: 'ti-speakerphone', onClick: onBack },
            ...(activeCamp
              ? [
                  {
                    label: activeCamp.name,
                    icon: activeCamp.icon,
                    onClick: onNavigateCampaign ? () => onNavigateCampaign(activeCamp.id) : undefined,
                  },
                ]
              : []),
            { label: 'Analytics', icon: 'ti-chart-bar', active: true },
          ]}
        />

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium py-1.5 px-3.5 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors shadow-xs"
            title="Download verified records as CSV"
          >
            <i className="ti ti-download text-[13px]"></i>
            <span>Export CSV</span>
          </button>

          {onCreateCampaign && (
            <button
              type="button"
              onClick={onCreateCampaign}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold py-1.5 px-4 rounded-full bg-[#C9B8FF] hover:bg-[#ba9bf7] text-[#000000] cursor-pointer transition-all shadow-sm active:scale-95"
            >
              <i className="ti ti-plus text-[13px]"></i>
              <span>New campaign</span>
            </button>
          )}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold py-1.5 px-3.5 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC] border border-[#222222] cursor-pointer transition-colors"
            >
              <i className="ti ti-arrow-left text-[12px]"></i>
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= PRIMARY TOP SECTION SELECTOR ================= */}
      {/* Prominently placed at the top to clearly differentiate Promoters from App Owners */}
      <div className="space-y-3">
        <div>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-normal tracking-[-0.8px] text-[#F4F2EC] leading-tight">
            Analytics Hub
          </h1>
          <p className="text-[13px] text-[#9C9A92] mt-0.5">
            Select your analytics perspective: track performance as a <b>Promoter sharing links</b> or as an <b>App Owner funding campaigns</b>.
          </p>
        </div>

        {/* Dual Top Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Section 1: For People Who Promote (Creator) */}
          <button
            type="button"
            onClick={() => setActiveSection('creator')}
            className={`p-4 sm:p-5 rounded-[22px] border text-left cursor-pointer transition-all duration-200 relative group flex items-start gap-4 ${
              activeSection === 'creator'
                ? 'bg-[#141414] border-[#C9B8FF] shadow-[0_0_24px_rgba(201,184,255,0.18)] ring-1 ring-[#C9B8FF]/50'
                : 'bg-[#0E0E0E] border-[#222222] hover:border-[#333333] hover:bg-[#121212]'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-[22px] shrink-0 transition-colors ${
                activeSection === 'creator'
                  ? 'bg-[#C9B8FF] text-[#000000]'
                  : 'bg-[#1B1B1B] text-[#9C9A92] group-hover:text-[#F4F2EC]'
              }`}
            >
              <i className="ti ti-speakerphone"></i>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activeSection === 'creator'
                      ? 'bg-[#C9B8FF]/20 text-[#C9B8FF]'
                      : 'bg-[#1B1B1B] text-[#9C9A92]'
                  }`}
                >
                  For Promoters
                </span>
                {activeSection === 'creator' && (
                  <span className="flex items-center gap-1 text-[11px] text-[#C9B8FF] font-medium">
                    <i className="ti ti-check text-[12px]"></i> Active section
                  </span>
                )}
              </div>

              <div className="text-[17px] sm:text-[18px] font-medium text-[#F4F2EC] mt-1 flex items-center justify-between">
                <span>I Promote Apps (Creator)</span>
                <i
                  className={`ti ti-arrow-right text-[14px] transition-transform ${
                    activeSection === 'creator' ? 'translate-x-1 text-[#C9B8FF]' : 'text-[#444]'
                  }`}
                ></i>
              </div>

              <p className="text-[12.5px] text-[#9C9A92] mt-1 leading-relaxed">
                Track referral links you shared, verified installs delivered, and your cash earnings per campaign.
              </p>
            </div>
          </button>

          {/* Section 2: For People Who Have an App (Founder) */}
          <button
            type="button"
            onClick={() => setActiveSection('founder')}
            className={`p-4 sm:p-5 rounded-[22px] border text-left cursor-pointer transition-all duration-200 relative group flex items-start gap-4 ${
              activeSection === 'founder'
                ? 'bg-[#141414] border-[#C9B8FF] shadow-[0_0_24px_rgba(201,184,255,0.18)] ring-1 ring-[#C9B8FF]/50'
                : 'bg-[#0E0E0E] border-[#222222] hover:border-[#333333] hover:bg-[#121212]'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-[22px] shrink-0 transition-colors ${
                activeSection === 'founder'
                  ? 'bg-[#C9B8FF] text-[#000000]'
                  : 'bg-[#1B1B1B] text-[#9C9A92] group-hover:text-[#F4F2EC]'
              }`}
            >
              <i className="ti ti-device-mobile"></i>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    activeSection === 'founder'
                      ? 'bg-[#C9B8FF]/20 text-[#C9B8FF]'
                      : 'bg-[#1B1B1B] text-[#9C9A92]'
                  }`}
                >
                  For App Owners
                </span>
                {activeSection === 'founder' && (
                  <span className="flex items-center gap-1 text-[11px] text-[#C9B8FF] font-medium">
                    <i className="ti ti-check text-[12px]"></i> Active section
                  </span>
                )}
              </div>

              <div className="text-[17px] sm:text-[18px] font-medium text-[#F4F2EC] mt-1 flex items-center justify-between">
                <span>I Have an App (Founder)</span>
                <i
                  className={`ti ti-arrow-right text-[14px] transition-transform ${
                    activeSection === 'founder' ? 'translate-x-1 text-[#C9B8FF]' : 'text-[#444]'
                  }`}
                ></i>
              </div>

              <p className="text-[12.5px] text-[#9C9A92] mt-1 leading-relaxed">
                Track your app's install acquisition, escrow budget spend, SDK attribution health, and top creators.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ================= SECTION KPI OVERVIEW ================= */}
      {activeSection === 'creator' ? (
        /* Promoter KPIs */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">Verified Installs</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#F4F2EC] font-mono">142</div>
            <div className="text-[11px] text-[#C9B8FF] flex items-center gap-1">
              <i className="ti ti-arrow-up-right"></i> +18% this month
            </div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">Total Earned</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#C9B8FF] font-mono">$348.60</div>
            <div className="text-[11px] text-[#9C9A92]">$248.60 available</div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">Attribution Clicks</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#F4F2EC] font-mono">1,842</div>
            <div className="text-[11px] text-[#9C9A92]">76.4% verification rate</div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">Next Payout</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#FAC775] font-mono">Fri, Oct 9</div>
            <div className="text-[11px] text-[#9C9A92]">Weekly settlement</div>
          </div>
        </div>
      ) : (
        /* Founder KPIs */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">App Installs Verified</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#F4F2EC] font-mono">2,840</div>
            <div className="text-[11px] text-[#FAC775] flex items-center gap-1">
              <i className="ti ti-arrow-up-right"></i> Attributed via SDK
            </div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">Escrow Left</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#C9B8FF] font-mono">$6,140.00</div>
            <div className="text-[11px] text-[#9C9A92]">of $10,000 funded</div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">Active Promoters</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#F4F2EC] font-mono">38</div>
            <div className="text-[11px] text-[#9C9A92]">Verified creators</div>
          </div>

          <div className="p-4 rounded-[18px] bg-[#0E0E0E] border border-[#222222] space-y-1">
            <div className="text-[11.5px] text-[#9C9A92] uppercase font-mono">SDK Attestation</div>
            <div className="text-[22px] sm:text-[24px] font-medium text-[#C9B8FF] font-mono">Live · 100%</div>
            <div className="text-[11px] text-[#9C9A92]">RavenCore real-time</div>
          </div>
        </div>
      )}

      {/* ================= TELEMETRY BAR CHART ================= */}
      <KredTelemetryBarChart
        title={
          activeSection === 'creator'
            ? activeCamp
              ? `Promoter Telemetry: verified installs and earnings generated for ${activeCamp.name}.`
              : 'Promoter Telemetry: verified installs and bounties earned across your joined campaigns.'
            : activeCamp
            ? `App Owner Telemetry: inbound installs and spend velocity for ${activeCamp.name}.`
            : 'App Owner Telemetry: total app acquisition runs and escrow spend across your campaigns.'
        }
        pillLabel={
          activeSection === 'creator'
            ? 'Creator Tracking Links · Verified installs'
            : 'App Attribution Engine · Live SDK telemetry'
        }
        icon={activeSection === 'creator' ? (activeCamp?.icon || 'ti-speakerphone') : 'ti-device-mobile'}
        barColor={activeSection === 'creator' ? '#C9B8FF' : '#FAC775'}
        badgeBg={activeCamp?.bg || (activeSection === 'creator' ? '#CECBF6' : '#FAC775')}
        badgeFg={activeCamp?.fg || (activeSection === 'creator' ? '#26215C' : '#412402')}
        bountyPrice={activeCamp ? parseFloat(activeCamp.price || '2.5') : 2.5}
      />

      {/* ================= MAIN ANALYTICS ENGINE ================= */}
      <KredAnalyticsEngine
        role={activeSection}
        onRoleChange={setActiveSection}
        hideHeaderSwitcher={false}
        campaigns={campaigns}
        initialCampaignId={initialCampaignId}
        onNavigateCampaign={onNavigateCampaign}
        onNavigateEarnings={onNavigateEarnings}
      />
    </div>
  );
};

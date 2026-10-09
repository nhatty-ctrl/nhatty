import React, { useState } from 'react';
import { Campaign } from '../types/campaign';
import { Breadcrumbs } from './Breadcrumbs';
import { KredAnalyticsEngine } from './KredAnalyticsEngine';
import { KredTelemetryBarChart } from './KredTelemetryBarChart';

interface CampaignAnalyticsViewProps {
  campaigns?: Campaign[];
  initialCampaignId?: string | null;
  onBack?: () => void;
  onNavigateCampaign?: (id: string) => void;
  onCreateCampaign?: () => void;
  onNavigateEarnings?: () => void;
}

export const CampaignAnalyticsView: React.FC<CampaignAnalyticsViewProps> = ({
  campaigns = [],
  initialCampaignId,
  onNavigateCampaign,
  onCreateCampaign,
  onNavigateEarnings,
  onBack,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const activeCamp = initialCampaignId
    ? campaigns.find((c) => c.id === initialCampaignId)
    : null;

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Campaign,Gross Installs,Verified Installs,Verification Rate,Spend\n' +
      '2026-10-02,Pixel Pop,48,38,79.1%,$68.40\n' +
      '2026-10-01,Pixel Pop,52,41,78.8%,$73.80\n' +
      '2026-09-30,Stride,26,22,84.6%,$63.80\n' +
      '2026-09-29,Focusly,18,14,77.7%,$29.40\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kred_attribution_${initialCampaignId || 'all'}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-8 text-left select-none animate-[fade-in_0.2s_ease-out]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="pill text-[12px] py-1.5 px-3 out cursor-pointer"
            title="Download verified install records as CSV"
          >
            <i className="ti ti-download text-[13px]"></i>
            <span>Export CSV</span>
          </button>

          {onCreateCampaign && (
            <button
              type="button"
              onClick={onCreateCampaign}
              className="pill on text-[12px] py-1.5 px-3 cursor-pointer"
            >
              <i className="ti ti-plus text-[13px]"></i>
              <span>New campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Image 1 Telemetry Bar Chart */}
      <KredTelemetryBarChart
        title={
          activeCamp
            ? `Let’s look at your latest runs and verified installs for ${activeCamp.name}.`
            : 'Let’s look at your latest runs and verified installs across campaigns.'
        }
        pillLabel={
          activeCamp
            ? `Read attribution telemetry · $${activeCamp.price} bounty`
            : 'Read attribution telemetry · Verified runs'
        }
        icon={activeCamp?.icon || 'ti-heart-filled'}
        barColor={activeCamp?.bg || '#F4C0D1'}
        badgeBg={activeCamp?.bg}
        badgeFg={activeCamp?.fg}
        bountyPrice={activeCamp ? parseFloat(activeCamp.price || '2.5') : 2.5}
      />

      {/* Main Analytics Engine */}
      <KredAnalyticsEngine
        campaigns={campaigns}
        initialCampaignId={initialCampaignId}
        onNavigateCampaign={onNavigateCampaign}
        onNavigateEarnings={onNavigateEarnings}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import { Campaign, FounderApp, AppKey } from '../../types/umi';
import { CampaignCreateWizard } from './CampaignCreateWizard';
import { AppSdkSetupView } from './AppSdkSetupView';

interface FounderDashboardViewProps {
  campaigns: Campaign[];
  apps: FounderApp[];
  appKeys: AppKey[];
  onNavigateCampaignDetail?: (id: string) => void;
}

export const FounderDashboardView: React.FC<FounderDashboardViewProps> = ({
  campaigns,
  apps,
  appKeys,
  onNavigateCampaignDetail,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'campaigns' | 'approvals' | 'sdk'>('campaigns');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('2500');

  // Creator Applications State (Point 3: Approval, E-sign & FTC Disclosure duty)
  const [creatorApplications, setCreatorApplications] = useState([
    {
      id: 'app_maya',
      creatorHandle: 'maya.makes',
      creatorName: 'Maya Lin',
      primaryChannel: 'tiktok' as const,
      followerCount: '24k followers',
      campaignId: 'pixelpop',
      campaignName: 'Pixel Pop',
      pitchNote: 'Hey! I do daily iOS indie games content. I would love to make a 45s speedrun clip showcasing the level 3 mechanic with my link.',
      ftcPledge: true,
      eSignedName: 'Maya Lin',
      submittedAt: 'Today, 2 hours ago',
      status: 'pending' as 'pending' | 'approved' | 'rejected',
    },
    {
      id: 'app_alex',
      creatorHandle: 'alex.fitness',
      creatorName: 'Alex Chen',
      primaryChannel: 'youtube' as const,
      followerCount: '86k subscribers',
      campaignId: 'stride',
      campaignName: 'Stride Health',
      pitchNote: 'Creating a "My Minimalist Morning Routine" YouTube Short highlighting Stride HealthKit integration and step tracking.',
      ftcPledge: true,
      eSignedName: 'Alex Chen',
      submittedAt: 'Yesterday',
      status: 'pending' as 'pending' | 'approved' | 'rejected',
    },
    {
      id: 'app_sarah',
      creatorHandle: 'sarah.tech',
      creatorName: 'Sarah Kim',
      primaryChannel: 'instagram' as const,
      followerCount: '42k followers',
      campaignId: 'focusly',
      campaignName: 'Focusly AI',
      pitchNote: 'Reel showing deep work flow with Focusly 25m Pomodoro timer. Verified link in bio.',
      ftcPledge: true,
      eSignedName: 'Sarah Kim',
      submittedAt: '3 days ago',
      status: 'approved' as 'pending' | 'approved' | 'rejected',
    },
  ]);

  const [managedModalOpen, setManagedModalOpen] = useState(false);
  const [approvedNotification, setApprovedNotification] = useState<string | null>(null);

  const pendingApprovalsCount = creatorApplications.filter((a) => a.status === 'pending').length;

  const handleApproveCreator = (appId: string) => {
    setCreatorApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'approved' } : a))
    );
    const app = creatorApplications.find((a) => a.id === appId);
    setApprovedNotification(
      `Approved @${app?.creatorHandle}! Creator agreement verified & exclusive workspace link dispatched.`
    );
    setTimeout(() => setApprovedNotification(null), 4000);
  };

  const handleRejectCreator = (appId: string) => {
    setCreatorApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'rejected' } : a))
    );
  };

  // Compute aggregate metrics
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const totalBudgetMinor = campaigns.reduce((acc, c) => acc + c.totalBudgetMinor, 0);
  const totalReservedMinor = campaigns.reduce((acc, c) => acc + c.reservedMinor, 0);
  const totalPaidMinor = campaigns.reduce((acc, c) => acc + c.paidMinor, 0);
  const totalVerifiedInstalls = campaigns.reduce((acc, c) => acc + c.qualifiedCount, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicksCount, 0);
  const totalInstalls = campaigns.reduce((acc, c) => acc + c.installsCount, 0);

  const filteredCampaigns = campaigns.filter(
    (c) => filterCat === 'all' || c.category.toLowerCase() === filterCat.toLowerCase()
  );

  const handleDeposit = () => {
    const minor = Math.round(parseFloat(depositAmount || '0') * 100);
    if (minor > 0 && campaigns[0]) {
      umiStore.postLedgerTransaction({
        idempotencyKey: `whop_escrow_deposit_${Date.now()}`,
        kind: 'escrow_deposit',
        referenceType: 'deposit',
        referenceId: `dep_${Date.now()}`,
        description: `Whop Escrow top-up for ${campaigns[0].appName} ($${(minor / 100).toFixed(2)})`,
        entries: [
          {
            accountId: 'acc_whop_clearing',
            direction: 'debit',
            amountMinor: minor,
          },
          {
            accountId: 'acc_escrow_pixelpop',
            direction: 'credit',
            amountMinor: minor,
          },
        ],
      });
      campaigns[0].totalBudgetMinor += minor;
      setDepositModalOpen(false);
    }
  };

  if (activeSubView === 'sdk') {
    return (
      <AppSdkSetupView
        apps={apps}
        appKeys={appKeys}
        onBack={() => setActiveSubView('campaigns')}
      />
    );
  }

  return (
    <div className="space-y-7 animate-[fadeIn_0.15s_ease-out]">
      {/* Top Banner: Founder Operations & Escrow Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-medium text-[#9C9A92] uppercase tracking-wider">
              Founder Control Plane
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Stripe Escrow Active · 100% Prefunded
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#F4F2EC]">Growth Campaigns & Attribution</h1>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubView('sdk')}
            className="px-3.5 py-2 rounded-full bg-[#141414] hover:bg-[#252525] text-[#F4F2EC] text-[12.5px] font-medium border border-[#222222] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-code text-[14px] text-[#9C9A92]"></i>
            <span>iOS SDK & Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setDepositModalOpen(true)}
            className="px-3.5 py-2 rounded-full bg-[#141414] hover:bg-[#252525] text-[#F4F2EC] text-[12.5px] font-medium border border-[#222222] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-plus text-[14px] text-[#C9B8FF]"></i>
            <span>Prefund Escrow</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 rounded-full bg-[#F4F2EC] hover:bg-white text-[#000000] text-[12.5px] font-semibold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(244,242,236,0.3)] cursor-pointer border-0 flex items-center gap-1.5 active:scale-95"
          >
            <i className="ti ti-speakerphone text-[14px]"></i>
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Subview Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubView('campaigns')}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer border ${
            activeSubView === 'campaigns'
              ? 'bg-[#F4F2EC] text-[#000000] border-transparent shadow-xs'
              : 'bg-[#141414] text-[#9C9A92] hover:text-[#F4F2EC] border-[#222222]'
          }`}
        >
          <span>Campaigns & Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('approvals')}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
            activeSubView === 'approvals'
              ? 'bg-[#F4F2EC] text-[#000000] border-transparent shadow-xs'
              : 'bg-[#141414] text-[#9C9A92] hover:text-[#F4F2EC] border-[#222222]'
          }`}
        >
          <span>Creator Approvals & FTC E-Sign</span>
          {pendingApprovalsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#C9B8FF] text-black text-[11px] font-bold flex items-center justify-center">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('sdk')}
          className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer border bg-[#141414] text-[#9C9A92] hover:text-[#F4F2EC] border-[#222222]"
        >
          <span>iOS SDK & Device Keys</span>
        </button>
      </div>

      {approvedNotification && (
        <div className="p-3.5 bg-[#141414] border border-[#C9B8FF]/40 rounded-[14px] text-[13px] text-[#F4F2EC] flex items-center justify-between animate-[fade-in_0.15s_ease-out]">
          <div className="flex items-center gap-2">
            <i className="ti ti-circle-check text-[#C9B8FF] text-[17px]"></i>
            <span>{approvedNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setApprovedNotification(null)}
            className="text-[#9C9A92] hover:text-[#F4F2EC] bg-transparent border-0 cursor-pointer"
          >
            <i className="ti ti-x text-[13px]"></i>
          </button>
        </div>
      )}

      {/* ================= VIEW: CREATOR APPROVALS & PRE-PAYOUT REVIEW ================= */}
      {activeSubView === 'approvals' && (
        <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
          {/* Header Description */}
          <div className="p-5 bg-[#0E0E0E] rounded-[20px] border border-[#222222] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C9B8FF]/20 text-[#C9B8FF] flex items-center justify-center text-[12px]">
                <i className="ti ti-signature"></i>
              </span>
              <h2 className="text-[16px] font-semibold text-[#F4F2EC]">
                Creator Approval & FTC Disclosure Monitoring (Point 3)
              </h2>
            </div>
            <p className="text-[12.5px] text-[#9C9A92] leading-relaxed max-w-[780px]">
              NewWave has brands approve creators, who then e-sign an agreement before they get a campaign workspace.
              For Umi this achieves three critical goals: <b>reduces bot fraud</b>, <b>satisfies our mandatory FTC endorsement monitoring duty (#ad)</b>, and <b>gives founders full control</b> over which creators represent their brand.
            </p>
          </div>

          {/* Pending Applications List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-medium text-[#F4F2EC]">Incoming Creator Applications</h3>
              <span className="text-[12px] text-[#9C9A92]">{creatorApplications.length} total applications</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {creatorApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 bg-[#0E0E0E] rounded-[18px] border border-[#222222] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-full bg-[#C9B8FF]/15 text-[#C9B8FF] flex items-center justify-center font-bold text-[14px]">
                        {app.creatorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[15px] text-[#F4F2EC]">{app.creatorName}</span>
                          <span className="font-mono text-[12px] text-[#9C9A92]">@{app.creatorHandle}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#181818] border border-[#262626] text-[11px] text-[#B8B6AE] capitalize">
                            {app.primaryChannel} · {app.followerCount}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#9C9A92] mt-0.5">
                          Applying for: <b className="text-[#F4F2EC] font-medium">{app.campaignName}</b> · {app.submittedAt}
                        </div>
                      </div>
                    </div>

                    {/* Pitch Note */}
                    <div className="p-3 bg-[#141414] rounded-[12px] border border-[#222222] text-[12.5px] text-[#B8B6AE] leading-relaxed">
                      "{app.pitchNote}"
                    </div>

                    {/* E-sign & FTC Pledge Verifications */}
                    <div className="flex items-center gap-3 text-[11.5px] text-[#9C9A92] flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[#C0DD97]">
                        <i className="ti ti-circle-check"></i>
                        <span>FTC #ad Pledge Signed</span>
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-[#C9B8FF]">
                        <i className="ti ti-signature"></i>
                        <span>E-Signed: <b className="text-[#F4F2EC] font-normal">{app.eSignedName}</b></span>
                      </span>
                      <span>·</span>
                      <span className="text-[#9C9A92]">Legal Agreement: Umi-Creator-v2.4</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRejectCreator(app.id)}
                          className="px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#FF8A80] border border-[#222222] text-[12.5px] font-medium cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveCreator(app.id)}
                          className="px-5 py-2 rounded-full bg-[#F4F2EC] hover:bg-white text-black text-[12.5px] font-semibold cursor-pointer transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <i className="ti ti-check text-[13px]"></i>
                          <span>Approve & Issue Workspace</span>
                        </button>
                      </>
                    ) : app.status === 'approved' ? (
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[12px] font-medium flex items-center gap-1">
                        <i className="ti ti-circle-check"></i>
                        <span>Approved & Workspace Active</span>
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[12px] font-medium">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Payout Review Section */}
          <div className="p-5 bg-[#0E0E0E] rounded-[20px] border border-[#222222] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#F4F2EC]">Pre-Payout Settlement Queue</h3>
                <p className="text-[12px] text-[#9C9A92]">
                  Upcoming batch scheduled for <b>Friday, Oct 16 at 17:00 UTC</b>. All qualified outcomes undergo automated device attestation review before payout release.
                </p>
              </div>
              <span className="text-[11.5px] font-mono text-[#C9B8FF] bg-[#C9B8FF]/10 px-2.5 py-1 rounded-full border border-[#C9B8FF]/20">
                Weekly Friday Batch
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-[#222] text-[#777] text-[11px] uppercase tracking-wider">
                    <th className="pb-2">Creator</th>
                    <th className="pb-2">Campaign</th>
                    <th className="pb-2">Verified Installs</th>
                    <th className="pb-2">Attestation Confidence</th>
                    <th className="pb-2">Amount to Settle</th>
                    <th className="pb-2 text-right">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                  <tr>
                    <td className="py-2.5 font-medium text-[#F4F2EC]">@maya.makes</td>
                    <td className="py-2.5 text-[#9C9A92]">Pixel Pop</td>
                    <td className="py-2.5 font-mono">42 qualified</td>
                    <td className="py-2.5 text-[#C0DD97] font-mono">99.4% (Hardware OK)</td>
                    <td className="py-2.5 font-mono font-medium text-[#F4F2EC]">$75.60</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Ready for Friday
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-[#F4F2EC]">@alex.fitness</td>
                    <td className="py-2.5 text-[#9C9A92]">Stride Health</td>
                    <td className="py-2.5 font-mono">28 qualified</td>
                    <td className="py-2.5 text-[#C0DD97] font-mono">98.9% (HealthKit Sync)</td>
                    <td className="py-2.5 font-mono font-medium text-[#F4F2EC]">$81.20</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Ready for Friday
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW: CAMPAIGNS & CONTROLS ================= */}
      {activeSubView === 'campaigns' && (
        <div className="space-y-7 animate-[fadeIn_0.15s_ease-out]">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#9C9A92] mb-1">Active Escrow Reserve</div>
              <div className="text-[22px] font-mono font-semibold text-[#F4F2EC] tracking-tight">
                ${((totalBudgetMinor - totalPaidMinor) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11.5px] text-[#777] mt-1 flex items-center gap-1">
                <span className="text-[#C9B8FF] font-medium">${(totalPaidMinor / 100).toFixed(0)}</span>
                <span>settled to creators (0% fee taken)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#9C9A92] mb-1">Verified Installs (Qualified)</div>
              <div className="text-[22px] font-mono font-semibold text-[#C9B8FF] tracking-tight">
                {totalVerifiedInstalls.toLocaleString()}
              </div>
              <div className="text-[11.5px] text-[#777] mt-1">
                <span>Pass rate: </span>
                <span className="text-[#F4F2EC] font-medium">94.8% anti-fraud</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#9C9A92] mb-1">Active Creators Reaching Users</div>
              <div className="text-[22px] font-mono font-semibold text-[#F4F2EC] tracking-tight">
                {campaigns.reduce((sum, c) => sum + c.creatorsCount, 0).toLocaleString()}
              </div>
              <div className="text-[11.5px] text-[#777] mt-1">Across {campaigns.length} live campaigns</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#9C9A92] mb-1">Platform Subscription Plan</div>
              <div className="text-[20px] font-semibold text-[#F4F2EC] tracking-tight">
                Starter · $199/mo
              </div>
              <div className="text-[11.5px] text-[#C9B8FF] mt-1">0% cut on creator bounties</div>
            </div>
          </div>

          {/* Differentiate on Verified Outcomes vs Vanity Views Banner (Point 7) */}
          <div className="p-4 sm:p-5 rounded-[20px] bg-[#0E0E0E] border border-[#C9B8FF]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C9B8FF]/15 text-[#C9B8FF] border border-[#C9B8FF]/30">
                  Umi Core Edge
                </span>
                <span className="text-[14px] font-semibold text-[#F4F2EC]">
                  Verified In-App Outcomes vs. Vanity Public Views
                </span>
              </div>
              <p className="text-[12px] text-[#9C9A92] leading-relaxed max-w-[700px]">
                Platforms like NewWave pay creators based on public video view counts. Views measure passive scroll-bys, are vulnerable to view-bots, and offer zero conversion accountability. <b>Umi measures verified in-app outcomes</b>: authentic installs, onboarding completion, and in-game events verified cryptographically on device by our RavenCore SDK.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#222] text-center min-w-[130px]">
                <div className="text-[11px] text-[#777] uppercase font-mono">Attribution</div>
                <div className="text-[14px] font-semibold text-[#C9B8FF] mt-0.5">SDK Hardware</div>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-[#222] text-center min-w-[130px]">
                <div className="text-[11px] text-[#777] uppercase font-mono">Creator Cut</div>
                <div className="text-[14px] font-semibold text-[#C0DD97] mt-0.5">0% ($0.00)</div>
              </div>
            </div>
          </div>

          {/* Managed Launch Callout for Early Founders (Point 6) */}
          <div className="p-4 sm:p-5 rounded-[20px] bg-[#121215] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10.5px] uppercase font-bold tracking-wider bg-[#FAC775]/15 text-[#FAC775] border border-[#FAC775]/30">
                  Design Partner Tier
                </span>
                <span className="text-[14.5px] font-semibold text-[#F4F2EC]">
                  Umi Managed Launch for Early Founders (Point 6)
                </span>
              </div>
              <p className="text-[12px] text-[#9C9A92] leading-relaxed max-w-[680px]">
                Want our team to run your campaign end-to-end? In the Managed tier, Umi sources and vets 25+ creators, writes high-converting video briefs, audits FTC disclosures, and optimizes weekly pacing for your first 3 to 5 campaigns.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setManagedModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#222222] text-[#F4F2EC] text-[12.5px] font-semibold border border-[#303030] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Explore Managed Launch
            </button>
          </div>

          {/* Campaigns List Section with Campaign Controls (Point 5) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-[#F4F2EC]">Active Campaigns & Controls</h2>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                {['all', 'games', 'health & fitness', 'productivity'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCat(cat)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer border-0 capitalize ${
                      filterCat === cat
                        ? 'bg-[#F4F2EC] text-[#000000]'
                        : 'bg-[#181818] text-[#888] hover:text-[#F4F2EC]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Cards Grid with Controls (Point 5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((camp) => {
                const budgetPercent = Math.min(
                  100,
                  Math.round((camp.reservedMinor / camp.totalBudgetMinor) * 100)
                );
                const remainingBudget = (camp.totalBudgetMinor - camp.reservedMinor) / 100;
                return (
                  <div
                    key={camp.id}
                    className="bg-[#141414] border border-[#262626] hover:border-[#383838] transition-all rounded-2xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C9B8FF] flex items-center justify-center text-[19px] shrink-0">
                            <i className={`ti ${camp.icon}`}></i>
                          </div>
                          <div>
                            <h3 className="text-[15px] font-medium text-[#F4F2EC] leading-snug">{camp.name}</h3>
                            <div className="text-[12px] text-[#9C9A92]">{camp.appName} · {camp.category}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => umiStore.toggleCampaignStatus(camp.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                            camp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                        >
                          {camp.status === 'active' ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      {/* Milestone description */}
                      <div className="p-2.5 rounded-xl bg-[#181818] border border-[#222] text-[12px] text-[#B8B6AE] mb-3">
                        <span className="text-[#777] block text-[10px] uppercase tracking-wider mb-0.5">
                          Verified Milestone:
                        </span>
                        <span className="text-[#F4F2EC] font-medium">{camp.qualifyingEventLabel}</span>
                      </div>

                      {/* Escrow Budget Remaining & Pacing (Point 5) */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-[11.5px] text-[#9C9A92]">
                          <span>Escrow Budget Remaining</span>
                          <span className="font-mono text-[#F4F2EC] font-medium">
                            ${remainingBudget.toFixed(0)} of ${(camp.totalBudgetMinor / 100).toFixed(0)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#202020] overflow-hidden">
                          <div
                            className="h-full bg-[#C9B8FF] rounded-full transition-all"
                            style={{ width: `${100 - budgetPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Controls Badges: Pacing, Video Cap, End Date (Point 5) */}
                      <div className="grid grid-cols-2 gap-2 text-[11.5px] p-2.5 rounded-xl bg-[#101012] border border-[#222222]">
                        <div>
                          <span className="text-[#777] block text-[10px]">Pacing & Daily Cap</span>
                          <span className="font-mono text-[#F4F2EC] font-medium">$250/day ({(camp as any).pacingPercentage || 88}%)</span>
                        </div>
                        <div>
                          <span className="text-[#777] block text-[10px]">Per-Creator Cap</span>
                          <span className="text-[#F4F2EC] font-medium">Max 3 videos/creator</span>
                        </div>
                        <div>
                          <span className="text-[#777] block text-[10px]">Campaign End Date</span>
                          <span className="text-[#C9B8FF] font-medium">Oct 29 (22 days left)</span>
                        </div>
                        <div>
                          <span className="text-[#777] block text-[10px]">Trust Mechanism</span>
                          <span className="text-[#C0DD97] font-medium">100% Escrow Backed</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Metrics */}
                    <div className="pt-3 border-t border-[#222] flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-[#C9B8FF] font-semibold">${(camp.rewardMinor / 100).toFixed(2)}</span>
                        <span className="text-[#777]">/ install</span>
                      </div>

                      <div className="text-[#9C9A92]">
                        <span className="font-mono text-[#F4F2EC]">{camp.qualifiedCount}</span> verified
                      </div>

                      <div className="text-[11px] text-[#888] font-mono">
                        {camp.holdDays}d hold
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Managed Launch Info Modal (Point 6) */}
      {managedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#FAC775]/20 text-[#FAC775] flex items-center justify-center text-[16px]">
                  <i className="ti ti-star"></i>
                </span>
                <h3 className="text-[17px] font-semibold text-[#F4F2EC]">Umi Managed Launch Tier</h3>
              </div>
              <button
                type="button"
                onClick={() => setManagedModalOpen(false)}
                className="text-[#888] hover:text-[#F4F2EC] bg-transparent border-0 cursor-pointer"
              >
                <i className="ti ti-x text-[16px]"></i>
              </button>
            </div>

            <p className="text-[13px] text-[#9C9A92] leading-relaxed">
              NewWave offers a managed tier where its team runs the campaign. A lightweight version of this helps your first 3 to 5 design partners get fast verified installs and learn what converts before scaling self-serve.
            </p>

            <div className="space-y-2.5 p-4 rounded-xl bg-[#181818] border border-[#262626] text-[12.5px]">
              <div className="flex items-start gap-2 text-[#F4F2EC]">
                <i className="ti ti-check text-[#C9B8FF] mt-0.5"></i>
                <span><b>Vetted Creator Matching:</b> We pair top 30 gaming/productivity creators whose audience aligns with your app.</span>
              </div>
              <div className="flex items-start gap-2 text-[#F4F2EC]">
                <i className="ti ti-check text-[#C9B8FF] mt-0.5"></i>
                <span><b>Brief & Hook Writing:</b> We provide performance templates that instruct creators how to present your value proposition.</span>
              </div>
              <div className="flex items-start gap-2 text-[#F4F2EC]">
                <i className="ti ti-check text-[#C9B8FF] mt-0.5"></i>
                <span><b>FTC & Fraud Monitoring:</b> Continuous automated and human review of #ad tags and in-app SDK attestation logs.</span>
              </div>
              <div className="flex items-start gap-2 text-[#F4F2EC]">
                <i className="ti ti-check text-[#C9B8FF] mt-0.5"></i>
                <span><b>Managed Escrow & Settlements:</b> We handle creator questions and Friday batch payouts directly.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setManagedModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#222] text-[#9C9A92] text-[12.5px] border border-[#303030] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setManagedModalOpen(false);
                  setApprovedNotification("Design Partner Managed Request submitted! An Umi launch engineer will contact your account today.");
                }}
                className="px-5 py-2 rounded-full bg-[#F4F2EC] hover:bg-white text-black text-[12.5px] font-semibold border-0 cursor-pointer shadow-sm"
              >
                Request Managed Launch ($599/mo)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Create Wizard Modal */}
      <CampaignCreateWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        apps={apps}
        onCreated={() => setIsWizardOpen(false)}
      />

      {/* Escrow Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-[#F4F2EC]">Prefund Stripe Escrow</h3>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="text-[#888] hover:text-[#F4F2EC] bg-transparent border-0 cursor-pointer"
              >
                <i className="ti ti-x text-[16px]"></i>
              </button>
            </div>
            <p className="text-[12.5px] text-[#9C9A92] mb-4">
              Prefunded escrow is our primary trust mechanism. Creators know their bounty is 100% reserved in Stripe escrow before posting.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#9C9A92] mb-1.5">
                  Deposit Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#777]">$</span>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full h-11 pl-8 pr-3.5 bg-[#141414] border border-[#222222] focus:border-[#C9B8FF] rounded-xl text-[14px] font-mono text-[#F4F2EC] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#262626] text-[11.5px] text-[#888] leading-relaxed">
                Source: Linked Corporate Card • Visa •••• 4242 (<span className="text-[#C9B8FF]">0% fee on creator pay</span>).
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-transparent hover:bg-[#222] text-[#9C9A92] text-[12.5px] border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeposit}
                  className="px-5 py-2 rounded-full bg-[#F4F2EC] hover:bg-white text-black text-[12.5px] font-semibold border-0 cursor-pointer shadow-sm"
                >
                  Confirm Escrow Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

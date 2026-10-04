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
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'campaigns' | 'sdk'>('campaigns');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('2500');

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
            <span className="text-[12px] font-medium text-[#A8A69E] uppercase tracking-wider">
              Founder Control Plane
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Whop Escrow Active
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#F5F3EC]">Growth Campaigns & Attribution</h1>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveSubView('sdk')}
            className="px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#F5F3EC] text-[12.5px] font-medium border border-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-code text-[14px] text-[#A8A69E]"></i>
            <span>iOS SDK & Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setDepositModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#F5F3EC] text-[12.5px] font-medium border border-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-plus text-[14px] text-[#C7F26B]"></i>
            <span>Fund Escrow</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[12.5px] font-semibold transition-all shadow-sm cursor-pointer border-0 flex items-center gap-1.5"
          >
            <i className="ti ti-speakerphone text-[14px]"></i>
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">Active Escrow Reserve</div>
          <div className="text-[22px] font-mono font-semibold text-[#F5F3EC] tracking-tight">
            ${((totalBudgetMinor - totalPaidMinor) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1 flex items-center gap-1">
            <span className="text-[#C7F26B] font-medium">${(totalPaidMinor / 100).toFixed(0)}</span>
            <span>settled to creators via Whop</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">Verified Installs (Qualified)</div>
          <div className="text-[22px] font-mono font-semibold text-[#C7F26B] tracking-tight">
            {totalVerifiedInstalls.toLocaleString()}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1">
            <span>Pass rate: </span>
            <span className="text-[#F5F3EC] font-medium">94.8% anti-fraud</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">Active Creators Reaching Users</div>
          <div className="text-[22px] font-mono font-semibold text-[#F5F3EC] tracking-tight">
            {campaigns.reduce((sum, c) => sum + c.creatorsCount, 0).toLocaleString()}
          </div>
          <div className="text-[11.5px] text-[#777] mt-1">Across 3 live campaigns</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
          <div className="text-[12px] text-[#A8A69E] mb-1">Avg Install Cost (Bounty)</div>
          <div className="text-[22px] font-mono font-semibold text-[#F5F3EC] tracking-tight font-mono">
            $2.27
          </div>
          <div className="text-[11.5px] text-[#777] mt-1">100% verified performance-based</div>
        </div>
      </div>

      {/* Attribution Funnel Section */}
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#F5F3EC]">Verified Attribution Funnel</h2>
            <p className="text-[12px] text-[#A8A69E]">
              From edge redirect click to source confirmation, app open, and qualifying in-app milestone
            </p>
          </div>
          <span className="text-[11.5px] font-mono text-[#C7F26B] bg-[#C7F26B]/10 px-2.5 py-1 rounded-full border border-[#C7F26B]/20">
            Convex Pipeline Latency: 180ms
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424] text-center">
            <div className="text-[11px] text-[#888] uppercase tracking-wider mb-1">1. Edge Clicks</div>
            <div className="text-[18px] font-mono font-medium text-[#F5F3EC]">{totalClicks.toLocaleString()}</div>
            <div className="text-[11px] text-[#666] mt-0.5">Worker filtered</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424] text-center">
            <div className="text-[11px] text-[#888] uppercase tracking-wider mb-1">2. Source Confirm</div>
            <div className="text-[18px] font-mono font-medium text-[#F5F3EC]">{Math.floor(totalInstalls * 1.08).toLocaleString()}</div>
            <div className="text-[11px] text-[#C7F26B] mt-0.5">Universal Links + Code</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424] text-center">
            <div className="text-[11px] text-[#888] uppercase tracking-wider mb-1">3. App Opens</div>
            <div className="text-[18px] font-mono font-medium text-[#F5F3EC]">{totalInstalls.toLocaleString()}</div>
            <div className="text-[11px] text-[#666] mt-0.5">Install token generated</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424] text-center">
            <div className="text-[11px] text-[#888] uppercase tracking-wider mb-1">4. Milestone Met</div>
            <div className="text-[18px] font-mono font-medium text-[#F5F3EC]">{totalVerifiedInstalls.toLocaleString()}</div>
            <div className="text-[11px] text-[#388BFD] mt-0.5">SDK Event confirmed</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1C1C1C] border border-[#C7F26B]/30 text-center">
            <div className="text-[11px] text-[#C7F26B] uppercase tracking-wider mb-1">5. Verified Reward</div>
            <div className="text-[18px] font-mono font-bold text-[#C7F26B]">{totalVerifiedInstalls.toLocaleString()}</div>
            <div className="text-[11px] text-[#C7F26B]/80 mt-0.5">Committed to Ledger</div>
          </div>
        </div>
      </div>

      {/* Campaigns List Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold text-[#F5F3EC]">Active Campaigns</h2>
            <span className="text-[12px] text-[#888] font-mono">({campaigns.length})</span>
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
                    ? 'bg-[#F5F3EC] text-[#0B0B0B]'
                    : 'bg-[#181818] text-[#888] hover:text-[#F5F3EC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((camp) => {
            const budgetPercent = Math.min(
              100,
              Math.round((camp.reservedMinor / camp.totalBudgetMinor) * 100)
            );
            return (
              <div
                key={camp.id}
                className="bg-[#141414] border border-[#262626] hover:border-[#383838] transition-all rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C7F26B] flex items-center justify-center text-[19px] shrink-0">
                        <i className={`ti ${camp.icon}`}></i>
                      </div>
                      <div>
                        <h3 className="text-[15px] font-medium text-[#F5F3EC] leading-snug">{camp.name}</h3>
                        <div className="text-[12px] text-[#A8A69E]">{camp.appName} · {camp.category}</div>
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
                  <div className="p-3 rounded-xl bg-[#181818] border border-[#222] text-[12px] text-[#B9B7AF] mb-4">
                    <span className="text-[#777] block text-[10.5px] uppercase tracking-wider mb-0.5">
                      Required Milestone:
                    </span>
                    <span className="text-[#F5F3EC] font-medium">{camp.qualifyingEventLabel}</span>
                  </div>

                  {/* Budget & Progress */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11.5px] text-[#A8A69E]">
                      <span>Escrow Reserved</span>
                      <span className="font-mono text-[#F5F3EC] font-medium">
                        ${(camp.reservedMinor / 100).toFixed(0)} / ${(camp.totalBudgetMinor / 100).toFixed(0)} ({budgetPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#202020] overflow-hidden">
                      <div
                        className="h-full bg-[#C7F26B] rounded-full transition-all"
                        style={{ width: `${budgetPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-[#222] flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#C7F26B] font-semibold">${(camp.rewardMinor / 100).toFixed(2)}</span>
                    <span className="text-[#777]">/ install</span>
                  </div>

                  <div className="text-[#A8A69E]">
                    <span className="font-mono text-[#F5F3EC]">{camp.qualifiedCount}</span> verified
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
              <h3 className="text-[16px] font-semibold text-[#F5F3EC]">Fund Escrow via Whop</h3>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="text-[#888] hover:text-[#F5F3EC] bg-transparent border-0 cursor-pointer"
              >
                <i className="ti ti-x text-[16px]"></i>
              </button>
            </div>
            <p className="text-[12.5px] text-[#A8A69E] mb-4">
              Escrow funds are held securely by Whop and atomically booked to your Umi double-entry ledger.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#A8A69E] mb-1.5">
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
                    className="w-full h-11 pl-8 pr-3.5 bg-[#1C1C1C] border border-[#2A2A2A] focus:border-[#C7F26B] rounded-xl text-[14px] font-mono text-[#F5F3EC] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#262626] text-[11.5px] text-[#888] leading-relaxed">
                Source: Linked Corporate Wire / Whop Balance (<span className="text-[#C7F26B]">whop_clearing_in_transit</span>).
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-[#222] text-[#A8A69E] text-[12.5px] border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeposit}
                  className="px-5 py-2 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[12.5px] font-semibold border-0 cursor-pointer"
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

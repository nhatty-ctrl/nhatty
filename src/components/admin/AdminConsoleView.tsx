import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import {
  AttributionDecision,
  LedgerAccount,
  LedgerTransaction,
  ProviderInboxItem,
  AuditLogItem,
  RewardEntitlement,
  Campaign,
} from '../../types/umi';

interface AdminConsoleViewProps {
  attributions: AttributionDecision[];
  ledgerAccounts: LedgerAccount[];
  ledgerTransactions: LedgerTransaction[];
  providerInbox: ProviderInboxItem[];
  auditLogs: AuditLogItem[];
  rewards: RewardEntitlement[];
  campaigns: Campaign[];
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  attributions,
  ledgerAccounts,
  ledgerTransactions,
  providerInbox,
  auditLogs,
  rewards,
  campaigns,
}) => {
  const [activeTab, setActiveTab] = useState<
    'operations' | 'attribution' | 'ledger' | 'providers' | 'risk' | 'audit'
  >('operations');
  const [attrSearch, setAttrSearch] = useState('');
  const [selectedAttr, setSelectedAttr] = useState<AttributionDecision | null>(null);
  const [invariantResult, setInvariantResult] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRunInvariantAudit = () => {
    const res = umiStore.verifyLedgerInvariants();
    setInvariantResult(res);
    setActionNotice(
      res.passed
        ? `Audit Passed: Verified ${res.totalTransactions} transactions. Debits === Credits across all accounts.`
        : 'Invariant Violation Detected in balance sheet!'
    );
  };

  const handleSimulateRevenueCat = () => {
    umiStore.simulateRevenueCatPurchase(campaigns[0]?.appId || 'app_pixelpop');
    setActionNotice('Simulated signed RevenueCat INITIAL_PURCHASE webhook. Normalized into provider inbox.');
  };

  const filteredAttributions = attributions.filter((a) => {
    const q = attrSearch.toLowerCase();
    return (
      a.id.toLowerCase().includes(q) ||
      a.installId.toLowerCase().includes(q) ||
      a.campaignName.toLowerCase().includes(q) ||
      a.creatorHandle.toLowerCase().includes(q) ||
      a.reasonCode.toLowerCase().includes(q)
    );
  });

  const frozenRewards = rewards.filter((r) => r.status === 'frozen');

  return (
    <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-medium text-[#C7F26B] uppercase tracking-wider font-mono">
              [Umi Control Plane]
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#A8A69E] border border-[#333]">
              Environment: Production
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#F5F3EC]">Operations, Ledger & Audit Console</h1>
        </div>

        {/* Global Test & Audit Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunInvariantAudit}
            className="px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#F5F3EC] text-[12px] font-medium border border-[#333] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-check text-[#C7F26B]"></i>
            <span>Run Invariant Audit</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateRevenueCat}
            className="px-3.5 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-[#F5F3EC] text-[12px] font-medium border border-[#333] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <i className="ti ti-brand-apple text-[#388BFD]"></i>
            <span>Test RevenueCat Webhook</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-[#181818] border border-[#C7F26B]/30 text-[#C7F26B] text-[12.5px] font-mono flex items-center justify-between animate-[fadeIn_0.1s_ease-out]">
          <div className="flex items-center gap-2">
            <i className="ti ti-info-circle text-[15px]"></i>
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-[#888] hover:text-[#FFF] bg-transparent border-0 cursor-pointer"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-xl border border-[#262626] overflow-x-auto">
        {[
          { id: 'operations', label: 'Operations Health', icon: 'ti-activity' },
          { id: 'attribution', label: `Attribution Explorer (${attributions.length})`, icon: 'ti-zoom-question' },
          { id: 'ledger', label: 'Double-Entry Ledger', icon: 'ti-book' },
          { id: 'providers', label: `Provider Inboxes (${providerInbox.length})`, icon: 'ti-inbox' },
          { id: 'risk', label: `Risk & Freezes (${frozenRewards.length})`, icon: 'ti-shield-alert' },
          { id: 'audit', label: `Audit Log (${auditLogs.length})`, icon: 'ti-history' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer border-0 flex items-center gap-2 whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#262626] text-[#F5F3EC] shadow-sm'
                : 'text-[#888] hover:text-[#F5F3EC] bg-transparent'
            }`}
          >
            <i className={`ti ${t.icon} text-[14px]`}></i>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Operations Health */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#A8A69E] mb-1">SDK Ingestion Health</div>
              <div className="text-[22px] font-mono font-bold text-emerald-400">99.98%</div>
              <div className="text-[11.5px] text-[#777] mt-1">Convex HTTP endpoints online</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#A8A69E] mb-1">Webhook Backlog</div>
              <div className="text-[22px] font-mono font-bold text-[#F5F3EC]">0 pending</div>
              <div className="text-[11.5px] text-[#777] mt-1">Whop & RevenueCat in sync</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#A8A69E] mb-1">Reconciliation Discrepancies</div>
              <div className="text-[22px] font-mono font-bold text-emerald-400">$0.00</div>
              <div className="text-[11.5px] text-[#777] mt-1">Ledger matches Whop accounts</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[12px] text-[#A8A69E] mb-1">Automated Freeze Rate</div>
              <div className="text-[22px] font-mono font-bold text-[#C7F26B]">0.38%</div>
              <div className="text-[11.5px] text-[#777] mt-1">Velocity & IP cluster triggers</div>
            </div>
          </div>

          {/* Architecture Status */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626]">
            <h3 className="text-[15px] font-semibold text-[#F5F3EC] mb-2">Convex Backend Architecture Status</h3>
            <p className="text-[12.5px] text-[#A8A69E] mb-4">
              Control plane, transactional mutations, hold schedulers, and webhook ingestion nodes
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424]">
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Convex Mutations & Queries</span>
                </div>
                <div className="text-[#888] text-[11.5px]">Atomic campaign, reward, budget, and double-entry ledger transitions.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424]">
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Convex HTTP Actions</span>
                </div>
                <div className="text-[#888] text-[11.5px]">Direct iOS SDK event intake and Whop/RevenueCat webhooks.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#242424]">
                <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Scheduled Functions</span>
                </div>
                <div className="text-[#888] text-[11.5px]">Safety hold expiry cron, retry queue, and daily reconciliation.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attribution Decision Explorer */}
      {activeTab === 'attribution' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#777]"></i>
              <input
                type="text"
                value={attrSearch}
                onChange={(e) => setAttrSearch(e.target.value)}
                placeholder="Search install tokens, creators, campaigns, evidence..."
                className="w-full h-10 pl-9 pr-3.5 bg-[#161616] border border-[#262626] rounded-xl text-[13px] text-[#F5F3EC] outline-none focus:border-[#C7F26B]"
              />
            </div>
            <div className="text-[12px] text-[#888] font-mono">
              Showing {filteredAttributions.length} decisions
            </div>
          </div>

          <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#181818] border-b border-[#262626] text-[#777] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-medium">Attribution ID</th>
                    <th className="p-3.5 font-medium">Install Token</th>
                    <th className="p-3.5 font-medium">Campaign</th>
                    <th className="p-3.5 font-medium">Creator</th>
                    <th className="p-3.5 font-medium">Confidence</th>
                    <th className="p-3.5 font-medium">Outcome</th>
                    <th className="p-3.5 font-medium">Reason Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020]">
                  {filteredAttributions.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedAttr(a)}
                      className="hover:bg-[#181818] cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-mono text-[12px] text-[#C7F26B] font-medium">
                        {a.id}
                      </td>
                      <td className="p-3.5 font-mono text-[12px] text-[#A8A69E]">
                        {a.installId.slice(0, 16)}...
                      </td>
                      <td className="p-3.5 text-[#F5F3EC]">{a.campaignName}</td>
                      <td className="p-3.5 font-mono text-[#DDD]">{a.creatorHandle}</td>
                      <td className="p-3.5 font-mono text-[#F5F3EC]">
                        {(a.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          a.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {a.status === 'approved' ? 'Approved' : 'Frozen Under Review'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11.5px] text-[#888]">
                        {a.reasonCode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decision Detail Drawer */}
          {selectedAttr && (
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#C7F26B]/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-semibold text-[#F5F3EC]">
                  Attribution Evidence Graph: {selectedAttr.id}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedAttr(null)}
                  className="text-[#888] hover:text-[#FFF] bg-transparent border-0 cursor-pointer"
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] font-mono">
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-1">Evidence Records Attached:</div>
                  <div className="text-[#C7F26B]">{selectedAttr.evidenceIds.join(', ')}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-1">Active Rule Policy:</div>
                  <div className="text-[#DDD]">{selectedAttr.ruleVersion}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-1">Decision Timestamp:</div>
                  <div className="text-[#DDD]">{new Date(selectedAttr.decidedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Double-Entry Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Balance Sheet Accounts */}
          <div>
            <h3 className="text-[15px] font-semibold text-[#F5F3EC] mb-3">Balance Sheet Accounts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ledgerAccounts.map((acc) => (
                <div key={acc.id} className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-[#777] uppercase">{acc.kind}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${acc.allowNegative ? 'bg-amber-500/10 text-amber-400' : 'bg-[#222] text-[#888]'}`}>
                      {acc.allowNegative ? 'Clearing' : 'Strict Non-Negative'}
                    </span>
                  </div>
                  <div className="text-[14px] font-medium text-[#F5F3EC] truncate">{acc.name}</div>
                  <div className="text-[20px] font-mono font-bold text-[#C7F26B] mt-2">
                    ${(acc.balanceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal Entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-[#F5F3EC]">Append-Only Journal Transactions</h3>
              <span className="text-[12px] text-[#888] font-mono">
                {ledgerTransactions.length} balanced transactions
              </span>
            </div>

            <div className="space-y-3">
              {ledgerTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
                    <div>
                      <span className="font-mono text-[12px] text-[#C7F26B] font-semibold mr-2">{tx.id}</span>
                      <span className="text-[13px] text-[#F5F3EC] font-medium">{tx.description}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#777]">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Balanced Entries Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] font-mono">
                    {tx.entries.map((ent) => (
                      <div
                        key={ent.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          ent.direction === 'debit'
                            ? 'bg-[#181818] border-[#2A2A2A] text-[#B9B7AF]'
                            : 'bg-[#1C1C1C] border-[#333] text-[#F5F3EC]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            ent.direction === 'debit' ? 'bg-amber-500/15 text-amber-300' : 'bg-lime-500/15 text-lime-300'
                          }`}>
                            {ent.direction}
                          </span>
                          <span className="truncate">{ent.accountName}</span>
                        </div>
                        <span className="font-bold text-[#F5F3EC] shrink-0 ml-2">
                          ${(ent.amountMinor / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Provider Health & Webhook Inboxes */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-[#F5F3EC]">Whop Payouts & Funding</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[12px] text-[#A8A69E]">
                External money movement gateway for escrow funding and creator ACH/Stripe transfers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-[#F5F3EC]">RevenueCat Webhook</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[12px] text-[#A8A69E]">
                Receives signed server-to-server subscription and in-app purchase attribution signals.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-[#F5F3EC]">Apple Server Notifications</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[12px] text-[#A8A69E]">
                App Store Server Notifications V2 inbox for renewal, refund, and revoke events.
              </p>
            </div>
          </div>

          {/* Webhook Inbox Table */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
            <h3 className="text-[15px] font-semibold text-[#F5F3EC] mb-3">Received Provider Webhooks</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#222] text-[#777] text-[11px] uppercase tracking-wider">
                    <th className="pb-2.5 font-medium">Provider</th>
                    <th className="pb-2.5 font-medium">Event Type</th>
                    <th className="pb-2.5 font-medium">Summary</th>
                    <th className="pb-2.5 font-medium">State</th>
                    <th className="pb-2.5 font-medium text-right">Received At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020]">
                  {providerInbox.map((item) => (
                    <tr key={item.id} className="hover:bg-[#181818]/60 transition-colors">
                      <td className="py-3 font-medium uppercase font-mono text-[11.5px] text-[#C7F26B]">
                        {item.provider}
                      </td>
                      <td className="py-3 font-mono text-[12px] text-[#F5F3EC]">
                        {item.eventType}
                      </td>
                      <td className="py-3 text-[#B9B7AF] text-[12.5px]">{item.summary}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                          {item.processingState}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[12px] text-[#777] text-right">
                        {new Date(item.receivedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Risk & Automated Freezes */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] text-[12.5px] text-[#A8A69E] leading-relaxed">
            <strong className="text-[#F5F3EC]">Automated Risk Rule Engine:</strong> Convex mutations enforce velocity limits (max 10 events/min per IP/creator), duplicate install hashes, and timing invariants. Triggered events are non-accusatorily placed in <span className="font-mono text-rose-400">Frozen</span> status for admin forensic inspection without affecting innocent creators.
          </div>

          <div className="space-y-3">
            {frozenRewards.length > 0 ? (
              frozenRewards.map((rew) => (
                <div key={rew.id} className="p-4 rounded-2xl bg-[#141414] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-medium font-mono">
                        Frozen Security Flag
                      </span>
                      <span className="text-[13px] font-medium text-[#F5F3EC]">
                        {rew.campaignName} · ${(rew.amountMinor / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[12px] font-mono text-[#A8A69E]">
                      Creator: {rew.creatorHandle} · Attribution: {rew.attributionId}
                    </div>
                    <div className="text-[12px] text-rose-400 mt-1">
                      {rew.frozenReason || 'Triggered by automated velocity rule'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        umiStore.unfreezeReward(rew.id);
                        setActionNotice(`Unfroze reward ${rew.id}. Status restored to On Hold.`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#202020] hover:bg-[#2A2A2A] text-[#C7F26B] text-[12px] font-medium transition-colors border border-[#333] cursor-pointer"
                    >
                      Release Freeze (Approve)
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-[#141414] border border-[#262626] text-center text-[#888] text-[13px]">
                No rewards currently frozen. All automated safety thresholds normal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
          <h3 className="text-[15px] font-semibold text-[#F5F3EC] mb-3">System & Admin Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#222] text-[#777] text-[11px] uppercase tracking-wider">
                  <th className="pb-2.5 font-medium">Actor</th>
                  <th className="pb-2.5 font-medium">Action</th>
                  <th className="pb-2.5 font-medium">Target</th>
                  <th className="pb-2.5 font-medium">Details</th>
                  <th className="pb-2.5 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#181818]/60 transition-colors">
                    <td className="py-3 font-mono text-[12px] text-[#C7F26B]">{log.actor}</td>
                    <td className="py-3 font-mono text-[12px] text-[#F5F3EC]">{log.action}</td>
                    <td className="py-3 font-mono text-[11.5px] text-[#888]">{log.targetType}/{log.targetId}</td>
                    <td className="py-3 text-[#A8A69E] text-[12.5px]">{log.details}</td>
                    <td className="py-3 font-mono text-[11.5px] text-[#777] text-right">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

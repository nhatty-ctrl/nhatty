import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import { Campaign } from '../../types/umi';

interface SdkSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
}

export const SdkSimulationModal: React.FC<SdkSimulationModalProps> = ({
  isOpen,
  onClose,
  campaigns,
}) => {
  const [selectedCampId, setSelectedCampId] = useState(campaigns[0]?.id || '');
  const [step, setStep] = useState<number>(1);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  if (!isOpen) return null;

  const campaign = campaigns.find((c) => c.id === selectedCampId) || campaigns[0];

  const addLog = (msg: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunFullSimulation = async () => {
    setIsRunning(true);
    setLogMessages([]);
    setSimulationResult(null);
    setStep(1);

    addLog(`Initiating user click on Edge Redirect: https://umi.link/c/ALEX24`);
    await new Promise((r) => setTimeout(r, 600));

    setStep(2);
    addLog(`Cloudflare Worker classified user as valid iOS Safari. Routed to App Store.`);
    await new Promise((r) => setTimeout(r, 600));

    setStep(3);
    addLog(`App opened for the first time. Umi iOS SDK generated install token and confirmed creator code "ALEX24".`);
    await new Promise((r) => setTimeout(r, 700));

    setStep(4);
    addLog(`User completed in-app milestone: "${campaign.qualifyingEventLabel}". Emitting SDK telemetry.`);
    await new Promise((r) => setTimeout(r, 800));

    const result = umiStore.simulateFullAttributionFlow(campaign.id);
    setSimulationResult(result);

    setStep(5);
    addLog(`Convex Mutation evaluated rules: Confidence 0.99 (Approved).`);
    addLog(`Double-Entry Ledger booked: Escrow -$${(campaign.rewardMinor / 100).toFixed(2)} -> Creator Pending +$${(campaign.rewardMinor / 100).toFixed(2)}.`);
    addLog(`Scheduled Function set: Safety hold for ${campaign.holdDays} days.`);
    setIsRunning(false);
  };

  const handleFastForwardHold = () => {
    if (!simulationResult?.reward) return;
    try {
      const released = umiStore.releaseHold(simulationResult.reward.id);
      addLog(`Fast-forwarded hold expiry! Transaction committed: Status changed to Available ($${(released.amountMinor / 100).toFixed(2)}).`);
      setSimulationResult((prev: any) => ({
        ...prev,
        reward: released,
      }));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleWithdrawSimulated = () => {
    try {
      const payout = umiStore.requestWhopPayout();
      addLog(`Initiated Whop Payout intent ${payout.id}. Idempotency key checked. Whop webhook returning in 1.5s...`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#141414] border border-[#262626] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C7F26B] flex items-center justify-center text-[20px]">
              <i className="ti ti-player-play"></i>
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-[#F5F3EC]">
                Interactive Umi Verification & Ledger Simulator
              </h2>
              <p className="text-[12px] text-[#A8A69E]">
                Test the end-to-end attribution lifecycle: Edge click → iOS SDK → Convex Ledger → Whop
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
          {/* Target Campaign Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
            <div>
              <span className="text-[11px] text-[#777] uppercase tracking-wider block">Target App:</span>
              <span className="text-[14px] font-medium text-[#F5F3EC]">{campaign.appName} (${(campaign.rewardMinor / 100).toFixed(2)} bounty)</span>
            </div>
            <select
              value={selectedCampId}
              onChange={(e) => setSelectedCampId(e.target.value)}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-lg bg-[#222] border border-[#333] text-[#F5F3EC] text-[12.5px] outline-none cursor-pointer"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.appName} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Stepper Visualization */}
          <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
            {[
              { num: 1, label: 'Edge Click' },
              { num: 2, label: 'App Store' },
              { num: 3, label: 'iOS Open' },
              { num: 4, label: 'Milestone Met' },
              { num: 5, label: 'Ledger Booked' },
            ].map((s) => (
              <div
                key={s.num}
                className={`p-2 rounded-xl border transition-all ${
                  step === s.num && isRunning
                    ? 'bg-[#C7F26B]/15 border-[#C7F26B] text-[#C7F26B] font-semibold animate-pulse'
                    : step >= s.num
                    ? 'bg-[#181818] border-[#333] text-[#F5F3EC]'
                    : 'bg-[#121212] border-[#202020] text-[#555]'
                }`}
              >
                <div className="font-mono text-[12px]">{s.num}</div>
                <div className="truncate mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunFullSimulation}
              disabled={isRunning}
              className="flex-1 py-3 rounded-xl bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[13px] font-semibold transition-all shadow-md cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <i className={`ti ti-bolt ${isRunning ? 'animate-spin' : ''}`}></i>
              <span>{isRunning ? 'Running Simulation Pipeline...' : 'Run 1-Click Verification Flow'}</span>
            </button>
          </div>

          {/* Terminal Console Output */}
          <div className="p-4 rounded-xl bg-[#0B0B0B] border border-[#222] font-mono text-[12px] text-[#DDD] space-y-1.5 max-h-48 overflow-y-auto">
            <div className="text-[#777] text-[11px] uppercase tracking-wider pb-1 border-b border-[#1A1A1A]">
              Telemetry & Convex Mutation Log
            </div>
            {logMessages.length > 0 ? (
              logMessages.map((msg, i) => (
                <div key={i} className="text-[#C7F26B]/90 leading-relaxed">
                  {msg}
                </div>
              ))
            ) : (
              <div className="text-[#555] italic">Press the button above to simulate a live install event.</div>
            )}
          </div>

          {/* Post-Simulation Actions: Hold Fast-Forward & Payout */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-[#181818] border border-[#C7F26B]/30 space-y-3 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#F5F3EC]">
                    Reward Entitlement Created: {simulationResult.reward.id}
                  </div>
                  <div className="text-[12px] text-[#A8A69E]">
                    Current Status: <span className="text-[#C7F26B] font-mono uppercase font-bold">{simulationResult.reward.status}</span> (${(simulationResult.reward.amountMinor / 100).toFixed(2)})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {simulationResult.reward.status === 'on_hold' && (
                    <button
                      type="button"
                      onClick={handleFastForwardHold}
                      className="px-3.5 py-1.5 rounded-lg bg-[#C7F26B] hover:bg-[#baf055] text-[#0B0B0B] text-[12px] font-semibold transition-colors border-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="ti ti-player-track-next"></i>
                      <span>Fast-Forward 7-Day Hold</span>
                    </button>
                  )}

                  {simulationResult.reward.status === 'available' && (
                    <button
                      type="button"
                      onClick={handleWithdrawSimulated}
                      className="px-3.5 py-1.5 rounded-lg bg-[#388BFD] hover:bg-[#2d73d6] text-white text-[12px] font-semibold transition-colors border-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="ti ti-wallet"></i>
                      <span>Trigger Whop Payout</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262626] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#222] hover:bg-[#2A2A2A] text-[#F5F3EC] text-[13px] font-medium transition-colors border-0 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

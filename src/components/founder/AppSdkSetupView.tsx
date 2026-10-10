import React, { useState } from 'react';
import { umiStore } from '../../services/umiStore';
import { FounderApp, AppKey } from '../../types/umi';

interface AppSdkSetupViewProps {
  apps: FounderApp[];
  appKeys: AppKey[];
  onBack: () => void;
}

export const AppSdkSetupView: React.FC<AppSdkSetupViewProps> = ({ apps, appKeys, onBack }) => {
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id || '');
  const [isRotating, setIsRotating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState<string | null>(null);

  const selectedApp = apps.find((a) => a.id === selectedAppId) || apps[0];
  const activeKey = appKeys.find((k) => k.appId === selectedApp?.id && k.status === 'active');

  const handleRotateKey = () => {
    if (!selectedApp) return;
    setIsRotating(true);
    setTimeout(() => {
      umiStore.rotateAppKey(selectedApp.id);
      setIsRotating(false);
      setSimLog(`Rotated app key for ${selectedApp.name}. Old key moved to "rotated" state.`);
    }, 400);
  };

  const handleVerifyOwnership = () => {
    if (!selectedApp) return;
    umiStore.verifyAppOwnership(selectedApp.id);
    setSimLog(`Verified Apple App Site Association (AASA) for ${selectedApp.bundleId}.`);
  };

  const handleSimulateSdkEvent = () => {
    if (!selectedApp) return;
    setIsSimulating(true);
    setSimLog(`Transmitting simulated iOS SDK handshake to Convex HTTP endpoint for ${selectedApp.bundleId}...`);

    setTimeout(() => {
      setIsSimulating(false);
      selectedApp.lastEventAt = 'Just now';
      selectedApp.sdkState = 'connected';
      setSimLog(`Handshake acknowledged: Event "app_install_handshake" processed by Convex HTTP action (Status 200 OK).`);
    }, 700);
  };

  const swiftSnippet = `// 1. Initialize Umi in AppDelegate or @main App
import UmiSDK

Umi.initialize(
    appKey: "${activeKey?.publicPrefix || 'umi_live_pxp_9f82b'}",
    bundleId: "${selectedApp?.bundleId || 'com.novaplay.pixelpop'}"
)

// 2. Automated Source Confirmation (Universal Link or Clipboard)
Umi.handleDeepLink(url) { attribution in
    print("Umi Source confirmed: \\(attribution.creatorCode)")
}

// 3. Emit Qualifying Event when user reaches milestone
Umi.logEvent("${selectedApp?.category === 'Games' ? 'level_3_completed' : 'first_focus_session_25m'}")`;

  return (
    <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-[#9C9A92] hover:text-[#F4F2EC] mb-1.5 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <i className="ti ti-arrow-left"></i>
            <span>Back to Campaigns</span>
          </button>
          <h1 className="text-[20px] font-semibold text-[#F4F2EC]">App & iOS SDK Infrastructure</h1>
          <p className="text-[13px] text-[#9C9A92] mt-0.5">
            Configure Apple App Store bundle IDs, rotate Convex SDK keys, and test event ingestion
          </p>
        </div>

        {/* App Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0E0E0E] rounded-xl border border-[#262626]">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelectedAppId(app.id)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer border-0 flex items-center gap-2 ${
                selectedApp?.id === app.id
                  ? 'bg-[#262626] text-[#F4F2EC] shadow-sm'
                  : 'text-[#888] hover:text-[#F4F2EC] bg-transparent'
              }`}
            >
              <i className={`ti ${app.icon} text-[14px]`}></i>
              <span>{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedApp && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Credentials & Integration */}
          <div className="lg:col-span-2 space-y-6">
            {/* App Credentials Card */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#222]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202020] text-[#C9B8FF] flex items-center justify-center text-[20px]">
                    <i className={`ti ${selectedApp.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-medium text-[#F4F2EC]">{selectedApp.name}</h3>
                    <div className="text-[12px] text-[#9C9A92] font-mono">{selectedApp.bundleId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                      selectedApp.ownershipState === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    <i
                      className={`ti ${
                        selectedApp.ownershipState === 'verified' ? 'ti-check' : 'ti-alert-circle'
                      } text-[12px]`}
                    ></i>
                    <span>
                      {selectedApp.ownershipState === 'verified' ? 'AASA Verified' : 'DNS Check Pending'}
                    </span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                      selectedApp.sdkState === 'connected'
                        ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
                        : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedApp.sdkState === 'connected' ? 'bg-[#C9B8FF] animate-pulse' : 'bg-[#666]'
                      }`}
                    ></span>
                    <span>
                      {selectedApp.sdkState === 'connected' ? 'SDK Receiving Events' : 'Awaiting SDK'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Metadata Rows */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-0.5">Apple Team ID</div>
                  <div className="font-mono text-[#F4F2EC]">{selectedApp.teamId}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-0.5">App Store ID</div>
                  <div className="font-mono text-[#F4F2EC]">{selectedApp.appStoreId}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-0.5">Category</div>
                  <div className="text-[#F4F2EC]">{selectedApp.category}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#181818] border border-[#222]">
                  <div className="text-[#777] mb-0.5">Last Event Telemetry</div>
                  <div className="text-[#C9B8FF] font-mono">{selectedApp.lastEventAt || 'None'}</div>
                </div>
              </div>
            </div>

            {/* SDK Key Management */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-medium text-[#F4F2EC]">Public App Key</h3>
                  <p className="text-[12px] text-[#9C9A92]">
                    Convex HTTP actions validate this key on every client SDK payload.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRotateKey}
                  disabled={isRotating}
                  className="px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2C2C2C] text-[#F4F2EC] text-[12px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-1.5"
                >
                  <i className={`ti ti-refresh ${isRotating ? 'animate-spin' : ''}`}></i>
                  <span>Rotate Key</span>
                </button>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="font-mono text-[13px] text-[#C9B8FF] flex-1 truncate px-1">
                  {activeKey?.publicPrefix || 'umi_live_pxp_9f82b'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeKey?.publicPrefix || '');
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#1B1B1B] hover:bg-[#303030] text-[#F4F2EC] text-[11.5px] font-medium transition-colors border-0 cursor-pointer"
                >
                  {copiedKey ? 'Copied' : 'Copy Key'}
                </button>
              </div>
              <div className="mt-2 text-[11px] text-[#666] font-mono">
                Secret Signature Hash: {activeKey?.secretHash.slice(0, 28)}...
              </div>
            </div>

            {/* Swift Code Snippet */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="ti ti-brand-swift text-[18px] text-[#FA7343]"></i>
                  <h3 className="text-[14px] font-medium text-[#F4F2EC]">Swift Package (iOS 16+)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(swiftSnippet);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="text-[12px] text-[#C9B8FF] hover:underline bg-transparent border-0 cursor-pointer flex items-center gap-1"
                >
                  <i className="ti ti-copy text-[13px]"></i>
                  <span>{copiedSnippet ? 'Copied to Clipboard' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#000000] border border-[#222] font-mono text-[12px] text-[#DDD] overflow-x-auto leading-relaxed">
                <code>{swiftSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Right Col: Interactive Test Console & Ownership */}
          <div className="space-y-6">
            {/* Interactive Test Console */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ti ti-terminal-2 text-[17px] text-[#C9B8FF]"></i>
                <h3 className="text-[14px] font-medium text-[#F4F2EC]">SDK Ingestion Test Console</h3>
              </div>
              <p className="text-[12px] text-[#9C9A92] mb-4">
                Simulate an incoming iOS SDK handshake and verify attribution rule execution.
              </p>

              <button
                type="button"
                onClick={handleSimulateSdkEvent}
                disabled={isSimulating}
                className="w-full py-2.5 rounded-xl bg-[#C9B8FF] hover:bg-[#b5e056] text-[#000000] text-[12.5px] font-semibold transition-all shadow-md cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <i className={`ti ti-bolt ${isSimulating ? 'animate-bounce' : ''}`}></i>
                <span>{isSimulating ? 'Simulating Event...' : 'Send Test SDK Event'}</span>
              </button>

              {simLog && (
                <div className="mt-3.5 p-3 rounded-xl bg-[#0F0F0F] border border-[#1B1B1B] text-[11.5px] font-mono text-[#9C9A92] leading-normal animate-[fadeIn_0.1s_ease-out]">
                  <div className="text-[#C9B8FF] mb-1 font-semibold flex items-center gap-1">
                    <i className="ti ti-check text-[13px]"></i>
                    <span>Console Output</span>
                  </div>
                  {simLog}
                </div>
              )}
            </div>

            {/* Apple App Site Association (AASA) Verification */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <i className="ti ti-world text-[17px] text-[#388BFD]"></i>
                <h3 className="text-[14px] font-medium text-[#F4F2EC]">App Ownership Check</h3>
              </div>
              <p className="text-[12px] text-[#9C9A92] mb-3 leading-relaxed">
                Umi verifies ownership using your domain's <code className="text-[#C9B8FF] font-mono text-[11px]">.well-known/apple-app-site-association</code> to link universal redirects securely.
              </p>

              <div className="p-3 rounded-xl bg-[#181818] border border-[#222] mb-3 text-[11.5px] font-mono text-[#999]">
                <div>Target Domain: https://{selectedApp.name.toLowerCase().replace(/[^a-z]/g, '')}.com</div>
                <div className="text-[#C9B8FF] mt-0.5">applinks:umi.link/{selectedApp.bundleId}</div>
              </div>

              {selectedApp.ownershipState === 'verified' ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[12px] text-emerald-400 flex items-center gap-2">
                  <i className="ti ti-circle-check text-[16px]"></i>
                  <span>Ownership verified & cryptographically bound</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleVerifyOwnership}
                  className="w-full py-2 rounded-xl bg-[#141414] hover:bg-[#252525] text-[#F4F2EC] text-[12px] font-medium transition-colors border border-[#333] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <i className="ti ti-refresh"></i>
                  <span>Check Verification Status</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';

interface SdkKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SdkKeysModal: React.FC<SdkKeysModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copy = (key: string, val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  const keys = [
    {
      id: 'live',
      label: 'Production app key',
      val: 'kred_live_pixelpop7k2x98q1',
      desc: 'Use in your production app build.',
    },
    {
      id: 'test',
      label: 'Sandbox / test key',
      val: 'kred_test_sandbox_dev3x11',
      desc: 'Use for local development and test devices.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-[480px] bg-[#161616] border border-[#2A2A2A] rounded-[24px] p-6 shadow-2xl animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left relative space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[18px] font-medium text-[#F5F3EC]">SDK and app keys</div>
            <div className="sub mt-0.5">Integrate the attribution SDK to verify real mobile installs.</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1C1C1C] hover:bg-[#242424] text-[#9A9892] hover:text-[#F5F3EC] flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close"
          >
            <i className="ti ti-x text-[14px]"></i>
          </button>
        </div>

        {/* Keys List */}
        <div className="space-y-3 pt-1">
          {keys.map((k) => (
            <div key={k.id} className="space-y-1">
              <div className="flex justify-between text-[12px]">
                <span className="font-medium text-[#F5F3EC]">{k.label}</span>
                <span className="text-[#9A9892]">{k.desc}</span>
              </div>
              <div className="code">
                <span>{k.val}</span>
                <button
                  type="button"
                  onClick={() => copy(k.id, k.val)}
                  className="chip text-[12px] py-1 px-2.5 shrink-0"
                >
                  {copiedKey === k.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Docs Link */}
        <div className="bg-[#1C1C1C] rounded-[16px] p-3.5 border border-[#2A2A2A]/40 flex items-center justify-between text-[12px]">
          <div>
            <span className="text-[#F5F3EC] font-medium block">Documentation</span>
            <span className="text-[#9A9892]">Guides for iOS, Android, React Native, and Unity.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ol text-[11px] py-1 px-3"
          >
            <span>Read guides</span>
            <i className="ti ti-arrow-up-right text-[12px]" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

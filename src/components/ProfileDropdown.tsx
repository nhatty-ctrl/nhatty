import React, { useRef, useEffect } from 'react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: number;
  onNavigateEarnings: () => void;
  onNavigateAnalytics: () => void;
  onNavigatePayoutMethods: () => void;
  onNavigateBilling: () => void;
  onNavigateSettings: () => void;
  onNavigateDocs?: () => void;
  onNavigateSdk?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  balance = 248.6,
  onNavigateEarnings,
  onNavigateAnalytics,
  onNavigatePayoutMethods,
  onNavigateBilling,
  onNavigateSettings,
  onNavigateDocs,
  onNavigateSdk,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const firstName = localStorage.getItem('kred_fname') || 'Amara';
  const lastName = localStorage.getItem('kred_lname') || 'Bekele';
  const username = localStorage.getItem('kred_uname') || '@amara';

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-50 w-[300px] rounded-[24px] bg-[#161616] border border-[#2A2A2A] shadow-2xl p-2 animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left"
    >
      {/* Profile Header */}
      <div
        onClick={() => {
          onNavigateSettings();
          onClose();
        }}
        className="flex items-center gap-3 p-2.5 rounded-[16px] hover:bg-[#1C1C1C] cursor-pointer transition-colors"
      >
        <div className="w-[42px] h-[42px] rounded-full bg-[#388BFD] text-white flex items-center justify-center text-[18px] shrink-0">
          <i className="ti ti-user" aria-hidden="true"></i>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-medium text-[#F5F3EC]">
            {firstName} {lastName}
          </div>
          <div className="text-[12px] text-[#A8A69E] truncate">
            {username} · Account settings
          </div>
        </div>
        <i className="ti ti-chevron-right text-[14px] text-[#A8A69E]"></i>
      </div>

      {/* Available Balance Card */}
      <div className="mx-1 my-1.5 bg-[#1C1C1C] rounded-[18px] p-3 px-3.5 flex items-center justify-between border border-[#2A2A2A]/40">
        <div>
          <div className="text-[11px] text-[#A8A69E]">Available balance</div>
          <div className="text-[20px] font-medium tracking-[-0.4px] text-[#F5F3EC] mt-0.5 font-mono">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onNavigatePayoutMethods();
            onClose();
          }}
          className="pill on text-[11px] py-1 px-3 cursor-pointer"
        >
          Withdraw
        </button>
      </div>

      {/* Menu Navigation Items */}
      <div className="space-y-0.5 px-1 pt-1">
        <button
          type="button"
          onClick={() => {
            onNavigateEarnings();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-coin text-[17px] text-[#C0DD97]" aria-hidden="true"></i>
          <span className="flex-1">Earnings</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigateAnalytics();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-chart-bar text-[17px] text-[#B5D4F4]" aria-hidden="true"></i>
          <span className="flex-1">Campaign analytics</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigateBilling();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-receipt text-[17px] text-[#FAC775]" aria-hidden="true"></i>
          <span className="flex-1">Billing & invoices</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>

        <button
          type="button"
          onClick={() => {
            onNavigatePayoutMethods();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-wallet text-[17px] text-[#CECBF6]" aria-hidden="true"></i>
          <span className="flex-1">Payout methods</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNavigateSdk) onNavigateSdk();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-key text-[17px] text-[#FAC775]" aria-hidden="true"></i>
          <span className="flex-1 font-medium">SDK & API Keys</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNavigateDocs) onNavigateDocs();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-book text-[17px] text-[#C7F26B]" aria-hidden="true"></i>
          <span className="flex-1">Documentation</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>

        {/* Dedicated Settings with Gear icon (as specifically requested) */}
        <button
          type="button"
          onClick={() => {
            onNavigateSettings();
            onClose();
          }}
          className="w-full border-0 bg-transparent text-[#F5F3EC] flex items-center gap-3 text-left p-2.5 px-3 rounded-[14px] text-[13px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
        >
          <i className="ti ti-settings text-[17px] text-[#388BFD]" aria-hidden="true"></i>
          <span className="flex-1 font-medium">Settings</span>
          <i className="ti ti-arrow-right text-[13px] text-[#5F5E5A] group-hover:text-[#B9B7AF]"></i>
        </button>
      </div>

      {/* Divider */}
      <div className="h-[0.5px] bg-[#2A2A2A] mx-2 my-1.5" />

      {/* Log out */}
      <div className="px-1 pb-1">
        <button
          type="button"
          onClick={onClose}
          className="w-full border-0 bg-transparent text-[#FF8A80] hover:bg-[#FF8A80]/10 flex items-center gap-3 text-left p-2 px-3 rounded-[14px] text-[13px] transition-colors cursor-pointer"
        >
          <i className="ti ti-logout text-[17px]" aria-hidden="true"></i>
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

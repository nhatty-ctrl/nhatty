import React, { useState } from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: any) => void;
  onNavigateCampaign: (id: string) => void;
  unreadCount: number;
  readMap: Record<number, boolean>;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  balance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  readMap,
  onMarkRead,
  onMarkAllRead,
  balance = 248.6,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0B]/95 backdrop-blur-md border-b border-[#2A2A2A] px-3 sm:px-6 py-2.5 sm:py-3 select-none">
      {/* Edge-to-Edge corner-to-corner container */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onNavigate('campaigns')}
            className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-[12px] bg-[#1C1C1C] hover:bg-[#242424] text-[#F5F3EC] flex items-center justify-center text-[18px] border-0 cursor-pointer transition-colors shrink-0"
            aria-label="KRED home"
          >
            <i className="ti ti-asterisk" aria-hidden="true"></i>
          </button>

          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <span
              onClick={() => onNavigate('campaigns')}
              className="text-[17px] font-semibold tracking-tight text-[#F5F3EC] cursor-pointer hover:text-white transition-colors"
            >
              kred
            </span>
          </div>

          {/* Desktop Navigation: ONLY Campaigns & Discover (Per explicit requirement) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 ml-2" aria-label="Main navigation">
            <button
              onClick={() => onNavigate('campaigns')}
              className={`pill text-[13px] px-3.5 py-1.5 min-h-[36px] ${
                currentTab === 'campaigns' ? 'on' : ''
              }`}
            >
              <span>Campaigns</span>
            </button>

            <button
              onClick={() => onNavigate('discover')}
              className={`pill text-[13px] px-3.5 py-1.5 min-h-[36px] ${
                currentTab === 'discover' ? 'on' : ''
              }`}
            >
              <span>Discover</span>
            </button>
          </nav>
        </div>

        {/* Right Corner: Create Campaign, Notifications, Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Create campaign button (Solid Blue as shown in screenshots) */}
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium py-1.5 px-4 rounded-full bg-[#388BFD] hover:bg-[#2f75d3] text-white cursor-pointer transition-colors shadow-sm"
          >
            <span>Create campaign</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className={`w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border-0 cursor-pointer flex items-center justify-center text-[17px] relative transition-colors ${
                isNotifOpen
                  ? 'bg-[#2A2A2A] text-[#F5F3EC]'
                  : 'bg-[#1C1C1C] hover:bg-[#242424] text-[#A8A69E] hover:text-[#F5F3EC]'
              }`}
              aria-label="Notifications"
            >
              <i className="ti ti-bell"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#388BFD] ring-2 ring-[#0B0B0B]" />
              )}
            </button>

            {isNotifOpen && (
              <NotificationsDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                readMap={readMap}
                onMarkRead={onMarkRead}
                onMarkAllRead={onMarkAllRead}
                onNavigateSettings={() => {
                  setIsNotifOpen(false);
                  onNavigate('settings');
                }}
              />
            )}
          </div>

          {/* Profile Avatar Button (Blue circle matching screenshot avatar) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full bg-[#388BFD] text-white flex items-center justify-center text-[17px] border-0 cursor-pointer hover:brightness-110 transition-all shadow-sm"
              aria-label="Account and workspace menu"
            >
              <i className="ti ti-user" aria-hidden="true"></i>
            </button>

            {isProfileOpen && (
              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                balance={balance}
                onNavigateEarnings={() => onNavigate('earnings')}
                onNavigateAnalytics={() => onNavigate('analytics')}
                onNavigatePayoutMethods={() => onNavigate('payout-methods')}
                onNavigateBilling={() => onNavigate('billing')}
                onNavigateSettings={() => onNavigate('settings')}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

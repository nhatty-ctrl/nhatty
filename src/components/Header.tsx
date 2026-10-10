import React, { useState } from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsDropdown } from './NotificationsDropdown';
import { SmileyAvatar } from './SmileyAvatar';
import { UserRole } from '../types/campaign';
import { UmiLogoMark } from './Icons';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: any) => void;
  onNavigateCampaign: (id: string) => void;
  unreadCount: number;
  readMap: Record<number, boolean>;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  balance?: number;
  avatarPalette?: string;
  avatarMood?: string;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  readMap,
  onMarkRead,
  onMarkAllRead,
  balance = 248.6,
  avatarPalette,
  avatarMood,
  userRole,
  onRoleChange,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/95 backdrop-blur-md border-b border-[#222222] px-3 sm:px-6 py-2.5 sm:py-3 select-none">
      {/* Edge-to-Edge corner-to-corner container */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Umi Primary Mark & Serif Wordmark Lockup */}
          <button
            onClick={() => onNavigate('campaigns')}
            className="flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer group"
            aria-label="Umi home"
          >
            <UmiLogoMark size={34} variant="lime" className="transition-transform group-hover:scale-105" />
            <span className="font-serif text-[22px] font-medium tracking-tight text-[#F4F2EC] group-hover:text-white transition-colors">
              umi
            </span>
          </button>

          {/* Desktop Navigation: Campaigns & Discover (sleek segmented pill) */}
          <nav
            className="flex items-center p-1 bg-[#141414] border border-[#222222] rounded-full gap-1 ml-2 shadow-inner"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={() => onNavigate('campaigns')}
              className={`inline-flex items-center gap-1.5 text-[13px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 ${
                currentTab === 'campaigns'
                  ? 'bg-[#F4F2EC] text-[#000000] shadow-sm'
                  : 'text-[#9C9A92] hover:text-[#F4F2EC] hover:bg-[#1B1B1B]'
              }`}
            >
              <i className="ti ti-speakerphone text-[14px]"></i>
              <span>Campaigns</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('discover')}
              className={`inline-flex items-center gap-1.5 text-[13px] font-semibold py-1.5 px-4 rounded-full cursor-pointer transition-all duration-150 ${
                currentTab === 'discover'
                  ? 'bg-[#F4F2EC] text-[#000000] shadow-sm'
                  : 'text-[#9C9A92] hover:text-[#F4F2EC] hover:bg-[#1B1B1B]'
              }`}
            >
              <i className="ti ti-compass text-[14px]"></i>
              <span>Discover</span>
            </button>
          </nav>
        </div>

        {/* Right Corner: Create Campaign, Notifications, Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Create campaign button (Umi Accent Lime) */}
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold py-1.5 px-4 rounded-full bg-[#C9B8FF] hover:bg-[#ba9bf7] text-[#000000] cursor-pointer transition-all duration-150 shadow-sm hover:shadow-[0_0_14px_rgba(201, 184, 255,0.35)] active:scale-95"
          >
            <i className="ti ti-plus text-[13px] stroke-[2.5]" aria-hidden="true"></i>
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
                  ? 'bg-[#222222] text-[#F4F2EC]'
                  : 'bg-[#141414] hover:bg-[#1B1B1B] text-[#9C9A92] hover:text-[#F4F2EC]'
              }`}
              aria-label="Notifications"
            >
              <i className="ti ti-bell"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9B8FF] ring-2 ring-[#000000]" />
              )}
            </button>

            {isNotifOpen && (
              <NotificationsDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                readMap={readMap}
                onMarkRead={onMarkRead}
                onMarkAllRead={onMarkAllRead}
                userRole={userRole}
                onNavigateSettings={() => {
                  setIsNotifOpen(false);
                  onNavigate('notification-settings');
                }}
              />
            )}
          </div>

          {/* Profile Avatar Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border-0 cursor-pointer hover:brightness-110 transition-all shadow-sm p-0 overflow-hidden flex items-center justify-center bg-transparent"
              aria-label="Account and workspace menu"
            >
              <SmileyAvatar paletteId={avatarPalette} mood={avatarMood} size={38} />
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
                onNavigateDocs={() => onNavigate('docs')}
                onNavigateSdk={() => onNavigate('sdk')}
                onNavigateStatesGallery={() => onNavigate('states-gallery')}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { SmileyAvatar } from './SmileyAvatar';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  currentTab: 'campaigns' | 'discover' | 'earnings' | 'analytics' | 'profile' | 'create' | 'payout-methods' | 'billing' | 'notification-settings';
  onNavigate: (tab: 'campaigns' | 'discover' | 'earnings' | 'analytics' | 'profile' | 'create' | 'payout-methods' | 'billing' | 'notification-settings') => void;
  onNavigateCampaign: (id: string) => void;
  avatarPalette?: string;
  avatarMood?: string;
  unreadCount: number;
  readMap: Record<number, boolean>;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  balance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onNavigateCampaign,
  avatarPalette = '#C7F26B',
  avatarMood = 'builder',
  unreadCount,
  readMap,
  onMarkRead,
  onMarkAllRead,
  balance = 248.6,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0B] border-b border-[#2A2A2A] px-3 sm:px-6 py-3 select-none">
      {/* Edge-to-Edge corner-to-corner container (no max-w constrain) */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Corner: Logo & Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onNavigate('campaigns')}
            className="w-[36px] h-[36px] rounded-[12px] bg-[#1C1C1C] hover:bg-[#242424] text-[#F5F3EC] flex items-center justify-center text-[18px] border-0 cursor-pointer transition-colors shrink-0"
            aria-label="KRED home"
          >
            <i className="ti ti-asterisk" aria-hidden="true"></i>
          </button>

          {/* Navigation Pills: Campaigns, Discover, Earnings */}
          <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main navigation">
            <button
              onClick={() => onNavigate('campaigns')}
              className={`pill ${currentTab === 'campaigns' ? 'on' : ''}`}
            >
              <i className="ti ti-speakerphone" aria-hidden="true"></i>
              <span>Campaigns</span>
            </button>

            <button
              onClick={() => onNavigate('discover')}
              className={`pill ${currentTab === 'discover' ? 'on' : ''}`}
            >
              <i className="ti ti-compass" aria-hidden="true"></i>
              <span>Discover</span>
            </button>
          </nav>
        </div>

        {/* Right Corner: Create Campaign, Notifications, Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Create campaign button (Available for everyone) */}
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className={`pill on font-medium text-[13px] py-1.5 px-3.5 cursor-pointer ${
              currentTab === 'create' ? 'ring-2 ring-[#C7F26B]' : ''
            }`}
          >
            <i className="ti ti-plus" aria-hidden="true"></i>
            <span className="hidden sm:inline">Create campaign</span>
            <span className="sm:hidden">Create</span>
          </button>

          {/* Notifications Button with Live Unread Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className={`w-[36px] h-[36px] rounded-full border-0 flex items-center justify-center text-[17px] transition-colors relative cursor-pointer ${
                isNotifOpen
                  ? 'bg-[#F5F3EC] text-[#0B0B0B]'
                  : 'bg-[#1C1C1C] text-[#F5F3EC] hover:bg-[#242424]'
              }`}
              aria-label="Notifications"
            >
              <i className="ti ti-bell" aria-hidden="true"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-[#C7F26B] text-[#16140F] text-[10px] font-semibold flex items-center justify-center px-1 border-2 border-[#0B0B0B] box-content">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationsDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              role="creator"
              readMap={readMap}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
              onNavigateCampaign={onNavigateCampaign}
              onOpenNotificationSettings={() => {
                setIsNotifOpen(false);
                onNavigate('notification-settings');
              }}
            />
          </div>

          {/* Profile Avatar Button with Dropdown directing to pages */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className={`w-[36px] h-[36px] rounded-full p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all ${
                isProfileOpen ? 'ring-2 ring-[#F5F3EC]' : ''
              }`}
              aria-label="Profile menu"
            >
              <SmileyAvatar paletteId={avatarPalette} personaId={avatarMood} size={36} />
            </button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              avatarPalette={avatarPalette}
              avatarMood={avatarMood}
              balance={balance}
              onNavigateProfile={() => onNavigate('profile')}
              onNavigateEarnings={() => onNavigate('earnings')}
              onNavigateAnalytics={() => onNavigate('profile')}
              onNavigatePayoutMethods={() => onNavigate('payout-methods')}
              onNavigateBilling={() => onNavigate('billing')}
              onNavigateNotificationSettings={() => onNavigate('notification-settings')}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

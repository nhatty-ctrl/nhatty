import React, { useRef, useEffect, useState } from 'react';
import { UserRole } from '../types/campaign';

export interface NotificationItem {
  id: number;
  r: UserRole;
  ic: string;
  bg: string;
  fg: string;
  t: string;
  d: string;
  tm: string;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    r: 'creator',
    ic: 'ti-coin',
    bg: '#C0DD97',
    fg: '#173404',
    t: 'Payout sent',
    d: '$124.60 for the Oct 2 settlement is on its way.',
    tm: '2h',
  },
  {
    id: 2,
    r: 'creator',
    ic: 'ti-circle-check',
    bg: '#B5D4F4',
    fg: '#042C53',
    t: '12 installs verified',
    d: 'Pixel Pop confirmed new installs from your link.',
    tm: '5h',
  },
  {
    id: 3,
    r: 'creator',
    ic: 'ti-clock',
    bg: '#FAC775',
    fg: '#412402',
    t: 'Focusly ends in 3 days',
    d: 'Share your link soon to catch the last installs.',
    tm: 'Yesterday',
  },
  {
    id: 4,
    r: 'creator',
    ic: 'ti-speakerphone',
    bg: '#CECBF6',
    fg: '#26215C',
    t: 'New in Health',
    d: 'Stride pays $2.90 per verified install.',
    tm: '2d',
  },
  {
    id: 5,
    r: 'founder',
    ic: 'ti-plug',
    bg: '#9FE1CB',
    fg: '#04342C',
    t: 'SDK connected',
    d: 'Pixel Pop sent its first event.',
    tm: '1h',
  },
  {
    id: 6,
    r: 'founder',
    ic: 'ti-users',
    bg: '#F4C0D1',
    fg: '#4B1528',
    t: '600 creators joined',
    d: 'Pixel Pop reached a new milestone.',
    tm: '4h',
  },
  {
    id: 7,
    r: 'founder',
    ic: 'ti-alert-triangle',
    bg: '#FAC775',
    fg: '#412402',
    t: '80% of budget used',
    d: 'Stride has $580 left. Add funds to keep it running.',
    tm: 'Yesterday',
  },
  {
    id: 8,
    r: 'founder',
    ic: 'ti-shield-check',
    bg: '#B5D4F4',
    fg: '#042C53',
    t: '7 installs rejected',
    d: 'They failed verification, so you were not charged.',
    tm: '2d',
  },
];

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  readMap: Record<number, boolean>;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onNavigateCampaign?: (id: string) => void;
  onOpenNotificationSettings?: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  role,
  readMap,
  onMarkRead,
  onMarkAllRead,
  onNavigateCampaign,
  onOpenNotificationSettings,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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

  const roleList = INITIAL_NOTIFICATIONS.filter((n) => n.r === role);
  const unreadCount = roleList.filter((n) => !readMap[n.id]).length;
  const filteredRows = roleList.filter((n) => filter === 'all' || !readMap[n.id]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-50 w-[350px] sm:w-[372px] rounded-[24px] bg-[#161616] border border-[#2A2A2A] shadow-2xl p-2 animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 pt-2 pb-2">
        <div className="text-[16px] font-medium text-[#F5F3EC]">Notifications</div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="pill text-[12px] py-1 px-2.5 hover:bg-[#1C1C1C] border-0 bg-transparent text-[#9A9892] hover:text-[#F5F3EC] cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 px-2.5 pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`pill text-[12px] py-1.5 px-3 border-0 ${
            filter === 'all' ? 'on' : 'bg-[#1C1C1C] text-[#F5F3EC]'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`pill text-[12px] py-1.5 px-3 border-0 ${
            filter === 'unread' ? 'on' : 'bg-[#1C1C1C] text-[#F5F3EC]'
          }`}
        >
          Unread{unreadCount > 0 ? ` · ${unreadCount}` : ''}
        </button>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto space-y-1 px-1">
        {filteredRows.length > 0 ? (
          filteredRows.map((n) => {
            const isRead = !!readMap[n.id];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  onMarkRead(n.id);
                  if (onNavigateCampaign) {
                    if (n.d.includes('Pixel Pop')) onNavigateCampaign('pixelpop');
                    else if (n.d.includes('Stride')) onNavigateCampaign('stride');
                    else if (n.d.includes('Focusly')) onNavigateCampaign('focusly');
                  }
                }}
                className="w-full border-0 bg-transparent text-[#F5F3EC] flex gap-3 items-start text-left p-2.5 rounded-[16px] hover:bg-[#1C1C1C] transition-colors cursor-pointer group"
              >
                {/* Tile Icon */}
                <span
                  className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center text-[17px] shrink-0"
                  style={{ backgroundColor: n.bg, color: n.fg }}
                >
                  <i className={`ti ${n.ic}`} aria-hidden="true"></i>
                </span>

                {/* Text */}
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-[14px] ${
                      isRead ? 'font-normal text-[#B9B7AF]' : 'font-medium text-[#F5F3EC]'
                    }`}
                  >
                    {n.t}
                  </span>
                  <span className="block text-[12px] text-[#9A9892] mt-0.5 leading-[1.45]">
                    {n.d}
                  </span>
                </span>

                {/* Time & Unread Indicator */}
                <span className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                  <span className="sub text-[11px]">{n.tm}</span>
                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#C7F26B]" />
                  )}
                </span>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 px-2">
            <div className="text-[14px] font-medium text-[#F5F3EC]">
              You are all caught up
            </div>
            <div className="sub mt-1">New activity shows up here.</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-[0.5px] bg-[#2A2A2A] mx-2 my-1.5" />

      {/* Footer link */}
      <div className="px-2 pb-1">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenNotificationSettings) onOpenNotificationSettings();
          }}
          className="ol w-full justify-between py-2 text-[12px] cursor-pointer"
        >
          <span>Notification settings</span>
          <i className="ti ti-arrow-up-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
};

import React, { useRef, useEffect, useState } from 'react';

export interface NotificationItem {
  id: number;
  ic: string;
  bg: string;
  fg: string;
  t: string;
  d: string;
  tm: string;
  r?: 'creator' | 'founder' | string;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    ic: 'ti-coin',
    bg: '#C0DD97',
    fg: '#173404',
    t: 'Payout sent',
    d: '$124.60 for the Oct 2 settlement is on its way.',
    tm: '2h',
    r: 'creator',
  },
  {
    id: 2,
    ic: 'ti-circle-check',
    bg: '#B5D4F4',
    fg: '#042C53',
    t: '12 installs verified',
    d: 'Pixel Pop confirmed new installs from your link.',
    tm: '5h',
    r: 'creator',
  },
  {
    id: 3,
    ic: 'ti-clock',
    bg: '#FAC775',
    fg: '#412402',
    t: 'Focusly ends in 3 days',
    d: 'Share your link soon to catch the last installs.',
    tm: 'Yesterday',
    r: 'creator',
  },
  {
    id: 4,
    ic: 'ti-speakerphone',
    bg: '#CECBF6',
    fg: '#26215C',
    t: 'New in Health',
    d: 'Stride pays $2.90 per verified install.',
    tm: '2d',
    r: 'creator',
  },
  {
    id: 5,
    ic: 'ti-plug',
    bg: '#9FE1CB',
    fg: '#04342C',
    t: 'SDK connected',
    d: 'Attribution verified for incoming events.',
    tm: '3d',
    r: 'founder',
  },
  {
    id: 6,
    ic: 'ti-users',
    bg: '#F4C0D1',
    fg: '#4B1528',
    t: 'Install milestone reached',
    d: 'Over 600 verified installs recorded this week.',
    tm: '4d',
    r: 'founder',
  },
  {
    id: 7,
    ic: 'ti-shield-check',
    bg: '#C0DD97',
    fg: '#173404',
    t: 'Escrow funded',
    d: '$5,000 deposited for Pixel Pop campaign budget.',
    tm: '5d',
    r: 'founder',
  },
  {
    id: 8,
    ic: 'ti-receipt-refund',
    bg: '#F5C4B3',
    fg: '#4A1B0C',
    t: 'Dispute resolved',
    d: 'Attribution event #88192 verified by audit telemetry.',
    tm: '1w',
    r: 'founder',
  },
];

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  readMap: Record<number, boolean>;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onNavigateSettings?: () => void;
  userRole?: 'creator' | 'founder';
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  readMap,
  onMarkRead,
  onMarkAllRead,
  onNavigateSettings,
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

  const unreadCount = INITIAL_NOTIFICATIONS.filter((n) => !readMap[n.id]).length;
  const filteredRows = INITIAL_NOTIFICATIONS.filter((n) => filter === 'all' || !readMap[n.id]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-[24px] bg-[#0E0E0E] border border-[#222222] shadow-2xl p-3 animate-[pop_0.18s_cubic-bezier(0.16,1,0.3,1)] select-none text-left"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 px-1 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-[#F4F2EC]">Notifications</span>
          {unreadCount > 0 && (
            <span className="chip text-[10.5px] py-0.5 px-2 bg-[#C9B8FF] text-[#000000] font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[11.5px] text-[#9C9A92] hover:text-[#F4F2EC] transition-colors cursor-pointer bg-transparent border-0"
            >
              Mark all read
            </button>
          )}

          {onNavigateSettings && (
            <button
              type="button"
              onClick={() => {
                onNavigateSettings();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#141414] hover:bg-[#252525] text-[#9C9A92] hover:text-[#F4F2EC] flex items-center justify-center transition-colors cursor-pointer border-0"
              title="Notification settings"
            >
              <i className="ti ti-settings text-[14px]"></i>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs: All | Unread */}
      <div className="flex items-center gap-2 py-2 px-1">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`chip text-[11.5px] py-1 px-3 cursor-pointer ${filter === 'all' ? 'sel font-medium' : ''}`}
        >
          All ({INITIAL_NOTIFICATIONS.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`chip text-[11.5px] py-1 px-3 cursor-pointer ${filter === 'unread' ? 'sel font-medium' : ''}`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[360px] overflow-y-auto space-y-1 py-1 pr-0.5">
        {filteredRows.length > 0 ? (
          filteredRows.map((n) => {
            const isRead = !!readMap[n.id];
            return (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-2.5 rounded-[16px] transition-colors cursor-pointer flex items-start gap-3 relative group ${
                  isRead ? 'hover:bg-[#141414]/60 opacity-80' : 'bg-[#141414]/70 hover:bg-[#141414]'
                }`}
              >
                {/* Icon Tile */}
                <div
                  className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[17px] shrink-0"
                  style={{ backgroundColor: n.bg, color: n.fg }}
                >
                  <i className={`ti ${n.ic}`}></i>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-medium text-[#F4F2EC] truncate">{n.t}</span>
                    <span className="text-[11px] text-[#9C9A92] shrink-0 font-mono">{n.tm}</span>
                  </div>
                  <p className="text-[12px] text-[#9C9A92] mt-0.5 leading-snug line-clamp-2">
                    {n.d}
                  </p>
                </div>

                {!isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#388BFD] shrink-0 mt-2" title="Unread" />
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-[12.5px] text-[#9C9A92]">
            No unread notifications
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 px-1 border-t border-[#222222] flex justify-between items-center text-[11.5px] text-[#9C9A92]">
        <span>Weekly settlements released every Friday</span>
        <button
          type="button"
          onClick={onClose}
          className="hover:text-[#F4F2EC] cursor-pointer bg-transparent border-0"
        >
          Close
        </button>
      </div>
    </div>
  );
};
